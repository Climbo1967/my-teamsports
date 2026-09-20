import { authorizeMonitor, monitorRpc } from "@/lib/monitor";

// GET /api/monitor/trials — the per-team board: every real coach's team with
// its status (paid / league / trial_open / comped / expired_unpaid), trial and
// paid-through dates, roster size, AI dates, plus coaches with no team yet.
// PII (coach name + email) by design. Scope 'trials'.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const auth = await authorizeMonitor(request, "trials");
  if (!auth.supabase) return auth;
  return monitorRpc(auth.supabase, "monitor_trials", {});
}
