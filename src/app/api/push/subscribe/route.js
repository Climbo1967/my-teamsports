import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Anonymous parents (no account) subscribe a device to a team's push notifications.
// Writes go through the SECURITY DEFINER RPC add_push_subscription (validated, dedup by team+endpoint).
export async function POST(request) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  const { teamId, subscription } = payload || {};
  if (!teamId || !subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
    return NextResponse.json({ error: "Missing subscription." }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("add_push_subscription", {
    p_team_id: teamId,
    p_endpoint: subscription.endpoint,
    p_p256dh: subscription.keys.p256dh,
    p_auth: subscription.keys.auth,
    p_user_agent: (request.headers.get("user-agent") || "").slice(0, 300) || null,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
