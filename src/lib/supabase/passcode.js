// Server-only client for the parent-facing passcode RPCs (get_team_site,
// get_board, upsert_rsvp, ...). NEVER import into a client component.
//
// Why a separate client: the database throttles wrong passcodes per team AND
// caller IP (passcode_gate, 2026-10-09 migration). Our API routes all call
// from Vercel, so the IP PostgREST sees is Vercel's, not the parent's — every
// parent of a team would share one bucket and one attacker could lock them
// all out. So the routes call with the service role and forward the parent's
// real IP in `x-mts-client-ip`; the gate trusts that header only on
// service-role requests, so a direct caller with the public key cannot forge
// it. The functions are SECURITY DEFINER with their own passcode checks, so
// the service role grants nothing extra inside them.
//
// Falls back to the cookie-aware anon client when the service key is absent
// (local dev without it): everything still works, keyed by the platform IP.
import { createClient } from "@supabase/supabase-js";
import { createClient as createCookieClient } from "@/lib/supabase/server";

export function clientIp(request) {
  const fwd = request?.headers?.get?.("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return request?.headers?.get?.("x-real-ip") || "unknown";
}

export async function createPasscodeClient(ip) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) {
    return createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { "x-mts-client-ip": String(ip || "unknown").slice(0, 64) } },
    });
  }
  return createCookieClient();
}

// What the database returns when the slug/passcode pair is wrong: jsonb
// functions give {error: "invalid team or passcode"}, the others give null.
export function passcodeDenied(data) {
  return data === null || data === undefined || (typeof data === "object" && data?.error === "invalid team or passcode");
}

export function lockedOut(error) {
  return !!error && /too many attempts/i.test(error.message || "");
}

export const LOCKOUT_MSG = "Too many wrong passcodes from your network right now. Wait 15 minutes and try again.";
export const EXPIRED_MSG = "Your team access expired. Re-enter the passcode.";
