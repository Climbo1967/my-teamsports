import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendPush } from "@/lib/push";
import { rateLimited, RATE_MSG } from "@/lib/ratelimit";

// Sends a team push on game start / final. Coach-triggered from the scorer.
export async function POST(request) {
  if (rateLimited(request, "push-game", { limit: 30, windowMs: 600_000 })) {
    return NextResponse.json({ error: RATE_MSG }, { status: 429 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  const { teamId, kind, opponent, ourScore, oppScore } = body || {};
  if (!teamId || (kind !== "start" && kind !== "final")) {
    return NextResponse.json({ error: "Missing fields." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  // RLS limits this to the coach's own team + its device subscriptions.
  const { data: team } = await supabase.from("teams").select("id, name, slug").eq("id", teamId).single();
  if (!team) return NextResponse.json({ error: "Team not found." }, { status: 404 });

  const { data: devices } = await supabase
    .from("push_subscriptions").select("endpoint, p256dh, auth").eq("team_id", teamId).eq("want_games", true);
  const subs = devices || [];
  if (subs.length === 0) return NextResponse.json({ ok: true, sent: 0 });

  const opp = (opponent && String(opponent).trim()) || "the opponent";
  let title;
  let text;
  if (kind === "start") {
    title = `🏟️ ${team.name} — game starting`;
    text = `The game vs ${opp} is underway. Follow the live score on the team site.`;
  } else {
    const us = Number(ourScore) || 0;
    const them = Number(oppScore) || 0;
    const verdict = us > them ? "Win" : us < them ? "Final" : "Tie";
    title = `${verdict} — ${team.name}`;
    text = `${team.name} ${us}, ${opp} ${them}. See the recap on the team site.`;
  }

  const r = await sendPush(subs, { title, body: text, url: `/team/${team.slug}` });
  if (r.stale && r.stale.length) {
    await supabase.from("push_subscriptions").delete().eq("team_id", teamId).in("endpoint", r.stale);
  }
  return NextResponse.json({ ok: true, sent: r.sent });
}
