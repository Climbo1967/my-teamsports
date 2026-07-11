import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

// Passcode-gated board read for the team site. Polled like /api/live-score.
export async function GET(request) {
  const slug = String(request.nextUrl.searchParams.get("slug") || "").toLowerCase();
  if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });

  const cookieStore = await cookies();
  const passcode = cookieStore.get(`team_access_${slug}`)?.value;
  if (!passcode) {
    return NextResponse.json({ error: "Your team access expired. Re-enter the passcode." }, { status: 401 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_board", {
    p_slug: slug,
    p_passcode: passcode,
  });

  if (error) {
    if (error.message?.includes("invalid")) {
      return NextResponse.json({ error: "Your team access expired. Re-enter the passcode." }, { status: 401 });
    }
    if (error.message?.includes("not enabled")) {
      return NextResponse.json({ error: "The board is not available for this team." }, { status: 404 });
    }
    return NextResponse.json({ error: "Could not load the board." }, { status: 500 });
  }

  return NextResponse.json(
    { board: data || null },
    { headers: { "Cache-Control": "no-store" } }
  );
}
