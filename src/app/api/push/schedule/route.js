import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendPush } from "@/lib/push";
import { rateLimited, RATE_MSG } from "@/lib/ratelimit";

// Push slice 3: schedule-change alerts, coach-triggered from the schedule page.
// Accepts a small batch of changes (the client debounces edits into a digest)
// and sends ONE notification covering all of them. Only devices that opted in
// to schedule alerts (want_schedule) receive it.
const KINDS = new Set(["added", "changed", "canceled"]);

function line(c) {
  const label = String(c.label || "Event").slice(0, 80);
  const when = String(c.when || "").slice(0, 60);
  const loc = c.location ? ` @ ${String(c.location).slice(0, 60)}` : "";
  if (c.kind === "added") return `New: ${label} — ${when}${loc}`;
  if (c.kind === "canceled") return `Canceled: ${label} (${when})`;
  return `Updated: ${label} — now ${when}${loc}`;
}

export async function POST(request) {
  if (rateLimited(request, "push-schedule", { limit: 30, windowMs: 600_000 })) {
    return NextResponse.json({ error: RATE_MSG }, { status: 429 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  const teamId = body?.teamId;
  const changes = Array.isArray(body?.changes)
    ? body.changes.filter((c) => c && KINDS.has(c.kind)).slice(0, 20)
    : [];
  if (!teamId || changes.length === 0) {
    return NextResponse.json({ error: "Missing fields." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  // RLS limits this to the coach's own team + its device subscriptions.
  const { data: team } = await supabase.from("teams").select("id, name, slug").eq("id", teamId).single();
  if (!team) return NextResponse.json({ error: "Team not found." }, { status: 404 });

  const { data: devices } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("team_id", teamId)
    .eq("want_schedule", true);
  const subs = devices || [];
  if (subs.length === 0) return NextResponse.json({ ok: true, sent: 0 });

  let title;
  let text;
  if (changes.length === 1) {
    title = `📅 ${team.name} — schedule update`;
    text = line(changes[0]);
  } else {
    title = `📅 ${team.name} — ${changes.length} schedule updates`;
    const lines = changes.slice(0, 3).map(line);
    if (changes.length > 3) lines.push(`…and ${changes.length - 3} more`);
    text = lines.join("\n");
  }

  const r = await sendPush(subs, { title, body: text, url: `/team/${team.slug}` });
  if (r.stale && r.stale.length) {
    await supabase.from("push_subscriptions").delete().eq("team_id", teamId).in("endpoint", r.stale);
  }
  return NextResponse.json({ ok: true, sent: r.sent });
}
