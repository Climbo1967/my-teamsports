import { NextResponse } from "next/server";
import Stripe from "stripe";
import { fulfillCheckoutSession, sessionIsOurs } from "@/lib/billing/fulfill";

export const runtime = "nodejs";

/**
 * Stripe webhook. Provisions access on checkout.session.completed and
 * checkout.session.async_payment_succeeded (delayed payment methods).
 *
 * Shared-account rule: the 2B Creations Stripe account serves several apps,
 * so this endpoint also receives sibling apps' events. Anything that isn't
 * ours returns 200 quietly — never an error — otherwise Stripe retries
 * hopeless events forever and the endpoint's error rate goes to 100%.
 */
const HANDLED = new Set([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
]);

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

  if (event.type === "checkout.session.async_payment_failed") {
    const s = event.data.object;
    if (sessionIsOurs(s)) {
      console.error("stripe async payment failed", s.id, s.metadata?.team_id);
    }
    return NextResponse.json({ received: true });
  }

  if (!HANDLED.has(event.type)) {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object;
  const result = await fulfillCheckoutSession(session);

  if (result.status === "retry") {
    console.error("stripe webhook fulfillment failed", session.id, result.reason);
    return NextResponse.json({ error: "Temporary failure." }, { status: 500 }); // Stripe retries
  }
  if (result.status === "ignored" && sessionIsOurs(session) && result.reason !== "not paid") {
    // Ours but unprovisionable (e.g. team deleted) — log it, still 200.
    console.error("stripe webhook ignored own session", session.id, result.reason);
  }
  return NextResponse.json({ received: true });
}
