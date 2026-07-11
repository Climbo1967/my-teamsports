import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail, basicHtml } from "@/lib/email";
import { rateLimited, RATE_MSG } from "@/lib/ratelimit";

// Report a board post to the coaches. The RPC validates the passcode and
// returns the post details only; coach emails are looked up with the service
// role here so they never pass through an anon-callable function.
export async function POST(request) {
  if (await rateLimited(request, "board-report", { limit: 5, windowMs: 600_000 })) {
    return NextResponse.json({ error: RATE_MSG }, { status: 429 });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  const { slug, postId } = payload || {};
  const normalizedSlug = String(slug || "").toLowerCase();
  if (!normalizedSlug || !postId) {
    return NextResponse.json({ error: "Missing report details." }, { status: 400 });
  }

  const cookieStore = await cookies();
  const passcode = cookieStore.get(`team_access_${normalizedSlug}`)?.value;
  if (!passcode) {
    return NextResponse.json({ error: "Your team access expired. Re-enter the passcode." }, { status: 401 });
  }

  const supabase = await createClient();
  const { data: report, error } = await supabase.rpc("report_board_post", {
    p_slug: normalizedSlug,
    p_passcode: passcode,
    p_post_id: postId,
  });

  if (error || !report) {
    const denied = error?.message?.includes("invalid");
    return NextResponse.json(
      { error: denied ? "Your team access expired. Re-enter the passcode." : "Could not send the report. Try again." },
      { status: denied ? 401 : 500 }
    );
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Could not send the report. Try again." }, { status: 502 });
  }
  const { data: coaches } = await admin
    .from("team_coaches")
    .select("email")
    .eq("team_id", report.team_id);
  const emails = [...new Set((coaches || []).map((c) => c.email).filter(Boolean))];
  if (emails.length === 0) {
    return NextResponse.json({ error: "Could not send the report. Try again." }, { status: 502 });
  }

  const when = new Date(report.created_at).toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });
  const bodyText =
    `A parent flagged a post on the ${report.team_name} board.\n\n` +
    `Thread: ${report.thread_title}\n` +
    `Posted by: ${report.author_name || "Coach"} on ${when}\n\n` +
    `"${report.body}"\n\n` +
    `Review it on the moderation page — you can remove the post or lock the thread:\n` +
    `https://my-teamsports.com/dashboard/teams/${report.team_id}/board`;

  const result = await sendEmail({
    to: emails,
    subject: `⚠️ Post reported on the ${report.team_name} board`,
    text: bodyText,
    html: basicHtml({
      heading: "A board post was reported",
      body: bodyText,
      footer: "Sent by My-Team Sports board moderation.",
    }),
  });

  if (!result.ok) {
    return NextResponse.json({ error: "Could not send the report. Try again." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
