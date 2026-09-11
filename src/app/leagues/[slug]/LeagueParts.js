// Server-safe presentational pieces shared by the league home, schedule and
// standings pages. No hooks, no client state.

import { fmtGameTime, fmtPct, isFinal, STATUS_LABEL, teamLabel } from "@/lib/leagueFormat";

export function SectionTitle({ children, right }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-4">
      <h2 className="font-[family-name:var(--font-oswald)] text-xl font-bold tracking-wide">{children}</h2>
      {right && <div className="shrink-0 whitespace-nowrap">{right}</div>}
    </div>
  );
}

export function Empty({ text }) {
  return (
    <div className="rounded-xl border border-dashed border-white/10 px-6 py-10 text-center text-sm text-slate-500">
      {text}
    </div>
  );
}

/** One game: time · away over home (stacked, scoreboard style) · scores. */
export function GameRow({ site, game, showDivision = false }) {
  const home = teamLabel(site, game.home_team_id);
  const away = teamLabel(site, game.away_team_id);
  const final = isFinal(game);
  const live = game.status === "in_progress";
  const status = STATUS_LABEL[game.status] ?? "";
  const showScore = final || live;
  const homeWon = final && game.home_score > game.away_score;
  const awayWon = final && game.away_score > game.home_score;
  const division = showDivision ? site.divisionsById[game.division_id] : null;
  const meta = [division?.name, game.location].filter(Boolean).join(" · ");

  const teamCls = (won) => `truncate ${won ? "font-bold text-white" : showScore && final ? "text-slate-400" : "text-slate-200"}`;
  const scoreCls = (won) => `font-[family-name:var(--font-oswald)] text-lg font-bold leading-tight tabular-nums ${won ? "text-white" : "text-slate-400"}`;

  return (
    <div className="grid grid-cols-[3.75rem_minmax(0,1fr)_auto] items-center gap-x-3 px-3 py-2.5 text-sm odd:bg-white/[0.02]">
      <div className="text-xs text-slate-500">
        {live ? <span className="font-bold text-[var(--color-accent-green)]">LIVE</span> : fmtGameTime(game)}
      </div>
      <div className="min-w-0 leading-tight">
        <div className={teamCls(awayWon)}>{away}</div>
        <div className={teamCls(homeWon)}><span className="mr-1 text-[10px] uppercase text-slate-600">at</span>{home}</div>
        {meta && <div className="mt-0.5 truncate text-[11px] text-slate-500">{meta}</div>}
      </div>
      <div className="text-right">
        {showScore ? (
          <>
            <div className={scoreCls(awayWon)}>{game.away_score ?? "–"}</div>
            <div className={scoreCls(homeWon)}>{game.home_score ?? "–"}</div>
            {game.status === "forfeit" && <div className="text-[10px] uppercase tracking-wider text-slate-500">forfeit</div>}
          </>
        ) : (
          <span className={`text-[11px] uppercase tracking-wider ${status ? "text-yellow-400" : "text-slate-600"}`}>
            {status || "Scheduled"}
          </span>
        )}
      </div>
    </div>
  );
}

/** Per-division standings table over league_standings() rows. */
export function StandingsTable({ site, rows, compact = false }) {
  if (!rows || rows.length === 0) return <Empty text="No teams in this division yet." />;
  return (
    <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
      <table className={`w-full text-sm ${compact ? "" : "min-w-[560px]"}`}>
        <thead>
          <tr className="bg-white/[0.04] text-left text-[11px] uppercase tracking-wider text-slate-500">
            <th className="px-3 py-2">Team</th>
            <th className="px-2 py-2 text-center">W</th>
            <th className="px-2 py-2 text-center">L</th>
            <th className="px-2 py-2 text-center">T</th>
            <th className="px-2 py-2 text-center">Pct</th>
            {!compact && (
              <>
                <th className="px-2 py-2 text-center">PF</th>
                <th className="px-2 py-2 text-center">PA</th>
                <th className="px-2 py-2 text-center">Diff</th>
                <th className="px-2 py-2 text-center">Streak</th>
                <th className="px-2 py-2 text-center">Last 5</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.team_id} className="border-t border-white/[0.05]">
              <td className="px-3 py-2">
                <span className="mr-2 inline-block w-4 text-right text-xs text-slate-600">{i + 1}</span>
                <span className="font-medium text-white">{teamLabel(site, r.team_id)}</span>
              </td>
              <td className="px-2 py-2 text-center tabular-nums">{r.wins}</td>
              <td className="px-2 py-2 text-center tabular-nums">{r.losses}</td>
              <td className="px-2 py-2 text-center tabular-nums">{r.ties}</td>
              <td className="px-2 py-2 text-center tabular-nums">{fmtPct(r.pct)}</td>
              {!compact && (
                <>
                  <td className="px-2 py-2 text-center tabular-nums text-slate-400">{r.pf}</td>
                  <td className="px-2 py-2 text-center tabular-nums text-slate-400">{r.pa}</td>
                  <td className={`px-2 py-2 text-center tabular-nums ${r.diff > 0 ? "text-[var(--color-accent-green)]" : r.diff < 0 ? "text-red-400" : "text-slate-400"}`}>
                    {r.diff > 0 ? `+${r.diff}` : r.diff}
                  </td>
                  <td className="px-2 py-2 text-center text-slate-400">{r.streak}</td>
                  <td className="px-2 py-2 text-center text-xs text-slate-400">{r.last5}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
