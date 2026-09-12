import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail, basicHtml } from "@/lib/email";
import { rateLimited, RATE_MSG } from "@/lib/ratelimit";
import { sportLabel } from "@/lib/constants";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * League commissioner invites (or re-invites) a team's head coach.
 * Authorization lives in the league_invite_coach RPC (commissioner of that
 * team's league, or site admin) — this route only adds the email on top.
 * If the coach already has an account the RPC hands the team over
 * immediately and the email just says "it's on your dashboard".
 */
export async function POST(request) {
  if (await rateLimited(request, "league-invite", { limit: 30, windowMs: 600_000 })) {
    return NextResponse.json({ error: RATE_MSG }, { status: 429 });
  }

  let payload;
  try { payload = await request.json(); } catch { return NextResponse.json({ error: "Bad request." }, { status: 400 }); }
  const teamId = String(payload?.teamId || "").trim();
  const email = String(payload?.email || "").trim().toLowerCase();
  if (!UUID_RE.test(teamId) || !email) {
    return NextResponse.json({ error: "Missing team or email." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  const { data: inv, error } = await supabase.rpc("league_invite_coach", { p_team_id: teamId, p_email: email });
  if (error) return NextResponse.json({ error: error.message }, { status: 403 });
  if (!inv?.slug) return NextResponse.json({ error: "Invite failed." }, { status: 500 });

  const teamLink = `https://my-teamsports.com/team/${inv.slug}`;
  const heading = `You're the head coach of ${inv.team_name} on My-Team Sports`;
  const intro = `${inv.league_name} set up a team site for ${inv.team_name} (${sportLabel(inv.sport)}) and named you head coach. The league schedule is already on it; you run everything else — roster, live scoring, stats, photos, alerts to parents.`;
  const steps = inv.already_signed_up
    ? `You already have a My-Team Sports account under this email, so it's done — log in at https://my-teamsports.com/login and ${inv.team_name} is on your dashboard.`
    : `Getting in takes about a minute:

1. Go to https://my-teamsports.com/signup
2. Create a free coach account using THIS email address (${inv.email}) — that's how we match you to the team
3. ${inv.team_name} appears on your dashboard automatically, and you become its owner.

Already have an account under this email? Log in at https://my-teamsports.com/login instead.`;
  const parents = `Your parents' link and passcode (share these — no app, no accounts for them):
${teamLink}
Passcode: ${inv.passcode}`;
  const league = inv.is_public
    ? `League schedule, results and standings: https://my-teamsports.com/leagues/${inv.league_slug}`
    : "";
  const outro = `League games on your schedule are set by ${inv.league_name} — you can't move or delete those, but your practices and non-league games are yours. When you end a game in the scorekeeper, the final goes to the league standings automatically.

Questions? Reply to this email and it goes to ${user.email}.`;

  const body = [intro, steps, parents, league, outro].filter(Boolean).join("\n\n");
  const result = await sendEmail({
    to: inv.email,
    replyTo: user.email,
    subject: heading,
    text: `${body}\n\n— My-Team Sports · my-teamsports.com`,
    html: basicHtml({ heading, body, footer: `Sent on behalf of ${inv.league_name} (${user.email}) via My-Team Sports · my-teamsports.com` }),
  });
  if (!result.ok) {
    // The invite row exists either way; the coach can still sign up with that email.
    return NextResponse.json({ ok: false, invited: true, error: `Invite saved, but the email didn't send: ${result.error}` }, { status: 502 });
  }
  return NextResponse.json({ ok: true, alreadySignedUp: inv.already_signed_up });
}
