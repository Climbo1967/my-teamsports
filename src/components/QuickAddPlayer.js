"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { nextSortOrder } from "@/lib/rosterOrder";

/**
 * Inline "type a name" add — the roster is built as a side effect of using a
 * tool (lineup, "who scored?"), instead of being a gate in front of it.
 * First-session value spec, Move 2 (2026-09-30).
 *
 * Inserts one players row and hands it back via onAdded({ id, name, jersey_number }).
 * A leading number is read as the jersey: "12 Sam Lee" -> #12 Sam Lee.
 */
export default function QuickAddPlayer({ teamId, onAdded, placeholder = "Player name", buttonLabel = "Add", autoFocus = false }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function add(e) {
    e?.preventDefault?.();
    const raw = text.trim();
    if (!raw || busy) return;
    const lead = raw.match(/^#?(\d{1,3})\s+(.+)$/);
    const name = (lead ? lead[2] : raw).trim().slice(0, 80);
    const jersey = lead ? lead[1] : null;
    if (!name) return;
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const sort_order = await nextSortOrder(supabase, teamId);
    const { data, error: err } = await supabase
      .from("players")
      .insert({ team_id: teamId, name, jersey_number: jersey, sort_order })
      .select("id, name, jersey_number")
      .single();
    setBusy(false);
    if (err) { setError(err.message); return; }
    setText("");
    onAdded?.(data);
  }

  return (
    <form onSubmit={add} className="w-full">
      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={84}
          placeholder={placeholder}
          autoFocus={autoFocus}
          enterKeyHint="done"
          className="flex-1 min-w-0 bg-white/[0.05] border border-white/[0.1] rounded-lg px-4 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-[var(--color-accent-blue)] transition-colors"
        />
        <button
          type="submit"
          disabled={busy || !text.trim()}
          className="shrink-0 bg-[var(--color-accent-blue)] hover:bg-blue-600 text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {busy ? "Adding…" : buttonLabel}
        </button>
      </div>
      {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
    </form>
  );
}
