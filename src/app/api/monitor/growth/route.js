import { authorizeMonitor, monitorRpc } from "@/lib/monitor";

// GET /api/monitor/growth — aggregates only (signups, funnel, teams by status,
// revenue, landing paths). No names or emails. Scope 'growth'.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const auth = await authorizeMonitor(request, "growth");
  if (!auth.supabase) return auth;
  return monitorRpc(auth.supabase, "monitor_growth", {});
}
