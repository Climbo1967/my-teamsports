import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimited, RATE_MSG } from "@/lib/ratelimit";
import { logAiUse } from "@/lib/aiUse";

// Called once when a coach opens the AI Coach tab (or the chat screen).
// Records "opened it" or "opened it and saw the locked card" in the use log,
// at most once per coach, per team, per day. Which of the two it was is
// decided here from the team's own billing columns, not by the browser.
export async function POST(request) {
  if (await rateLimited(request, "ai-seen", { limit: 60, windowMs: 300_000 })) {
    return NextResponse.json({ error: RATE_MSG }, { status: 429 });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  const teamId = payload?.teamId;
  if (!teamId) return NextResponse.json({ error: "Missing team." }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  // RLS only returns the team if this coach is on its staff.
  const { data: team } = await supabase
    .from("teams").select("id, ai_enabled, ai_paid_through, ai_trial_ends_at").eq("id", teamId).single();
  if (!team) return NextResponse.json({ error: "Team not found." }, { status: 404 });

  const aiActive = team.ai_enabled
    || (team.ai_paid_through && team.ai_paid_through >= new Date().toISOString().slice(0, 10))
    || (team.ai_trial_ends_at && new Date(team.ai_trial_ends_at) > new Date());

  await logAiUse(aiActive ? "hub_view" : "locked_view", { teamId: team.id, userId: user.id });
  return NextResponse.json({ ok: true });
}
