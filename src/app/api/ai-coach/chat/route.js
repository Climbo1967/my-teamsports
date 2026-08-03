import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { computeRecord, formatRecord, STAT_KEYS, sportLabel } from "@/lib/constants";
import { askClaudeChat } from "@/lib/ai";
import { rateLimited, RATE_MSG } from "@/lib/ratelimit";

const MONTHLY_TEAM_CAP = 400; // coach messages per team per calendar month
const HISTORY_TURNS = 20;     // prior messages sent to the model
const MAX_MESSAGE_CHARS = 1500;

async function requireTeam(supabase, teamId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "Please sign in again." }, { status: 401 }) };
  // RLS only returns the team if this coach is on its staff.
  const { data: team } = await supabase
    .from("teams").select("id, name, sport, season, age_group, ai_enabled, ai_paid_through").eq("id", teamId).single();
  if (!team) return { error: NextResponse.json({ error: "Team not found." }, { status: 404 }) };
  const aiActive = team.ai_enabled || (team.ai_paid_through && team.ai_paid_through >= new Date().toISOString().slice(0, 10));
  if (!aiActive) {
    return { error: NextResponse.json({ error: "The AI Assistant Coach isn't enabled for this team yet." }, { status: 403 }) };
  }
  return { user, team };
}

export async function GET(request) {
  const teamId = new URL(request.url).searchParams.get("teamId");
  if (!teamId) return NextResponse.json({ error: "Missing team." }, { status: 400 });
  const supabase = await createClient();
  const ctx = await requireTeam(supabase, teamId);
  if (ctx.error) return ctx.error;

  const { data: messages } = await supabase
    .from("ai_chat_messages")
    .select("id, role, content, created_at")
    .eq("team_id", teamId).eq("coach_id", ctx.user.id)
    .order("created_at", { ascending: false }).limit(60);
  return NextResponse.json({ ok: true, messages: (messages || []).reverse() });
}

export async function DELETE(request) {
  const teamId = new URL(request.url).searchParams.get("teamId");
  if (!teamId) return NextResponse.json({ error: "Missing team." }, { status: 400 });
  const supabase = await createClient();
  const ctx = await requireTeam(supabase, teamId);
  if (ctx.error) return ctx.error;

  await supabase.from("ai_chat_messages").delete().eq("team_id", teamId).eq("coach_id", ctx.user.id);
  return NextResponse.json({ ok: true });
}

export async function POST(request) {
  if (await rateLimited(request, "ai-chat", { limit: 20, windowMs: 300_000 })) {
    return NextResponse.json({ error: RATE_MSG }, { status: 429 });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  const { teamId } = payload || {};
  const message = String(payload?.message || "").trim();
  if (!teamId) return NextResponse.json({ error: "Missing team." }, { status: 400 });
  if (!message) return NextResponse.json({ error: "Type a message first." }, { status: 400 });
  if (message.length > MAX_MESSAGE_CHARS) {
    return NextResponse.json({ error: `Keep messages under ${MAX_MESSAGE_CHARS} characters.` }, { status: 400 });
  }

  const supabase = await createClient();
  const ctx = await requireTeam(supabase, teamId);
  if (ctx.error) return ctx.error;
  const { user, team } = ctx;

  // Monthly budget: coach messages per team, all coaches combined.
  const monthStart = new Date();
  monthStart.setUTCDate(1); monthStart.setUTCHours(0, 0, 0, 0);
  const { count } = await supabase
    .from("ai_chat_messages")
    .select("id", { count: "exact", head: true })
    .eq("team_id", teamId).eq("role", "user").gte("created_at", monthStart.toISOString());
  if ((count || 0) >= MONTHLY_TEAM_CAP) {
    return NextResponse.json({ error: "This team has used its AI chat allowance for the month. It resets on the 1st." }, { status: 429 });
  }

  // Fresh team context on every message — same data the briefing reads.
  const [{ data: players }, { data: events }, { data: stats }, { data: history }] = await Promise.all([
    supabase.from("players").select("id, name, jersey_number, position").eq("team_id", teamId).order("sort_order").order("name"),
    supabase.from("events").select("event_type, opponent, starts_at, result, notes").eq("team_id", teamId).order("starts_at"),
    supabase.from("stats").select("player_id, stat_key, value, event_id").eq("team_id", teamId),
    supabase.from("ai_chat_messages").select("role, content").eq("team_id", teamId).eq("coach_id", user.id)
      .order("created_at", { ascending: false }).limit(HISTORY_TURNS),
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
  const rosterLines = roster.map((p) => `- ${nameById[p.id]}${p.position ? ` (${p.position})` : ""}`);
  const dataBlock = [
    `Team: ${team.name} (${sportLabel(team.sport)}${team.season ? ", " + team.season : ""})`,
    team.age_group ? `Age group: ${team.age_group}` : null,
    `Record: ${rec.played ? `${formatRecord(rec)} (${rec.played} games)` : "no games recorded yet"}`,
    rosterLines.length ? `Roster:\n${rosterLines.join("\n")}` : "Roster: empty",
    past.length ? `Recent results:\n${past.join("\n")}` : "Recent results: none yet",
    upcoming.length ? `Upcoming:\n${upcoming.join("\n")}` : "Upcoming: none scheduled",
    statLines.length ? `Season stats (${legend}):\n${statLines.join("\n")}` : "Season stats: none recorded yet",
  ].filter(Boolean).join("\n\n");

  const system = `You are the AI assistant coach for a youth ${sportLabel(team.sport)} team, chatting with one of its coaches. Ground every answer ONLY in the team data below; never invent stats, players, or results. Be specific — name players, cite numbers — but stay positive and development-focused: these are kids. The team's sport and format are the coach's settled decision, sanctioned by their league — if this is tackle football, coach tackle football. Never suggest switching formats or sports (for example flag instead of tackle), and never question whether the sport suits the age group; channel safety into correct, sport-appropriate technique and smart practice design instead. If an age group is provided, match drill complexity, terminology, and expectations to it. Keep answers conversational and under ~200 words unless the coach asks for something longer (like a full plan or a draft message to parents). You only discuss this team, youth coaching, and closely related topics; politely decline anything else. Plain text only, no markdown symbols.\n\nTEAM DATA (current as of this message):\n${dataBlock}`;

  const turns = (history || []).reverse().map((m) => ({ role: m.role, content: m.content }));
  turns.push({ role: "user", content: message });

  const result = await askClaudeChat({ system, messages: turns, maxTokens: 700 });
  if (!result.ok) {
    return NextResponse.json({ error: result.error || "The assistant coach couldn't answer." }, { status: 502 });
  }
  const reply = result.text.slice(0, 4000);

  const nowIso = new Date().toISOString();
  await supabase.from("ai_chat_messages").insert([
    { team_id: teamId, coach_id: user.id, role: "user", content: message },
    { team_id: teamId, coach_id: user.id, role: "assistant", content: reply },
  ]);

  return NextResponse.json({ ok: true, reply, generatedAt: nowIso });
}
