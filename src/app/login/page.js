"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
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
          <h1 className="text-2xl font-bold text-center mb-6">COACH LOGIN</h1>
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
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Your password"
                className="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-[var(--color-accent-blue)] transition-colors"
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--color-accent-blue)] text-white font-[family-name:var(--font-oswald)] text-lg font-semibold tracking-wide py-3.5 rounded-xl hover:bg-blue-600 transition-all disabled:opacity-50"
            >
              {loading ? "Logging in..." : "LOG IN"}
            </button>
          </form>
          <p className="text-sm text-slate-500 text-center mt-6">
            New here?{" "}
            <Link href="/signup" className="text-[var(--color-accent-blue)] hover:underline">Create a coach account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
