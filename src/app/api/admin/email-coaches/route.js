import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmailBatch, basicHtml } from "@/lib/email";
import { rateLimited, RATE_MSG } from "@/lib/ratelimit";

// Sends a message from the admin console to selected coaches THROUGH the app
// (Resend, noreply@my-teamsports.com) instead of opening the admin's personal
// mail client. Each coach gets an individual email with a personal greeting;
// replies go to the admin's own address.
//
// Security: admin-only via the is_admin() RPC, and the recipient list is
// re-validated server-side against admin_overview() — this route can only ever
// email addresses that actually exist in the coach directory, never arbitrary
// ones a tampered request might include.
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
  const directory = new Map(
    (overview?.coaches || []).map((c) => [String(c.email || "").toLowerCase(), c.full_name || ""])
  );
  const recipients = requested.filter((e) => directory.has(e));
  if (recipients.length === 0) {
    return NextResponse.json({ error: "None of those addresses are in the coach directory." }, { status: 400 });
  }

  const messages = recipients.map((email) => {
    const first = (directory.get(email) || "").trim().split(/\s+/)[0];
    const body = `Hi ${first || "Coach"},\n\n${message}`;
    return {
      to: email,
      replyTo: user.email,
      subject,
      text: `${body}\n\n— My-Team Sports · my-teamsports.com`,
      html: basicHtml({
        heading: subject,
        body,
        footer: `Sent by My-Team Sports · my-teamsports.com — replies go to ${user.email}`,
      }),
    };
  });

  // Resend's batch endpoint takes up to 100 emails per call.
  let sent = 0;
  for (let i = 0; i < messages.length; i += 100) {
    const chunk = messages.slice(i, i + 100);
    const result = await sendEmailBatch(chunk);
    if (!result.ok) {
      const detail = sent > 0 ? ` (${sent} of ${messages.length} were already sent)` : "";
      return NextResponse.json({ error: (result.error || "Sending failed.") + detail, sent }, { status: 502 });
    }
    sent += chunk.length;
  }

  return NextResponse.json({ ok: true, sent, skipped: requested.length - recipients.length });
}
