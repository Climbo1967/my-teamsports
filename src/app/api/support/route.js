import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail, basicHtml, SUPPORT_INBOX } from "@/lib/email";
import { rateLimited, RATE_MSG } from "@/lib/ratelimit";

export async function POST(request) {
  if (await rateLimited(request, "support", { limit: 5, windowMs: 600_000 })) {
    return NextResponse.json({ error: RATE_MSG }, { status: 429 });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  const { subject, message, teamId, teamName } = payload || {};
  const cleanSubject = String(subject || "").trim().slice(0, 150);
  const cleanMessage = String(message || "").trim().slice(0, 5000);

  if (!cleanSubject || !cleanMessage) {
    return NextResponse.json({ error: "Add a subject and a message." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  const coachName = user.user_metadata?.full_name || null;

  const { error } = await supabase.from("support_requests").insert({
    coach_id: user.id,
    coach_email: user.email,
    coach_name: coachName,
    team_id: teamId || null,
    team_name: teamName || null,
    subject: cleanSubject,
    message: cleanMessage,
  });

  if (error) {
    return NextResponse.json({ error: "Could not submit your request. Try again." }, { status: 500 });
  }

  // Notify the support inbox; a reply goes straight back to the coach.
  await sendEmail({
    to: SUPPORT_INBOX,
    replyTo: user.email,
    subject: `[Support] ${cleanSubject}`,
    text: `From: ${coachName ? coachName + " " : ""}<${user.email}>\nTeam: ${teamName || "—"}\n\n${cleanMessage}`,
    html: basicHtml({
      heading: cleanSubject,
      body: cleanMessage,
      footer: `From ${coachName ? coachName + " " : ""}${user.email}${teamName ? " · " + teamName : ""} — reply to this email to respond directly.`,
    }),
  });

  return NextResponse.json({ ok: true });
}
