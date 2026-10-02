import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimited, RATE_MSG } from "@/lib/ratelimit";

// One-click unsubscribe for coach emails (the List-Unsubscribe header points
// here, and mail apps POST to it). The token in ?c= is the only credential.
// A plain GET (someone opening the link) goes to the page, which asks first —
// link scanners that prefetch URLs must not unsubscribe anyone.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request) {
  if (await rateLimited(request, "coach-unsubscribe", { limit: 300, windowMs: 600_000 })) {
    return NextResponse.json({ error: RATE_MSG }, { status: 429 });
  }
  const token = new URL(request.url).searchParams.get("c") || "";
  if (!UUID.test(token)) return NextResponse.json({ ok: false }, { status: 400 });

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("coach_email_opt", { p_token: token, p_opt_out: true });
  if (error) return NextResponse.json({ ok: false }, { status: 500 });
  return NextResponse.json({ ok: !!data?.ok });
}

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const token = searchParams.get("c") || "";
  return NextResponse.redirect(new URL(UUID.test(token) ? `/unsubscribe?c=${token}` : "/unsubscribe", origin));
}
