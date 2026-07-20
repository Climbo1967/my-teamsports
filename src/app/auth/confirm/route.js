import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Email confirmation endpoint that works from ANY device/browser.
// The Supabase email templates link here with ?token_hash=...&type=signup
// (or type=recovery for password resets). verifyOtp validates the token
// server-side — no PKCE code verifier needed, so the link works even when
// the email is opened on a different device than the one that signed up.
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      // Session cookies are now set — send the user straight into the app.
      const next = type === "recovery" ? "/reset-password" : "/dashboard";
      return NextResponse.redirect(new URL(next, origin));
    }
  }

  // Link expired or already used. If it was used before, the email is already
  // confirmed — the login page shows a friendly banner + resend option.
  return NextResponse.redirect(new URL("/login?message=confirm_expired", origin));
}
