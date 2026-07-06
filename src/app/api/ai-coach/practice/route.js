import { NextResponse } from "next/server";
import { rateLimited, RATE_MSG } from "@/lib/ratelimit";
import { createClient } from "@/lib/supabase/server";
import { computeRecord, formatRecord, STAT_KEYS, sportLabel } from "@/lib/constants";
import { askClaude } from "@/lib/ai";

const MINUTES = new Set([45, 60, 75, 90]);
const FOCI = {
  auto: "Let the data decide where to spend the time.",
  offense: "Weight the plan toward offense/hitting/scoring, while keeping it balanced.",
  defense: "Weight the plan toward defense/fielding/stopping the other team, while keeping it balanced.",
  fundamentals: "Emphasize core fundamentals and skill-building appropriate for this age.",
  conditioning: "Work in extra movement, agility, and conditioning, kept fun and age-appropriate.",
};

export async function POST(request) {
  if (rateLimited(request, "ai-practice", { limit: 10, windowMs: 300_000 })) {
    return NextResponse.json({ error: RATE_MSG }, { status: 429 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  const teamId = body?.teamId;
  if (!teamId) return NextResponse.json({ error: "Missing team." }, { status: 400 });
  const minutes = MINUTES.has(Number(body?.minutes)) ? Number(body.minutes) : 75;
  const focus = FOCI[body?.focus] ? body.focus : "auto";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  // RLS only returns the team if this coach is on its staff.
  const { data: team } = await supabase
    .from("teams").select("id, name, sport, season, ai_enabled, ai_paid_through").eq("id", teamId).single();
  if (!team) return NextResponse.json({ error: "Team not found." }, { status: 404 });
  const aiActive = team.ai_enabled || (team.ai_paid_through && team.ai_paid_through >= new Date().toISOString().slice(0, 10));
  if (!aiActive) {
    return NextResponse.json({ error: "The AI Assistant Coach isn't enabled for this team yet." }, { status: 403 });
  }

  const [{ data: players }, { data: events }, { data: stats }] = await Promise.all([
    supabase.from("players").select("id, name, jersey_number, position").eq("team_id", teamId).order("sort_order").order("name"),
    supabase.from("events").select("event_type, opponent, starts_at, result").eq("team_id", teamId).order("starts_at"),
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
  const nextGame = evs.filter((e) => e.event_type === "game" && new Date(e.starts_at).getTime() >= now)[0];
  const nextStr = nextGame
    ? `${nextGame.opponent ? "vs " + nextGame.opponent : "Game"} on ${new Date(nextGame.starts_at).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}`
    : "none scheduled";

  const legend = keys.map((k) => `${k.abbr}=${k.label}`).join(", ");
  const dataBlock = [
    `Team: ${team.name} (${sportLabel(team.sport)}${team.season ? ", " + team.season : ""})`,
    `Roster size: ${roster.length}`,
    `Record: ${rec.played ? `${formatRecord(rec)} (${rec.played} games)` : "no games recorded yet"}`,
    past.length ? `Recent results:\n${past.join("\n")}` : "Recent results: none yet",
    `Next game: ${nextStr}`,
    statLines.length ? `Season stats (${legend}):\n${statLines.join("\n")}` : "Season stats: none recorded yet",
  ].join("\n\n");

  const system = `You are an experienced, encouraging youth ${sportLabel(team.sport)} coach. Build ONE practice plan totaling about ${minutes} minutes for this team, grounded ONLY in the data provided. ${FOCI[focus]} Target the team's real weak spots, prep a bit for the next opponent if one is scheduled, keep kids moving and engaged, and make it age-appropriate and positive. Never invent stats. Output plain text only (no markdown symbols, asterisks, or bullets). Start with a one-line "Focus:" summary. Then list the practice as time-blocked segments, each on its own line beginning with the minutes, like "10 min - Dynamic warm-up: ...". Include a warm-up, 3 to 5 skill/drill blocks tied to the data, a short fun/competitive segment, and a brief cool-down and team talk. Make the segment minutes add up to about ${minutes}. End with one line "Coach's reminder:" giving an encouraging point of emphasis.`;
  const prompt = `Here is the team's data. Build the ${minutes}-minute practice plan.\n\n${dataBlock}`;

  const result = await askClaude({ system, prompt, maxTokens: 1100 });
  if (!result.ok) {
    return NextResponse.json({ error: result.error || "Could not build the practice plan." }, { status: 502 });
  }
  return NextResponse.json({ ok: true, plan: result.text, minutes, focus, generatedAt: new Date().toISOString() });
}
