"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setSent(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-b from-[var(--color-navy)] to-[var(--color-navy-mid)]">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-3 mb-8">
          <div className="w-11 h-11 bg-gradient-to-br from-[var(--color-accent-blue)] to-blue-700 rounded-xl flex items-center justify-center text-lg">⚾</div>
          <span className="font-[family-name:var(--font-oswald)] font-bold text-xl tracking-wide text-white">
            MY-TEAM <span className="text-[var(--color-accent-blue)]">SPORTS</span>
          </span>
        </Link>
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-8">
          {sent ? (
            <div className="text-center">
              <div className="text-4xl mb-3">📬</div>
              <h1 className="text-2xl font-bold mb-2">CHECK YOUR EMAIL</h1>
              <p className="text-slate-400 text-sm leading-relaxed">
                If an account exists for <span className="text-white font-semibold">{email}</span>,
                we sent a link to reset your password. The link works for one hour.
              </p>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-center mb-2">FORGOT PASSWORD?</h1>
              <p className="text-slate-400 text-sm text-center mb-6">
                Enter your email and we&apos;ll send you a reset link.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-[var(--color-accent-blue)] transition-colors"
                  />
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[var(--color-accent-blue)] text-white font-[family-name:var(--font-oswald)] text-lg font-semibold tracking-wide py-3.5 rounded-xl hover:bg-blue-600 transition-all disabled:opacity-50"
                >
                  {loading ? "Sending..." : "SEND RESET LINK"}
                </button>
              </form>
            </>
          )}
          <p className="text-sm text-slate-500 text-center mt-6">
            <Link href="/login" className="text-[var(--color-accent-blue)] hover:underline">← Back to login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
