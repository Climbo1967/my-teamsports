"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { uploadTeamImage } from "@/lib/upload";
import { signMediaUrls } from "@/lib/media";
import { POSITIONS } from "@/lib/constants";
import { Input, Select, Label, Button, Card, EmptyState, ErrorText, Spinner, TextArea } from "@/components/ui";

export default function RosterPage({ params }) {
  const { teamId } = use(params);
  const supabase = createClient();
  const [players, setPlayers] = useState(null);
  const [sport, setSport] = useState("other");
  const [editing, setEditing] = useState(null); // player object or "new"
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    const [{ data: playerRows, error: pErr }, { data: team }] = await Promise.all([
      supabase.from("players").select("*").eq("team_id", teamId).order("sort_order").order("name"),
      supabase.from("teams").select("sport").eq("id", teamId).single(),
    ]);
    if (pErr) setError(pErr.message);
    // photo_url stores a private-bucket path; sign for display (photo_display).
    const rows = playerRows || [];
    const displays = await signMediaUrls(supabase, rows.map((p) => p.photo_url));
    setPlayers(rows.map((p, i) => ({ ...p, photo_display: displays[i] })));
    if (team) setSport(team.sport);
  }, [teamId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  async function removePlayer(player) {
    if (!confirm(`Remove ${player.name} from the roster?`)) return;
    const { error: err } = await supabase.from("players").delete().eq("id", player.id);
    if (err) setError(err.message);
    load();
  }

  async function movePlayer(index, dir) {
    const arr = [...players];
    const j = index + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[index], arr[j]] = [arr[j], arr[index]];
    setPlayers(arr.map((p, i) => ({ ...p, sort_order: i })));
    await Promise.all(arr.map((p, i) => supabase.from("players").update({ sort_order: i }).eq("id", p.id)));
  }

  if (!players) return <Spinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-slate-400 text-sm">{players.length} player{players.length === 1 ? "" : "s"} on the roster</p>
        <Button variant="green" onClick={() => setEditing("new")}>+ Add Player</Button>
      </div>

      <ErrorText>{error}</ErrorText>

      {editing && (
        <PlayerForm
          teamId={teamId}
          sport={sport}
          player={editing === "new" ? null : editing}
          onDone={() => { setEditing(null); load(); }}
          onCancel={() => setEditing(null)}
        />
      )}

      {players.length === 0 && !editing ? (
        <EmptyState icon="📋" text="No players yet. Add your first player — name and number are all you need to start." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {players.map((p, i) => (
            <Card key={p.id} className="flex gap-4 items-center !p-4">
              {p.photo_display ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.photo_display} alt={p.name} className="w-16 h-16 rounded-full object-cover border border-white/10 shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-700/20 border border-white/10 flex items-center justify-center text-xl font-bold text-slate-500 shrink-0">
                  {p.jersey_number ? `#${p.jersey_number}` : p.name[0]}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate">{p.name}</p>
                <p className="text-xs text-slate-500">
                  {p.jersey_number ? `#${p.jersey_number}` : ""}{p.jersey_number && p.position ? " · " : ""}{p.position || ""}
                </p>
                <div className="flex gap-3 mt-1.5 items-center">
                  <button onClick={() => setEditing(p)} className="text-xs text-[var(--color-accent-blue)] hover:underline">Edit</button>
                  <button onClick={() => removePlayer(p)} className="text-xs text-red-400 hover:underline">Remove</button>
                  <span className="flex-1" />
                  <button onClick={() => movePlayer(i, -1)} disabled={i === 0} title="Move up" className="text-xs text-slate-400 hover:text-white disabled:opacity-30">↑</button>
                  <button onClick={() => movePlayer(i, 1)} disabled={i === players.length - 1} title="Move down" className="text-xs text-slate-400 hover:text-white disabled:opacity-30">↓</button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function PlayerForm({ teamId, sport, player, onDone, onCancel }) {
  const supabase = createClient();
  const fileRef = useRef(null);
  const [name, setName] = useState(player?.name || "");
  const [jersey, setJersey] = useState(player?.jersey_number || "");
  const [position, setPosition] = useState(player?.position || "");
  const [bio, setBio] = useState(player?.bio || "");
  // photoPath is what gets stored; photoUrl is a signed URL for on-screen preview.
  const [photoPath, setPhotoPath] = useState(player?.photo_url || null);
  const [photoUrl, setPhotoUrl] = useState(player?.photo_display || null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const positions = POSITIONS[sport] || [];

  async function handlePhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const { path, displayUrl } = await uploadTeamImage(supabase, `${teamId}/players`, file);
      setPhotoPath(path);
      setPhotoUrl(displayUrl);
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  }

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const row = {
      team_id: teamId,
      name: name.trim(),
      jersey_number: jersey.trim() || null,
      position: position || null,
      bio: bio.trim() || null,
      photo_url: photoPath,
    };
    const query = player
      ? supabase.from("players").update(row).eq("id", player.id)
      : supabase.from("players").insert(row);
    const { error: err } = await query;
    setBusy(false);
    if (err) { setError(err.message); return; }
    onDone();
  }

  return (
    <Card className="mb-6 border-blue-500/25">
      <h3 className="font-bold text-lg mb-4">{player ? `EDIT ${player.name.toUpperCase()}` : "ADD PLAYER"}</h3>
      <form onSubmit={save} className="space-y-4">
        <div className="flex items-center gap-4">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt="Player" className="w-20 h-20 rounded-full object-cover border border-white/10" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-white/[0.05] border border-dashed border-white/20 flex items-center justify-center text-2xl">📷</div>
          )}
          <div>
            <Button type="button" variant="ghost" onClick={() => fileRef.current?.click()} disabled={busy}>
              {photoUrl ? "Change photo" : "Upload photo"}
            </Button>
            {photoUrl && (
              <button type="button" onClick={() => { setPhotoPath(null); setPhotoUrl(null); }} className="block text-xs text-red-400 hover:underline mt-1.5">
                Remove photo
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <Label>Player Name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required maxLength={80} placeholder="Jake Thompson" />
          </div>
          <div>
            <Label>Jersey #</Label>
            <Input value={jersey} onChange={(e) => setJersey(e.target.value)} maxLength={4} placeholder="12" />
          </div>
        </div>

        <div>
          <Label>Position</Label>
          {positions.length > 0 ? (
            <Select value={position} onChange={(e) => setPosition(e.target.value)}>
              <option value="">— Select position —</option>
              {positions.map((p) => <option key={p} value={p}>{p}</option>)}
            </Select>
          ) : (
            <Input value={position} onChange={(e) => setPosition(e.target.value)} maxLength={40} placeholder="Position" />
          )}
        </div>

        <div>
          <Label>Bio (shows on the player&apos;s card)</Label>
          <TextArea value={bio} onChange={(e) => setBio(e.target.value)} rows={2} maxLength={500} placeholder="Favorite player, years on the team, fun fact..." />
        </div>

        <ErrorText>{error}</ErrorText>

        <div className="flex gap-3">
          <Button type="submit" variant="green" disabled={busy || !name.trim()}>
            {busy ? "Saving..." : player ? "Save changes" : "Add player"}
          </Button>
          <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        </div>
      </form>
    </Card>
  );
}
