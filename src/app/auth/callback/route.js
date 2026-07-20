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
  // Only allow same-site relative paths to avoid open redirects.
  const nextParam = searchParams.get("next");
  const next = nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }
  }

  return NextResponse.redirect(new URL("/login?message=email_confirmed_login", origin));
}
