import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail, basicHtml } from "@/lib/email";

export async function POST(request) {
  const { teamId, subject, body } = await request.json();
  const cleanSubject = String(subject || "Team update").trim().slice(0, 150);
  const cleanBody = String(body || "").trim();

  if (!teamId || !cleanBody) {
    return NextResponse.json({ error: "Missing announcement content." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  // RLS ensures the coach can only read their own team + its subscribers.
  const { data: team } = await supabase.from("teams").select("id, name, slug").eq("id", teamId).single();
  if (!team) return NextResponse.json({ error: "Team not found." }, { status: 404 });

  const { data: subs } = await supabase.from("subscribers").select("email").eq("team_id", teamId);
  const emails = [...new Set((subs || []).map((s) => s.email).filter(Boolean))];
  if (emails.length === 0) return NextResponse.json({ error: "No subscribers yet." }, { status: 400 });

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

  if (!result.ok) return NextResponse.json({ error: result.error || "Email failed to send." }, { status: 502 });
  return NextResponse.json({ ok: true, count: emails.length });
}
