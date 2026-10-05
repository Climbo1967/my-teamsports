// Server-only: monthly AI Coach allowances per team (bug sweep 2026-10-03, #19).
// NEVER import into a client component (it uses the service-role client).
//
// The chat cap used to count ai_chat_messages under the calling coach's RLS,
// so it was really per coach, and "Clear chat" deleted the rows and reset it.
// Briefing, practice plan and lineup had no monthly cap at all. All four now
// count the append-only use log (ai_coach_events, written by logAiUse after
// every successful call): one number per team per calendar month, every coach
// on the staff combined, untouched by Clear chat.
//
// Fail-open on purpose: if the service key or the log table is missing, the
// result says source: "none" and the coach is not blocked; the chat route
// then falls back to its old per-coach count.
import { createAdminClient } from "@/lib/supabase/admin";

// Coach-initiated calls per team per calendar month (UTC).
export const AI_MONTHLY_CAPS = {
  chat: 400,
  briefing: 100,
  practice: 100,
  lineup: 100,
};

const TOOL_NAMES = {
  chat: "AI chat",
  briefing: "Coach's briefing",
  practice: "practice planner",
  lineup: "lineup advisor",
};

export function monthStart(now = new Date()) {
  const d = new Date(now);
  d.setUTCDate(1);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export function aiCapMessage(kind) {
  return `This team has used its ${TOOL_NAMES[kind] || "AI Coach"} allowance for the month (${AI_MONTHLY_CAPS[kind]}). It resets on the 1st.`;
}

/**
 * How much of this month's allowance the team has used.
 * Returns { allowed, used, cap, source } where source is "log" (counted from
 * ai_coach_events) or "none" (log unavailable; allowed).
 */
export async function aiMonthlyUse(kind, teamId, { now = new Date() } = {}) {
  const cap = AI_MONTHLY_CAPS[kind];
  if (!cap || !teamId) return { allowed: true, used: 0, cap: cap || 0, source: "none" };

  try {
    const admin = createAdminClient();
    if (admin) {
      const { count, error } = await admin
        .from("ai_coach_events")
        .select("id", { count: "exact", head: true })
        .eq("team_id", teamId)
        .eq("kind", kind)
        .gte("created_at", monthStart(now).toISOString());
      if (!error && typeof count === "number") {
        return { allowed: count < cap, used: count, cap, source: "log" };
      }
    }
  } catch {
    // log unavailable
  }
  return { allowed: true, used: 0, cap, source: "none" };
}
