import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

// Public (passcode-gated) live score for a team page. Polled by the team site.
export async function GET(request) {
  const slug = String(request.nextUrl.searchParams.get("slug") || "").toLowerCase();
  if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });

  const cookieStore = await cookies();
  const passcode = cookieStore.get(`team_access_${slug}`)?.value;
  if (!passcode) return NextResponse.json({ live: null }, { status: 200 });

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_live_game", {
    p_slug: slug,
    p_passcode: passcode,
  });
  if (error) return NextResponse.json({ live: null }, { status: 200 });

  return NextResponse.json(
    { live: data || null },
    { headers: { "Cache-Control": "no-store" } }
  );
}
