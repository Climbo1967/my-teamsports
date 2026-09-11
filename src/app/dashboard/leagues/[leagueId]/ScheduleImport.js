"use client";

import { useMemo, useState } from "react";
import { Button, Card, ErrorText, Input, Label, Select, TextArea } from "@/components/ui";
import { buildImportRows, parseCsv, SAMPLE_CSV } from "@/lib/leagueCsv";
import { fmtLocal } from "./LeagueConsole";
import { confirmDialog } from "@/components/confirm";
import { nowMs } from "@/lib/leagueFormat";

/**
 * Schedule tab: CSV import with a dry-run diff (what would be created /
 * updated / unchanged / rejected) before anything is written, plus a plain
 * list of the season's games with reschedule / postpone / cancel / delete.
 */
export default function ScheduleImport({ supabase, data, reload, can }) {
  const seasons = data.seasons;
  const [seasonId, setSeasonId] = useState(seasons.find((s) => s.is_current)?.id || seasons[0]?.id || "");
  const [csv, setCsv] = useState("");
  const [preview, setPreview] = useState(null); // RPC dry-run result
  const [parseProblems, setParseProblems] = useState([]);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);

  const season = seasons.find((s) => s.id === seasonId);
  const fallbackYear = season?.starts_on ? Number(season.starts_on.slice(0, 4)) : new Date().getFullYear();
  const canSchedule = can("scheduler");

  const teamLabel = useMemo(() => {
    const bySchool = Object.fromEntries(data.schools.map((s) => [s.id, s]));
    return (id) => {
      const t = data.teams.find((x) => x.id === id);
      if (!t) return "TBD";
      const s = t.school_id ? bySchool[t.school_id] : null;
      const short = s?.short_name || s?.name;
      return short && !t.name.toLowerCase().includes(short.toLowerCase()) ? `${short} ${t.name}` : t.name;
    };
  }, [data.teams, data.schools]);
  const divName = (id) => data.divisions.find((d) => d.id === id)?.name || "—";

  async function onFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setCsv(await f.text());
    setPreview(null); setDone(null);
  }

  async function dryRun(commit = false) {
    setBusy(true); setError(null); setDone(null);
    try {
      const { rows, problems } = buildImportRows(parseCsv(csv), { fallbackYear });
      setParseProblems(problems);
      if (rows.length === 0) { setPreview(null); if (!problems.length) setError("No games found in that text."); return; }
      const { data: res, error: err } = await supabase.rpc("league_import_games", {
        p_league_id: data.league.id, p_season_id: seasonId, p_rows: rows, p_commit: commit,
      });
      if (err) throw new Error(err.message);
      // Attach the original text back onto each result row for display.
      res.rows = res.rows.map((r, i) => ({ ...r, src: rows[i] }));
      if (commit) { setDone(res); setPreview(null); setCsv(""); await reload(); }
      else setPreview(res);
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }

  const games = data.games.filter((g) => g.season_id === seasonId);

  return (
    <div className="space-y-6">
      {seasons.length === 0 && <ErrorText>Add a season under Schools &amp; Teams first.</ErrorText>}

      {canSchedule && (
        <Card>
          <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
            <div>
              <h3 className="font-bold text-lg">IMPORT SCHEDULE</h3>
              <p className="text-xs text-slate-500 mt-1">
                Paste from your spreadsheet or upload a CSV. Columns (any order): <b>Date, Time, Division, Home, Away, Location</b>. Optional <b>Game #</b> makes re-imports update the same game. Times are Central.
              </p>
            </div>
            <div className="min-w-[220px]">
              <Label>Season</Label>
              <Select value={seasonId} onChange={(e) => { setSeasonId(e.target.value); setPreview(null); }}>
                {seasons.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
            </div>
          </div>

          <TextArea rows={8} value={csv} onChange={(e) => { setCsv(e.target.value); setPreview(null); setDone(null); }}
            placeholder={SAMPLE_CSV} className="font-mono text-xs" />
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <label className="text-sm text-slate-300 border border-white/10 rounded-lg px-4 py-2.5 cursor-pointer hover:bg-white/5">
              Upload CSV… <input type="file" accept=".csv,text/csv,.txt" onChange={onFile} className="hidden" />
            </label>
            <button type="button" className="text-xs text-slate-500 hover:text-slate-300" onClick={() => { setCsv(SAMPLE_CSV); setPreview(null); }}>use sample</button>
            <div className="flex-1" />
            <Button variant="ghost" disabled={busy || !csv.trim() || !seasonId} onClick={() => dryRun(false)}>{busy ? "Checking…" : "PREVIEW"}</Button>
            <Button disabled={busy || !preview || preview.errors === preview.rows.length || (preview.create + preview.update) === 0} onClick={() => dryRun(true)}>
              IMPORT {preview ? `${preview.create + preview.update} GAME${preview.create + preview.update === 1 ? "" : "S"}` : ""}
            </Button>
          </div>
          <ErrorText>{error}</ErrorText>
          {parseProblems.length > 0 && (
            <ul className="mt-3 text-xs text-yellow-400 space-y-0.5">{parseProblems.map((p, i) => <li key={i}>{p}</li>)}</ul>
          )}

          {done && (
            <p className="mt-4 text-sm text-[var(--color-accent-green)]">
              ✓ Imported: {done.create} new, {done.update} updated, {done.unchanged} unchanged{done.errors ? `, ${done.errors} skipped` : ""}. Every team&apos;s schedule is updated.
            </p>
          )}

          {preview && (
            <div className="mt-5">
              <div className="flex flex-wrap gap-4 text-sm mb-2">
                <span className="text-[var(--color-accent-green)] font-semibold">{preview.create} new</span>
                <span className="text-[var(--color-accent-blue)] font-semibold">{preview.update} changed</span>
                <span className="text-slate-500">{preview.unchanged} unchanged</span>
                <span className={preview.errors ? "text-red-400 font-semibold" : "text-slate-500"}>{preview.errors} rejected</span>
                <span className="text-slate-600 ml-auto">Nothing has been written yet.</span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
                <table className="w-full text-xs min-w-[720px]">
                  <thead><tr className="text-left uppercase tracking-wider text-slate-500 bg-white/[0.04]">
                    <th className="px-2 py-2">Row</th><th className="px-2 py-2">Action</th><th className="px-2 py-2">When (CT)</th><th className="px-2 py-2">Division</th><th className="px-2 py-2">Away</th><th className="px-2 py-2">Home</th><th className="px-2 py-2">Location</th><th className="px-2 py-2">Problem</th>
                  </tr></thead>
                  <tbody>
                    {preview.rows.map((r) => (
                      <tr key={r.row} className={`border-t border-white/[0.05] ${r.error ? "bg-red-500/[0.06]" : ""}`}>
                        <td className="px-2 py-1.5 text-slate-500">{r.src.row}</td>
                        <td className="px-2 py-1.5"><ActionBadge action={r.action} /></td>
                        <td className="px-2 py-1.5 text-slate-300">{r.starts_at ? fmtLocal(r.starts_at, { weekday: "short" }) : r.src.starts_local}</td>
                        <td className="px-2 py-1.5 text-slate-300">{r.division_id ? divName(r.division_id) : r.src.division}</td>
                        <td className="px-2 py-1.5 text-slate-300">{r.away_team_id ? teamLabel(r.away_team_id) : r.src.away}</td>
                        <td className="px-2 py-1.5 text-slate-300">{r.home_team_id ? teamLabel(r.home_team_id) : r.src.home}</td>
                        <td className="px-2 py-1.5 text-slate-500">{r.src.location || ""}</td>
                        <td className="px-2 py-1.5 text-red-400">{r.error || ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-slate-600 mt-2">Team names must match a team in that division — the team name, &quot;School Team&quot;, or just the school when it has one team there. Fix the sheet and preview again.</p>
            </div>
          )}
        </Card>
      )}

      <GameList games={games} teamLabel={teamLabel} divName={divName} supabase={supabase} reload={reload} canSchedule={canSchedule} />
    </div>
  );
}

function ActionBadge({ action }) {
  const map = {
    create: ["NEW", "text-[var(--color-accent-green)]"],
    update: ["CHANGE", "text-[var(--color-accent-blue)]"],
    unchanged: ["SAME", "text-slate-500"],
    skip: ["SKIP", "text-yellow-400"],
    error: ["REJECT", "text-red-400"],
  };
  const [label, cls] = map[action] || [action, "text-slate-400"];
  return <span className={`font-semibold ${cls}`}>{label}</span>;
}

function GameList({ games, teamLabel, divName, supabase, reload, canSchedule }) {
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState(null);
  const [showPast, setShowPast] = useState(false);
  const now = nowMs();
  const shown = games.filter((g) => showPast || new Date(g.starts_at).getTime() >= now - 86400e3);

  async function act(name, args) {
    setError(null);
    const { error: e } = await supabase.rpc(name, args);
    if (e) setError(e.message); else { setEditing(null); await reload(); }
  }

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <h3 className="font-bold text-lg">GAMES ({games.length})</h3>
        <label className="text-xs text-slate-400 flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={showPast} onChange={(e) => setShowPast(e.target.checked)} /> show past
        </label>
      </div>
      <ErrorText>{error}</ErrorText>
      {shown.length === 0 ? <p className="text-sm text-slate-500">No games{showPast ? "" : " coming up"}.</p> : (
        <div className="divide-y divide-white/[0.05]">
          {shown.map((g) => (
            <div key={g.id} className="py-2 text-sm">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="text-slate-500 w-40 shrink-0">{fmtLocal(g.starts_at, { weekday: "short" })}</span>
                <span className="text-slate-600 w-28 shrink-0 truncate">{divName(g.division_id)}</span>
                <span className="text-slate-200 flex-1 min-w-[200px]">{teamLabel(g.away_team_id)} <span className="text-slate-600">at</span> {teamLabel(g.home_team_id)}</span>
                <span className="text-slate-500 truncate max-w-[160px]">{g.location || ""}</span>
                <StatusPill g={g} />
                {canSchedule && g.status !== "final" && g.status !== "forfeit" && (
                  <button onClick={() => setEditing(editing === g.id ? null : g.id)} className="text-xs text-[var(--color-accent-blue)] hover:underline">
                    {editing === g.id ? "close" : "edit"}
                  </button>
                )}
              </div>
              {editing === g.id && <GameEditor g={g} act={act} />}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export function StatusPill({ g }) {
  const s = g.status;
  const cls = s === "final" || s === "forfeit" ? "text-[var(--color-accent-green)]" : s === "scheduled" ? "text-slate-500" : "text-yellow-400";
  return (
    <span className={`text-[11px] uppercase tracking-wider font-semibold ${cls}`}>
      {s === "final" || s === "forfeit" ? `${g.away_score}–${g.home_score}${s === "forfeit" ? " FF" : ""}${g.locked ? " 🔒" : ""}` : s}
    </span>
  );
}

function GameEditor({ g, act }) {
  const local = new Date(g.starts_at).toLocaleString("sv-SE", { timeZone: "America/Chicago" }).slice(0, 16); // "YYYY-MM-DD HH:MM"
  const [when, setWhen] = useState(local.replace(" ", "T"));
  const [loc, setLoc] = useState(g.location || "");
  return (
    <div className="mt-2 flex flex-wrap items-end gap-3 bg-white/[0.03] rounded-lg p-3">
      <div><Label>Date &amp; time (CT)</Label><Input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} /></div>
      <div className="min-w-[200px]"><Label>Location</Label><Input value={loc} onChange={(e) => setLoc(e.target.value)} /></div>
      <Button onClick={() => act("league_update_game", { p_game_id: g.id, p_starts_local: when.replace("T", " "), p_location: loc, p_status: "scheduled" })}>SAVE</Button>
      {g.status !== "postponed" && <Button variant="ghost" onClick={() => act("league_update_game", { p_game_id: g.id, p_starts_local: null, p_location: null, p_status: "postponed" })}>POSTPONE</Button>}
      {g.status !== "cancelled" && <Button variant="ghost" onClick={() => act("league_update_game", { p_game_id: g.id, p_starts_local: null, p_location: null, p_status: "cancelled" })}>CANCEL GAME</Button>}
      <Button variant="danger" onClick={async () => {
        if (await confirmDialog({ title: "Delete game?", message: "It disappears from the league and from both teams' schedules.", confirmLabel: "Delete", danger: true })) {
          act("league_delete_game", { p_game_id: g.id });
        }
      }}>DELETE</Button>
    </div>
  );
}
