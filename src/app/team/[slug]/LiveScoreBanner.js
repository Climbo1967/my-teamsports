"use client";

import { useEffect, useState } from "react";
import { SCOREBOARD_SPORTS, periodShort, formatClock } from "@/lib/constants";

// Polls the passcode-gated live score and shows a banner while a game is live.
// Handles both the baseball-style game and the universal clock/period scoreboard.
export default function LiveScoreBanner({ slug, teamName }) {
  const [live, setLive] = useState(null);
  const [tick, setTick] = useState(Date.now());

  useEffect(() => {
    let active = true;
    async function poll() {
      try {
        const res = await fetch(`/api/live-score?slug=${encodeURIComponent(slug)}`, { cache: "no-store" });
        const json = await res.json();
        if (active) setLive(json.live || null);
      } catch {
        // ignore — try again next tick
      }
    }
    poll();
    const id = setInterval(poll, 12000);
    return () => { active = false; clearInterval(id); };
  }, [slug]);

  // Local 1s tick so a running clock counts down smoothly between polls.
  useEffect(() => {
    if (!live || !live.clock_running) return;
    const id = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, [live?.clock_running]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!live) return null;

  const us = live.team_name || teamName || "Us";
  const them = live.opponent || "Opponent";

  // ---- Universal scoreboard (basketball, soccer, hockey, football, volleyball) ----
  if (SCOREBOARD_SPORTS.includes(live.sport)) {
    let clockLabel = null;
    if (live.clock_seconds != null) {
      let rem = live.clock_seconds;
      if (live.clock_running && live.clock_updated_at) {
        const elapsed = (tick - new Date(live.clock_updated_at).getTime()) / 1000;
        rem = Math.max(0, Math.round(live.clock_seconds - elapsed));
      }
      clockLabel = formatClock(rem);
    }
    return (
      <Banner>
        <div className="flex items-center gap-2 px-5 py-2 border-b border-white/[0.06]">
          <span className="w-2 h-2 rounded-full bg-[var(--color-accent-green)] animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-accent-green)]">Live now</span>
          <span className="text-xs text-slate-400 ml-auto">
            {periodShort(live.sport, live.period)}{clockLabel ? ` · ${clockLabel}` : ""}
          </span>
        </div>
        <div className="flex items-center text-center py-4">
          <Side name={us} score={live.our_score} />
          <div className="px-3 text-slate-600 font-bold">–</div>
          <Side name={them} score={live.opp_score} />
        </div>
      </Banner>
    );
  }

  // ---- Baseball / softball ----
  const arrow = live.half === "top" ? "▲" : "▼";
  return (
    <Banner>
      <div className="flex items-center gap-2 px-5 py-2 border-b border-white/[0.06]">
        <span className="w-2 h-2 rounded-full bg-[var(--color-accent-green)] animate-pulse" />
        <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-accent-green)]">Live now</span>
        <span className="text-xs text-slate-400 ml-auto">{arrow} {ordinal(live.inning)} · {live.outs} {live.outs === 1 ? "out" : "outs"}</span>
      </div>
      <div className="flex items-center text-center py-4">
        <Side name={us} score={live.our_score} />
        <div className="px-4 min-w-[90px]">
          <p className="text-[10px] uppercase tracking-widest text-slate-500">Count</p>
          <p className="font-[family-name:var(--font-oswald)] text-2xl font-bold text-white">{live.balls}<span className="text-slate-600">-</span>{live.strikes}</p>
        </div>
        <Side name={them} score={live.opp_score} />
      </div>
      {live.batter && (
        <p className="text-center text-xs text-slate-400 pb-3">
          At bat: <span className="text-white font-semibold">{live.batter.jersey_number ? `#${live.batter.jersey_number} ` : ""}{live.batter.name}</span>
        </p>
      )}
    </Banner>
  );
}

function Banner({ children }) {
  return (
    <div className="px-6 pt-6">
      <div className="max-w-3xl mx-auto rounded-2xl border border-[var(--color-accent-green)]/30 bg-[var(--color-accent-green)]/[0.06] overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function Side({ name, score }) {
  return (
    <div className="flex-1 px-2">
      <p className="text-xs uppercase tracking-widest text-slate-400 mb-1 truncate">{name}</p>
      <p className="font-[family-name:var(--font-oswald)] text-4xl font-bold text-white">{score}</p>
    </div>
  );
}

function ordinal(n) {
  const s = ["th", "st", "nd", "rd"], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
