"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const PASSCODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const PASSCODE_LENGTH = 8;

function generatePasscode() {
  let code = "";
  const bytes = new Uint8Array(PASSCODE_LENGTH);
  crypto.getRandomValues(bytes);
  for (const b of bytes) code += PASSCODE_CHARS[b % PASSCODE_CHARS.length];
  return code;
}

// Shows the current passcode with two ways to change it: a random 8-character
// code, or a custom 8-character code the coach types (letters/numbers only).
// Used on the team overview share card and the team settings page.
export default function PasscodeManager({ teamId, passcode, onChanged }) {
  const router = useRouter();
  const supabase = createClient();
  const [editing, setEditing] = useState(false);
  const [custom, setCustom] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save(next) {
    setError("");
    if (!confirm("Change the passcode? The old one stops working immediately — you'll need to re-share with parents.")) return;
    setSaving(true);
    const { error: err } = await supabase.from("teams").update({ passcode: next }).eq("id", teamId);
    setSaving(false);
    if (err) { setError(err.message); return; }
    setEditing(false);
    setCustom("");
    onChanged?.(next);
    router.refresh();
  }

  function saveCustom(e) {
    e.preventDefault();
    const next = custom.toUpperCase().trim();
    if (!/^[A-Z0-9]{8}$/.test(next)) {
      setError("Passcode must be exactly 8 letters or numbers (no spaces).");
      return;
    }
    save(next);
  }

  return (
    <div>
      <p className="text-2xl font-mono font-bold tracking-[0.3em] text-white">{passcode}</p>
      {!editing ? (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
          <button
            type="button"
            onClick={() => save(generatePasscode())}
            disabled={saving}
            className="text-xs font-semibold text-slate-400 hover:text-white transition-colors disabled:opacity-50"
          >
            🔄 New random code
          </button>
          <button
            type="button"
            onClick={() => { setEditing(true); setError(""); }}
            disabled={saving}
            className="text-xs font-semibold text-slate-400 hover:text-white transition-colors disabled:opacity-50"
          >
            ✏️ Make my own
          </button>
        </div>
      ) : (
        <form onSubmit={saveCustom} className="mt-2 space-y-2">
          <input
            type="text"
            value={custom}
            onChange={(e) => setCustom(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8))}
            autoFocus
            placeholder="8 letters/numbers"
            autoComplete="off"
            className="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-3 py-2 font-mono font-bold tracking-[0.2em] text-white placeholder:text-slate-600 placeholder:tracking-normal placeholder:font-sans focus:outline-none focus:border-[var(--color-accent-blue)] transition-colors uppercase"
          />
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving || custom.length < 8}
              className="text-xs font-semibold bg-[var(--color-accent-blue)] text-white px-3 py-1.5 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save passcode"}
            </button>
            <button
              type="button"
              onClick={() => { setEditing(false); setCustom(""); setError(""); }}
              className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
    </div>
  );
}
