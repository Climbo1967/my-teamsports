import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const names = Object.keys(process.env).filter((k) => k.toUpperCase().includes("STRIPE"));
  return NextResponse.json({
    stripeVars: names.map((k) => ({ name: JSON.stringify(k), len: (process.env[k] || "").length })),
    hasSecret: Boolean(process.env.STRIPE_SECRET_KEY),
    hasWebhook: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
    url: request.url.slice(0, 60),
  });
}
