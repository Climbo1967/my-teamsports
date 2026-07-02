import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimited, RATE_MSG } from "@/lib/ratelimit";

export async function POST(request) {
  if (rateLimited(request, "team-access", { limit: 10, windowMs: 60_000 })) {
    return NextResponse.json({ error: RATE_MSG }, { status: 429 });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  const { slug, passcode } = payload || {};

  if (!slug || !passcode) {
    return NextResponse.json({ error: "Missing slug or passcode" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_team_site", {
    p_slug: String(slug).toLowerCase(),
    p_passcode: String(passcode).toUpperCase().trim(),
  });

  if (error) {
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Wrong passcode. Check with your coach and try again." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(`team_access_${String(slug).toLowerCase()}`, String(passcode).toUpperCase().trim(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 180, // 180 days — the whole season
    path: "/",
  });
  return response;
}
