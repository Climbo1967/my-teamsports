import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { rateLimited, RATE_MSG } from "@/lib/ratelimit";

// Push slice 3: per-device notification preferences for anonymous parents.
// Gated by the team passcode cookie; reads/writes go through passcode-checked
// SECURITY DEFINER RPCs. POST with {slug, endpoint} reads; include prefs to update.
export async function POST(request) {
  if (await rateLimited(request, "push-prefs", { limit: 30, windowMs: 600_000 })) {
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
  const prefs = payload?.prefs;
  if (!slug || !endpoint) {
    return NextResponse.json({ error: "Missing subscription." }, { status: 400 });
  }

  const cookieStore = await cookies();
  const passcode = cookieStore.get(`team_access_${slug}`)?.value;
  if (!passcode) {
    return NextResponse.json({ error: "Your team access expired. Re-enter the passcode." }, { status: 401 });
  }

  const supabase = await createClient();

  if (prefs && typeof prefs === "object") {
    const { error } = await supabase.rpc("set_push_prefs", {
      p_slug: slug,
      p_passcode: passcode,
      p_endpoint: endpoint,
      p_announcements: typeof prefs.announcements === "boolean" ? prefs.announcements : null,
      p_games: typeof prefs.games === "boolean" ? prefs.games : null,
      p_schedule: typeof prefs.schedule === "boolean" ? prefs.schedule : null,
    });
    if (error) {
      const denied = /invalid|passcode/i.test(error.message || "");
      return NextResponse.json(
        { error: denied ? "Your team access expired. Re-enter the passcode." : "Could not save preferences." },
        { status: denied ? 401 : 500 }
      );
    }
  }

  const { data, error: readErr } = await supabase.rpc("get_push_prefs", {
    p_slug: slug,
    p_passcode: passcode,
    p_endpoint: endpoint,
  });
  if (readErr) return NextResponse.json({ error: "Could not load preferences." }, { status: 500 });
  return NextResponse.json({ ok: true, prefs: data || null });
}
