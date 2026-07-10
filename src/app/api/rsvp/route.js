import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
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

  const supabase = await createClient();
  const { error } = await supabase.rpc("upsert_rsvp", {
    p_slug: normalizedSlug,
    p_passcode: passcode,
    p_event_id: eventId,
    p_player_id: playerId,
    p_status: status,
    p_note: note ? String(note).slice(0, 200) : null,
  });

  if (error) {
    const denied = error.message?.includes("invalid");
    return NextResponse.json(
      { error: denied ? "Your team access expired. Re-enter the passcode." : "Could not save your RSVP. Try again." },
      { status: denied ? 401 : 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
