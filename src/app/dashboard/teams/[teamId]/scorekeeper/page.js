"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AB_RESULTS, HIT_TYPES, SCOREKEEPER_SPORTS, gameResultString } from "@/lib/constants";
import { Button, Card, EmptyState, ErrorText, Spinner } from "@/components/ui";
import { BaseballField } from "@/components/field";
import { computeTendencies, tendencySentence, ZONE_LABEL, pctText } from "@/lib/spray";
import { recommendLineup } from "@/lib/lineup";

export default function ScorekeeperPage({ params }) {
  const { teamId } = use(params);
  const supabase = createClient();
  const [sport, setSport] = useState(null);
  const [games, setGames] = useState(null);
  const [players, setPlayers] = useState([]);
  const [selected, setSelected] = useState(null); // event row
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    const [{ data: team }, { data: eventRows }, { data: playerRows }] = await Promise.all([
      supabase.from("teams").select("sport").eq("id", teamId).single(),
      supabase.from("events").select("*").eq("team_id", teamId).eq("event_type", "game").order("starts_at"),
      supabase.from("players").select("id, name, jersey_number").eq("team_id", teamId).order("sort_order").order("name"),
    ]);
    setSport(team?.sport || "other");
    setGames(eventRows || []);
    setPlayers(playerRows || []);
  }, [teamId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  if (!games || sport === null) return <Spinner />;

  if (!SCOREKEEPER_SPORTS.includes(sport)) {
    return (
      <EmptyState
        icon="⚾"
        text="The live Scorekeeper currently supports baseball and softball. Set your team's sport to one of those in Settings to use it."
      />
    );
  }

  if (selected) {
    return (
      <GameScorer
        teamId={teamId}
        event={selected}
        players={players}
        onBack={() => { setSelected(null); load(); }}
      />
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-1">⚾ Live Scorekeeper</h2>
      <p className="text-slate-400 text-sm mb-6">Pick a game to score. Stats roll into each player&apos;s season totals automatically, and the score goes live on your team page.</p>
      <ErrorText>{error}</ErrorText>
      {games.length === 0 ? (
        <EmptyState icon="📅" text="No games on the schedule yet. Add a game on the Schedule tab first." />
      ) : (
        <div className="space-y-3">
          {games.map((g) => (
            <GamePickRow key={g.id} event={g} teamId={teamId} onPick={() => setSelected(g)} />
          ))}
        </div>
      )}
    </div>
  );
}

function GamePickRow({ event, teamId, onPick }) {
  const supabase = createClient();
  const [state, setState] = useState(undefined); // undefined=loading, null=none, row
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("game_scores").select("status, our_score, opp_score").eq("event_id", event.id).maybeSingle();
      setState(data || null);
    })();
  }, [event.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const d = new Date(event.starts_at);
  return (
    <button
      onClick={onPick}
      className="w-full text-left bg-white/[0.03] border border-white/[0.06] rounded-xl px-5 py-4 hover:border-[var(--color-accent-blue)]/40 transition-colors flex items-center gap-4"
    >
      <div className="text-center min-w-[52px]">
        <p className="text-xs uppercase tracking-widest text-slate-500">{d.toLocaleDateString("en-US", { month: "short" })}</p>
        <p className="text-xl font-bold text-white">{d.getDate()}</p>
      </div>
      <div className="flex-1">
        <p className="font-semibold text-white">{event.opponent ? `vs ${event.opponent}` : "Game"}</p>
        <p className="text-sm text-slate-400">{d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}{event.location ? ` · ${event.location}` : ""}</p>
      </div>
      {state === undefined ? null : state === null ? (
        <span className="text-xs font-semibold text-[var(--color-accent-blue)]">Start scoring →</span>
      ) : state.status === "in_progress" ? (
        <span className="text-xs font-semibold text-[var(--color-accent-green)] flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[var(--color-accent-green)] animate-pulse" /> LIVE {state.our_score}-{state.opp_score} →
        </span>
      ) : (
        <span className="text-xs font-semibold text-slate-400">Final {state.our_score}-{state.opp_score} · reopen →</span>
      )}
    </button>
  );
}

// ============================ GAME SCORER ============================
function GameScorer({ teamId, event, players, onBack }) {
  const supabase = createClient();
  const [game, setGame] = useState(undefined); // undefined=loading, null=not started, row
  const [lineup, setLineup] = useState([]); // [{player_id, spot, name, jersey_number}]
  const [pitchMap, setPitchMap] = useState({}); // { player_id: pitching_line row }
  const [tendencyByPlayer, setTendencyByPlayer] = useState({}); // season tendencies
  const [editingLineup, setEditingLineup] = useState(false);
  const [pending, setPending] = useState(null); // result object awaiting field/RBI input
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    const [{ data: g }, { data: lu }, { data: pl }, { data: ab }] = await Promise.all([
      supabase.from("game_scores").select("*").eq("event_id", event.id).maybeSingle(),
      supabase.from("game_lineups").select("player_id, spot").eq("event_id", event.id).order("spot"),
      supabase.from("pitching_lines").select("*").eq("event_id", event.id),
      supabase.from("at_bats").select("player_id, result, hit_x, hit_y, hit_type").eq("team_id", teamId),
    ]);
    setGame(g || null);
    const pmap = Object.fromEntries(players.map((p) => [p.id, p]));
    setLineup((lu || []).map((r) => ({ ...r, ...pmap[r.player_id] })));
    setPitchMap(Object.fromEntries((pl || []).map((r) => [r.player_id, r])));
    const grouped = {};
    for (const r of ab || []) { if (r.player_id) (grouped[r.player_id] = grouped[r.player_id] || []).push(r); }
    setTendencyByPlayer(Object.fromEntries(Object.entries(grouped).map(([pid, rows]) => [pid, computeTendencies(rows)])));
  }, [event.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  async function patchGame(patch) {
    const next = { ...game, ...patch, updated_at: new Date().toISOString() };
    setGame(next);
    const { error: e } = await supabase.from("game_scores").update({ ...patch, updated_at: next.updated_at }).eq("id", game.id);
    if (e) setError(e.message);
  }

  async function rollup() {
    await supabase.rpc("rollup_game_stats", { p_event_id: event.id });
  }

  if (game === undefined) return <Spinner />;

  const lineupLen = lineup.length;
  const weBat = game && ((game.is_home && game.half === "bottom") || (!game.is_home && game.half === "top"));
  const currentBatter = game ? lineup.find((l) => l.spot === game.current_spot) || lineup[0] : null;

  // ---- advance half/inning when 3 outs ----
  function applyOut(outsNow) {
    if (outsNow >= 3) {
      if (game.half === "top") return { outs: 0, half: "bottom", balls: 0, strikes: 0 };
      return { outs: 0, half: "top", inning: game.inning + 1, balls: 0, strikes: 0 };
    }
    return { outs: outsNow, balls: 0, strikes: 0 };
  }

  // ---- pitches (our batter only) ----
  async function pitch(kind) {
    if (!weBat) return;
    let balls = game.balls, strikes = game.strikes;
    if (kind === "ball") {
      balls += 1;
      if (balls >= 4) return commitResult({ key: "walk" }, { rbi: 0 });
      return patchGame({ balls });
    }
    if (kind === "strike") {
      strikes += 1;
      if (strikes >= 3) return commitResult({ key: "strikeout" }, { rbi: 0 });
      return patchGame({ strikes });
    }
    if (kind === "foul") {
      if (strikes < 2) strikes += 1;
      return patchGame({ strikes });
    }
  }

  // ---- commit a plate-appearance result for our batter ----
  async function commitResult(result, { rbi = 0, hit_x = null, hit_y = null, hit_type = null }) {
    setPending(null);
    const row = {
      team_id: teamId, event_id: event.id, player_id: currentBatter?.player_id || null,
      inning: game.inning, half: game.half, result: result.key,
      rbi, runs: rbi, hit_x, hit_y, hit_type, balls: game.balls, strikes: game.strikes,
    };
    const { error: e } = await supabase.from("at_bats").insert(row);
    if (e) { setError(e.message); return; }
    const def = AB_RESULTS.find((r) => r.key === result.key);
    const isOut = def?.out;
    const nextSpot = lineupLen ? (game.current_spot % lineupLen) + 1 : 1;
    const patch = {
      our_score: game.our_score + rbi,
      current_spot: nextSpot,
      ...applyOut(game.outs + (isOut ? 1 : 0)),
    };
    await patchGame(patch);
    await rollup();
  }

  async function stolenBase() {
    if (!weBat || !currentBatter) return;
    const { error: e } = await supabase.from("at_bats").insert({
      team_id: teamId, event_id: event.id, player_id: currentBatter.player_id,
      inning: game.inning, half: game.half, result: "stolen_base",
    });
    if (e) { setError(e.message); return; }
    await rollup();
  }

  // ---- defense / pitcher tracking ----
  const PITCH_FIELDS = ["pitches", "strikes", "outs", "walks", "strikeouts", "hits", "runs"];

  async function setPitcher(playerId) {
    await patchGame({ pitcher_id: playerId });
    if (!pitchMap[playerId]) {
      const base = { team_id: teamId, event_id: event.id, player_id: playerId, pitches: 0, strikes: 0, outs: 0, walks: 0, strikeouts: 0, hits: 0, runs: 0 };
      const { data } = await supabase.from("pitching_lines").insert(base).select().single();
      if (data) setPitchMap((m) => ({ ...m, [playerId]: data }));
    }
  }

  async function bumpPitcher(delta) {
    const pid = game.pitcher_id;
    if (!pid) return;
    const cur = pitchMap[pid] || { team_id: teamId, event_id: event.id, player_id: pid };
    const next = { ...cur };
    for (const f of PITCH_FIELDS) next[f] = (cur[f] || 0) + (delta[f] || 0);
    setPitchMap((m) => ({ ...m, [pid]: next }));
    const { error: e } = await supabase
      .from("pitching_lines")
      .upsert({ team_id: teamId, event_id: event.id, player_id: pid,
        pitches: next.pitches, strikes: next.strikes, outs: next.outs, walks: next.walks,
        strikeouts: next.strikeouts, hits: next.hits, runs: next.runs, updated_at: new Date().toISOString() },
        { onConflict: "event_id,player_id" });
    if (e) setError(e.message);
  }

  async function defensePitch(kind) {
    if (!game.pitcher_id) return;
    if (kind === "ball") {
      const nb = game.balls + 1;
      await bumpPitcher({ pitches: 1 });
      if (nb >= 4) { await bumpPitcher({ walks: 1 }); return patchGame({ balls: 0, strikes: 0 }); }
      return patchGame({ balls: nb });
    }
    if (kind === "strike") {
      const ns = game.strikes + 1;
      await bumpPitcher({ pitches: 1, strikes: 1 });
      if (ns >= 3) { await bumpPitcher({ strikeouts: 1, outs: 1 }); return patchGame(applyOut(game.outs + 1)); }
      return patchGame({ strikes: ns });
    }
    if (kind === "foul") {
      await bumpPitcher({ pitches: 1, strikes: 1 });
      return patchGame({ strikes: Math.min(2, game.strikes + 1) });
    }
  }

  async function defenseHit() {
    if (!game.pitcher_id) return;
    await bumpPitcher({ pitches: 1, strikes: 1, hits: 1 });
    await patchGame({ balls: 0, strikes: 0 });
  }
  async function defenseInPlayOut() {
    if (!game.pitcher_id) return;
    await bumpPitcher({ pitches: 1, strikes: 1, outs: 1 });
    await patchGame(applyOut(game.outs + 1));
  }
  async function defenseRun() {
    await patchGame({ opp_score: game.opp_score + 1 });
    await bumpPitcher({ runs: 1 });
  }

  async function endGame() {
    if (!confirm("End and finalize this game? The score will be saved as the game result.")) return;
    await supabase.from("game_scores").update({ status: "final" }).eq("id", game.id);
    await supabase.from("events").update({ result: gameResultString(game.our_score, game.opp_score) }).eq("id", event.id);
    await rollup();
    onBack();
  }

  async function reopenGame() { await patchGame({ status: "in_progress" }); }

  const d = new Date(event.starts_at);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="text-sm text-slate-400 hover:text-white">← All games</button>
        <p className="text-sm text-slate-500">{d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
      </div>

      <ErrorText>{error}</ErrorText>

      {/* Setup: no lineup yet, or editing it */}
      {(lineupLen === 0 || editingLineup) ? (
        <LineupBuilder
          teamId={teamId} event={event} players={players} existing={lineup}
          onDone={() => { setEditingLineup(false); load(); }}
          onCancel={lineupLen ? () => setEditingLineup(false) : null}
        />
      ) : !game ? (
        <StartPanel
          teamId={teamId} event={event} lineup={lineup}
          onEditLineup={() => setEditingLineup(true)}
          onStart={async (isHome) => {
            const { data, error: e } = await supabase.from("game_scores")
              .insert({ team_id: teamId, event_id: event.id, is_home: isHome, status: "in_progress" })
              .select().single();
            if (e) { setError(e.message); return; }
            setGame(data);
          }}
        />
      ) : (
        <>
          <Scoreboard game={game} event={event} weBat={weBat} onPatch={patchGame} />

          {game.status === "final" ? (
            <Card className="mt-5 text-center border-green-500/25">
              <p className="text-lg font-bold mb-1">Final · {gameResultString(game.our_score, game.opp_score)}</p>
              <p className="text-sm text-slate-400 mb-4">Saved to the schedule and player stats.</p>
              <Button variant="ghost" onClick={reopenGame}>Reopen to edit</Button>
            </Card>
          ) : weBat ? (
            <BattingPanel
              batter={currentBatter} game={game} lineup={lineup}
              tendencyByPlayer={tendencyByPlayer}
              onPitch={pitch} onResult={(r) => setPending(r)} onSteal={stolenBase}
              onEditLineup={() => setEditingLineup(true)}
            />
          ) : (
            <PitchingPanel
              game={game} event={event} players={players} lineup={lineup}
              line={game.pitcher_id ? pitchMap[game.pitcher_id] : null}
              onSetPitcher={setPitcher} onPitch={defensePitch}
              onHit={defenseHit} onInPlayOut={defenseInPlayOut} onRun={defenseRun}
            />
          )}

          {game.status !== "final" && (
            <div className="mt-6 text-center">
              <Button variant="danger" onClick={endGame}>End game &amp; save result</Button>
            </div>
          )}
        </>
      )}

      {pending && (
        <ResultOverlay
          result={pending}
          onCancel={() => setPending(null)}
          onConfirm={(payload) => commitResult(pending, payload)}
        />
      )}
    </div>
  );
}

// ============================ LINEUP ============================
function LineupBuilder({ teamId, event, players, existing, onDone, onCancel }) {
  const supabase = createClient();
  const [order, setOrder] = useState(existing.map((e) => e.player_id));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const chosen = order.map((id) => players.find((p) => p.id === id)).filter(Boolean);
  const available = players.filter((p) => !order.includes(p.id));

  async function suggest() {
    const { data } = await supabase.from("at_bats").select("player_id, result, rbi").eq("team_id", teamId);
    const byPlayer = {};
    for (const a of data || []) { if (a.player_id) (byPlayer[a.player_id] = byPlayer[a.player_id] || []).push(a); }
    const ranked = recommendLineup(players, byPlayer);
    setOrder(ranked.map((r) => r.player.id));
  }

  async function save() {
    if (order.length === 0) return;
    setBusy(true); setError(null);
    await supabase.from("game_lineups").delete().eq("event_id", event.id);
    const rows = order.map((player_id, i) => ({ team_id: teamId, event_id: event.id, player_id, spot: i + 1 }));
    const { error: e } = await supabase.from("game_lineups").insert(rows);
    setBusy(false);
    if (e) { setError(e.message); return; }
    onDone();
  }

  return (
    <Card className="border-blue-500/25">
      <div className="flex items-center justify-between gap-3 mb-1">
        <h3 className="font-bold text-lg">Batting order</h3>
        {players.length > 0 && (
          <button onClick={suggest} className="text-xs font-semibold text-[var(--color-accent-blue)] hover:underline whitespace-nowrap">🧠 Suggest from stats</button>
        )}
      </div>
      <p className="text-sm text-slate-400 mb-4">Tap players in order. Tap again to remove.</p>
      <ErrorText>{error}</ErrorText>

      {chosen.length > 0 && (
        <ol className="space-y-2 mb-5">
          {chosen.map((p, i) => (
            <li key={p.id} className="flex items-center gap-3 bg-white/[0.04] rounded-lg px-3 py-2">
              <span className="w-6 text-center font-bold text-[var(--color-accent-blue)]">{i + 1}</span>
              <span className="flex-1 text-white">{p.jersey_number ? <span className="text-slate-500">#{p.jersey_number} </span> : ""}{p.name}</span>
              <button onClick={() => setOrder(order.filter((id) => id !== p.id))} className="text-red-400 text-sm">remove</button>
            </li>
          ))}
        </ol>
      )}

      {available.length > 0 && (
        <>
          <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">Tap to add</p>
          <div className="flex flex-wrap gap-2 mb-5">
            {available.map((p) => (
              <button key={p.id} onClick={() => setOrder([...order, p.id])}
                className="px-3 py-2 rounded-lg bg-white/[0.05] border border-white/10 text-sm text-white hover:border-[var(--color-accent-blue)]/50">
                {p.jersey_number ? `#${p.jersey_number} ` : ""}{p.name}
              </button>
            ))}
          </div>
        </>
      )}

      {players.length === 0 && <p className="text-sm text-slate-500 mb-4">Add players on the Roster tab first.</p>}

      <div className="flex gap-3">
        <Button variant="green" onClick={save} disabled={busy || order.length === 0}>{busy ? "Saving..." : "Save lineup"}</Button>
        {onCancel && <Button variant="ghost" onClick={onCancel}>Cancel</Button>}
      </div>
    </Card>
  );
}

function StartPanel({ lineup, onStart, onEditLineup }) {
  return (
    <Card className="text-center border-green-500/25">
      <p className="text-sm text-slate-400 mb-1">{lineup.length}-batter lineup set</p>
      <h3 className="font-bold text-lg mb-5">Are you home or away?</h3>
      <div className="flex gap-3 justify-center mb-5">
        <Button variant="green" onClick={() => onStart(true)}>🏠 Home</Button>
        <Button variant="primary" onClick={() => onStart(false)}>✈️ Away</Button>
      </div>
      <button onClick={onEditLineup} className="text-sm text-slate-400 hover:text-white">Edit batting order</button>
    </Card>
  );
}

// ============================ SCOREBOARD ============================
function Scoreboard({ game, event, weBat, onPatch }) {
  const [edit, setEdit] = useState(false);
  const arrow = game.half === "top" ? "▲" : "▼";
  return (
    <Card className="border-white/10">
      <div className="flex items-stretch text-center">
        <ScoreSide label="US" score={game.our_score} active={weBat} />
        <div className="px-4 flex flex-col justify-center items-center min-w-[110px]">
          <p className="text-xs uppercase tracking-widest text-slate-500">{arrow} {ordinal(game.inning)}</p>
          <div className="flex gap-1.5 my-2">
            {[0, 1, 2].map((i) => (
              <span key={i} className={`w-3 h-3 rounded-full ${i < game.outs ? "bg-red-500" : "bg-white/15"}`} />
            ))}
          </div>
          <p className="text-xs text-slate-400">{game.outs} {game.outs === 1 ? "out" : "outs"}</p>
          <p className="font-[family-name:var(--font-oswald)] text-lg font-bold mt-1">{game.balls}<span className="text-slate-600">-</span>{game.strikes}</p>
          <p className="text-[10px] uppercase tracking-widest text-slate-600">B - S</p>
        </div>
        <ScoreSide label={event.opponent || "THEM"} score={game.opp_score} active={!weBat} />
      </div>
      <div className="mt-3 text-center">
        <button onClick={() => setEdit(!edit)} className="text-xs text-slate-500 hover:text-slate-300">{edit ? "done" : "fix score / count"}</button>
      </div>
      {edit && (
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <Stepper label="Us" value={game.our_score} onChange={(v) => onPatch({ our_score: Math.max(0, v) })} />
          <Stepper label="Them" value={game.opp_score} onChange={(v) => onPatch({ opp_score: Math.max(0, v) })} />
          <Stepper label="Outs" value={game.outs} onChange={(v) => onPatch({ outs: Math.min(3, Math.max(0, v)) })} />
          <Stepper label="Inning" value={game.inning} onChange={(v) => onPatch({ inning: Math.max(1, v) })} />
          <div className="col-span-2 sm:col-span-4 flex gap-2 justify-center">
            <button onClick={() => onPatch({ half: game.half === "top" ? "bottom" : "top" })} className="text-xs px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/10 text-slate-300">Flip to {game.half === "top" ? "bottom" : "top"}</button>
            <button onClick={() => onPatch({ balls: 0, strikes: 0 })} className="text-xs px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/10 text-slate-300">Reset count</button>
          </div>
        </div>
      )}
    </Card>
  );
}

function ScoreSide({ label, score, active }) {
  return (
    <div className={`flex-1 py-2 rounded-xl ${active ? "bg-[var(--color-accent-green)]/10" : ""}`}>
      <p className={`text-xs uppercase tracking-widest mb-1 truncate ${active ? "text-[var(--color-accent-green)]" : "text-slate-500"}`}>{label}{active ? " •" : ""}</p>
      <p className="font-[family-name:var(--font-oswald)] text-5xl font-bold text-white">{score}</p>
    </div>
  );
}

function Stepper({ label, value, onChange }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">{label}</p>
      <div className="flex items-center justify-center gap-2">
        <button onClick={() => onChange(value - 1)} className="w-7 h-7 rounded-lg bg-white/[0.06] border border-white/10 text-white">−</button>
        <span className="w-6 text-center font-bold">{value}</span>
        <button onClick={() => onChange(value + 1)} className="w-7 h-7 rounded-lg bg-white/[0.06] border border-white/10 text-white">+</button>
      </div>
    </div>
  );
}

// ============================ BATTING PANEL ============================
function BattingPanel({ batter, game, lineup, tendencyByPlayer, onPitch, onResult, onSteal, onEditLineup }) {
  const len = lineup.length;
  // Next three spots in the order after the current batter.
  const upcoming = len
    ? [1, 2, 3].map((k) => lineup.find((l) => l.spot === ((game.current_spot - 1 + k) % len) + 1)).filter(Boolean)
    : [];
  return (
    <div className="mt-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-500">Now batting · {ordinal(game.current_spot)}</p>
          <p className="text-2xl font-bold text-white">{batter ? <>{batter.jersey_number ? <span className="text-slate-500">#{batter.jersey_number} </span> : ""}{batter.name}</> : "—"}</p>
        </div>
        <button onClick={onEditLineup} className="text-xs text-slate-400 hover:text-white">edit lineup</button>
      </div>

      {batter && <BatterTendency playerId={batter.player_id} />}

      {upcoming.length > 0 && <ComingUp upcoming={upcoming} tendencyByPlayer={tendencyByPlayer} />}

      {/* Pitch counter */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <PitchBtn label="Ball" cls="bg-emerald-600/15 border-emerald-500/30 text-emerald-300" onClick={() => onPitch("ball")} />
        <PitchBtn label="Strike" cls="bg-red-600/15 border-red-500/30 text-red-300" onClick={() => onPitch("strike")} />
        <PitchBtn label="Foul" cls="bg-amber-600/15 border-amber-500/30 text-amber-300" onClick={() => onPitch("foul")} />
      </div>

      {/* Outcome buttons */}
      <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">Outcome</p>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {AB_RESULTS.map((r) => (
          <button key={r.key} onClick={() => onResult(r)}
            className={`py-3 rounded-xl border text-sm font-semibold transition-colors ${colorCls(r.color)}`}>
            <span className="block text-base font-bold">{r.short}</span>
            <span className="block text-[10px] font-normal opacity-70">{r.label}</span>
          </button>
        ))}
        <button onClick={onSteal}
          className="py-3 rounded-xl border text-sm font-semibold bg-blue-600/15 border-blue-500/30 text-blue-300">
          <span className="block text-base font-bold">SB</span>
          <span className="block text-[10px] font-normal opacity-70">Stolen base</span>
        </button>
      </div>
    </div>
  );
}

function PitchBtn({ label, cls, onClick }) {
  return (
    <button onClick={onClick} className={`py-4 rounded-xl border font-bold text-lg ${cls}`}>{label}</button>
  );
}

function PitchingPanel({ game, event, players, lineup, line, onSetPitcher, onPitch, onHit, onInPlayOut, onRun }) {
  // Prefer roster order; fall back to anyone on the team.
  const candidates = (lineup.length ? lineup.map((l) => ({ id: l.player_id, name: l.name, jersey_number: l.jersey_number })) : players);
  const pitcher = players.find((p) => p.id === game.pitcher_id);
  const pitches = line?.pitches || 0;
  const ip = `${Math.floor((line?.outs || 0) / 3)}.${(line?.outs || 0) % 3}`;
  const countCls = pitches >= 65 ? "text-red-400" : pitches >= 50 ? "text-amber-400" : "text-white";

  if (!game.pitcher_id) {
    return (
      <Card className="mt-5">
        <p className="text-sm text-slate-400 mb-1">{event.opponent || "Opponent"} batting</p>
        <h3 className="font-bold text-lg mb-4">Who&apos;s pitching?</h3>
        <div className="flex flex-wrap gap-2">
          {candidates.map((p) => (
            <button key={p.id} onClick={() => onSetPitcher(p.id)}
              className="px-3 py-2 rounded-lg bg-white/[0.05] border border-white/10 text-sm text-white hover:border-[var(--color-accent-blue)]/50">
              {p.jersey_number ? `#${p.jersey_number} ` : ""}{p.name}
            </button>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <div className="mt-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-500">Pitching · {event.opponent || "vs opponent"} batting</p>
          <p className="text-2xl font-bold text-white">{pitcher ? <>{pitcher.jersey_number ? <span className="text-slate-500">#{pitcher.jersey_number} </span> : ""}{pitcher.name}</> : "—"}</p>
        </div>
        <select value={game.pitcher_id} onChange={(e) => onSetPitcher(e.target.value)}
          className="bg-white/[0.05] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white [&>option]:bg-[#132140]">
          {candidates.map((p) => <option key={p.id} value={p.id}>{p.jersey_number ? `#${p.jersey_number} ` : ""}{p.name}</option>)}
        </select>
      </div>

      {/* pitcher line */}
      <div className="grid grid-cols-6 gap-2 mb-4 text-center">
        <Stat label="Pitch" value={pitches} cls={countCls} big />
        <Stat label="IP" value={ip} />
        <Stat label="K" value={line?.strikeouts || 0} />
        <Stat label="BB" value={line?.walks || 0} />
        <Stat label="H" value={line?.hits || 0} />
        <Stat label="R" value={line?.runs || 0} />
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <PitchBtn label="Ball" cls="bg-emerald-600/15 border-emerald-500/30 text-emerald-300" onClick={() => onPitch("ball")} />
        <PitchBtn label="Strike" cls="bg-red-600/15 border-red-500/30 text-red-300" onClick={() => onPitch("strike")} />
        <PitchBtn label="Foul" cls="bg-amber-600/15 border-amber-500/30 text-amber-300" onClick={() => onPitch("foul")} />
      </div>

      <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">Ball in play</p>
      <div className="grid grid-cols-3 gap-2">
        <button onClick={onHit} className="py-3 rounded-xl border text-sm font-semibold bg-white/[0.05] border-white/10 text-slate-200">Hit allowed</button>
        <button onClick={onInPlayOut} className="py-3 rounded-xl border text-sm font-semibold bg-white/[0.05] border-white/10 text-slate-200">In-play out</button>
        <button onClick={onRun} className="py-3 rounded-xl border text-sm font-semibold bg-blue-600/15 border-blue-500/30 text-blue-300">+1 Their run</button>
      </div>
    </div>
  );
}

function Stat({ label, value, cls = "text-white", big = false }) {
  return (
    <div className="bg-white/[0.04] rounded-lg py-2">
      <p className={`font-[family-name:var(--font-oswald)] font-bold ${big ? "text-2xl" : "text-lg"} ${cls}`}>{value}</p>
      <p className="text-[10px] uppercase tracking-widest text-slate-500">{label}</p>
    </div>
  );
}

// ============================ RESULT OVERLAY ============================
function ResultOverlay({ result, onCancel, onConfirm }) {
  const def = AB_RESULTS.find((r) => r.key === result.key) || result;
  const [rbi, setRbi] = useState(0);
  const [loc, setLoc] = useState(null); // {x,y}
  const [hitType, setHitType] = useState(null);

  function tapField(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
    setLoc({ x, y });
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center p-4" onClick={onCancel}>
      <div className="w-full max-w-md bg-[#0f1d3a] border border-white/10 rounded-2xl p-5" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-bold text-lg mb-3">{def.label}</h3>

        {def.field && (
          <div className="mb-4">
            <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">Tap where it went</p>
            <BaseballField loc={loc} onTap={tapField} interactive />
            <div className="flex flex-wrap gap-2 mt-3">
              {HIT_TYPES.map((h) => (
                <button key={h.key} onClick={() => setHitType(h.key === hitType ? null : h.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs border ${hitType === h.key ? "bg-[var(--color-accent-blue)] border-[var(--color-accent-blue)] text-white" : "bg-white/[0.05] border-white/10 text-slate-300"}`}>
                  {h.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-slate-300">Runs batted in (RBI)</p>
          <div className="flex items-center gap-3">
            <button onClick={() => setRbi(Math.max(0, rbi - 1))} className="w-9 h-9 rounded-lg bg-white/[0.06] border border-white/10 text-white text-lg">−</button>
            <span className="w-6 text-center font-bold text-lg">{rbi}</span>
            <button onClick={() => setRbi(Math.min(4, rbi + 1))} className="w-9 h-9 rounded-lg bg-white/[0.06] border border-white/10 text-white text-lg">+</button>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="green" className="flex-1" onClick={() => onConfirm({ rbi, hit_x: loc?.x ?? null, hit_y: loc?.y ?? null, hit_type: hitType })}>
            Confirm {def.short}
          </Button>
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}

// ============ Tier 2: inline batter tendency on the scoring screen ============
function BatterTendency({ playerId }) {
  const supabase = createClient();
  const [t, setT] = useState(undefined);
  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("at_bats")
        .select("result, hit_x, hit_y, hit_type")
        .eq("player_id", playerId)
        .not("hit_x", "is", null);
      if (active) setT(computeTendencies(data || []));
    })();
    return () => { active = false; };
  }, [playerId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (t === undefined || t.n === 0) return null;

  const enough = t.n >= 4;
  return (
    <div className="mb-4 rounded-xl border border-[var(--color-accent-blue)]/25 bg-[var(--color-accent-blue)]/[0.06] px-4 py-3">
      <p className="text-xs uppercase tracking-widest text-[var(--color-accent-blue)] mb-1">📈 Tendency</p>
      <p className="text-sm text-white">{tendencySentence(t)}</p>
      {enough && (
        <div className="mt-2 flex gap-1.5 h-2 rounded-full overflow-hidden">
          {t.horizontal.map((z) => (
            <div key={z.zone} title={`${ZONE_LABEL[z.zone]} ${pctText(z.pct)}`}
              style={{ flex: Math.max(z.pct, 0.02) }}
              className={z.zone === t.primary.zone ? "bg-[var(--color-accent-blue)]" : "bg-white/15"} />
          ))}
        </div>
      )}
    </div>
  );
}

// ============ Tier 3: where the next three batters tend to hit ============
function ComingUp({ upcoming, tendencyByPlayer }) {
  return (
    <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
      <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">Coming up</p>
      <div className="space-y-1.5">
        {upcoming.map((u, i) => {
          const t = tendencyByPlayer[u.player_id];
          const has = t && t.n >= 4;
          return (
            <div key={u.player_id} className="flex items-center gap-2 text-sm">
              <span className="text-slate-500 w-5">{i + 1}.</span>
              <span className="text-white flex-1 truncate">{u.jersey_number ? `#${u.jersey_number} ` : ""}{u.name}</span>
              {has
                ? <span className="text-[var(--color-accent-blue)] text-xs whitespace-nowrap">→ {ZONE_LABEL[t.primary.zone]} {pctText(t.primary.pct)}</span>
                : <span className="text-slate-600 text-xs">no read yet</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================ helpers ============================
function ordinal(n) {
  const s = ["th", "st", "nd", "rd"], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function colorCls(color) {
  switch (color) {
    case "green": return "bg-[var(--color-accent-green)]/15 border-[var(--color-accent-green)]/30 text-[var(--color-accent-green)]";
    case "blue": return "bg-blue-600/15 border-blue-500/30 text-blue-300";
    case "red": return "bg-red-600/15 border-red-500/30 text-red-300";
    default: return "bg-white/[0.05] border-white/10 text-slate-300";
  }
}
