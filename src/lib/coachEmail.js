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

// A row that has sat in "sending" this long was interrupted (the function was
// killed, or the final status update failed). Its claim is released so the
// email can be retried instead of being blocked forever. Must agree with the
// same interval in coach_email_snapshot(), which drops such rows from sent_keys.
export const STALE_SENDING_MINUTES = 10;

// Release stale "sending" claims that hold any of these keys for this coach.
// Returns the number of rows released.
async function releaseStaleClaims(admin, coachId, keys) {
  const cutoff = new Date(Date.now() - STALE_SENDING_MINUTES * 60_000).toISOString();
  const { data, error } = await admin
    .from("coach_emails")
    .update({ status: "failed", dedupe_key: null, meta: { stale: true, released_at: new Date().toISOString() } })
    .eq("coach_id", coachId)
    .eq("status", "sending")
    .in("dedupe_key", keys)
    .lt("created_at", cutoff)
    .select("id");
  if (error) return 0;
  return (data || []).length;
}

// Send one automatic email, exactly once. The log row is claimed BEFORE the
// send (the unique index on coach_id + dedupe_key picks one winner), so two
// overlapping runs can't both send. A failed send releases its keys so the next
// run retries; so does a claim left in "sending" for more than
// STALE_SENDING_MINUTES. Returns { status: "sent" | "skipped" | "failed", error? }.
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
  let { data: claimed, error: claimError } = await admin.from("coach_emails").insert(rows).select("id");
  if (claimError && claimError.code === "23505") {
    // Another run holds one of these keys. If that run died mid-send, the row
    // is stale: release it and claim again, once.
    const released = await releaseStaleClaims(admin, coach.id, keys);
    if (released > 0) {
      ({ data: claimed, error: claimError } = await admin.from("coach_emails").insert(rows).select("id"));
    }
  }
  if (claimError) {
    // 23505 = another run already holds one of these keys: not an error.
    return claimError.code === "23505" ? { status: "skipped" } : { status: "failed", error: claimError.message };
  }
  const ids = (claimed || []).map((r) => r.id);

  const result = await sendEmail(renderCoachEmail({ coach, subject, heading, body }));
  if (!result.ok) {
    const { error: releaseError } = await admin
      .from("coach_emails")
      .update({ status: "failed", dedupe_key: null, meta: { ...meta, error: String(result.error || "").slice(0, 300) } })
      .in("id", ids);
    // If the release itself failed the row stays "sending"; the stale-claim
    // rule above picks it up on a later run.
    return { status: "failed", error: releaseError ? `${result.error} (and the log row could not be released: ${releaseError.message})` : result.error };
  }
  const { error: markError } = await admin.from("coach_emails").update({ status: "sent", provider_id: result.id || null }).in("id", ids);
  // Sent is sent: the email went out. A failed status write leaves the row as
  // "sending"; after STALE_SENDING_MINUTES the stale rule releases it and the
  // next run sends again. A rare duplicate beats a coach never getting the
  // email, since the log cannot tell the two cases apart.
  return markError ? { status: "sent", error: `Sent, but the log row could not be marked: ${markError.message}` } : { status: "sent" };
}
