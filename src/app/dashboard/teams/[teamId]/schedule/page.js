"use client";

import { use, useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { STAT_KEYS } from "@/lib/constants";
import { Input, Select, Label, Button, Card, EmptyState, ErrorText, Spinner, TextArea } from "@/components/ui";

export default function SchedulePage({ params }) {
  const { teamId } = use(params);
  const supabase = createClient();
  const [events, setEvents] = useState(null);
  const [players, setPlayers] = useState([]);
  const [rsvps, setRsvps] = useState([]);
  const [sport, setSport] = useState("other");
  const [editing, setEditing] = useState(null);
  const [statsFor, setStatsFor] = useState(null); // event object
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    const [{ data: eventRows, error: err }, { data: playerRows }, { data: rsvpRows }, { data: team }] = await Promise.all([
      supabase.from("events").select("*").eq("team_id", teamId).order("starts_at"),
      supabase.from("players").select("id, name, jersey_number").eq("team_id", teamId).order("name"),
      supabase.from("rsvps").select("event_id, player_id, status, note").eq("team_id", teamId),
      supabase.from("teams").select("sport").eq("id", teamId).single(),
    ]);
    if (err) setError(err.message);
    setEvents(eventRows || []);
    setPlayers(playerRows || []);
    setRsvps(rsvpRows || []);
    if (team) setSport(team.sport);
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

      {statsFor && (
        <StatsEditor
          teamId={teamId}
          event={statsFor}
          players={players}
          sport={sport}
          onClose={() => setStatsFor(null)}
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
                  <EventRow
                    key={e.id} event={e} players={players}
                    rsvps={rsvps.filter((r) => r.event_id === e.id)}
                    onEdit={() => setEditing(e)} onDelete={() => remove(e)}
                  />
                ))}
              </div>
            </section>
          )}
          {past.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-500 mb-3">Past — add results and stats</h3>
              <div className="space-y-3">
                {past.map((e) => (
                  <EventRow
                    key={e.id} event={e} past players={players}
                    rsvps={[]}
                    onEdit={() => setEditing(e)} onDelete={() => remove(e)}
                    onStats={e.event_type === "game" ? () => setStatsFor(e) : null}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function EventRow({ event, past, players, rsvps, onEdit, onDelete, onStats }) {
  const [showRsvps, setShowRsvps] = useState(false);
  const d = new Date(event.starts_at);
  const going = rsvps.filter((r) => r.status === "going");
  const maybe = rsvps.filter((r) => r.status === "maybe");
  const out = rsvps.filter((r) => r.status === "not_going");
  const playerName = (id) => players.find((p) => p.id === id)?.name || "Unknown";

  return (
    <div className={`bg-white/[0.03] border border-white/[0.06] rounded-xl px-5 py-4 ${past ? "opacity-80" : ""}`}>
      <div className="flex flex-wrap items-center gap-4">
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
        <div className="flex gap-3 items-center">
          {onStats && <button onClick={onStats} className="text-xs text-[var(--color-accent-green)] hover:underline font-semibold">📊 Stats</button>}
          <button onClick={onEdit} className="text-xs text-[var(--color-accent-blue)] hover:underline">Edit</button>
          <button onClick={onDelete} className="text-xs text-red-400 hover:underline">Delete</button>
        </div>
      </div>

      {!past && rsvps.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/[0.06]">
          <button onClick={() => setShowRsvps(!showRsvps)} className="text-xs text-slate-400 hover:text-white">
            <span className="text-green-400 font-semibold">{going.length} going</span>
            {maybe.length > 0 && <span className="text-yellow-400"> · {maybe.length} maybe</span>}
            {out.length > 0 && <span className="text-red-400"> · {out.length} out</span>}
            <span className="ml-2 text-slate-600">{showRsvps ? "▲ hide" : "▼ who"}</span>
          </button>
          {showRsvps && (
            <div className="mt-2 grid sm:grid-cols-3 gap-2 text-xs">
              <RsvpList label="Going" color="text-green-400" items={going} playerName={playerName} />
              <RsvpList label="Maybe" color="text-yellow-400" items={maybe} playerName={playerName} />
              <RsvpList label="Can't make it" color="text-red-400" items={out} playerName={playerName} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RsvpList({ label, color, items, playerName }) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className={`font-semibold mb-1 ${color}`}>{label}</p>
      {items.map((r) => (
        <p key={r.player_id} className="text-slate-400">
          {playerName(r.player_id)}{r.note ? <span className="text-slate-600"> — {r.note}</span> : ""}
        </p>
      ))}
    </div>
  );
}

function StatsEditor({ teamId, event, players, sport, onClose }) {
  const supabase = createClient();
  const keys = STAT_KEYS[sport] || STAT_KEYS.other;
  const [values, setValues] = useState(null); // { playerId: { key: value } }
  const [liveScored, setLiveScored] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      const [{ data }, { count: abCount }, { count: spCount }] = await Promise.all([
        supabase.from("stats").select("player_id, stat_key, value").eq("event_id", event.id),
        supabase.from("at_bats").select("id", { count: "exact", head: true }).eq("event_id", event.id),
        supabase.from("scoring_plays").select("id", { count: "exact", head: true }).eq("event_id", event.id),
      ]);
      const map = {};
      for (const row of data || []) {
        map[row.player_id] = map[row.player_id] || {};
        map[row.player_id][row.stat_key] = Number(row.value);
      }
      setValues(map);
      setLiveScored(((abCount || 0) + (spCount || 0)) > 0);
    })();
  }, [event.id]); // eslint-disable-line react-hooks/exhaustive-deps

  function setStat(playerId, key, raw) {
    const v = raw === "" ? "" : Math.max(0, Number(raw) || 0);
    setValues((prev) => ({ ...prev, [playerId]: { ...prev[playerId], [key]: v } }));
  }

  async function save() {
    setBusy(true);
    setError(null);
    const rows = [];
    for (const p of players) {
      for (const k of keys) {
        const v = values[p.id]?.[k.key];
        if (v !== undefined && v !== "" && Number(v) > 0) {
          rows.push({ team_id: teamId, event_id: event.id, player_id: p.id, stat_key: k.key, value: Number(v) });
        }
      }
    }
    // Replace only the columns this grid manages, so stats in other columns
    // (e.g. live-scored keys, or a manually-kept column like Runs) are left untouched.
    const { error: delErr } = await supabase.from("stats").delete().eq("event_id", event.id).in("stat_key", keys.map((k) => k.key));
    if (delErr) { setError(delErr.message); setBusy(false); return; }
    if (rows.length > 0) {
      const { error: insErr } = await supabase.from("stats").insert(rows);
      if (insErr) { setError(insErr.message); setBusy(false); return; }
    }
    setBusy(false);
    onClose();
  }

  const d = new Date(event.starts_at);

  return (
    <Card className="mb-6 border-green-500/25">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-bold text-lg">
          📊 GAME STATS {event.opponent ? `— VS ${event.opponent.toUpperCase()}` : ""}
        </h3>
        <span className="text-xs text-slate-500">{d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
      </div>
      <p className="text-sm text-slate-400 mb-4">Enter what you tracked — blanks are fine. Totals appear on each player&apos;s card on the team site.</p>

      {liveScored && (
        <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/[0.06] px-3 py-2 text-xs text-amber-200/90">
          This game was scored live — these numbers come from the live scorer. Manual edits here will be replaced if you reopen and score the live game again.
        </div>
      )}

      {players.length === 0 ? (
        <p className="text-sm text-slate-500">Add players to the roster first.</p>
      ) : !values ? (
        <Spinner />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="py-2 pr-4 text-slate-400 font-medium">Player</th>
                {keys.map((k) => (
                  <th key={k.key} className="py-2 px-2 text-slate-400 font-medium text-center" title={k.label}>{k.abbr}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {players.map((p) => (
                <tr key={p.id} className="border-t border-white/[0.05]">
                  <td className="py-2 pr-4 text-white whitespace-nowrap">
                    {p.jersey_number ? <span className="text-slate-500">#{p.jersey_number} </span> : ""}{p.name}
                  </td>
                  {keys.map((k) => (
                    <td key={k.key} className="py-1.5 px-1 text-center">
                      <input
                        type="number"
                        min="0"
                        value={values[p.id]?.[k.key] ?? ""}
                        onChange={(e) => setStat(p.id, k.key, e.target.value)}
                        className="w-16 bg-white/[0.05] border border-white/[0.1] rounded-md px-2 py-1.5 text-center text-white focus:outline-none focus:border-[var(--color-accent-blue)]"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4"><ErrorText>{error}</ErrorText></div>
      <div className="flex gap-3 mt-2">
        <Button variant="green" onClick={save} disabled={busy || !values}>{busy ? "Saving..." : "Save stats"}</Button>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
      </div>
    </Card>
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
