import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail, basicHtml } from "@/lib/email";
import { sendPush } from "@/lib/push";

export async function POST(request) {
  const { teamId, announcementId, subject, body } = await request.json();
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
    supabase.from("push_subscriptions").select("endpoint, p256dh, auth").eq("team_id", teamId),
  ]);
  const emails = [...new Set((subs || []).map((s) => s.email).filter(Boolean))];
  const pushSubs = devices || [];

  if (emails.length === 0 && pushSubs.length === 0) {
    return NextResponse.json({ error: "No subscribers or devices yet." }, { status: 400 });
  }

  let emailCount = 0;
  let pushCount = 0;
  let emailError = null;

  // Email channel (unchanged behavior, now optional).
  if (emails.length > 0) {
    const result = await sendEmail({
      to: "noreply@2bcreations.com",
      bcc: emails,
      replyTo: user.email,
      subject: cleanSubject,
      text: `${cleanBody}\n\n— ${team.name}\nhttps://my-teamsports.com/team/${team.slug}\n\nUnsubscribe: https://my-teamsports.com/unsubscribe?team=${team.slug}`,
      html: basicHtml({
        heading: cleanSubject,
        body: cleanBody,
        footer: `Sent by ${team.name} via My-Team Sports · my-teamsports.com/team/${team.slug}`,
        unsubscribeUrl: `https://my-teamsports.com/unsubscribe?team=${team.slug}`,
      }),
    });
    if (result.ok) emailCount = emails.length;
    else emailError = result.error || "Email failed to send.";
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

  if (announcementId) {
    await supabase.from("announcements").update({ emailed_at: new Date().toISOString() }).eq("id", announcementId);
  }
  return NextResponse.json({ ok: true, emailCount, pushCount });
}
