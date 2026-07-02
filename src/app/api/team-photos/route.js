import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Parent photo upload. The passcode lives in an httpOnly cookie set by the
 * passcode gate; we validate it server-side, upload to storage with the
 * service-role client (so the bucket needs no anonymous INSERT policy), and
 * record the photo through a passcode-checked database function.
 */
const ALLOWED = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const BUCKET = "team-media";

function pathFromPublicUrl(url) {
  // .../object/public/team-media/<path>
  const marker = `/object/public/${BUCKET}/`;
  const i = url.indexOf(marker);
  return i === -1 ? null : url.slice(i + marker.length);
}

export async function POST(request) {
  const form = await request.formData();
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
  if (file.size > 15 * 1024 * 1024) {
    return NextResponse.json({ error: "Image is too large (max 15MB)." }, { status: 400 });
  }

  const cookieStore = await cookies();
  const passcode = cookieStore.get(`team_access_${slug}`)?.value;
  if (!passcode) {
    return NextResponse.json({ error: "Your team access expired. Re-enter the passcode." }, { status: 401 });
  }

  const supabase = await createClient();

  // Validate passcode and get the team id
  const { data: site } = await supabase.rpc("get_team_site", { p_slug: slug, p_passcode: passcode });
  if (!site) {
    return NextResponse.json({ error: "Your team access expired. Re-enter the passcode." }, { status: 401 });
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

  const { data: pub } = admin.storage.from(BUCKET).getPublicUrl(path);

  // Record it (passcode re-checked inside the function)
  const { error: rpcError } = await supabase.rpc("add_team_photo", {
    p_slug: slug,
    p_passcode: passcode,
    p_url: pub.publicUrl,
    p_caption: caption || null,
    p_player_id: playerId,
  });
  if (rpcError) {
    // Roll back the orphaned object so it doesn't linger publicly
    await admin.storage.from(BUCKET).remove([path]).catch(() => {});
    return NextResponse.json({ error: "Could not save the photo. Try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, url: pub.publicUrl });
}

export async function DELETE(request) {
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
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("delete_team_photo", {
    p_slug: slug, p_passcode: passcode, p_photo_id: photoId,
  });
  if (error || !data?.ok) {
    return NextResponse.json({ error: "Could not remove the photo." }, { status: 500 });
  }

  // Also remove the underlying storage object (M3) if the RPC returned its URL
  if (data.url) {
    const path = pathFromPublicUrl(data.url);
    const admin = createAdminClient();
    if (path && admin) {
      await admin.storage.from(BUCKET).remove([path]).catch(() => {});
    }
  }

  return NextResponse.json({ ok: true, removed: data.removed });
}
