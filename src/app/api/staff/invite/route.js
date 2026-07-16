import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail, basicHtml } from "@/lib/email";
import { rateLimited, RATE_MSG } from "@/lib/ratelimit";

// Emails an invited assistant coach with instructions for getting into the team.
// The invite row itself is created by the client under the "Owner invites coaches"
// RLS policy — this route only notifies, and re-verifies authorization server-side.
export async function POST(request) {
  if (await rateLimited(request, "staff-invite", { limit: 10, windowMs: 600_000 })) {
    return NextResponse.json({ error: RATE_MSG }, { status: 429 });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  const teamId = String(payload?.teamId || "").trim();
  const email = String(payload?.email || "").trim().toLowerCase();
  if (!teamId || !email) {
    return NextResponse.json({ error: "Missing team or email." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  // Authorization: caller must be the team's head coach (owner).
  const { data: me } = await supabase
    .from("team_coaches")
    .select("id")
    .eq("team_id", teamId)
    .eq("user_id", user.id)
    .eq("role", "owner")
    .maybeSingle();
  if (!me) return NextResponse.json({ error: "Only the head coach can send invites." }, { status: 403 });

  // The invite row must actually exist for this team + email.
  const { data: invite } = await supabase
    .from("team_coaches")
    .select("id, user_id")
    .eq("team_id", teamId)
    .eq("email", email)
    .maybeSingle();
  if (!invite) return NextResponse.json({ error: "Invite not found — add the coach first." }, { status: 404 });

  const { data: team } = await supabase.from("teams").select("name, slug").eq("id", teamId).single();
  if (!team) return NextResponse.json({ error: "Team not found." }, { status: 404 });

  const alreadySignedUp = Boolean(invite.user_id);
  const heading = `You're invited to help coach ${team.name}`;
  const intro = `${user.email} added you to the coaching staff of ${team.name} on My-Team Sports.`;
  const steps = alreadySignedUp
    ? `You already have a My-Team Sports account under this email, so you're all set — just log in at https://my-teamsports.com/login and ${team.name} will be on your dashboard.`
    : `Getting in takes about a minute:

1. Go to https://my-teamsports.com/signup
2. Create a free coach account using THIS email address (${email}) — that's how we match you to the team
3. That's it. ${team.name} appears on your dashboard automatically.

Already have an account under this email? Just log in at https://my-teamsports.com/login instead.`;
  const outro = `As an assistant coach you can manage the roster, schedule, scores, photos, and announcements — everything except deleting the team or changing the coaching staff.

Questions? Just reply to this email and it goes straight to ${user.email}.`;

  const body = `${intro}\n\n${steps}\n\n${outro}`;
  const result = await sendEmail({
    to: email,
    replyTo: user.email,
    subject: heading,
    text: `${body}\n\n— My-Team Sports · my-teamsports.com`,
    html: basicHtml({
      heading,
      body,
      footer: `Sent on behalf of ${user.email} via My-Team Sports · my-teamsports.com`,
    }),
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error || "The invite email could not be sent." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
