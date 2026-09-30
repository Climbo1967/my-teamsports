"use client";

// First-session value spec (Sydney, approved by Ron 2026-09-30):
//   Move 1 — a finished thing with the team's name on it before any roster work.
//   Move 3 — end the first session with one outward action (send the team page
//            to a parent) and one dated reason to come back (Game 1 on the schedule).
// These are the shared pieces the playbook and scorekeeper first-run paths use.
// Measurement rides on existing counters only (invite_copied via CopyInviteButton);
// no new counter keys, so no migration.

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { queueScheduleAlert } from "@/lib/pushClient";
import CopyInviteButton from "./CopyInviteButton";

/** Outward action: send the team page to a parent. */
export function ShareTeamCard({ teamId, note }) {
  const [team, setTeam] = useState(null);

  useEffect(() => {
    let live = true;
    createClient()
      .from("teams")
      .select("name, slug, passcode")
      .eq("id", teamId)
      .single()
      .then(({ data }) => { if (live) setTeam(data || null); });
    return () => { live = false; };
  }, [teamId]);

  if (!team?.slug || !team?.passcode) return null;

  return (
    <div className="rounded-xl border border-green-500/25 bg-green-500/[0.06] p-4 md:p-5">
      <p className="font-semibold text-white">📲 Send your team page to one parent</p>
      <p className="text-sm text-slate-400 mt-1">
        {note || "They open it in any browser — no app, no account."}
      </p>
      <p className="text-xs text-slate-500 mt-1.5 mb-3">
        <span className="break-all">my-teamsports.com/team/{team.slug}</span>
        {" · "}
        <span className="whitespace-nowrap">passcode <span className="font-mono text-slate-300">{team.passcode}</span></span>
      </p>
      <CopyInviteButton team={team} />
    </div>
  );
}

// Push alert line — mirrors scheduleAlertPayload() in schedule/page.js so a
// game added here reads the same on parents' phones as one added there.
function alertPayload(row) {
  const when = new Date(row.starts_at).toLocaleString("en-US", {
    weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });
  return { kind: "added", label: `Game${row.opponent ? " vs " + row.opponent : ""}`, when, location: null };
}

function toLocalInputValue(d) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Next Saturday, 9:00 AM local (a week out if today is Saturday).
function defaultGameTime() {
  const d = new Date();
  const add = ((6 - d.getDay() + 7) % 7) || 7;
  d.setDate(d.getDate() + add);
  d.setHours(9, 0, 0, 0);
  return toLocalInputValue(d);
}

export function formatGameWhen(iso) {
  return new Date(iso).toLocaleString("en-US", {
    weekday: "long", month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });
}

/**
 * Replaces "No games on the schedule yet. Add a game on the Schedule tab first."
 * One opponent field + one date. Creates a normal events row (event_type game),
 * so it shows on the Schedule tab and the team page like any other game.
 */
export function QuickGameCard({ teamId, onAdded }) {
  const [opponent, setOpponent] = useState("");
  const [startsAt, setStartsAt] = useState(defaultGameTime);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function add(e) {
    e.preventDefault();
    if (!startsAt) { setError("Pick a date and time."); return; }
    setBusy(true);
    setError(null);
    const row = {
      team_id: teamId,
      event_type: "game",
      opponent: opponent.trim() || null,
      starts_at: new Date(startsAt).toISOString(),
    };
    const { data, error: err } = await createClient().from("events").insert(row).select("*").single();
    setBusy(false);
    if (err) { setError(err.message); return; }
    if (new Date(row.starts_at).getTime() > Date.now()) queueScheduleAlert(teamId, alertPayload(row));
    onAdded?.(data);
  }

  return (
    <form onSubmit={add} className="bg-white/[0.03] border border-[var(--color-accent-blue)]/30 rounded-2xl p-5 md:p-6">
      <p className="text-xs uppercase tracking-widest text-[var(--color-accent-blue)] font-semibold">Game 1</p>
      <h3 className="text-xl font-bold text-white mt-0.5 mb-1">Put your first game on the schedule</h3>
      <p className="text-sm text-slate-400 mb-5">Who and when — that&apos;s it. You&apos;ll score it live from here on game day.</p>
      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1.5">Opponent</label>
          <input
            type="text"
            value={opponent}
            onChange={(e) => setOpponent(e.target.value)}
            maxLength={80}
            placeholder="e.g. Tigers"
            className="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-4 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-[var(--color-accent-blue)] transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1.5">Date &amp; time</label>
          <input
            type="datetime-local"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            required
            className="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[var(--color-accent-blue)] transition-colors [color-scheme:dark]"
          />
        </div>
      </div>
      {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="w-full sm:w-auto bg-[var(--color-accent-green)] hover:bg-green-500 text-white font-semibold text-sm px-6 py-3 rounded-lg transition-all disabled:opacity-50"
      >
        {busy ? "Adding…" : "📅 Add Game 1"}
      </button>
      <p className="text-xs text-slate-500 mt-3">
        Have a whole season? Use the <Link href={`/dashboard/teams/${teamId}/schedule`} className="underline hover:text-slate-300">Schedule tab</Link> for repeating games and practices.
      </p>
    </form>
  );
}
