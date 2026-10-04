import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail, basicHtml, RESEND_MAX_RECIPIENTS } from "@/lib/email";
import { sendPush } from "@/lib/push";
import { rateLimited, RATE_MSG } from "@/lib/ratelimit";

export async function POST(request) {
  if (await rateLimited(request, "send-announcement", { limit: 10, windowMs: 600_000 })) {
    return NextResponse.json({ error: RATE_MSG }, { status: 429 });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  const { teamId, announcementId, subject, body } = payload || {};
  const cleanSubject = String(subject || "Team update").trim().slice(0, 150);
  const cleanBody = String(body || "").trim();

  if (!teamId || !cleanBody) {
    return NextResponse.json({ error: "Missing announcement content." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  // RLS ensures the coach can only read their own team + its subscribers/devices.
  const { data: team } = await supabase.from("teams").select("id, name, slug").eq("id", teamId).single();
  if (!team) return NextResponse.json({ error: "Team not found." }, { status: 404 });

  const [{ data: subs }, { data: devices }] = await Promise.all([
    supabase.from("subscribers").select("email").eq("team_id", teamId),
    supabase.from("push_subscriptions").select("endpoint, p256dh, auth").eq("team_id", teamId).eq("want_announcements", true),
  ]);
  const emails = [...new Set((subs || []).map((s) => s.email).filter(Boolean))];
  const pushSubs = devices || [];

  if (emails.length === 0 && pushSubs.length === 0) {
    return NextResponse.json({ error: "No subscribers or devices yet." }, { status: 400 });
  }

  let emailCount = 0;
  let emailFailed = 0;
  let pushCount = 0;
  let emailError = null;

  // Email channel. Resend takes at most 50 recipients per message, so the
  // list goes out in chunks; one bad chunk no longer fails everyone.
  if (emails.length > 0) {
    const message = {
      to: "noreply@my-teamsports.com",
      replyTo: user.email,
      subject: cleanSubject,
      text: `${cleanBody}\n\n— ${team.name}\nhttps://my-teamsports.com/team/${team.slug}\n\nUnsubscribe: https://my-teamsports.com/unsubscribe?team=${team.slug}`,
      html: basicHtml({
        heading: cleanSubject,
        body: cleanBody,
        footer: `Sent by ${team.name} via My-Team Sports · my-teamsports.com/team/${team.slug}`,
        unsubscribeUrl: `https://my-teamsports.com/unsubscribe?team=${team.slug}`,
      }),
    };
    const chunkSize = RESEND_MAX_RECIPIENTS - 1; // the "to" address counts too
    for (let i = 0; i < emails.length; i += chunkSize) {
      const chunk = emails.slice(i, i + chunkSize);
      const result = await sendEmail({ ...message, bcc: chunk });
      if (result.ok) emailCount += chunk.length;
      else {
        emailFailed += chunk.length;
        emailError = emailError || result.error || "Email failed to send.";
      }
    }
  }

  // Push channel (devices that opted in on the team site).
  if (pushSubs.length > 0) {
    const r = await sendPush(pushSubs, {
      title: cleanSubject,
      body: cleanBody.slice(0, 180),
      url: `/team/${team.slug}`,
    });
    pushCount = r.sent || 0;
    if (r.stale && r.stale.length) {
      await supabase.from("push_subscriptions").delete().eq("team_id", teamId).in("endpoint", r.stale);
    }
  }

  if (emailCount === 0 && pushCount === 0) {
    return NextResponse.json({ error: emailError || "Could not notify the team." }, { status: 502 });
  }

  // Only stamp the post as emailed when at least one email actually went; a
  // push-only success used to mark it emailed and hide the email failure.
  if (announcementId && emailCount > 0) {
    await supabase.from("announcements").update({ emailed_at: new Date().toISOString() }).eq("id", announcementId);
  }
  // A partial failure is still ok: true (something went out), with the
  // numbers and the first error so the coach can see what did not.
  return NextResponse.json({ ok: true, emailCount, emailFailed, pushCount, emailError });
}
