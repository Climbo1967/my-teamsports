import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { rateLimited } from "@/lib/ratelimit";
import { fulfillCheckoutSession, sessionIsOurs } from "@/lib/billing/fulfill";

export const runtime = "nodejs";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SESSION_RE = /^cs_(live|test)_[a-zA-Z0-9]+$/;

/**
 * Checkout-return self-heal. Stripe's success_url points here: we look the
 * session up in Stripe directly and provision immediately, so access unlocks
 * the moment the coach lands back on the site — even if the webhook is
 * delayed or broken — then redirect to the team billing page.
 */
export async function GET(request) {
  const url = new URL(request.url);
  const teamParam = url.searchParams.get("team") || "";
  const sessionId = url.searchParams.get("session_id") || "";
  const teamId = UUID_RE.test(teamParam) ? teamParam : null;
  const billingPath = teamId ? `/dashboard/teams/${teamId}/billing` : "/dashboard";
  const dest = (status) =>
    NextResponse.redirect(new URL(status ? `${billingPath}?status=${status}` : billingPath, url.origin));

  if (await rateLimited(request, "billing-sync", { limit: 30, windowMs: 600_000 })) {
    return dest(null);
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey || !SESSION_RE.test(sessionId)) {
    // Fall back to the old behavior: land on the billing page, which polls
    // while the webhook provisions.
    return dest("success");
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", url.origin));
  }

  try {
    const stripe = new Stripe(secretKey);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Shared Stripe account: never act on a sibling app's session.
    if (!sessionIsOurs(session)) {
      return NextResponse.redirect(new URL("/dashboard", url.origin));
    }

    // Only provision when the signed-in user can see the session's team
    // through RLS (i.e. they coach it).
    const { data: team } = await supabase
      .from("teams").select("id").eq("id", session.metadata?.team_id).maybeSingle();
    if (!team) {
      return NextResponse.redirect(new URL("/dashboard", url.origin));
    }

    if (session.payment_status === "paid") {
      await fulfillCheckoutSession(session);
      return dest("success");
    }
    return dest("processing");
  } catch (e) {
    console.error("billing sync failed", e?.message);
    // The webhook + billing-page polling remain as the safety net.
    return dest("success");
  }
}
