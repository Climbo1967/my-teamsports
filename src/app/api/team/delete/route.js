import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimited, RATE_MSG } from "@/lib/ratelimit";

const BUCKET = "team-media";

// Deletes a team and its files. The browser used to delete the row directly,
// which left every object under `<teamId>/` (logo, headshots, gallery) and
// `parent-uploads/<teamId>/` (parents' photos of kids) in storage for good,
// while /terms says a deleted team's content is removed.
//
// Order: the row goes first through the coach's own session (RLS and the
// owner guard decide who may delete; nothing here widens that), then the
// files with the service role. If the row delete is refused, no file is
// touched; if a file removal fails, the team is still gone and the leftovers
// are logged for cleanup.
export async function POST(request) {
  if (await rateLimited(request, "team-delete", { limit: 5, windowMs: 600_000 })) {
    return NextResponse.json({ error: RATE_MSG }, { status: 429 });
  }
  let payload;
  try { payload = await request.json(); } catch { return NextResponse.json({ error: "Bad request." }, { status: 400 }); }
  const teamId = String(payload?.teamId || "");
  if (!/^[0-9a-f-]{36}$/i.test(teamId)) return NextResponse.json({ error: "Bad request." }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  // .select() so a delete the database refused (not the owner) comes back as
  // zero rows instead of looking like success.
  const { data: gone, error } = await supabase.from("teams").delete().eq("id", teamId).select("id");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!gone || gone.length === 0) return NextResponse.json({ error: "Only the head coach can delete this team." }, { status: 403 });

  const admin = createAdminClient();
  let removed = 0;
  let leftover = 0;
  if (admin) {
    for (const prefix of [teamId, `parent-uploads/${teamId}`]) {
      const paths = await listAll(admin, prefix);
      for (let i = 0; i < paths.length; i += 100) {
        const chunk = paths.slice(i, i + 100);
        const { error: rmErr } = await admin.storage.from(BUCKET).remove(chunk);
        if (rmErr) leftover += chunk.length; else removed += chunk.length;
      }
    }
  }
  if (leftover) console.error(`[team/delete] team ${teamId}: ${leftover} storage objects could not be removed`);
  return NextResponse.json({ ok: true, removed, leftover });
}

// Storage list is one folder level at a time; our tree is at most
// <teamId>/<kind>/<file>, so two levels cover it (and a third just in case).
async function listAll(admin, prefix, depth = 0) {
  const out = [];
  let offset = 0;
  for (;;) {
    const { data, error } = await admin.storage.from(BUCKET).list(prefix, { limit: 1000, offset });
    if (error || !data) break;
    for (const entry of data) {
      const full = `${prefix}/${entry.name}`;
      // Folders come back with no id/metadata.
      if (entry.id || entry.metadata) out.push(full);
      else if (depth < 3) out.push(...(await listAll(admin, full, depth + 1)));
    }
    if (data.length < 1000) break;
    offset += data.length;
  }
  return out;
}
