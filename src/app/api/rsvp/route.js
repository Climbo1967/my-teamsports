import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createPasscodeClient, clientIp, passcodeDenied, lockedOut, LOCKOUT_MSG, EXPIRED_MSG } from "@/lib/supabase/passcode";
import { rateLimited, RATE_MSG } from "@/lib/ratelimit";

export async function POST(request) {
  if (await rateLimited(request, "rsvp", { limit: 60, windowMs: 600_000 })) {
    return NextResponse.json({ error: RATE_MSG }, { status: 429 });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  const { slug, eventId, playerId, status, note } = payload || {};
  const normalizedSlug = String(slug || "").toLowerCase();

  if (!normalizedSlug || !eventId || !playerId || !status) {
    return NextResponse.json({ error: "Missing RSVP details." }, { status: 400 });
  }

  const cookieStore = await cookies();
  const passcode = cookieStore.get(`team_access_${normalizedSlug}`)?.value;
  if (!passcode) {
    return NextResponse.json({ error: "Your team access expired. Re-enter the passcode." }, { status: 401 });
  }

  const supabase = await createPasscodeClient(clientIp(request));
  const { data, error } = await supabase.rpc("upsert_rsvp", {
    p_slug: normalizedSlug,
    p_passcode: passcode,
    p_event_id: eventId,
    p_player_id: playerId,
    p_status: status,
    p_note: note ? String(note).slice(0, 200) : null,
  });

  if (lockedOut(error)) return NextResponse.json({ error: LOCKOUT_MSG }, { status: 429 });
  if (error) {
    const denied = error.message?.includes("invalid");
    return NextResponse.json(
      { error: denied ? EXPIRED_MSG : "Could not save your RSVP. Try again." },
      { status: denied ? 401 : 500 }
    );
  }
  if (passcodeDenied(data)) return NextResponse.json({ error: EXPIRED_MSG }, { status: 401 });

  return NextResponse.json({ ok: true });
}
