import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { seasonEndDate } from "@/lib/pricing";

export const runtime = "nodejs";

/**
 * Stripe webhook. Handles checkout.session.completed:
 * records the payment and extends the team's paid_through /
 * ai_paid_through to the end of the purchased season.
 */
export async function POST(request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secretKey || !webhookSecret) {
    return NextResponse.json({ error: "Billing not configured." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  const payload = await request.text();

  const stripe = new Stripe(secretKey);
  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (e) {
    console.error("stripe webhook signature failed", e?.message);
    return NextResponse.json({ error: "Bad signature." }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object;
  if (session.payment_status !== "paid") {
    return NextResponse.json({ received: true });
  }

  const teamId = session.metadata?.team_id;
  const product = session.metadata?.product;
  const seasonYear = parseInt(session.metadata?.season_year, 10);
  if (!teamId || !["season", "ai"].includes(product) || !seasonYear) {
    console.error("stripe webhook missing metadata", session.id);
    return NextResponse.json({ received: true });
  }

  const admin = createAdminClient();
  if (!admin) {
    console.error("stripe webhook: no service role key");
    return NextResponse.json({ error: "Server not configured." }, { status: 500 });
  }

  // Idempotent payment record (webhooks can be delivered more than once).
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
  if (payError) {
    console.error("stripe webhook payments upsert failed", payError.message);
    return NextResponse.json({ error: "Storage failed." }, { status: 500 }); // Stripe retries
  }

  const paidThrough = seasonEndDate(seasonYear);
  const column = product === "season" ? "paid_through" : "ai_paid_through";

  const { data: team, error: teamError } = await admin
    .from("teams").select(`id, ${column}`).eq("id", teamId).single();
  if (teamError || !team) {
    console.error("stripe webhook team fetch failed", teamError?.message);
    return NextResponse.json({ error: "Team missing." }, { status: 500 });
  }

  // Never shorten existing coverage.
  if (!team[column] || team[column] < paidThrough) {
    const { error: updError } = await admin
      .from("teams").update({ [column]: paidThrough }).eq("id", teamId);
    if (updError) {
      console.error("stripe webhook team update failed", updError.message);
      return NextResponse.json({ error: "Update failed." }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
