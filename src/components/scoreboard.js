"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { scoreboardConfig, periodShort, formatClock, gameResultString } from "@/lib/constants";
import { Button, Card, ErrorText, Spinner } from "@/components/ui";
import { notifyGame } from "@/lib/pushClient";
import { confirmDialog } from "@/components/confirm";
import QuickAddPlayer from "@/components/QuickAddPlayer";

// Universal live scorer for clock/period sports (basketball, soccer, hockey,
// football, flag football, volleyball). Reuses game_scores + the live banner.
export function ScoreboardScorer({ teamId, sport, teamName, event, players, onPlayerAdded, onBack }) {
  const supabase = createClient();
  const cfg = scoreboardConfig(sport);
  const timed = cfg && cfg.clockMinutes != null;

  const [game, setGame] = useState(undefined); // undefined=loading, null=not started, row
  const [plays, setPlays] = useState([]); // scoring_plays, most recent first
  const [pending, setPending] = useState(null); // { points } awaiting player pick (us side)
  const [error, setError] = useState(null);
  const [nowTick, setNowTick] = useState(() => Date.now());
  // L2: a game that was already final (loaded final, or ended once) must not
  // push a second "final" alert when it is reopened and ended again.
  const finalAnnounced = useRef(false);
  // Latest game row for handlers that fire faster than React re-renders (two
  // taps on a score button, undo right after a score). Reading `game` from the
  // render closure made the second write start from the first one's stale row.
  const gameRef = useRef(game);
  useEffect(() => { gameRef.current = game; }, [game]);
  // One scoring write at a time: a double-tap on "Who scored?" used to insert
  // the play twice (player credited twice) while the score rose once.
  const writing = useRef(false);

  // Initial fetch: state is set in the promise callback; a late response after
  // leaving this game is dropped.
  useEffect(() => {
    let live = true;
    Promise.all([
      supabase.from("game_scores").select("*").eq("event_id", event.id).maybeSingle(),
      supabase.from("scoring_plays").select("*").eq("event_id", event.id).order("created_at", { ascending: false }),
    ]).then(([{ data: g }, { data: pl }]) => {
      if (!live) return;
      setGame(g || null);
      if (g?.status === "final") finalAnnounced.current = true;
      setPlays(pl || []);
    });
    return () => { live = false; };
  }, [event.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Tick locally while the clock runs so the coach sees it count down smoothly.
  useEffect(() => {
    if (!game || !game.clock_running) return;
    const id = setInterval(() => setNowTick(Date.now()), 250);
    return () => clearInterval(id);
  }, [game?.clock_running]); // eslint-disable-line react-hooks/exhaustive-deps

  const remaining = useMemo(() => {
    if (!game || game.clock_seconds == null) return null;
    if (!game.clock_running) return game.clock_seconds;
    const elapsed = (nowTick - new Date(game.clock_updated_at).getTime()) / 1000;
    return Math.max(0, Math.round(game.clock_seconds - elapsed));
  }, [game, nowTick]);

  const playerMap = useMemo(() => Object.fromEntries(players.map((p) => [p.id, p])), [players]);

  async function patch(p) {
    const base = gameRef.current;
    const next = { ...base, ...p, updated_at: new Date().toISOString() };
    gameRef.current = next;
    setGame(next);
    const { error: e } = await supabase.from("game_scores").update({ ...p, updated_at: next.updated_at }).eq("id", base.id);
    if (e) {
      // Put the screen back to what the database has; the coach sees why.
      gameRef.current = base;
      setGame(base);
      setError(`Didn't save: ${e.message}. Check your connection and try again.`);
      return false;
    }
    return true;
  }

  async function startGame(isHome) {
    setError(null);
    const { data: liveOther } = await supabase.from("game_scores").select("event_id").eq("team_id", teamId).eq("status", "in_progress").neq("event_id", event.id).limit(1);
    if (liveOther && liveOther.length && !confirm("Another game is still marked live for this team. Starting this one makes it the live game on your team page (the other stays in progress until you End it). Continue?")) return;
    const clock = timed ? cfg.clockMinutes * 60 : null;
    const { data, error: e } = await supabase.from("game_scores")
      .insert({ team_id: teamId, event_id: event.id, is_home: isHome, status: "in_progress",
                period: 1, clock_seconds: clock, clock_running: false, clock_updated_at: new Date().toISOString() })
      .select().single();
    if (e) { setError(e.message); return; }
    setGame(data);
    notifyGame({ teamId, kind: "start", opponent: event.opponent });
  }

  async function applyScore(side, points, playerId) {
    if (writing.current) return;
    writing.current = true;
    setPending(null);
    setError(null);
    try {
      const field = side === "us" ? "our_score" : "opp_score";
      const cur = gameRef.current;
      const { data: play, error: e } = await supabase.from("scoring_plays").insert({
        team_id: teamId, event_id: event.id, player_id: playerId || null,
        side, points, period: cur.period,
      }).select().single();
      if (e) { setError(`Score didn't save: ${e.message}. Check your connection and try again.`); return; }
      setPlays((ps) => [play, ...ps]);
      await patch({ [field]: (cur[field] || 0) + points });
    } finally {
      writing.current = false;
    }
  }

  // "us" score: attribute to a player only when this scoring play actually
  // credits a season stat. For 'sum' sports (basketball) every point counts; for
  // 'unit' sports only the increment worth one unit does (a 6-pt TD, not a field
  // goal / XP / 2pt) -- matching what rollup_scoreboard_stats actually records.
  function scoreCredits(points) {
    if (!cfg.statKey) return false;
    if (cfg.statMode === "sum") return true;
    return points === cfg.statUnit;
  }
  function scoreUs(points) {
    if (scoreCredits(points)) setPending({ points });
    else applyScore("us", points, null);
  }

  async function undoLast() {
    const last = plays[0];
    if (!last || writing.current) return;
    writing.current = true;
    setError(null);
    try {
      // Remove the play first; only then take the points off. The old order
      // could leave the score lowered with the play (and the player's credit)
      // still on record when the delete failed.
      const { error: e } = await supabase.from("scoring_plays").delete().eq("id", last.id);
      if (e) { setError(`Couldn't undo: ${e.message}. Check your connection and try again.`); return; }
      setPlays((ps) => ps.filter((x) => x.id !== last.id));
      const field = last.side === "us" ? "our_score" : "opp_score";
      await patch({ [field]: Math.max(0, (gameRef.current[field] || 0) - last.points) });
    } finally {
      writing.current = false;
    }
  }

  function adjust(side, delta) {
    const field = side === "us" ? "our_score" : "opp_score";
    patch({ [field]: Math.max(0, (gameRef.current[field] || 0) + delta) });
  }

  function startClock() {
    patch({ clock_running: true, clock_seconds: remaining, clock_updated_at: new Date().toISOString() });
  }
  function pauseClock() {
    patch({ clock_running: false, clock_seconds: remaining, clock_updated_at: new Date().toISOString() });
  }
  function resetClock() {
    patch({ clock_running: false, clock_seconds: timed ? cfg.clockMinutes * 60 : null, clock_updated_at: new Date().toISOString() });
  }

  function changePeriod(delta) {
    const next = Math.max(1, gameRef.current.period + delta);
    patch({ period: next, clock_running: false,
            clock_seconds: timed ? cfg.clockMinutes * 60 : null, clock_updated_at: new Date().toISOString() });
  }

  async function endGame() {
    // One mis-tap used to finalize the game and push "Final" to parents.
    if (!(await confirmDialog({ title: "End this game?", message: "The score will be saved as the game result.", confirmLabel: "End & finalize" }))) return;
    // Each save is checked: on a bad connection at the field any of these can
    // fail, and the coach must see that instead of being sent back as if the
    // game were saved (and parents told "Final" for a game still in progress).
    setError(null);
    const { error: e1 } = await supabase.from("game_scores").update({ status: "final", clock_running: false }).eq("id", game.id);
    if (e1) { setError(`Couldn't end the game: ${e1.message}. Check your connection and try again.`); return; }
    const { error: e2 } = await supabase.from("events").update({ result: gameResultString(game.our_score, game.opp_score) }).eq("id", event.id);
    if (e2) { setError(`Game ended, but the result didn't save to the schedule: ${e2.message}. Tap End game again.`); return; }
    if (cfg.statKey) {
      const { error: e3 } = await supabase.rpc("rollup_scoreboard_stats", { p_event_id: event.id });
      if (e3) { setError(`Game ended, but stats didn't update: ${e3.message}. Tap End game again.`); return; }
    }
    if (!finalAnnounced.current) {
      notifyGame({ teamId, kind: "final", opponent: event.opponent, ourScore: game.our_score, oppScore: game.opp_score });
      finalAnnounced.current = true;
    }
    onBack();
  }

  if (!cfg) return null;
  if (game === undefined) return <Spinner />;

  const us = teamName || "Us";
  const them = event.opponent || "Opponent";

  // ---- Not started yet: pick home/away ----
  if (game === null) {
    return (
      <div>
        <BackLink onBack={onBack} />
        <h2 className="text-xl font-bold mb-1">{them === "Opponent" ? "New game" : `vs ${them}`}</h2>
        <p className="text-slate-400 text-sm mb-6">Start the live scoreboard. The score goes live on your team page right away.</p>
        <ErrorText>{error}</ErrorText>
        <Card>
          <p className="text-sm font-medium text-slate-300 mb-4">Which side is your team?</p>
          <div className="flex gap-3">
            <Button variant="green" className="flex-1" onClick={() => startGame(true)}>🏠 We&apos;re Home</Button>
            <Button variant="primary" className="flex-1" onClick={() => startGame(false)}>✈️ We&apos;re Away</Button>
          </div>
        </Card>
      </div>
    );
  }

  const final = game.status === "final";

  return (
    <div>
      <BackLink onBack={onBack} />
      <ErrorText>{error}</ErrorText>

      {final && (
        <Card className="mb-4 text-center">
          <p className="text-lg font-bold mb-1">Final · {gameResultString(game.our_score, game.opp_score)}</p>
          <p className="text-slate-400 text-sm mb-4">This game is finished. Reopen it to keep scoring.</p>
          <Button variant="ghost" onClick={() => patch({ status: "in_progress" })}>Reopen game</Button>
        </Card>
      )}

      {/* Scoreboard */}
      <Card className="mb-4">
        <div className="flex items-center justify-center gap-2 mb-4 text-xs uppercase tracking-widest text-slate-400">
          {!final && <span className="w-2 h-2 rounded-full bg-[var(--color-accent-green)] animate-pulse" />}
          <span>{periodShort(sport, game.period)}</span>
          {timed && <span className="text-slate-600">·</span>}
          {timed && <span className="font-[family-name:var(--font-oswald)] text-base text-white tracking-normal">{formatClock(remaining)}</span>}
        </div>
        <div className="flex items-stretch text-center">
          <ScoreCol name={us} score={game.our_score} accent />
          <div className="px-3 flex items-center text-slate-600 font-bold">–</div>
          <ScoreCol name={them} score={game.opp_score} />
        </div>
      </Card>

      {!final && (
        <>
          {/* Clock controls */}
          {timed && (
            <Card className="mb-4">
              <p className="text-xs uppercase tracking-widest text-slate-500 mb-3">Game clock</p>
              {/* Two rows: four buttons in one row ran ~35px off a 320px phone. */}
              <div className="flex gap-2">
                {game.clock_running ? (
                  <Button variant="danger" className="flex-1" onClick={pauseClock}>⏸ Pause</Button>
                ) : (
                  <Button variant="green" className="flex-1" onClick={startClock}>▶ Start</Button>
                )}
                <Button variant="ghost" onClick={resetClock}>Reset</Button>
              </div>
              <div className="flex gap-2 mt-2">
                <Button variant="ghost" className="flex-1" onClick={() => changePeriod(-1)} disabled={game.period <= 1}>◀ {cfg.periodLabel}</Button>
                <Button variant="ghost" className="flex-1" onClick={() => changePeriod(1)}>{cfg.periodLabel} ▶</Button>
              </div>
            </Card>
          )}
          {!timed && (
            <Card className="mb-4">
              <p className="text-xs uppercase tracking-widest text-slate-500 mb-3">{cfg.periodLabel}</p>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => changePeriod(-1)} disabled={game.period <= 1}>◀ Previous</Button>
                <Button variant="green" className="flex-1" onClick={() => changePeriod(1)}>Next {cfg.periodLabel} ▶</Button>
              </div>
            </Card>
          )}

          {/* Scoring */}
          <Card className="mb-4">
            <div className="grid grid-cols-2 gap-5">
              <ScoreSide
                label={us}
                buttons={cfg.increments}
                onScore={(pts) => scoreUs(pts)}
                onAdjust={(d) => adjust("us", d)}
                accent
              />
              <ScoreSide
                label={them}
                buttons={cfg.increments}
                onScore={(pts) => applyScore("opp", pts, null)}
                onAdjust={(d) => adjust("opp", d)}
              />
            </div>
            <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/[0.06]">
              <button onClick={undoLast} disabled={plays.length === 0}
                className="text-sm text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed">
                ↩ Undo last
              </button>
              <span className="text-xs text-slate-600">{plays.length} scoring {plays.length === 1 ? "play" : "plays"}</span>
            </div>
          </Card>

          <Button variant="danger" className="w-full" onClick={endGame}>End game · {gameResultString(game.our_score, game.opp_score)}</Button>
        </>
      )}

      {/* Player attribution overlay */}
      {pending && (
        <PlayerPicker
          teamId={teamId}
          players={players}
          points={pending.points}
          onAdded={onPlayerAdded}
          onPick={(pid) => applyScore("us", pending.points, pid)}
          onCancel={() => setPending(null)}
        />
      )}
    </div>
  );
}

function ScoreCol({ name, score, accent }) {
  return (
    <div className="flex-1">
      <p className="text-xs uppercase tracking-widest text-slate-400 mb-1 truncate">{name}</p>
      <p className={`font-[family-name:var(--font-oswald)] text-6xl font-bold ${accent ? "text-[var(--color-accent-green)]" : "text-white"}`}>{score}</p>
    </div>
  );
}

function ScoreSide({ label, buttons, onScore, onAdjust, accent }) {
  return (
    <div className="text-center">
      <p className={`text-sm font-semibold mb-3 truncate ${accent ? "text-[var(--color-accent-green)]" : "text-slate-300"}`}>{label}</p>
      <div className="flex flex-col gap-2">
        {buttons.map((b) => (
          <button key={b.label} onClick={() => onScore(b.points)}
            className="bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] rounded-xl py-3 font-[family-name:var(--font-oswald)] text-lg font-semibold text-white transition-colors">
            {b.label}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-center gap-3 mt-3 text-slate-500">
        <button onClick={() => onAdjust(-1)} className="w-7 h-7 rounded-md border border-white/10 hover:bg-white/5 leading-none">−</button>
        <span className="text-[10px] uppercase tracking-widest">fix</span>
        <button onClick={() => onAdjust(1)} className="w-7 h-7 rounded-md border border-white/10 hover:bg-white/5 leading-none">+</button>
      </div>
    </div>
  );
}

function PlayerPicker({ teamId, players, points, onAdded, onPick, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4" onClick={onCancel}>
      <div className="w-full max-w-md bg-[#132140] border border-white/10 rounded-2xl p-6 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <p className="text-sm font-semibold text-white mb-1">Who scored? <span className="text-[var(--color-accent-green)]">+{points}</span></p>
        <p className="text-xs text-slate-500 mb-4">Tap a player to credit their season stats, or skip.</p>
        {/* Move 2 (first-session spec): name the scorer right here; they join the roster. */}
        <div className="mb-4">
          <QuickAddPlayer
            teamId={teamId}
            placeholder={players.length === 0 ? "Type their name" : "Someone new? Type a name"}
            buttonLabel="Credit"
            autoFocus={players.length === 0}
            onAdded={(p) => { onAdded?.(p); onPick(p.id); }}
          />
        </div>
        {players.length === 0 ? null : (
          <div className="grid grid-cols-1 gap-2 mb-4">
            {players.map((p) => (
              <button key={p.id} onClick={() => onPick(p.id)}
                className="flex items-center gap-3 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-xl px-4 py-3 text-left transition-colors">
                <span className="w-8 h-8 shrink-0 rounded-full bg-[var(--color-accent-blue)]/20 text-[var(--color-accent-blue)] flex items-center justify-center text-sm font-bold">
                  {p.jersey_number ?? "•"}
                </span>
                <span className="text-white font-medium">{p.name}</span>
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={() => onPick(null)}>No player (team)</Button>
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}

function BackLink({ onBack }) {
  return (
    <button onClick={onBack} className="text-sm text-slate-400 hover:text-white mb-4 inline-flex items-center gap-1">
      ← All games
    </button>
  );
}
