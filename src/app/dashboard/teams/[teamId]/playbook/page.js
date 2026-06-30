"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input, Label, Button, Card, EmptyState, ErrorText, Spinner, Select, TextArea } from "@/components/ui";
import PlayField from "@/components/PlayField";
import PlaybookBoard from "@/components/PlaybookBoard";
import { sportLabel } from "@/lib/constants";
import { emptyDiagram, normalizeDiagram, hasBoard, playCategoriesForSport } from "@/lib/playbook";

export default function PlaybookPage({ params }) {
  const { teamId } = use(params);
  const supabase = createClient();
  const [sport, setSport] = useState(null);
  const [plays, setPlays] = useState(null);
  const [editing, setEditing] = useState(null); // play object | "new" | null
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    const [{ data: team }, { data: rows, error: err }] = await Promise.all([
      supabase.from("teams").select("sport").eq("id", teamId).single(),
      supabase.from("plays").select("*").eq("team_id", teamId).order("sort_order").order("created_at"),
    ]);
    setSport(team?.sport || "other");
    if (err) setError(err.message);
    setPlays(rows || []);
  }, [teamId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  async function remove(p) {
    if (!confirm(`Delete the play "${p.name}"? This can't be undone.`)) return;
    await supabase.from("plays").delete().eq("id", p.id);
    load();
  }

  async function duplicate(p) {
    await supabase.from("plays").insert({
      team_id: teamId, name: `${p.name} (copy)`, category: p.category, formation: p.formation,
      sport: p.sport || sport, diagram: p.diagram, notes: p.notes, sort_order: (plays?.length || 0),
    });
    load();
  }

  async function move(index, dir) {
    const arr = [...plays];
    const j = index + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[index], arr[j]] = [arr[j], arr[index]];
    setPlays(arr.map((p, i) => ({ ...p, sort_order: i })));
    await Promise.all(arr.map((p, i) => supabase.from("plays").update({ sort_order: i }).eq("id", p.id)));
  }

  async function togglePublic(p) {
    setPlays((ps) => ps.map((x) => (x.id === p.id ? { ...x, is_public: !x.is_public } : x)));
    await supabase.from("plays").update({ is_public: !p.is_public }).eq("id", p.id);
  }

  function openPrint(playId) {
    const base = `/dashboard/teams/${teamId}/playbook/print`;
    window.open(playId ? `${base}?id=${playId}` : base, "_blank");
  }

  if (sport === null || plays === null) return <Spinner />;

  if (!hasBoard(sport)) {
    return (
      <div className="max-w-2xl">
        <EmptyState
          icon="🏈"
          text={`The play board is built for football, flag football, and soccer right now. Your team's sport is set to ${sportLabel(sport)}. Switch it on the Settings tab to use the playbook — more sports are coming.`}
        />
      </div>
    );
  }

  if (editing) {
    return (
      <PlayEditor
        teamId={teamId}
        sport={sport}
        play={editing === "new" ? null : editing}
        nextOrder={plays.length}
        onDone={() => { setEditing(null); load(); }}
        onCancel={() => setEditing(null)}
      />
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <p className="text-slate-400 text-sm max-w-xl">Draw up plays on the coach&apos;s board, save them to your playbook, and print them for practice or the sideline.</p>
        <div className="flex gap-2">
          {plays.length > 0 && (
            <Button variant="ghost" onClick={() => openPrint(null)}>🖨 Print playbook</Button>
          )}
          <Button variant="green" onClick={() => setEditing("new")}>+ New Play</Button>
        </div>
      </div>

      <ErrorText>{error}</ErrorText>

      {plays.length === 0 ? (
        <EmptyState icon="📋" text="No plays yet. Tap “New Play” to open the board and draw your first one." />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {plays.map((p, i) => (
            <Card key={p.id} className="flex gap-4 items-stretch">
              <button onClick={() => setEditing(p)} className="shrink-0 rounded-lg overflow-hidden border border-white/10 bg-[#2f8a4a]" style={{ width: 104 }} title="Edit play">
                <PlayField diagram={p.diagram} theme="turf" sport={sport} style={{ display: "block", width: "100%" }} />
              </button>
              <div className="flex-1 min-w-0 flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-white truncate">{p.name}</h4>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-1 mb-2">
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--color-accent-blue)]/15 text-[var(--color-accent-blue)] border border-blue-500/20">{p.category}</span>
                  {p.formation ? <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10">{p.formation}</span> : null}
                  <button onClick={() => togglePublic(p)} title="Toggle whether this play shows on the public team site"
                    className={`text-[11px] px-2 py-0.5 rounded-full border ${p.is_public ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-white/5 text-slate-500 border-white/10"}`}>
                    {p.is_public ? "On team site" : "Hidden"}
                  </button>
                </div>
                {p.notes ? <p className="text-xs text-slate-400 line-clamp-2 mb-2">{p.notes}</p> : <div className="flex-1" />}
                <div className="flex flex-wrap gap-3 mt-auto pt-1 text-xs">
                  <button onClick={() => setEditing(p)} className="text-[var(--color-accent-blue)] hover:underline font-medium">Edit</button>
                  <button onClick={() => openPrint(p.id)} className="text-slate-300 hover:underline">Print</button>
                  <button onClick={() => duplicate(p)} className="text-slate-300 hover:underline">Duplicate</button>
                  <button onClick={() => remove(p)} className="text-red-400 hover:underline">Delete</button>
                  <span className="flex-1" />
                  <button onClick={() => move(i, -1)} disabled={i === 0} title="Move up" className="text-slate-300 hover:underline disabled:opacity-30 disabled:no-underline">↑</button>
                  <button onClick={() => move(i, 1)} disabled={i === plays.length - 1} title="Move down" className="text-slate-300 hover:underline disabled:opacity-30 disabled:no-underline">↓</button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function PlayEditor({ teamId, sport, play, nextOrder, onDone, onCancel }) {
  const supabase = createClient();
  const categories = playCategoriesForSport(sport);
  const [name, setName] = useState(play?.name || "");
  const [category, setCategory] = useState(play?.category || categories[0]);
  const [formation, setFormation] = useState(play?.formation || "");
  const [notes, setNotes] = useState(play?.notes || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const diagramRef = useRef(normalizeDiagram(play?.diagram) || emptyDiagram());

  const onBoardChange = useCallback((d) => { diagramRef.current = d; }, []);

  async function save() {
    if (!name.trim()) { setError("Give the play a name."); return; }
    setBusy(true);
    setError(null);
    const row = {
      team_id: teamId,
      name: name.trim(),
      category,
      formation: formation.trim() || null,
      sport,
      diagram: diagramRef.current,
      notes: notes.trim() || null,
      updated_at: new Date().toISOString(),
    };
    const query = play
      ? supabase.from("plays").update(row).eq("id", play.id)
      : supabase.from("plays").insert({ ...row, sort_order: nextOrder });
    const { error: err } = await query;
    setBusy(false);
    if (err) { setError(err.message); return; }
    onDone();
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-4">
        <button onClick={onCancel} className="text-sm text-slate-400 hover:text-white">← Back to playbook</button>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button variant="green" onClick={save} disabled={busy}>{busy ? "Saving…" : play ? "Save changes" : "Save play"}</Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6 items-start">
        <PlaybookBoard initial={diagramRef.current} onChange={onBoardChange} sport={sport} />

        <Card className="border-white/10">
          <h3 className="font-bold mb-4">{play ? "Edit play" : "New play"}</h3>
          <div className="space-y-4">
            <div>
              <Label>Play name *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} placeholder="e.g. Trips Right — Smash" />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </div>
            <div>
              <Label>Formation (optional)</Label>
              <Input value={formation} onChange={(e) => setFormation(e.target.value)} maxLength={60} placeholder="e.g. Trips Right, I-Form" />
            </div>
            <div>
              <Label>Coaching notes (optional)</Label>
              <TextArea value={notes} onChange={(e) => setNotes(e.target.value)} rows={5} maxLength={2000} placeholder="Reads, assignments, coaching points…" />
            </div>
            <ErrorText>{error}</ErrorText>
            <p className="text-xs text-slate-500">Saved plays appear in your playbook and can be printed as a single sheet or as part of the full book.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
