"use client";

import { useMemo, useState } from "react";
import { GameRow, Empty } from "../LeagueParts";

// Client-side filtering keeps the page ISR-cacheable (no searchParams → no
// dynamic rendering). A season's schedule is a few hundred rows at most.
// `todayKey` comes from the server render (league-local date) so the first
// client paint matches the HTML — computing "today" here would hydrate wrong.
export default function ScheduleList({ site, games, dayLabels, todayKey }) {
  const [division, setDivision] = useState("");
  const [school, setSchool] = useState("");
  const [showPast, setShowPast] = useState(false);

  const filtered = useMemo(() => {
    return games.filter((g) => {
      if (division && g.division_id !== division) return false;
      if (school) {
        const h = site.teamsById[g.home_team_id]?.school_id;
        const a = site.teamsById[g.away_team_id]?.school_id;
        if (h !== school && a !== school) return false;
      }
      if (!showPast && g.dayKey < todayKey) return false;
      return true;
    });
  }, [games, division, school, showPast, todayKey, site.teamsById]);

  const groups = [];
  for (const g of filtered) {
    const last = groups[groups.length - 1];
    if (last && last.key === g.dayKey) last.games.push(g);
    else groups.push({ key: g.dayKey, label: dayLabels[g.dayKey], games: [g] });
  }

  const pastCount = games.filter((g) => g.dayKey < todayKey).length;
  const selectCls = "rounded-lg border border-white/10 bg-[var(--color-navy-mid)] px-3 py-2 text-sm text-white";

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        {site.divisions.length > 1 && (
          <select className={selectCls} value={division} onChange={(e) => setDivision(e.target.value)} aria-label="Division">
            <option value="">All divisions</option>
            {site.divisions.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        )}
        {site.schools.length > 1 && (
          <select className={selectCls} value={school} onChange={(e) => setSchool(e.target.value)} aria-label="School">
            <option value="">All schools</option>
            {site.schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        )}
        {pastCount > 0 && (
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-400">
            <input type="checkbox" checked={showPast} onChange={(e) => setShowPast(e.target.checked)} />
            Show past games ({pastCount})
          </label>
        )}
      </div>

      {groups.length === 0 ? (
        <Empty text={games.length === 0 ? "The schedule hasn't been published yet." : "No games match those filters."} />
      ) : (
        <div className="space-y-5">
          {groups.map((grp) => (
            <div key={grp.key}>
              <div className={`mb-1 text-xs font-semibold uppercase tracking-wider ${grp.key === todayKey ? "text-[var(--color-accent-green)]" : "text-slate-500"}`}>
                {grp.key === todayKey ? "Today · " : ""}{grp.label}
              </div>
              <div className="rounded-xl border border-white/[0.08]">
                {grp.games.map((g) => <GameRow key={g.id} site={site} game={g} showDivision={!division} />)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
