"use client";

import { use, useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { videoEmbedUrl, isValidVideoUrl } from "@/lib/video";
import { Input, Label, Button, Card, EmptyState, ErrorText, Spinner } from "@/components/ui";

export default function VideosPage({ params }) {
  const { teamId } = use(params);
  const supabase = createClient();
  const [videos, setVideos] = useState(null);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [gameDate, setGameDate] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    const { data, error: err } = await supabase
      .from("videos").select("*").eq("team_id", teamId)
      .order("game_date", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });
    if (err) setError(err.message);
    setVideos(data || []);
  }, [teamId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  function startEdit(v) {
    setEditingId(v.id);
    setTitle(v.title || "");
    setUrl(v.url || "");
    setGameDate(v.game_date || "");
    setError(null);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setTitle(""); setUrl(""); setGameDate(""); setError(null);
  }

  async function save(e) {
    e.preventDefault();
    setError(null);
    if (!isValidVideoUrl(url)) {
      setError("That doesn't look like a valid link.");
      return;
    }
    setBusy(true);
    const payload = { title: title.trim(), url: url.trim(), game_date: gameDate || null };
    const { error: err } = editingId
      ? await supabase.from("videos").update(payload).eq("id", editingId)
      : await supabase.from("videos").insert({ team_id: teamId, ...payload });
    setBusy(false);
    if (err) { setError(err.message); return; }
    setEditingId(null);
    setTitle("");
    setUrl("");
    setGameDate("");
    load();
  }

  async function remove(video) {
    if (!confirm(`Remove "${video.title}"?`)) return;
    await supabase.from("videos").delete().eq("id", video.id);
    load();
  }

  if (!videos) return <Spinner />;

  return (
    <div>
      <Card className="mb-8 border-blue-500/25 max-w-2xl">
        <h3 className="font-bold text-lg mb-1">{editingId ? "EDIT VIDEO" : "ADD GAME FILM"}</h3>
        <p className="text-sm text-slate-400 mb-4">
          Record to YouTube (set it to <span className="text-white">Unlisted</span>) or Vimeo, then paste the link here.
          It plays right on the team site — only people with the passcode see it.
        </p>
        <form onSubmit={save} className="space-y-4">
          <div>
            <Label>Title *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={120} placeholder="vs Eastside Eagles — Full Game" />
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Label>Video Link *</Label>
              <Input value={url} onChange={(e) => setUrl(e.target.value)} required maxLength={500} placeholder="https://youtu.be/..." />
            </div>
            <div>
              <Label>Game Date</Label>
              <Input type="date" value={gameDate} onChange={(e) => setGameDate(e.target.value)} />
            </div>
          </div>
          {url && !videoEmbedUrl(url) && isValidVideoUrl(url) && (
            <p className="text-xs text-yellow-400">
              Not a YouTube/Vimeo link — it&apos;ll show as a clickable link instead of a built-in player.
            </p>
          )}
          <ErrorText>{error}</ErrorText>
          <div className="flex gap-3">
            <Button type="submit" variant="green" disabled={busy || !title.trim() || !url.trim()}>
              {busy ? "Saving..." : editingId ? "Save changes" : "🎬 Add video"}
            </Button>
            {editingId && <Button type="button" variant="ghost" onClick={cancelEdit}>Cancel</Button>}
          </div>
        </form>
      </Card>

      {videos.length === 0 ? (
        <EmptyState icon="🎬" text="No game film yet. Paste a YouTube or Vimeo link above — full games, highlights, anything." />
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {videos.map((v) => {
            const embed = videoEmbedUrl(v.url);
            return (
              <Card key={v.id} className="!p-4">
                {embed ? (
                  <div className="aspect-video rounded-xl overflow-hidden bg-black mb-3">
                    <iframe
                      src={embed}
                      title={v.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <a href={v.url} target="_blank" rel="noopener noreferrer" className="block aspect-video rounded-xl bg-white/[0.04] border border-white/10 mb-3 flex items-center justify-center text-4xl hover:bg-white/[0.07]">
                    🎬
                  </a>
                )}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{v.title}</p>
                    {v.game_date && (
                      <p className="text-xs text-slate-500">
                        {new Date(v.game_date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-3 shrink-0">
                    <button onClick={() => startEdit(v)} className="text-xs text-[var(--color-accent-blue)] hover:underline">Edit</button>
                    <button onClick={() => remove(v)} className="text-xs text-red-400 hover:underline">Delete</button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
