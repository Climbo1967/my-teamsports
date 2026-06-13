import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function POST(request) {
  const { slug, eventId, playerId, status, note } = await request.json();
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
