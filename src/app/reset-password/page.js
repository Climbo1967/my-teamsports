"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [validLink, setValidLink] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    // The reset link signs the user in; verify we have a session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setValidLink(!!session);
      setReady(true);
    });
    // Some links arrive as a PASSWORD_RECOVERY event after redirect
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setValidLink(true);
        setReady(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.push("/dashboard");
    router.refresh();
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
          {!ready ? (
            <p className="text-slate-400 text-center">Checking your reset link...</p>
          ) : !validLink ? (
            <div className="text-center">
              <div className="text-4xl mb-3">⏰</div>
              <h1 className="text-2xl font-bold mb-2">LINK EXPIRED</h1>
              <p className="text-slate-400 text-sm mb-5">
                This reset link is invalid or has expired. Request a fresh one and use it within the hour.
              </p>
              <Link
                href="/forgot-password"
                className="inline-block bg-[var(--color-accent-blue)] text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-600 transition-all"
              >
                Request new link
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-center mb-6">SET A NEW PASSWORD</h1>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">New Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="At least 6 characters"
                    className="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-[var(--color-accent-blue)] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Type it again"
                    className="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-[var(--color-accent-blue)] transition-colors"
                  />
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[var(--color-accent-green)] text-white font-[family-name:var(--font-oswald)] text-lg font-semibold tracking-wide py-3.5 rounded-xl hover:bg-green-500 transition-all disabled:opacity-50"
                >
                  {loading ? "Saving..." : "SAVE NEW PASSWORD"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
