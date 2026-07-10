// Shared-store rate limiter (security backlog follow-up to audit M4).
// Backed by the Postgres check_rate_limit() RPC so a limit holds across every
// serverless instance, instead of the old per-warm-instance in-memory Map.
//
// Fails OPEN on any problem — missing service-role key, DB error, or network
// blip returns "not limited". A rate limiter must never lock real users out
// because its backing store hiccuped; blocking abuse is best-effort, keeping
// the app usable is not.
import { createAdminClient } from "@/lib/supabase/admin";

function clientIp(request) {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

export async function rateLimited(request, name, { limit, windowMs }) {
  const supabase = createAdminClient();
  if (!supabase) return false; // no service-role key -> fail open

  const key = `${name}:${clientIp(request)}`;
  const windowSeconds = Math.max(1, Math.round(windowMs / 1000));

  try {
    const { data, error } = await supabase.rpc("check_rate_limit", {
      p_key: key,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    });
    if (error) return false; // DB error -> fail open
    return data === true;
  } catch {
    return false; // unexpected -> fail open
  }
}

export const RATE_MSG = "Too many attempts. Wait a minute and try again.";
