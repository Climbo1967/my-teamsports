"use client";

import { useMemo, useState } from "react";
import { Button, Card, ErrorText, Input } from "@/components/ui";
import { fmtLocal } from "./LeagueConsole";
import { nowMs } from "@/lib/leagueFormat";
import { StatusPill } from "./ScheduleImport";

const SOURCE_LABEL = {
  home_scorer: "home team",
  away_scorer: "away team only",
  admin: "league",
  import: "import",
};

/**
 * Results tab: every game that needs a score (past, still 'scheduled'),
 * then recent finals with where the score came from. Entering a score here
 * sets it as the league's official result and locks it against the
 * scorekeeper roll-up; unlock by re-entering with the lock unticked.
 */
export default function ResultsTab({ supabase, data, reload, can }) {
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const canScore = can("scorer");
  const now = nowMs();

  const label = useMemo(() => {
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

  const needs = data.games.filter((g) => g.status === "scheduled" && new Date(g.starts_at).getTime() < now - 3 * 3600e3);
  const finals = data.games.filter((g) => g.status === "final" || g.status === "forfeit").sort((a, b) => new Date(b.starts_at) - new Date(a.starts_at));

  async function save(g, home, away, status, lock) {
    setError(null);
    const { error: e } = await supabase.rpc("league_set_result", {
      p_game_id: g.id, p_home_score: home, p_away_score: away, p_status: status, p_lock: lock,
    });
    if (e) setError(e.message); else await reload();
  }

  return (
    <div className="space-y-6">
      <ErrorText>{error}</ErrorText>
      <Card className={needs.length ? "border-yellow-500/30" : ""}>
        <h3 className="font-bold text-lg mb-1">NEEDS A SCORE ({needs.length})</h3>
        <p className="text-xs text-slate-500 mb-4">Games that have been played but nobody reported. Coaches&apos; scorekeeper finals land here automatically (home team is official); enter one yourself if they didn&apos;t.</p>
        {needs.length === 0 ? <p className="text-sm text-slate-500">All caught up.</p> : (
          <div className="divide-y divide-white/[0.05]">
            {needs.map((g) => <ResultRow key={g.id} g={g} label={label} divName={divName} canScore={canScore} onSave={save} />)}
          </div>
        )}
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-lg">FINALS ({finals.length})</h3>
          {finals.length > 15 && (
            <button className="text-xs text-slate-400 hover:text-white" onClick={() => setShowAll(!showAll)}>{showAll ? "show recent" : "show all"}</button>
          )}
        </div>
        {finals.length === 0 ? <p className="text-sm text-slate-500">No finals yet.</p> : (
          <div className="divide-y divide-white/[0.05]">
            {(showAll ? finals : finals.slice(0, 15)).map((g) => (
              <ResultRow key={g.id} g={g} label={label} divName={divName} canScore={canScore} onSave={save} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function ResultRow({ g, label, divName, canScore, onSave }) {
  const [open, setOpen] = useState(false);
  const [home, setHome] = useState(g.home_score ?? "");
  const [away, setAway] = useState(g.away_score ?? "");
  const [forfeit, setForfeit] = useState(g.status === "forfeit");
  const [lock, setLock] = useState(true);
  const isFinal = g.status === "final" || g.status === "forfeit";
  const src = SOURCE_LABEL[g.score_source] || g.score_source || "";

  return (
    <div className="py-2 text-sm">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="text-slate-500 w-40 shrink-0">{fmtLocal(g.starts_at, { weekday: "short" })}</span>
        <span className="text-slate-600 w-28 shrink-0 truncate">{divName(g.division_id)}</span>
        <span className="text-slate-200 flex-1 min-w-[200px]">{label(g.away_team_id)} <span className="text-slate-600">at</span> {label(g.home_team_id)}</span>
        {isFinal ? (
          <>
            <StatusPill g={g} />
            <span className={`text-[11px] ${g.score_source === "away_scorer" ? "text-yellow-400" : "text-slate-600"}`}>{src}</span>
          </>
        ) : <span className="text-[11px] uppercase tracking-wider text-yellow-400 font-semibold">no score</span>}
        {canScore && (
          <button onClick={() => setOpen(!open)} className="text-xs text-[var(--color-accent-blue)] hover:underline">
            {open ? "close" : isFinal ? "correct" : "enter"}
          </button>
        )}
      </div>
      {open && (
        <div className="mt-2 flex flex-wrap items-end gap-3 bg-white/[0.03] rounded-lg p-3">
          <div className="w-28">
            <label className="block text-xs text-slate-400 mb-1">{label(g.away_team_id)} (away)</label>
            <Input type="number" min={0} inputMode="numeric" value={away} onChange={(e) => setAway(e.target.value)} />
          </div>
          <div className="w-28">
            <label className="block text-xs text-slate-400 mb-1">{label(g.home_team_id)} (home)</label>
            <Input type="number" min={0} inputMode="numeric" value={home} onChange={(e) => setHome(e.target.value)} />
          </div>
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pb-3"><input type="checkbox" checked={forfeit} onChange={(e) => setForfeit(e.target.checked)} /> forfeit</label>
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pb-3" title="Locked results ignore later scorekeeper finals"><input type="checkbox" checked={lock} onChange={(e) => setLock(e.target.checked)} /> lock</label>
          <Button disabled={home === "" || away === ""} onClick={() => { onSave(g, Number(home), Number(away), forfeit ? "forfeit" : "final", lock); setOpen(false); }}>
            SAVE OFFICIAL SCORE
          </Button>
        </div>
      )}
    </div>
  );
}
