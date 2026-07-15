"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PasscodeGate({ slug }) {
  const router = useRouter();
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/team-access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, passcode }),
    });

    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Wrong passcode.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-b from-[var(--color-navy)] to-[var(--color-navy-mid)]">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="inline-flex items-center justify-center gap-3 mb-8">
          <div className="w-11 h-11 bg-gradient-to-br from-[var(--color-accent-blue)] to-blue-700 rounded-xl flex items-center justify-center text-lg">⚾</div>
          <span className="font-[family-name:var(--font-oswald)] font-bold text-xl tracking-wide text-white">
            MY-TEAM <span className="text-[var(--color-accent-blue)]">SPORTS</span>
          </span>
        </Link>
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-8">
          <div className="text-4xl mb-3">🔒</div>
          <h1 className="text-2xl font-bold mb-2">TEAM MEMBERS ONLY</h1>
          <p className="text-slate-400 text-sm mb-6">
            Enter the passcode your coach shared with you.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value.toUpperCase())}
              required
              maxLength={8}
              placeholder="PASSCODE"
              autoComplete="off"
              className="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-4 py-3.5 text-center text-2xl font-mono font-bold tracking-[0.4em] text-white placeholder:text-slate-700 placeholder:tracking-[0.4em] focus:outline-none focus:border-[var(--color-accent-blue)] transition-colors uppercase"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading || passcode.length < 6}
              className="w-full bg-[var(--color-accent-blue)] text-white font-[family-name:var(--font-oswald)] text-lg font-semibold tracking-wide py-3.5 rounded-xl hover:bg-blue-600 transition-all disabled:opacity-50"
            >
              {loading ? "Checking..." : "ENTER TEAM SITE"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
