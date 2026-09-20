// Read-only monitor endpoints for Sydney (Ron's local assistant), 2026-09-20.
// Same shape as the QKM monitor: a bearer token per scope, stored only as a
// sha256 in public.monitor_tokens, revocable with one UPDATE. The token check
// is the real gate — rateLimited() fails open by design and is only here to
// blunt a brute-force attempt on the token.
//
// Everything the routes return comes from the monitor_* SQL functions in
// migrations/20260920150000_monitor_endpoints.sql, which apply the exclusions
// themselves: public.monitor_exclusions (Ron's own and test accounts, inserted
// DB-side so no personal address lives in this repo), public.admins,
// @example.com, and the demo league.
import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimited, RATE_MSG } from "@/lib/ratelimit";

const NO_STORE = { "cache-control": "no-store, must-revalidate" };

function bearer(request) {
  const h = request.headers.get("authorization") || "";
  const m = /^Bearer\s+(\S+)$/i.exec(h);
  return m ? m[1] : null;
}

// Returns { supabase, token } on success, or a NextResponse to send back.
export async function authorizeMonitor(request, scope) {
  if (await rateLimited(request, `monitor-${scope}`, { limit: 60, windowMs: 600_000 })) {
    return NextResponse.json({ error: RATE_MSG }, { status: 429, headers: NO_STORE });
  }
  const supabase = createAdminClient();
  if (!supabase) {
    // No service-role key on this deployment: say so, never return empty data.
    return NextResponse.json({ error: "Monitor unavailable: service role not configured." }, { status: 503, headers: NO_STORE });
  }
  const raw = bearer(request);
  if (!raw || raw.length < 16 || raw.length > 256) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401, headers: NO_STORE });
  }
  const sha = crypto.createHash("sha256").update(raw, "utf8").digest("hex");
  const { data: token, error } = await supabase
    .from("monitor_tokens")
    .select("id, name, scope, revoked_at")
    .eq("token_sha256", sha)
    .eq("scope", scope)
    .is("revoked_at", null)
    .maybeSingle();
  if (error) {
    return NextResponse.json({ error: "Monitor unavailable: token store error." }, { status: 503, headers: NO_STORE });
  }
  if (!token) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401, headers: NO_STORE });
  }
  // Best-effort audit; a failure here must not fail the read.
  supabase.from("monitor_tokens").update({ last_used_at: new Date().toISOString() }).eq("id", token.id).then(() => {}, () => {});
  return { supabase, token };
}

export async function monitorRpc(supabase, fn, params) {
  const { data, error } = await supabase.rpc(fn, params);
  if (error) {
    return NextResponse.json({ error: `Monitor query failed: ${error.message}` }, { status: 500, headers: NO_STORE });
  }
  return NextResponse.json(data, { status: 200, headers: NO_STORE });
}

export function intParam(url, name, def, min, max) {
  const v = parseInt(url.searchParams.get(name) ?? "", 10);
  if (Number.isNaN(v)) return def;
  return Math.max(min, Math.min(max, v));
}
