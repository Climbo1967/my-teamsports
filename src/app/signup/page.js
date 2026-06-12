"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [needsConfirm, setNeedsConfirm] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    // If email confirmation is enabled, there's no session yet
    if (!data.session) {
      setNeedsConfirm(true);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  if (needsConfirm) {
    return (
      <AuthShell title="CHECK YOUR EMAIL">
        <p className="text-slate-400 text-center leading-relaxed">
          We sent a confirmation link to <span className="text-white font-semibold">{email}</span>.
          Click it to activate your coach account, then{" "}
          <Link href="/login" className="text-[var(--color-accent-blue)] hover:underline">log in</Link>.
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="CREATE YOUR COACH ACCOUNT" subtitle="Free for the 2026 season. Set up your team in minutes.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Your Name" type="text" value={fullName} onChange={setFullName} placeholder="Coach Smith" required />
        <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" required />
        <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="At least 6 characters" required minLength={6} />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[var(--color-accent-green)] text-white font-[family-name:var(--font-oswald)] text-lg font-semibold tracking-wide py-3.5 rounded-xl hover:bg-green-500 transition-all disabled:opacity-50"
        >
          {loading ? "Creating account..." : "SIGN UP"}
        </button>
      </form>
      <p className="text-sm text-slate-500 text-center mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-[var(--color-accent-blue)] hover:underline">Log in</Link>
      </p>
    </AuthShell>
  );
}

function AuthShell({ title, subtitle, children }) {
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
          <h1 className="text-2xl font-bold text-center mb-2">{title}</h1>
          {subtitle && <p className="text-slate-400 text-sm text-center mb-6">{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}

function Field({ label, type, value, onChange, placeholder, required, minLength }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-400 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        className="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-[var(--color-accent-blue)] transition-colors"
      />
    </div>
  );
}
