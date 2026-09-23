import { authorizeMonitor, monitorRpc, intParam } from "@/lib/monitor";
import { NextResponse } from "next/server";

// GET /api/monitor/tickets — coach support requests (public.support_requests).
// Read-only, PII (coach email + name) by design. Scope 'tickets'. Same
// exclusions as trials (monitor_exclusions, admins, @example.com, demo league).
//   ?since_hours=24     window on created_at (1..336)
//   ?status=open|all    default all
//   ?limit=20           tickets (1..100)
//   ?ticket_id=<uuid>   that one request in full, window ignored
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(request) {
  const auth = await authorizeMonitor(request, "tickets");
  if (!auth.supabase) return auth;
  const url = new URL(request.url);
  const ticketId = (url.searchParams.get("ticket_id") || "").trim() || null;
  if (ticketId && !UUID.test(ticketId)) {
    return NextResponse.json(
      { error: "ticket_id must be a uuid." },
      { status: 400, headers: { "cache-control": "no-store, must-revalidate" } }
    );
  }
  const status = /^open$/i.test(url.searchParams.get("status") || "") ? "open" : "all";
  return monitorRpc(auth.supabase, "monitor_tickets", {
    p_since_hours: intParam(url, "since_hours", 24, 1, 336),
    p_status: status,
    p_limit: intParam(url, "limit", 20, 1, 100),
    p_ticket_id: ticketId,
  });
}
