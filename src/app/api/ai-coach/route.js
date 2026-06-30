import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { computeRecord, formatRecord, STAT_KEYS, sportLabel } from "@/lib/constants";
import { askClaude } from "@/lib/ai";

export async function POST(request) {
  const { teamId } = await request.json();
  if (!teamId) return NextResponse.json({ error: "Missing team." }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  // RLS only returns the team if this coach is on its staff.
  const { data: team } = await supabase
    .from("teams").select("id, name, sport, season, ai_enabled").eq("id", teamId).single();
  if (!team) return NextResponse.json({ error: "Team not found." }, { status: 404 });
  if (!team.ai_enabled) {
    return NextResponse.json({ error: "The AI Assistant Coach isn't enabled for this team yet." }, { status: 403 });
  }

  const [{ data: players }, { data: events }, { data: stats }] = await Promise.all([
    supabase.from("players").select("id, name, jersey_number, position").eq("team_id", teamId).order("sort_order").order("name"),
    supabase.from("events").select("event_type, opponent, starts_at, result, notes").eq("team_id", teamId).order("starts_at"),
    supabase.from("stats").select("player_id, stat_key, value, event_id").eq("team_id", teamId),
  ]);

  const roster = players || [];
  const evs = events || [];
  const rec = computeRecord(evs);
  const keys = STAT_KEYS[team.sport] || STAT_KEYS.other;
  const nameById = Object.fromEntries(roster.map((p) => [p.id, (p.jersey_number ? `#${p.jersey_number} ` : "") + p.name]));

  const agg = {};
  for (const s of stats || []) {
    if (!agg[s.player_id]) agg[s.player_id] = { _games: new Set() };
    agg[s.player_id][s.stat_key] = (agg[s.player_id][s.stat_key] || 0) + Number(s.value);
    if (s.event_id) agg[s.player_id]._games.add(s.event_id);
  }
  const statLines = roster.filter((p) => agg[p.id]).map((p) => {
    const a = agg[p.id];
    const parts = keys.filter((k) => a[k.key]).map((k) => `${k.abbr} ${a[k.key]}`);
    return `- ${nameById[p.id]} (${a._games.size} g): ${parts.join(", ") || "no stats"}`;
  });

  const now = Date.now();
  const past = evs.filter((e) => e.result).slice(-6).map((e) => `${e.opponent ? "vs " + e.opponent : "Game"}: ${e.result}`);
  const upcoming = evs.filter((e) => new Date(e.starts_at).getTime() >= now).slice(0, 5).map((e) =>
    `${new Date(e.starts_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })} ${e.event_type === "game" ? (e.opponent ? "vs " + e.opponent : "Game") : e.event_type}`);

  const legend = keys.map((k) => `${k.abbr}=${k.label}`).join(", ");
  const dataBlock = [
    `Team: ${team.name} (${sportLabel(team.sport)}${team.season ? ", " + team.season : ""})`,
    `Roster size: ${roster.length}`,
    `Record: ${rec.played ? `${formatRecord(rec)} (${rec.played} games)` : "no games recorded yet"}`,
    past.length ? `Recent results:\n${past.join("\n")}` : "Recent results: none yet",
    upcoming.length ? `Upcoming:\n${upcoming.join("\n")}` : "Upcoming: none scheduled",
    statLines.length ? `Season stats (${legend}):\n${statLines.join("\n")}` : "Season stats: none recorded yet",
  ].join("\n\n");

  const system = `You are an experienced, encouraging assistant coach for a youth ${sportLabel(team.sport)} team. Give specific, practical, age-appropriate guidance grounded ONLY in the data provided. Be concrete — name players and cite their numbers — but stay positive and development-focused; these are kids. If the data is thin, focus on early-season fundamentals and what to start tracking. Never invent stats. Output plain text (no markdown symbols or bullets), about 250-350 words, organized under these short headers, each on its own line: Snapshot, What's working, What to work on, Players to watch, Focus for next practice.`;
  const prompt = `Here is the team's data. Write the coach's briefing.\n\n${dataBlock}`;

  const result = await askClaude({ system, prompt, maxTokens: 1100 });
  if (!result.ok) {
    return NextResponse.json({ error: result.error || "Could not generate the briefing." }, { status: 502 });
  }
  return NextResponse.json({ ok: true, briefing: result.text, generatedAt: new Date().toISOString() });
}
