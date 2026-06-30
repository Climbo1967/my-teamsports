"use client";

import { use, useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input, Label, Button, Card, EmptyState, ErrorText, Spinner, TextArea } from "@/components/ui";

export default function NotesPage({ params }) {
  const { teamId } = use(params);
  const supabase = createClient();
  const [notes, setNotes] = useState(null);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    const { data, error: err } = await supabase
      .from("notes").select("*").eq("team_id", teamId).order("created_at", { ascending: false });
    if (err) setError(err.message);
    setNotes(data || []);
  }, [teamId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  async function remove(n) {
    if (!confirm("Delete this note?")) return;
    await supabase.from("notes").delete().eq("id", n.id);
    load();
  }

  if (!notes) return <Spinner />;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <p className="text-slate-400 text-sm">Practice plans, game prep, and strategy — posted right on your public team page for parents and players to see.</p>
        <Button variant="green" onClick={() => setEditing("new")}>+ New Note</Button>
      </div>

      <ErrorText>{error}</ErrorText>

      {editing && (
        <NoteForm
          teamId={teamId}
          note={editing === "new" ? null : editing}
          onDone={() => { setEditing(null); load(); }}
          onCancel={() => setEditing(null)}
        />
      )}

      {notes.length === 0 && !editing ? (
        <EmptyState icon="📝" text="No notes yet. Post practice plans, game prep, or anything the team should know." />
      ) : (
        <div className="space-y-4 mt-6">
          {notes.map((n) => (
            <Card key={n.id}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <h4 className="font-bold text-white">{n.title}</h4>
                <span className="text-xs text-slate-500 whitespace-nowrap">
                  {new Date(n.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
              <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">{n.body}</p>
              <div className="flex gap-4 mt-3">
                <button onClick={() => setEditing(n)} className="text-xs text-[var(--color-accent-blue)] hover:underline">Edit</button>
                <button onClick={() => remove(n)} className="text-xs text-red-400 hover:underline">Delete</button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function NoteForm({ teamId, note, onDone, onCancel }) {
  const supabase = createClient();
  const [title, setTitle] = useState(note?.title || "");
  const [body, setBody] = useState(note?.body || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const row = { team_id: teamId, title: title.trim(), body: body.trim(), updated_at: new Date().toISOString() };
    const query = note
      ? supabase.from("notes").update(row).eq("id", note.id)
      : supabase.from("notes").insert(row);
    const { error: err } = await query;
    setBusy(false);
    if (err) { setError(err.message); return; }
    onDone();
  }

  return (
    <Card className="mb-6 border-blue-500/25">
      <h3 className="font-bold text-lg mb-4">{note ? "EDIT NOTE" : "NEW NOTE"}</h3>
      <p className="text-xs text-amber-300/90 mb-4">
        <strong>Visible to parents.</strong> Coach&apos;s Notes are published on your public team page &mdash; keep private info (like opponent scouting) out of here.
      </p>
      <form onSubmit={save} className="space-y-4">
        <div>
          <Label>Title *</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={120} placeholder="This week's practice plan" />
        </div>
        <div>
          <Label>Note *</Label>
          <TextArea value={body} onChange={(e) => setBody(e.target.value)} rows={6} maxLength={8000} required placeholder="Monday: hitting drills...&#10;Wednesday: defense...&#10;Saturday: game vs Eagles, arrive 9:15am" />
        </div>
        <ErrorText>{error}</ErrorText>
        <div className="flex gap-3">
          <Button type="submit" variant="green" disabled={busy || !title.trim() || !body.trim()}>
            {busy ? "Saving..." : note ? "Save changes" : "Post note"}
          </Button>
          <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        </div>
      </form>
    </Card>
  );
}
