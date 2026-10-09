import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createPasscodeClient, clientIp, passcodeDenied, lockedOut, LOCKOUT_MSG, EXPIRED_MSG } from "@/lib/supabase/passcode";
import { rateLimited, RATE_MSG } from "@/lib/ratelimit";

export async function POST(request) {
  if (await rateLimited(request, "subscribe", { limit: 10, windowMs: 600_000 })) {
    return NextResponse.json({ error: RATE_MSG }, { status: 429 });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  const { slug, email, name } = payload || {};
  const normalizedSlug = String(slug || "").toLowerCase();

  if (!normalizedSlug || !email) {
    return NextResponse.json({ error: "Please enter your email." }, { status: 400 });
  }

  const cookieStore = await cookies();
  const passcode = cookieStore.get(`team_access_${normalizedSlug}`)?.value;
  if (!passcode) {
    return NextResponse.json({ error: "Your team access expired. Re-enter the passcode." }, { status: 401 });
  }

  const supabase = await createPasscodeClient(clientIp(request));
  const { data, error } = await supabase.rpc("subscribe_team", {
    p_slug: normalizedSlug,
    p_passcode: passcode,
    p_email: String(email),
    p_name: name ? String(name) : null,
  });

  if (error) {
    if (lockedOut(error)) return NextResponse.json({ error: LOCKOUT_MSG }, { status: 429 });
    if (error.message?.includes("invalid email")) {
      return NextResponse.json({ error: "That email doesn't look right — check it and try again." }, { status: 400 });
    }
    return NextResponse.json({ error: "Could not subscribe. Try again." }, { status: 500 });
  }
  if (passcodeDenied(data)) return NextResponse.json({ error: EXPIRED_MSG }, { status: 401 });

  return NextResponse.json({ ok: true });
}
