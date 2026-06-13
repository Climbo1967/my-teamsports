"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { uploadTeamImage } from "@/lib/upload";
import { Select, Label, Button, Card, EmptyState, ErrorText, Spinner } from "@/components/ui";

export default function PhotosPage({ params }) {
  const { teamId } = use(params);
  const supabase = createClient();
  const fileRef = useRef(null);
  const [photos, setPhotos] = useState(null);
  const [players, setPlayers] = useState([]);
  const [taggedPlayer, setTaggedPlayer] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    const [{ data: photoRows, error: err }, { data: playerRows }] = await Promise.all([
      supabase.from("photos").select("*").eq("team_id", teamId).order("created_at", { ascending: false }),
      supabase.from("players").select("id, name").eq("team_id", teamId).order("name"),
    ]);
    if (err) setError(err.message);
    setPhotos(photoRows || []);
    setPlayers(playerRows || []);
  }, [teamId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  async function handleFiles(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setBusy(true);
    setError(null);
    let done = 0;
    try {
      for (const file of files) {
        setProgress(`Uploading ${done + 1} of ${files.length}...`);
        const url = await uploadTeamImage(supabase, `${teamId}/gallery`, file);
        const { error: err } = await supabase.from("photos").insert({
          team_id: teamId,
          url,
          player_id: taggedPlayer || null,
          uploaded_by: "coach",
        });
        if (err) throw err;
        done++;
      }
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
    setProgress("");
    if (fileRef.current) fileRef.current.value = "";
    load();
  }

  async function remove(photo) {
    if (!confirm("Delete this photo?")) return;
    await supabase.from("photos").delete().eq("id", photo.id);
    // Also remove the file from storage if it lives in our bucket
    const marker = "/team-media/";
    const i = photo.url.indexOf(marker);
    if (i !== -1) {
      await supabase.storage.from("team-media").remove([decodeURIComponent(photo.url.slice(i + marker.length))]);
    }
    load();
  }

  if (!photos) return <Spinner />;

  const playerName = (id) => players.find((p) => p.id === id)?.name;

  return (
    <div>
      <Card className="mb-8 border-blue-500/25">
        <h3 className="font-bold text-lg mb-1">UPLOAD PHOTOS</h3>
        <p className="text-sm text-slate-400 mb-4">
          Add as many as you like — they appear in the team gallery instantly. Parents can also upload from the team site.
        </p>
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[220px]">
            <Label>Tag a player (optional)</Label>
            <Select value={taggedPlayer} onChange={(e) => setTaggedPlayer(e.target.value)}>
              <option value="">— Whole team —</option>
              {players.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
          </div>
          <Button variant="green" onClick={() => fileRef.current?.click()} disabled={busy}>
            {busy ? progress || "Uploading..." : "📸 Choose photos"}
          </Button>
          <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
        </div>
        <div className="mt-3"><ErrorText>{error}</ErrorText></div>
      </Card>

      {photos.length === 0 ? (
        <EmptyState icon="📸" text="No photos yet. Upload action shots, team photos, and tournament memories." />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="group relative rounded-xl overflow-hidden border border-white/[0.08] bg-white/[0.02]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.url} alt={photo.caption || "Team photo"} className="w-full aspect-square object-cover" loading="lazy" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-300 truncate">
                    {photo.player_id ? playerName(photo.player_id) : photo.uploaded_by === "parent" ? "From a parent" : ""}
                  </span>
                  <button onClick={() => remove(photo)} className="text-xs text-red-400 hover:text-red-300 shrink-0">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
