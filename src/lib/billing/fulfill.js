import { createAdminClient } from "@/lib/supabase/admin";
import { seasonEndDate } from "@/lib/pricing";

// Every checkout session this app creates is tagged with this. The 2B
// Creations Stripe account is shared by several apps and every webhook
// endpoint on the account receives every app's events, so handlers must be
// able to tell "ours" from "a sibling app's" without erroring.
export const APP_TAG = "my-teamsports";

const PRODUCTS = ["season", "ai"];

// Sessions created before the app tag shipped carry team/product/season
// metadata but no `app` key — still ours.
export function sessionIsOurs(session) {
  const m = session?.metadata || {};
  if (m.app) return m.app === APP_TAG;
  return !!(m.team_id && PRODUCTS.includes(m.product) && m.season_year);
}

/**
 * Idempotently record a paid checkout session and extend the team's
 * paid_through / ai_paid_through. Shared by the webhook and the
 * checkout-return sync route, so either path can provision access.
 *
 * Returns { status, reason }:
 *  - 'fulfilled' — recorded and coverage extended (or already covered).
 *  - 'ignored'   — not ours / not paid / team gone. Callers must NOT error:
 *                  on a shared Stripe account unknown events are normal, and
 *                  a 500 would make Stripe retry a hopeless event forever.
 *  - 'retry'     — transient failure; the webhook should 500 so Stripe retries.
 */
export async function fulfillCheckoutSession(session) {
  if (!sessionIsOurs(session)) return { status: "ignored", reason: "not this app" };
  if (session.payment_status !== "paid") return { status: "ignored", reason: "not paid" };

  const teamId = session.metadata?.team_id;
  const product = session.metadata?.product;
  const seasonYear = parseInt(session.metadata?.season_year, 10);
  if (!teamId || !PRODUCTS.includes(product) || !seasonYear) {
    return { status: "ignored", reason: "missing metadata" };
  }

  const admin = createAdminClient();
  if (!admin) return { status: "retry", reason: "no service role key" };

  // Team first: if it no longer exists (deleted after purchase), there is
  // nothing to provision — ignore instead of erroring into a retry loop.
  const column = product === "season" ? "paid_through" : "ai_paid_through";
  const { data: team, error: teamError } = await admin
    .from("teams").select(`id, ${column}`).eq("id", teamId).maybeSingle();
  if (teamError) return { status: "retry", reason: `team fetch: ${teamError.message}` };
  if (!team) return { status: "ignored", reason: "team not found" };

  // Idempotent payment record — webhook, sync, and Stripe retries can all
  // land for the same session; the unique stripe_session_id absorbs them.
  const { error: payError } = await admin.from("payments").upsert(
    {
      team_id: teamId,
      coach_id: session.metadata?.coach_id || null,
      product,
      season_year: seasonYear,
      amount_cents: session.amount_total ?? 0,
      currency: session.currency || "usd",
      stripe_session_id: session.id,
      stripe_payment_intent:
        typeof session.payment_intent === "string" ? session.payment_intent : null,
      status: "paid",
    },
    { onConflict: "stripe_session_id", ignoreDuplicates: true }
  );
  if (payError) return { status: "retry", reason: `payments upsert: ${payError.message}` };

  // Never shorten existing coverage.
  const paidThrough = seasonEndDate(seasonYear);
  if (!team[column] || team[column] < paidThrough) {
    const { error: updError } = await admin
      .from("teams").update({ [column]: paidThrough }).eq("id", teamId);
    if (updError) return { status: "retry", reason: `team update: ${updError.message}` };
  }

  return { status: "fulfilled", reason: "ok" };
}
