import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createPasscodeClient, clientIp, passcodeDenied, lockedOut, LOCKOUT_MSG, EXPIRED_MSG } from "@/lib/supabase/passcode";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimited, RATE_MSG } from "@/lib/ratelimit";
import { mediaPath } from "@/lib/media";

/**
 * Parent photo upload. The passcode lives in an httpOnly cookie set by the
 * passcode gate; we validate it server-side, upload to storage with the
 * service-role client (so the bucket needs no anonymous INSERT policy), and
 * record the photo through a passcode-checked database function.
 * The bucket is private: we store the object PATH in photos.url and the
 * team page signs it at read time (see src/lib/media.js).
 */
const ALLOWED = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const BUCKET = "team-media";

export async function POST(request) {
  if (await rateLimited(request, "team-photos", { limit: 12, windowMs: 600_000 })) {
    return NextResponse.json({ error: RATE_MSG }, { status: 429 });
  }

  let form;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  const slug = String(form.get("slug") || "").toLowerCase();
  const file = form.get("file");
  const caption = String(form.get("caption") || "").slice(0, 200);
  const playerId = form.get("playerId") ? String(form.get("playerId")) : null;

  if (!slug || !file || typeof file === "string") {
    return NextResponse.json({ error: "Missing photo or team." }, { status: 400 });
  }
  const ext = ALLOWED[file.type];
  if (!ext) {
    return NextResponse.json({ error: "Please upload a JPG, PNG, or WebP image." }, { status: 400 });
  }
  // The platform rejects request bodies over 4.5 MB before this runs, so the
  // real limit is lower than this; the team site shrinks photos first.
  if (file.size > 4 * 1024 * 1024) {
    return NextResponse.json({ error: "Image is too large (max 4MB)." }, { status: 400 });
  }

  const cookieStore = await cookies();
  const passcode = cookieStore.get(`team_access_${slug}`)?.value;
  if (!passcode) {
    return NextResponse.json({ error: "Your team access expired. Re-enter the passcode." }, { status: 401 });
  }

  const supabase = await createPasscodeClient(clientIp(request));

  // Validate passcode and get the team id
  const { data: site, error: siteError } = await supabase.rpc("get_team_site", { p_slug: slug, p_passcode: passcode });
  if (lockedOut(siteError)) return NextResponse.json({ error: LOCKOUT_MSG }, { status: 429 });
  if (siteError) return NextResponse.json({ error: "Could not check your team access. Try again." }, { status: 500 });
  if (!site) {
    return NextResponse.json({ error: EXPIRED_MSG }, { status: 401 });
  }
  const teamId = site.team.id;

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Photo uploads are temporarily unavailable." }, { status: 503 });
  }

  // Upload into the parent-uploads area of the bucket (service-role bypasses RLS)
  const path = `parent-uploads/${teamId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const bytes = await file.arrayBuffer();
  const { error: uploadError } = await admin.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType: file.type });
  if (uploadError) {
    return NextResponse.json({ error: "Upload failed. Try again." }, { status: 500 });
  }

  // Record the object path (passcode re-checked inside the function);
  // the team page turns it into a signed URL at render time.
  const { data: photoId, error: rpcError } = await supabase.rpc("add_team_photo", {
    p_slug: slug,
    p_passcode: passcode,
    p_url: path,
    p_caption: caption || null,
    p_player_id: playerId,
  });
  if (rpcError || passcodeDenied(photoId)) {
    // Roll back the orphaned object so it doesn't linger
    await admin.storage.from(BUCKET).remove([path]).catch(() => {});
    if (lockedOut(rpcError)) return NextResponse.json({ error: LOCKOUT_MSG }, { status: 429 });
    if (!rpcError) return NextResponse.json({ error: EXPIRED_MSG }, { status: 401 });
    return NextResponse.json({ error: "Could not save the photo. Try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request) {
  if (await rateLimited(request, "team-photos-delete", { limit: 30, windowMs: 600_000 })) {
    return NextResponse.json({ error: RATE_MSG }, { status: 429 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  const slug = String(body?.slug || "").toLowerCase();
  const photoId = body?.photoId;
  if (!slug || !photoId) {
    return NextResponse.json({ error: "Missing photo." }, { status: 400 });
  }
  const cookieStore = await cookies();
  const passcode = cookieStore.get(`team_access_${slug}`)?.value;
  if (!passcode) {
    return NextResponse.json({ error: "Your team access expired. Re-enter the passcode." }, { status: 401 });
  }
  const supabase = await createPasscodeClient(clientIp(request));
  const { data, error } = await supabase.rpc("delete_team_photo", {
    p_slug: slug, p_passcode: passcode, p_photo_id: photoId,
  });
  if (lockedOut(error)) return NextResponse.json({ error: LOCKOUT_MSG }, { status: 429 });
  if (!error && passcodeDenied(data)) return NextResponse.json({ error: EXPIRED_MSG }, { status: 401 });
  if (error || !data?.ok) {
    return NextResponse.json({ error: "Could not remove the photo." }, { status: 500 });
  }

  // Also remove the underlying storage object (M3) if the RPC returned its
  // stored value — a bare path now, a full public URL for legacy rows.
  if (data.url) {
    const path = mediaPath(data.url);
    const admin = createAdminClient();
    if (path && admin) {
      await admin.storage.from(BUCKET).remove([path]).catch(() => {});
    }
  }

  return NextResponse.json({ ok: true, removed: data.removed });
}
