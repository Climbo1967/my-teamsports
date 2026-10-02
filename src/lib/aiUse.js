// Server-only: writes and reads the AI Coach use log (ai_coach_events).
// NEVER import into a client component (it uses the service-role client).
// The numbers shown on the admin page are worked out in ./aiUseSummary.js.
import { createAdminClient } from "@/lib/supabase/admin";
import { AI_USE_KINDS } from "@/lib/aiUseSummary";

/**
 * Record one AI Coach event. Never throws and never blocks the coach: if the
 * log table is missing, the key is absent, or the row is a repeat view for the
 * same coach, team and day, it quietly does nothing.
 */
export async function logAiUse(kind, { teamId, userId }) {
  try {
    if (!AI_USE_KINDS.includes(kind) || !teamId) return false;
    const admin = createAdminClient();
    if (!admin) return false;
    const { error } = await admin
      .from("ai_coach_events")
      .insert({ team_id: teamId, user_id: userId || null, kind });
    return !error;
  } catch {
    return false;
  }
}

const PAGE = 1000;      // the API returns at most 1,000 rows per request
const MAX_PAGES = 20;   // 20,000 events is far beyond what the admin page needs

/**
 * The log rows for the admin page, newest first, read a page at a time.
 * Returns { ok, rows, truncated } or { ok:false } when the log isn't set up.
 */
export async function loadAiUseRows(admin) {
  try {
    if (!admin) return { ok: false, rows: [], truncated: false };
    const rows = [];
    for (let page = 0; page < MAX_PAGES; page += 1) {
      const from = page * PAGE;
      const { data, error } = await admin
        .from("ai_coach_events")
        .select("team_id, user_id, kind, created_at")
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .range(from, from + PAGE - 1);
      if (error || !data) return { ok: false, rows: [], truncated: false };
      rows.push(...data);
      if (data.length < PAGE) return { ok: true, rows, truncated: false };
    }
    return { ok: true, rows, truncated: true };
  } catch {
    return { ok: false, rows: [], truncated: false };
  }
}
