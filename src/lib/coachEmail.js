// Server-only: sending and logging coach emails. NEVER import into a client
// component (it uses the service-role client). The rules for who gets what and
// the wording live in ./coachEmailPlan.js, which is pure and tested.
import { sendEmail, basicHtml, COACH_FROM, COACH_REPLY_TO } from "@/lib/email";
import { coachEmailFooter, unsubscribeHeaders, unsubscribeLinks } from "@/lib/coachEmailPlan";

// Everything the daily job and the admin panel need, in one call. Returns
// { ok, snapshot } or { ok: false, error } (e.g. the migration isn't applied).
export async function loadCoachSnapshot(admin) {
  if (!admin) return { ok: false, error: "Server key is not configured." };
  const { data, error } = await admin.rpc("coach_email_snapshot");
  if (error || !data) return { ok: false, error: error?.message || "Snapshot unavailable." };
  return { ok: true, snapshot: data };
}

// The message exactly as a coach receives it.
export function renderCoachEmail({ coach, subject, heading, body, replyTo }) {
  const links = unsubscribeLinks(coach.unsub_token);
  return {
    to: coach.email,
    from: COACH_FROM,
    replyTo: replyTo || COACH_REPLY_TO,
    subject,
    text: `${body}\n\n— ${coachEmailFooter(coach.unsub_token)}`,
    html: basicHtml({
      heading: heading || subject,
      body,
      footer: "My-Team Sports · my-teamsports.com",
      unsubscribeUrl: links.page,
    }),
    headers: unsubscribeHeaders(coach.unsub_token),
  };
}

// Send one automatic email, exactly once. The log row is claimed BEFORE the
// send (the unique index on coach_id + dedupe_key picks one winner), so two
// overlapping runs can't both send. A failed send releases its keys so the next
// run retries. Returns { status: "sent" | "skipped" | "failed", error? }.
export async function deliverCoachEmail(admin, { coach, kind, keys, subject, heading, body, teamId = null, meta = {} }) {
  const rows = keys.map((key) => ({
    coach_id: coach.id,
    email: coach.email,
    kind,
    dedupe_key: key,
    subject,
    team_id: teamId,
    meta,
    status: "sending",
  }));
  const { data: claimed, error: claimError } = await admin.from("coach_emails").insert(rows).select("id");
  if (claimError) {
    // 23505 = another run already holds one of these keys: not an error.
    return claimError.code === "23505" ? { status: "skipped" } : { status: "failed", error: claimError.message };
  }
  const ids = (claimed || []).map((r) => r.id);

  const result = await sendEmail(renderCoachEmail({ coach, subject, heading, body }));
  if (!result.ok) {
    await admin
      .from("coach_emails")
      .update({ status: "failed", dedupe_key: null, meta: { ...meta, error: String(result.error || "").slice(0, 300) } })
      .in("id", ids);
    return { status: "failed", error: result.error };
  }
  await admin.from("coach_emails").update({ status: "sent", provider_id: result.id || null }).in("id", ids);
  return { status: "sent" };
}
