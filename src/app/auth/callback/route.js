import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// PKCE code-exchange callback (used by OAuth providers, and a safety net for
// any legacy confirmation links). Exchange only works in the same browser
// that started the flow; when it fails after an email confirmation click,
// the email itself IS already confirmed — so route the user to login with a
// friendly message instead of a silent or scary error.
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Only allow same-site destinations to avoid open redirects. The old check
  // let "/\\evil.com" through (browsers read "/\\" as "//"). The value is now
  // resolved against our origin and the redirect uses that absolute URL, so
  // whatever the spelling, the browser can only land on this site.
  const next = safeNext(searchParams.get("next"), origin);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(next);
    }
  }

  return NextResponse.redirect(new URL("/login?message=email_confirmed_login", origin));
}

// Returns an absolute URL on `origin`. Anything that is not a plain path, or
// that resolves off-site ("//evil.com", "/\\evil.com", "/..//evil.com"), goes
// to the dashboard instead.
function safeNext(value, origin) {
  const fallback = new URL("/dashboard", origin).href;
  if (!value || typeof value !== "string" || !value.startsWith("/") || /^\/[\/\\]/.test(value)) return fallback;
  try {
    const resolved = new URL(value, origin);
    if (resolved.origin !== origin || resolved.pathname.startsWith("//")) return fallback;
    return resolved.href;
  } catch {
    return fallback;
  }
}
