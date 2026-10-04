import { NextResponse, after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { welcomeEmail } from "@/lib/coachEmailPlan";
import { deliverCoachEmail } from "@/lib/coachEmail";

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
    const { data, error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      // A new coach just confirmed: send the welcome once the redirect is on
      // its way. Never blocks or breaks the confirmation itself.
      if ((type === "signup" || type === "email") && data?.user?.id) {
        const userId = data.user.id;
        after(() => sendWelcome(userId).catch(() => {}));
      }
      // Session cookies are now set — send the user straight into the app.
      const next = type === "recovery" ? "/reset-password" : "/dashboard";
      return NextResponse.redirect(new URL(next, origin));
    }
  }

  // A used or expired password-reset link: the coach needs a new reset link,
  // not a confirmation resend (bug sweep 2026-10-03, #15).
  if (type === "recovery") {
    return NextResponse.redirect(new URL("/forgot-password?message=reset_expired", origin));
  }

  // Link expired or already used. If it was used before, the email is already
  // confirmed — the login page shows a friendly banner + resend option.
  return NextResponse.redirect(new URL("/login?message=confirm_expired", origin));
}

// The automatic welcome (replaces the hand-written Gmail one, 2026-10-02).
// The coach_emails log makes it once-only: a second click on the confirm link,
// or the daily job's safety net, finds the "welcome" key already taken.
// Skips owner/test accounts (monitor_exclusions) and anyone who opted out.
// If the migration isn't applied yet, the profile select fails and nothing sends.
async function sendWelcome(userId) {
  const admin = createAdminClient();
  if (!admin) return;
  const { data: profile, error } = await admin
    .from("profiles")
    .select("id, email, full_name, unsub_token, email_opt_out")
    .eq("id", userId)
    .single();
  if (error || !profile?.email || !profile.unsub_token || profile.email_opt_out) return;

  const email = String(profile.email).toLowerCase();
  const { data: excluded } = await admin.from("monitor_exclusions").select("email").eq("email", email).limit(1);
  if (excluded && excluded.length > 0) return;

  const coach = { id: profile.id, email, full_name: profile.full_name, unsub_token: profile.unsub_token };
  const mail = welcomeEmail(coach);
  await deliverCoachEmail(admin, { coach, kind: "welcome", keys: ["welcome"], ...mail, meta: { source: "confirm" } });
}
