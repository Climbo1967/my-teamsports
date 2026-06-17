"use client";

import { useEffect, useState } from "react";

// Polls the passcode-gated live score and shows a banner while a game is live.
export default function LiveScoreBanner({ slug, teamName }) {
  const [live, setLive] = useState(null);

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

  if (!live) return null;

  const arrow = live.half === "top" ? "▲" : "▼";
  const us = live.team_name || teamName || "Us";
  const them = live.opponent || "Opponent";

  return (
    <div className="px-6 pt-6">
      <div className="max-w-3xl mx-auto rounded-2xl border border-[var(--color-accent-green)]/30 bg-[var(--color-accent-green)]/[0.06] overflow-hidden">
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
