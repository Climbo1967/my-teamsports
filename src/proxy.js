import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Session refresh for server-rendered pages (bug sweep 2026-10-03, #21).
//
// Server components can read cookies but not write them, so when a coach's
// access token expired, every dashboard page refreshed it and then threw the
// new cookies away; the next page refreshed again. One signed-in session did
// 2,041 refreshes in a day. This runs before those pages, refreshes once, and
// writes the new cookies to both the forwarded request and the response.
// (Next 16 calls this file "proxy"; it is what used to be middleware.)
//
// Only for requests that carry a Supabase auth cookie: parents on /team/<slug>
// and logged-out visitors never pay for it.

const AUTH_COOKIE = /^sb-.*-auth-token/;

export async function proxy(request) {
  const hasSession = request.cookies.getAll().some((c) => AUTH_COOKIE.test(c.name));
  if (!hasSession) return NextResponse.next();

  let response = NextResponse.next({ request });
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            // The page about to render reads from the request; the browser
            // reads from the response. Both get the refreshed cookies.
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          },
        },
      }
    );
    // Reads the session from the cookie and refreshes it only when the
    // access token has expired, which is what triggers setAll above. The
    // result is not used or trusted here: each page still runs its own
    // getUser(), so this costs nothing extra while the token is valid.
    await supabase.auth.getSession();
  } catch {
    // Never block a page over a refresh problem (missing env, Supabase down,
    // malformed cookie); the page's own auth check still decides what the
    // coach sees.
  }
  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/team/:path*"],
};
