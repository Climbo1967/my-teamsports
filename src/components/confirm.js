"use client";

// Styled replacement for window.confirm()/prompt() — promise-based, so call
// sites read the same as before:  if (!(await confirmDialog({...}))) return;
// Mounts its own React root so no page needs modal state or a provider.

import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";

export function confirmDialog(opts = {}) {
  if (typeof window === "undefined") return Promise.resolve(false);
  return new Promise((resolve) => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const root = createRoot(host);
    const done = (result) => {
      // Unmount on the next tick — React warns about sync unmount during render.
      setTimeout(() => { root.unmount(); host.remove(); }, 0);
      resolve(result);
    };
    root.render(<ConfirmModal {...opts} onDone={done} />);
  });
}

function ConfirmModal({
  title = "Are you sure?",
  message = "",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  requireText = null,
  onDone,
}) {
  const [typed, setTyped] = useState("");
  const confirmRef = useRef(null);
  const canConfirm = !requireText || typed.trim() === requireText;

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onDone(false); };
    window.addEventListener("keydown", onKey);
    if (!requireText) confirmRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => onDone(false)} />
      <div className="relative w-full max-w-md bg-[#111a2e] border border-white/10 rounded-2xl p-6 shadow-2xl">
        <h3 className="font-bold text-lg text-white mb-2">{title}</h3>
        {message ? <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{message}</p> : null}
        {requireText ? (
          <div className="mt-4">
            <p className="text-xs text-slate-500 mb-1.5">
              Type <span className="font-semibold text-slate-300">{requireText}</span> to confirm:
            </p>
            <input
              autoFocus
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && canConfirm) onDone(true); }}
              className="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-red-500/50 transition-colors"
            />
          </div>
        ) : null}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => onDone(false)}
            className="px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-300 bg-white/[0.06] border border-white/10 hover:bg-white/[0.1] hover:text-white transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            onClick={() => onDone(true)}
            disabled={!canConfirm}
            className={`px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
              danger ? "bg-red-600 hover:bg-red-500" : "bg-[var(--color-accent-blue)] hover:bg-blue-500"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
