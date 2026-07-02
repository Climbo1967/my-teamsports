import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { rateLimited, RATE_MSG } from "@/lib/ratelimit";

// Anonymous parents (no account) subscribe/unsubscribe a device to a team's push
// notifications. Access is gated by the team passcode cookie set by the passcode
// gate; writes go through passcode-checked SECURITY DEFINER RPCs.
export async function POST(request) {
  if (rateLimited(request, "push-subscribe", { limit: 15, windowMs: 600_000 })) {
    return NextResponse.json({ error: RATE_MSG }, { status: 429 });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  const slug = String(payload?.slug || "").toLowerCase();
  const subscription = payload?.subscription;
  if (!slug || !subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
    return NextResponse.json({ error: "Missing subscription." }, { status: 400 });
  }
  if (!/^https:\/\//.test(subscription.endpoint)) {
    return NextResponse.json({ error: "Invalid endpoint." }, { status: 400 });
  }

  const cookieStore = await cookies();
  const passcode = cookieStore.get(`team_access_${slug}`)?.value;
  if (!passcode) {
    return NextResponse.json({ error: "Your team access expired. Re-enter the passcode." }, { status: 401 });
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("add_push_subscription", {
    p_slug: slug,
    p_passcode: passcode,
    p_endpoint: subscription.endpoint,
    p_p256dh: subscription.keys.p256dh,
    p_auth: subscription.keys.auth,
    p_user_agent: (request.headers.get("user-agent") || "").slice(0, 300) || null,
  });
  if (error) {
    const denied = /invalid|passcode/i.test(error.message || "");
    return NextResponse.json(
      { error: denied ? "Your team access expired. Re-enter the passcode." : "Could not turn on alerts." },
      { status: denied ? 401 : 500 }
    );
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(request) {
  if (rateLimited(request, "push-unsubscribe", { limit: 15, windowMs: 600_000 })) {
    return NextResponse.json({ error: RATE_MSG }, { status: 429 });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  const slug = String(payload?.slug || "").toLowerCase();
  const endpoint = payload?.endpoint;
  if (!slug || !endpoint) {
    return NextResponse.json({ error: "Missing subscription." }, { status: 400 });
  }
  const cookieStore = await cookies();
  const passcode = cookieStore.get(`team_access_${slug}`)?.value;
  if (!passcode) {
    return NextResponse.json({ error: "Your team access expired. Re-enter the passcode." }, { status: 401 });
  }
  const supabase = await createClient();
  const { error } = await supabase.rpc("remove_push_subscription", {
    p_slug: slug,
    p_passcode: passcode,
    p_endpoint: endpoint,
  });
  if (error) return NextResponse.json({ error: "Could not turn off alerts." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
