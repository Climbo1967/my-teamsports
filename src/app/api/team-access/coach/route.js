import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Coach preview of the public team site. A signed-in coach opening their own
// /team/<slug> used to get the page without the parent access cookie, so the
// cookie-gated parts (Team Board, RSVP, live score, parent uploads, push)
// failed or showed nothing. This sets the same cookie parents get, then sends
// the coach back to the page, which now renders exactly as parents see it.
//
// Authorization is RLS: the teams row only comes back for a coach of that
// team. No passcode is taken from the request.
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const slug = String(searchParams.get("slug") || "").toLowerCase().trim();
  if (!/^[a-z0-9-]{2,80}$/.test(slug)) {
    return NextResponse.redirect(new URL("/dashboard", origin));
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL(`/team/${slug}`, origin));

  const { data: own } = await supabase.from("teams").select("passcode").eq("slug", slug).maybeSingle();

  // ?from=coach tells the page not to bounce back here if the cookie still
  // doesn't work (for example cookies blocked), so it shows the gate instead.
  const response = NextResponse.redirect(new URL(`/team/${slug}?from=coach`, origin));
  if (own?.passcode) {
    response.cookies.set(`team_access_${slug}`, String(own.passcode).toUpperCase().trim(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 180, // same as the parent cookie
      path: "/",
    });
  }
  return response;
}
