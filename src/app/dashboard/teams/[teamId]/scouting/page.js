"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SCOREKEEPER_SPORTS, HIT_TYPES } from "@/lib/constants";
import { computeTendencies, tendencySentence, ZONE_LABEL, DEPTH_LABEL, pctText } from "@/lib/spray";
import { recommendLineup, fmtAvg, MIN_PA } from "@/lib/lineup";
import { BaseballField } from "@/components/field";
import { Card, EmptyState, Spinner } from "@/components/ui";

export default function ScoutingPage({ params }) {
  const { teamId } = use(params);
  const supabase = createClient();
  const [sport, setSport] = useState(null);
  const [players, setPlayers] = useState([]);
  const [atBats, setAtBats] = useState(null);
  const [pitching, setPitching] = useState([]);
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    const [{ data: team }, { data: playerRows }, { data: abRows }, { data: plRows }] = await Promise.all([
      supabase.from("teams").select("sport").eq("id", teamId).single(),
      supabase.from("players").select("id, name, jersey_number").eq("team_id", teamId).order("sort_order").order("name"),
      supabase.from("at_bats").select("player_id, result, hit_x, hit_y, hit_type").eq("team_id", teamId),
      supabase.from("pitching_lines").select("player_id, pitches, outs, strikeouts, walks, hits, runs").eq("team_id", teamId),
    ]);
    setSport(team?.sport || "other");
    setPlayers(playerRows || []);
    setAtBats(abRows || []);
    setPitching(plRows || []);
    setSelected((cur) => cur || (playerRows && playerRows[0]?.id) || null);
  }, [teamId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  const byPlayer = useMemo(() => {
    const m = {};
    for (const a of atBats || []) {
      if (!a.player_id) continue;
      (m[a.player_id] = m[a.player_id] || []).push(a);
    }
    return m;
  }, [atBats]);

  const pitcherTotals = useMemo(() => {
    const m = {};
    for (const r of pitching || []) {
      const t = (m[r.player_id] = m[r.player_id] || { pitches: 0, outs: 0, strikeouts: 0, walks: 0, hits: 0, runs: 0, games: 0 });
      t.pitches += r.pitches || 0; t.outs += r.outs || 0; t.strikeouts += r.strikeouts || 0;
      t.walks += r.walks || 0; t.hits += r.hits || 0; t.runs += r.runs || 0; t.games += 1;
    }
    return m;
  }, [pitching]);

  if (sport === null || atBats === null) return <Spinner />;

  if (!SCOREKEEPER_SPORTS.includes(sport)) {
    return <EmptyState icon="📈" text="Scouting tendencies are built from baseball/softball live scoring. Set your team's sport in Settings to use it." />;
  }
  if (players.length === 0) {
    return <EmptyState icon="📋" text="Add players on the Roster tab, then score a game to start building tendencies." />;
  }

  const player = players.find((p) => p.id === selected) || players[0];
  const t = computeTendencies(byPlayer[player.id] || []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-1">📈 Scouting</h2>
      <p className="text-slate-400 text-sm mb-5">Where each batter tends to hit — built automatically from games you score live.</p>

      {/* Batter picker */}
      <div className="flex flex-wrap gap-2 mb-6">
        {players.map((p) => {
          const n = (byPlayer[p.id] || []).filter((a) => a.hit_x != null).length;
          const active = p.id === player.id;
          return (
            <button key={p.id} onClick={() => setSelected(p.id)}
              className={`px-3 py-2 rounded-lg text-sm border transition-colors ${active ? "bg-[var(--color-accent-blue)] border-[var(--color-accent-blue)] text-white" : "bg-white/[0.05] border-white/10 text-slate-300 hover:border-white/25"}`}>
              {p.jersey_number ? `#${p.jersey_number} ` : ""}{p.name}
              <span className={`ml-1.5 text-xs ${active ? "text-white/70" : "text-slate-500"}`}>{n}</span>
            </button>
          );
        })}
      </div>

      {t.n === 0 ? (
        <EmptyState icon="⚾" text={`No tracked hit locations for ${player.name} yet. Score a game on the Scorekeeper tab and tap where each ball goes.`} />
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-white/10">
            <BaseballField points={t.points} />
            <div className="flex items-center justify-center gap-5 mt-3 text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[var(--color-accent-green)]" /> Hit</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-slate-400" /> Out / in play</span>
            </div>
          </Card>

          <div>
            <Card className="border-[var(--color-accent-blue)]/25 mb-4">
              <p className="text-xs uppercase tracking-widest text-[var(--color-accent-blue)] mb-1">Read</p>
              <p className="text-lg font-semibold text-white mb-1">{tendencySentence(t)}</p>
              {t.n >= 4 && (
                <p className="text-sm text-slate-400">Mostly to {DEPTH_LABEL[t.depth.zone]} ({pctText(t.depth.pct)}) · {pctText(t.hitRate)} go for hits.</p>
              )}
            </Card>

            <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">Spray distribution</p>
            <div className="space-y-2 mb-5">
              {t.horizontal.map((z) => (
                <div key={z.zone} className="flex items-center gap-3">
                  <span className="w-28 text-sm text-slate-300 capitalize">{ZONE_LABEL[z.zone]}</span>
                  <div className="flex-1 h-3 rounded-full bg-white/[0.06] overflow-hidden">
                    <div className={`h-full rounded-full ${z.zone === t.primary.zone ? "bg-[var(--color-accent-blue)]" : "bg-white/25"}`} style={{ width: `${Math.round(z.pct * 100)}%` }} />
                  </div>
                  <span className="w-14 text-right text-sm font-semibold text-white">{pctText(z.pct)}</span>
                </div>
              ))}
            </div>

            {Object.keys(t.types).length > 0 && (
              <>
                <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">Contact type</p>
                <div className="flex flex-wrap gap-2">
                  {HIT_TYPES.filter((h) => t.types[h.key]).map((h) => (
                    <span key={h.key} className="px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/10 text-xs text-slate-300">
                      {h.label}: <span className="text-white font-semibold">{t.types[h.key]}</span>
                    </span>
                  ))}
                </div>
              </>
            )}

            <p className="text-xs text-slate-500 mt-5">Based on {t.n} tracked {t.n === 1 ? "ball" : "balls"} in play.</p>
          </div>
        </div>
      )}

      <RecommendedOrder players={players} byPlayer={byPlayer} />

      <PitchingSection players={players} totals={pitcherTotals} />
    </div>
  );
}

function RecommendedOrder({ players, byPlayer }) {
  const ranked = recommendLineup(players, byPlayer);
  const withData = ranked.filter((r) => r.hasData);
  if (withData.length === 0) return null;

  return (
    <div className="mt-10">
      <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-500 mb-1">🧠 Recommended batting order</h3>
      <p className="text-xs text-slate-500 mb-3">Weighted toward getting on base — your best on-base hitters bat first. A suggestion, not a rule.</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-400">
              <th className="py-2 pr-4 font-medium">#</th>
              <th className="py-2 pr-4 font-medium">Batter</th>
              <th className="py-2 px-2 text-center font-medium" title="Plate appearances">PA</th>
              <th className="py-2 px-2 text-center font-medium" title="Batting average">AVG</th>
              <th className="py-2 px-2 text-center font-medium" title="On-base %">OBP</th>
              <th className="py-2 px-2 text-center font-medium" title="On-base plus slugging">OPS</th>
            </tr>
          </thead>
          <tbody>
            {withData.map((r, i) => (
              <tr key={r.player.id} className="border-t border-white/[0.05]">
                <td className="py-2 pr-4 font-bold text-[var(--color-accent-blue)]">{i + 1}</td>
                <td className="py-2 pr-4 text-white whitespace-nowrap">{r.player.jersey_number ? <span className="text-slate-500">#{r.player.jersey_number} </span> : ""}{r.player.name}</td>
                <td className="py-2 px-2 text-center text-slate-300">{r.o.pa}</td>
                <td className="py-2 px-2 text-center text-slate-300">{fmtAvg(r.o.avg)}</td>
                <td className="py-2 px-2 text-center text-white font-semibold">{fmtAvg(r.o.obp)}</td>
                <td className="py-2 px-2 text-center text-slate-300">{fmtAvg(r.o.ops)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-500 mt-2">Only batters with at least {MIN_PA} plate appearances are ranked. Score live games to sharpen it.</p>
    </div>
  );
}

function PitchingSection({ players, totals }) {
  const rows = players
    .map((p) => ({ p, t: totals[p.id] }))
    .filter((r) => r.t)
    .sort((a, b) => b.t.pitches - a.t.pitches);
  if (rows.length === 0) return null;

  const ip = (outs) => `${Math.floor(outs / 3)}.${outs % 3}`;
  return (
    <div className="mt-10">
      <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-500 mb-3">⚾ Pitching — season totals</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-400">
              <th className="py-2 pr-4 font-medium">Pitcher</th>
              <th className="py-2 px-2 text-center font-medium" title="Games">G</th>
              <th className="py-2 px-2 text-center font-medium" title="Pitches">P</th>
              <th className="py-2 px-2 text-center font-medium" title="Innings pitched">IP</th>
              <th className="py-2 px-2 text-center font-medium" title="Strikeouts">K</th>
              <th className="py-2 px-2 text-center font-medium" title="Walks">BB</th>
              <th className="py-2 px-2 text-center font-medium" title="Hits allowed">H</th>
              <th className="py-2 px-2 text-center font-medium" title="Runs allowed">R</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ p, t }) => (
              <tr key={p.id} className="border-t border-white/[0.05]">
                <td className="py-2 pr-4 text-white whitespace-nowrap">{p.jersey_number ? <span className="text-slate-500">#{p.jersey_number} </span> : ""}{p.name}</td>
                <td className="py-2 px-2 text-center text-slate-300">{t.games}</td>
                <td className="py-2 px-2 text-center text-white font-semibold">{t.pitches}</td>
                <td className="py-2 px-2 text-center text-slate-300">{ip(t.outs)}</td>
                <td className="py-2 px-2 text-center text-slate-300">{t.strikeouts}</td>
                <td className="py-2 px-2 text-center text-slate-300">{t.walks}</td>
                <td className="py-2 px-2 text-center text-slate-300">{t.hits}</td>
                <td className="py-2 px-2 text-center text-slate-300">{t.runs}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-500 mt-2">Pitch counts are tracked live while your team is on defense. Use them to manage rest and pitch-count limits.</p>
    </div>
  );
}
