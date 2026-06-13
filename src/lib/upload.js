"use client";

/**
 * Resize an image in the browser (max 1600px long edge) and return a JPEG blob.
 * Keeps uploads fast and storage small without visible quality loss.
 */
export async function resizeImage(file, maxSize = 1600, quality = 0.85) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d").drawImage(bitmap, 0, 0, w, h);

  return new Promise((resolve) =>
    canvas.toBlob((blob) => resolve(blob), "image/jpeg", quality)
  );
}

/**
 * Upload an image to the team-media bucket. Returns the public URL.
 * folder example: `${teamId}/players` or `${teamId}/gallery`
 */
export async function uploadTeamImage(supabase, folder, file) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file.");
  }
  if (file.size > 15 * 1024 * 1024) {
    throw new Error("Image is too large (max 15MB).");
  }

  const blob = await resizeImage(file);
  const name = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;

  const { error } = await supabase.storage
    .from("team-media")
    .upload(name, blob, { contentType: "image/jpeg" });
  if (error) throw error;

  const { data } = supabase.storage.from("team-media").getPublicUrl(name);
  return data.publicUrl;
}
