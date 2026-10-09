import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createPasscodeClient, clientIp, passcodeDenied, lockedOut, LOCKOUT_MSG, EXPIRED_MSG } from "@/lib/supabase/passcode";
import { rateLimited, RATE_MSG } from "@/lib/ratelimit";

// Parent reply on a board thread. Reply-only by design — thread creation is
// coach-side. The RPC re-validates the passcode and enforces board_enabled,
// thread lock, the 1000-char body cap, and the display-name requirement.
export async function POST(request) {
  if (await rateLimited(request, "board-reply", { limit: 10, windowMs: 600_000 })) {
    return NextResponse.json({ error: RATE_MSG }, { status: 429 });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  const { slug, threadId, name, body } = payload || {};
  const normalizedSlug = String(slug || "").toLowerCase();
  const cleanName = String(name || "").trim().slice(0, 40);
  const cleanBody = String(body || "").trim().slice(0, 1000);

  if (!normalizedSlug || !threadId || !cleanName || !cleanBody) {
    return NextResponse.json({ error: "Add your name and a message first." }, { status: 400 });
  }

  const cookieStore = await cookies();
  const passcode = cookieStore.get(`team_access_${normalizedSlug}`)?.value;
  if (!passcode) {
    return NextResponse.json({ error: "Your team access expired. Re-enter the passcode." }, { status: 401 });
  }

  const supabase = await createPasscodeClient(clientIp(request));
  const { data, error } = await supabase.rpc("add_board_reply", {
    p_slug: normalizedSlug,
    p_passcode: passcode,
    p_thread_id: threadId,
    p_author_name: cleanName,
    p_body: cleanBody,
  });

  if (error) {
    if (lockedOut(error)) return NextResponse.json({ error: LOCKOUT_MSG }, { status: 429 });
    if (error.message?.includes("invalid")) {
      return NextResponse.json({ error: EXPIRED_MSG }, { status: 401 });
    }
    if (error.message?.includes("locked")) {
      return NextResponse.json({ error: "This thread was locked by the coach." }, { status: 409 });
    }
    if (error.message?.includes("not enabled")) {
      return NextResponse.json({ error: "The board is not available for this team." }, { status: 404 });
    }
    return NextResponse.json({ error: "Could not post your reply. Try again." }, { status: 500 });
  }
  if (passcodeDenied(data)) {
    return NextResponse.json({ error: EXPIRED_MSG }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
