"use client";

import { use, useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input, Select, Label, Button, Card, EmptyState, ErrorText, Spinner, TextArea } from "@/components/ui";

export default function SchedulePage({ params }) {
  const { teamId } = use(params);
  const supabase = createClient();
  const [events, setEvents] = useState(null);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    const { data, error: err } = await supabase
      .from("events").select("*").eq("team_id", teamId).order("starts_at");
    if (err) setError(err.message);
    setEvents(data || []);
  }, [teamId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  async function remove(event) {
    if (!confirm("Delete this event?")) return;
    await supabase.from("events").delete().eq("id", event.id);
    load();
  }

  if (!events) return <Spinner />;

  const now = Date.now();
  const upcoming = events.filter((e) => new Date(e.starts_at) >= now);
  const past = events.filter((e) => new Date(e.starts_at) < now).reverse();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-slate-400 text-sm">{upcoming.length} upcoming · {past.length} past</p>
        <Button variant="green" onClick={() => setEditing("new")}>+ Add Event</Button>
      </div>

      <ErrorText>{error}</ErrorText>

      {editing && (
        <EventForm
          teamId={teamId}
          event={editing === "new" ? null : editing}
          onDone={() => { setEditing(null); load(); }}
          onCancel={() => setEditing(null)}
        />
      )}

      {events.length === 0 && !editing ? (
        <EmptyState icon="📅" text="No games or practices yet. Add your first event — parents will see it instantly." />
      ) : (
        <div className="space-y-8 mt-6">
          {upcoming.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-500 mb-3">Upcoming</h3>
              <div className="space-y-3">
                {upcoming.map((e) => (
                  <EventRow key={e.id} event={e} onEdit={() => setEditing(e)} onDelete={() => remove(e)} />
                ))}
              </div>
            </section>
          )}
          {past.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-500 mb-3">Past — add results so the team can relive the wins</h3>
              <div className="space-y-3">
                {past.map((e) => (
                  <EventRow key={e.id} event={e} past onEdit={() => setEditing(e)} onDelete={() => remove(e)} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function EventRow({ event, past, onEdit, onDelete }) {
  const d = new Date(event.starts_at);
  return (
    <div className={`flex flex-wrap items-center gap-4 bg-white/[0.03] border border-white/[0.06] rounded-xl px-5 py-4 ${past ? "opacity-80" : ""}`}>
      <div className="text-center min-w-[56px]">
        <p className="text-xs uppercase tracking-widest text-slate-500">{d.toLocaleDateString("en-US", { month: "short" })}</p>
        <p className="text-xl font-bold text-white">{d.getDate()}</p>
      </div>
      <div className="flex-1 min-w-[180px]">
        <p className="font-semibold text-white">
          {event.event_type === "game" && event.opponent ? `vs ${event.opponent}` : event.title || (event.event_type === "practice" ? "Practice" : "Team Event")}
          {event.result && <span className="ml-2 text-[var(--color-accent-green)] font-bold">{event.result}</span>}
        </p>
        <p className="text-sm text-slate-400">
          {d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
          {event.location ? ` · ${event.location}` : ""}
        </p>
      </div>
      <span className={`text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full ${
        event.event_type === "game"
          ? "bg-blue-500/10 text-[var(--color-accent-blue)] border border-blue-500/25"
          : "bg-green-500/10 text-green-400 border border-green-500/25"
      }`}>
        {event.event_type}
      </span>
      <div className="flex gap-3">
        <button onClick={onEdit} className="text-xs text-[var(--color-accent-blue)] hover:underline">Edit</button>
        <button onClick={onDelete} className="text-xs text-red-400 hover:underline">Delete</button>
      </div>
    </div>
  );
}

function toLocalInputValue(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function EventForm({ teamId, event, onDone, onCancel }) {
  const supabase = createClient();
  const [type, setType] = useState(event?.event_type || "game");
  const [opponent, setOpponent] = useState(event?.opponent || "");
  const [title, setTitle] = useState(event?.title || "");
  const [location, setLocation] = useState(event?.location || "");
  const [startsAt, setStartsAt] = useState(toLocalInputValue(event?.starts_at));
  const [result, setResult] = useState(event?.result || "");
  const [notes, setNotes] = useState(event?.notes || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const isPast = event && new Date(event.starts_at) < Date.now();

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const row = {
      team_id: teamId,
      event_type: type,
      opponent: type === "game" ? opponent.trim() || null : null,
      title: title.trim() || null,
      location: location.trim() || null,
      starts_at: new Date(startsAt).toISOString(),
      result: result.trim() || null,
      notes: notes.trim() || null,
    };
    const query = event
      ? supabase.from("events").update(row).eq("id", event.id)
      : supabase.from("events").insert(row);
    const { error: err } = await query;
    setBusy(false);
    if (err) { setError(err.message); return; }
    onDone();
  }

  return (
    <Card className="mb-6 border-blue-500/25">
      <h3 className="font-bold text-lg mb-4">{event ? "EDIT EVENT" : "ADD EVENT"}</h3>
      <form onSubmit={save} className="space-y-4">
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <Label>Type</Label>
            <Select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="game">Game</option>
              <option value="practice">Practice</option>
              <option value="other">Other</option>
            </Select>
          </div>
          {type === "game" ? (
            <div className="sm:col-span-2">
              <Label>Opponent</Label>
              <Input value={opponent} onChange={(e) => setOpponent(e.target.value)} maxLength={80} placeholder="Eastside Eagles" />
            </div>
          ) : (
            <div className="sm:col-span-2">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} placeholder={type === "practice" ? "Practice" : "Team pizza night"} />
            </div>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>Date &amp; Time *</Label>
            <Input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} required />
          </div>
          <div>
            <Label>Location</Label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} maxLength={120} placeholder="City Park Field 3" />
          </div>
        </div>

        {(isPast || result) && type === "game" && (
          <div>
            <Label>Result (e.g. &quot;W 7-3&quot;)</Label>
            <Input value={result} onChange={(e) => setResult(e.target.value)} maxLength={20} placeholder="W 7-3" />
          </div>
        )}

        <div>
          <Label>Notes for the team</Label>
          <TextArea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} maxLength={500} placeholder="Arrive 30 min early. Wear white jerseys." />
        </div>

        <ErrorText>{error}</ErrorText>

        <div className="flex gap-3">
          <Button type="submit" variant="green" disabled={busy || !startsAt}>
            {busy ? "Saving..." : event ? "Save changes" : "Add event"}
          </Button>
          <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        </div>
      </form>
    </Card>
  );
}
