import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { rateLimited, RATE_MSG } from "@/lib/ratelimit";
import { PRODUCT_NAMES, currentSeasonYear, priceFor, teamAccess } from "@/lib/pricing";

/**
 * Creates a Stripe Checkout session for a one-time season purchase.
 * Coach-only (team must be visible through RLS). Products: 'season' | 'ai'.
 */
export async function POST(request) {
  if (rateLimited(request, "billing-checkout", { limit: 10, windowMs: 600_000 })) {
    return NextResponse.json({ error: RATE_MSG }, { status: 429 });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ error: "Billing is not configured yet." }, { status: 503 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  const teamId = body?.teamId;
  const product = body?.product;
  if (!teamId || !PRODUCT_NAMES[product]) {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Please log in." }, { status: 401 });
  }

  // RLS: only coaches/owners can see their team.
  const { data: team } = await supabase
    .from("teams")
    .select("id, name, paid_through, ai_paid_through, trial_ends_at, ai_enabled")
    .eq("id", teamId)
    .single();
  if (!team) {
    return NextResponse.json({ error: "Team not found." }, { status: 404 });
  }

  const year = currentSeasonYear();
  const access = teamAccess(team);
  if (product === "season" && team.paid_through && team.paid_through >= `${year}-12-31`) {
    return NextResponse.json({ error: `Your ${year} Season Pass is already active.` }, { status: 400 });
  }
  if (product === "ai" && access.aiPaid && team.ai_paid_through >= `${year}-12-31`) {
    return NextResponse.json({ error: `AI Assistant Coach is already active for ${year}.` }, { status: 400 });
  }

  const amount = priceFor(product, year);
  const origin = request.headers.get("origin") || `https://${request.headers.get("host")}`;
  const billingUrl = `${origin}/dashboard/teams/${teamId}/billing`;

  const stripe = new Stripe(secretKey);
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: user.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: amount,
            product_data: {
              name: `${PRODUCT_NAMES[product]} — ${year} season`,
              description: `${team.name} on my-teamsports.com (covers through Dec 31, ${year})`,
            },
          },
        },
      ],
      metadata: {
        team_id: teamId,
        product,
        season_year: String(year),
        coach_id: user.id,
      },
      automatic_tax: { enabled: process.env.STRIPE_TAX === "1" },
      success_url: `${billingUrl}?status=success`,
      cancel_url: `${billingUrl}?status=canceled`,
    });
    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("stripe checkout error", e?.message);
    return NextResponse.json({ error: "Could not start checkout. Try again." }, { status: 500 });
  }
}
