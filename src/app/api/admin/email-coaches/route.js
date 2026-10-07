import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmailBatch } from "@/lib/email";
import { rateLimited, RATE_MSG } from "@/lib/ratelimit";
import { coachFillIns, fillTemplate } from "@/lib/coachEmailPlan";
import { loadCoachSnapshot, renderCoachEmail } from "@/lib/coachEmail";

// Sends a message from the admin console to selected coaches THROUGH the app
// (Resend, noreply@my-teamsports.com) instead of opening the admin's personal
// mail client. Each coach gets their own email: a personal greeting, the
// message with its fill-ins ({team}, {trial_end}, ...) resolved for that coach,
// and an unsubscribe link. Replies go to the admin's own address.
//
// Security: admin-only via the is_admin() RPC, and the recipient list is
// re-validated server-side against admin_overview() — this route can only ever
// email addresses that actually exist in the coach directory, never arbitrary
// ones a tampered request might include.
//
// Coaches who unsubscribed are skipped, and so is anyone without an account
// yet (no account = no unsubscribe link to give them). Every email that goes
// out is written to the coach_emails log.
export async function POST(request) {
  if (await rateLimited(request, "admin-email-coaches", { limit: 10, windowMs: 600_000 })) {
    return NextResponse.json({ error: RATE_MSG }, { status: 429 });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  const subject = String(payload?.subject || "").trim().slice(0, 150);
  const message = String(payload?.message || "").trim().slice(0, 5000);
  const requested = Array.isArray(payload?.emails)
    ? [...new Set(payload.emails.map((e) => String(e || "").trim().toLowerCase()).filter(Boolean))]
    : [];

  if (!subject || !message || requested.length === 0) {
    return NextResponse.json({ error: "Subject, message, and at least one coach are required." }, { status: 400 });
  }
  if (requested.length > 500) {
    return NextResponse.json({ error: "Too many recipients." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) return NextResponse.json({ error: "Admins only." }, { status: 403 });

  // Re-derive the coach directory server-side and keep only requested addresses
  // that are actually in it.
  const { data: overview } = await supabase.rpc("admin_overview");
  const directory = new Set((overview?.coaches || []).map((c) => String(c.email || "").toLowerCase()));
  const inDirectory = requested.filter((e) => directory.has(e));
  if (inDirectory.length === 0) {
    return NextResponse.json({ error: "None of those addresses are in the coach directory." }, { status: 400 });
  }

  // Per-coach details (name, team, trial dates, unsubscribe token, opt-out).
  const admin = createAdminClient();
  const snap = await loadCoachSnapshot(admin, { teamLinks: true });
  if (!snap.ok) {
    return NextResponse.json({ error: "The email log isn't set up yet, so nothing was sent." }, { status: 503 });
  }
  const coachByEmail = new Map(snap.snapshot.coaches.map((c) => [c.email, c]));
  const teamsByCoach = new Map();
  for (const t of snap.snapshot.teams) teamsByCoach.set(t.coach_id, [...(teamsByCoach.get(t.coach_id) || []), t]);

  const now = new Date();
  const messages = [];
  const logRows = [];
  let optedOut = 0;
  let noAccount = 0;
  for (const email of inDirectory) {
    const coach = coachByEmail.get(email);
    if (!coach || !coach.unsub_token) { noAccount += 1; continue; }
    if (coach.opt_out) { optedOut += 1; continue; }
    const fill = coachFillIns(coach, teamsByCoach.get(coach.id) || [], now);
    const filledSubject = fillTemplate(subject, fill.values).slice(0, 200);
    const body = `Hi ${fill.greeting},\n\n${fillTemplate(message, fill.values)}`;
    messages.push(renderCoachEmail({ coach, subject: filledSubject, heading: filledSubject, body, replyTo: user.email }));
    logRows.push({ coach_id: coach.id, email, kind: "admin", subject: filledSubject, status: "sent", sent_by: user.id, meta: { source: "admin" } });
  }

  if (messages.length === 0) {
    return NextResponse.json(
      { error: "Nobody to send to: everyone selected has unsubscribed or has no account yet.", sent: 0, optedOut, noAccount },
      { status: 400 }
    );
  }

  // Sender shows as "Ron at My-Team Sports" (the admin's first name from their
  // account) — same verified noreply address.
  const adminFirst = String(user.user_metadata?.full_name || "").trim().split(/\s+/)[0];
  if (adminFirst) for (const m of messages) m.from = `${adminFirst} at My-Team Sports <noreply@my-teamsports.com>`;

  // Resend's batch endpoint takes up to 100 emails per call.
  let sent = 0;
  for (let i = 0; i < messages.length; i += 100) {
    const chunk = messages.slice(i, i + 100);
    const result = await sendEmailBatch(chunk);
    if (!result.ok) {
      const detail = sent > 0 ? ` (${sent} of ${messages.length} were already sent)` : "";
      return NextResponse.json({ error: (result.error || "Sending failed.") + detail, sent }, { status: 502 });
    }
    const rows = logRows.slice(i, i + chunk.length).map((row, j) => ({ ...row, provider_id: result.ids?.[j] || null }));
    // The emails are already out; a logging hiccup must not report them as failed.
    await admin.from("coach_emails").insert(rows);
    sent += chunk.length;
  }

  return NextResponse.json({ ok: true, sent, optedOut, noAccount, skipped: requested.length - inDirectory.length });
}
