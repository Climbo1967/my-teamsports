"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { POSITIONS } from "@/lib/constants";
import { Input, Select, Button, ErrorText } from "@/components/ui";

const BLANK = { name: "", jersey: "", position: "" };
const START_ROWS = 4;

function playerNoun(sport) {
  return sport === "hockey" ? "skaters" : "players";
}

/**
 * Parse a pasted roster. Forgiving on purpose -- a coach pastes whatever their
 * league handed them. One player per line. Recognised shapes:
 *   John Smith
 *   12 John Smith
 *   #12 John Smith
 *   John Smith, 12, Pitcher
 *   John Smith - 12
 */
function parsePastedRoster(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      // Comma or tab separated: name, jersey, position
      if (/[,\t]/.test(line)) {
        const [a = "", b = "", c = ""] = line.split(/[,\t]/).map((s) => s.trim());
        return { name: a, jersey: b.replace(/^#/, ""), position: c };
      }
      // Leading jersey number: "12 John Smith" / "#12 John Smith"
      const lead = line.match(/^#?(\d{1,3})\s+(.*)$/);
      if (lead) return { ...BLANK, jersey: lead[1], name: lead[2].trim() };
      // Trailing jersey after a dash: "John Smith - 12"
      const trail = line.match(/^(.*?)\s*[-–]\s*#?(\d{1,3})$/);
      if (trail) return { ...BLANK, name: trail[1].trim(), jersey: trail[2] };
      return { ...BLANK, name: line };
    })
    .filter((p) => p.name)
    .map((p) => ({
      name: p.name.slice(0, 80),
      jersey: (p.jersey || "").slice(0, 8),
      position: p.position || "",
    }));
}

export function RosterQuickAdd({ teamId, teamName, sport }) {
  const router = useRouter();
  const [rows, setRows] = useState(() =>
    Array.from({ length: START_ROWS }, () => ({ ...BLANK }))
  );
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const positions = POSITIONS[sport] || [];
  const noun = playerNoun(sport);
  const filled = rows.filter((r) => r.name.trim());

  function setRow(i, patch) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, { ...BLANK }]);
  }

  function applyPaste() {
    const parsed = parsePastedRoster(pasteText);
    if (!parsed.length) {
      setError("I couldn't read any names out of that. One player per line.");
      return;
    }
    setError(null);
    setRows((prev) => {
      const kept = prev.filter((r) => r.name.trim());
      return [...kept, ...parsed, { ...BLANK }];
    });
    setPasteText("");
    setPasteOpen(false);
  }

  async function save() {
    if (busy) return; // double-submit guard
    const toInsert = rows
      .map((r) => ({
        name: r.name.trim(),
        jersey: r.jersey.trim(),
        position: r.position.trim(),
      }))
      .filter((r) => r.name);

    if (!toInsert.length) {
      setError(`Add at least one ${noun.replace(/s$/, "")} — a name is enough.`);
      return;
    }

    setBusy(true);
    setError(null);
    const supabase = createClient();

    // Idempotency guard: if this team already has players (double submit, back
    // button, second tab), do not insert a second copy.
    const { data: existing, error: checkErr } = await supabase
      .from("players")
      .select("id")
      .eq("team_id", teamId)
      .limit(1);

    if (checkErr) {
      setBusy(false);
      setError(checkErr.message);
      return;
    }

    if (!existing || existing.length === 0) {
      const { error: insertErr } = await supabase.from("players").insert(
        toInsert.map((r, i) => ({
          team_id: teamId,
          name: r.name.slice(0, 80),
          jersey_number: r.jersey || null,
          position: r.position || null,
          sort_order: i,
        }))
      );
      if (insertErr) {
        setBusy(false);
        setError(insertErr.message);
        return;
      }
    }

    await stampProfile(supabase, { step: 2, completed: true });
    router.refresh();
  }

  async function skip() {
    if (busy) return;
    setBusy(true);
    setError(null);
    const supabase = createClient();
    await stampProfile(supabase, { step: 2, completed: true });
    router.refresh();
  }

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <p className="text-sm text-slate-400">
          A name is all you need — jersey numbers and positions are optional, and
          you can add more {noun} any time.
        </p>
        <button
          type="button"
          onClick={() => setPasteOpen((v) => !v)}
          className="text-xs font-medium text-[var(--color-accent-blue)] hover:underline shrink-0"
        >
          {pasteOpen ? "Type them instead" : "📋 Paste a list"}
        </button>
      </div>

      {pasteOpen ? (
        <div className="mb-4">
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            rows={7}
            placeholder={"One per line:\nJohn Smith\n12 Maria Garcia\nSam Lee, 8, Catcher"}
            className="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-4 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-[var(--color-accent-blue)] transition-colors resize-y font-mono text-sm"
          />
          <div className="mt-2">
            <Button type="button" variant="ghost" onClick={applyPaste}>
              Add these {noun}
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="hidden sm:grid grid-cols-[1fr_5rem_11.5rem] gap-2 px-1 mb-1.5">
            <span className="text-xs uppercase tracking-wider text-slate-500">Name</span>
            <span className="text-xs uppercase tracking-wider text-slate-500">#</span>
            <span className="text-xs uppercase tracking-wider text-slate-500">Position</span>
          </div>

          <div className="space-y-2">
            {rows.map((row, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_4rem] sm:grid-cols-[1fr_5rem_11.5rem] gap-2 pb-3 mb-1 border-b border-white/[0.06] sm:pb-0 sm:mb-0 sm:border-b-0"
              >
                <Input
                  type="text"
                  value={row.name}
                  maxLength={80}
                  onChange={(e) => setRow(i, { name: e.target.value })}
                  placeholder={i === 0 ? "Player name" : ""}
                  aria-label={`Player ${i + 1} name`}
                />
                <Input
                  type="text"
                  inputMode="numeric"
                  value={row.jersey}
                  maxLength={8}
                  onChange={(e) => setRow(i, { jersey: e.target.value })}
                  placeholder="#"
                  aria-label={`Player ${i + 1} jersey number`}
                />
                {positions.length > 0 ? (
                  <Select
                    value={row.position}
                    onChange={(e) => setRow(i, { position: e.target.value })}
                    aria-label={`Player ${i + 1} position`}
                    className="col-span-2 sm:col-span-1"
                  >
                    <option value="">Position (optional)</option>
                    {positions.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                    {/* A pasted position that isn't one of this sport's options
                        still needs to survive -- keep it rather than silently
                        dropping what the coach typed. */}
                    {row.position && !positions.includes(row.position) && (
                      <option value={row.position}>{row.position}</option>
                    )}
                  </Select>
                ) : (
                  <Input
                    type="text"
                    value={row.position}
                    maxLength={40}
                    onChange={(e) => setRow(i, { position: e.target.value })}
                    placeholder="Position (optional)"
                    aria-label={`Player ${i + 1} position`}
                    className="col-span-2 sm:col-span-1"
                  />
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addRow}
            className="text-sm font-medium text-[var(--color-accent-blue)] hover:underline mt-3"
          >
            + Add another row
          </button>
        </>
      )}

      <ErrorText>{error}</ErrorText>

      <div className="flex flex-wrap items-center gap-3 mt-5 pt-5 border-t border-white/[0.08]">
        <Button variant="green" onClick={save} disabled={busy}>
          {busy
            ? "Saving..."
            : filled.length
              ? `Add ${filled.length} ${filled.length === 1 ? noun.replace(/s$/, "") : noun} to ${teamName}`
              : `Add ${noun}`}
        </Button>
        <button
          type="button"
          onClick={skip}
          disabled={busy}
          className="text-sm text-slate-500 hover:text-slate-300 transition-colors disabled:opacity-50"
        >
          I&apos;ll do this later
        </button>
      </div>
    </div>
  );
}

/**
 * Analytics record only. Never read back to decide the wizard step -- see the
 * comment at the top of GettingStarted.js. A failure here must not break the
 * coach's flow, so it is deliberately not surfaced.
 */
async function stampProfile(supabase, { step, completed }) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from("profiles")
      .update({ onboarding_step: step, onboarding_completed: completed })
      .eq("id", user.id);
  } catch {
    /* non-fatal */
  }
}
