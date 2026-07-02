import { createClient } from "@supabase/supabase-js";

// Server-only Supabase client using the service-role key. NEVER import this into
// a client component. Used to perform storage writes on behalf of passcode-verified
// parents so the public bucket no longer needs an anonymous INSERT policy.
// Returns null when the key is absent so callers can degrade gracefully.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
