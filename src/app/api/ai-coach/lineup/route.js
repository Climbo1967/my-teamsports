import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sportLabel } from "@/lib/constants";
import { recommendLineup, fmtAvg, MIN_PA } from "@/lib/lineup";
import { askClaude } from "@/lib/ai";

const DIAMOND = new Set(["baseball", "softball"]);

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
  if (!DIAMOND.has(team.sport)) {
    return NextResponse.json({ error: "The lineup advisor is for baseball and softball teams." }, { status: 400 });
  }

  const [{ data: players }, { data: atBats }] = await Promise.all([
    supabase.from("players").select("id, name, jersey_number").eq("team_id", teamId).order("sort_order").order("name"),
    supabase.from("at_bats").select("player_id, result, rbi").eq("team_id", teamId),
  ]);

  const roster = players || [];
  const bats = atBats || [];
  if (roster.length === 0) {
    return NextResponse.json({ error: "Add players to your roster first." }, { status: 400 });
  }
  if (bats.length === 0) {
    return NextResponse.json({ error: "No at-bats logged yet. Score a game in the Scorekeeper and the lineup advisor will build your order." }, { status: 400 });
  }

  const byPlayer = {};
  for (const a of bats) {
    if (a.player_id) (byPlayer[a.player_id] = byPlayer[a.player_id] || []).push(a);
  }
  const ranked = recommendLineup(roster, byPlayer);
  const named = (p) => (p.jersey_number ? `#${p.jersey_number} ` : "") + p.name;

  // Structured order for the UI (ranked players get a slot; thin-data players listed after).
  const order = ranked.map((r, i) => ({
    slot: r.hasData ? i + 1 : null,
    name: named(r.player),
    pa: r.o.pa,
    avg: fmtAvg(r.o.avg),
    obp: fmtAvg(r.o.obp),
    slg: fmtAvg(r.o.slg),
    ops: fmtAvg(r.o.ops),
    hr: r.o.hr,
    sb: r.o.sb,
    hasData: r.hasData,
  }));

  // Data block for Claude.
  const withData = ranked.filter((r) => r.hasData);
  const lines = withData.map((r, i) =>
    `${i + 1}. ${named(r.player)} — PA ${r.o.pa}, AVG ${fmtAvg(r.o.avg)}, OBP ${fmtAvg(r.o.obp)}, SLG ${fmtAvg(r.o.slg)}, OPS ${fmtAvg(r.o.ops)}` +
    `${r.o.hr ? `, HR ${r.o.hr}` : ""}${r.o.sb ? `, SB ${r.o.sb}` : ""}`);
  const thin = ranked.filter((r) => !r.hasData).map((r) => named(r.player));

  const dataBlock = [
    `Team: ${team.name} (${sportLabel(team.sport)}${team.season ? ", " + team.season : ""})`,
    `Recommended batting order (computed from on-base ability and OPS, table-setters first; a player needs at least ${MIN_PA} plate appearances to be ranked on merit):`,
    lines.join("\n"),
    thin.length ? `Not enough at-bats yet to rank: ${thin.join(", ")}` : "",
  ].filter(Boolean).join("\n\n");

  const system = `You are an experienced, encouraging assistant coach for a youth ${sportLabel(team.sport)} team. The recommended batting order below was computed from the players' real at-bats (weighted toward getting on base, with OPS mixing in power). Explain it to the head coach in plain, practical terms grounded ONLY in these numbers — never invent stats. Be concrete and name players, but stay positive and development-focused; these are kids. Output plain text (no markdown symbols or bullets), about 200-300 words, organized under these short headers, each on its own line: The order, Why it's built this way, Swinging it well, Tweaks to consider. Under "Tweaks to consider" offer one or two optional adjustments a coach might weigh (speed at the top, protecting a strong bat, giving a cold hitter a lower spot) and remind them this is a starting point, not a rule.`;
  const prompt = `Here is the team's recommended order and the numbers behind it. Explain it for the coach.\n\n${dataBlock}`;

  const result = await askClaude({ system, prompt, maxTokens: 900 });
  if (!result.ok) {
    return NextResponse.json({ error: result.error || "Could not generate the lineup advice." }, { status: 502 });
  }
  return NextResponse.json({ ok: true, order, advice: result.text, generatedAt: new Date().toISOString() });
}
