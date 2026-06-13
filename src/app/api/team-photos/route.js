import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

/**
 * Parent photo upload. The passcode lives in an httpOnly cookie set by the
 * passcode gate; we validate it server-side, upload to storage, and record
 * the photo through a passcode-checked database function.
 */
export async function POST(request) {
  const form = await request.formData();
  const slug = String(form.get("slug") || "").toLowerCase();
  const file = form.get("file");
  const caption = String(form.get("caption") || "").slice(0, 200);
  const playerId = form.get("playerId") ? String(form.get("playerId")) : null;

  if (!slug || !file || typeof file === "string") {
    return NextResponse.json({ error: "Missing photo or team." }, { status: 400 });
  }
  if (!file.type?.startsWith("image/")) {
    return NextResponse.json({ error: "Please upload an image file." }, { status: 400 });
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

  // Upload into the parent-uploads area of the bucket
  const ext = file.type === "image/png" ? "png" : "jpg";
  const path = `parent-uploads/${teamId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const bytes = await file.arrayBuffer();
  const { error: uploadError } = await supabase.storage
    .from("team-media")
    .upload(path, bytes, { contentType: file.type });
  if (uploadError) {
    return NextResponse.json({ error: "Upload failed. Try again." }, { status: 500 });
  }

  const { data: pub } = supabase.storage.from("team-media").getPublicUrl(path);

  // Record it (passcode re-checked inside the function)
  const { error: rpcError } = await supabase.rpc("add_team_photo", {
    p_slug: slug,
    p_passcode: passcode,
    p_url: pub.publicUrl,
    p_caption: caption || null,
    p_player_id: playerId,
  });
  if (rpcError) {
    return NextResponse.json({ error: "Could not save the photo. Try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, url: pub.publicUrl });
}
