"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Turnstile, { captchaEnabled } from "@/components/Turnstile";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get("message");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [captchaReset, setCaptchaReset] = useState(0);
  const [needsConfirm, setNeedsConfirm] = useState(false);
  const [resendState, setResendState] = useState("idle"); // idle | sending | sent | failed

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: { captchaToken: captchaToken || undefined },
    });

    setLoading(false);

    if (signInError) {
      setCaptchaReset((n) => n + 1); // tokens are single-use
      setNeedsConfirm(/email not confirmed/i.test(signInError.message));
      setError(signInError.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  async function resendConfirmation() {
    setResendState("sending");
    const supabase = createClient();
    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { captchaToken: captchaToken || undefined },
    });
    setCaptchaReset((n) => n + 1); // tokens are single-use
    setResendState(resendError ? "failed" : "sent");
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
          {message === "email_confirmed_login" && !error && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3 text-sm text-[var(--color-accent-green)] mb-4">
              ✓ Your email is confirmed — just log in below.
            </div>
          )}
          {message === "confirm_expired" && !error && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-3 text-sm mb-4">
              <p className="text-amber-400 mb-2">
                That confirmation link expired or was already used. If you confirmed before, just log in.
              </p>
              {resendState === "sent" ? (
                <p className="text-[var(--color-accent-green)]">
                  New confirmation email sent{email ? <> to <span className="font-semibold">{email}</span></> : null} from <span className="font-semibold">My-Team Sports (noreply@my-teamsports.com)</span>. Check your inbox (and spam).
                </p>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={resendConfirmation}
                    disabled={!email || resendState === "sending" || (captchaEnabled && !captchaToken)}
                    className="text-[var(--color-accent-blue)] font-medium hover:underline disabled:opacity-50"
                  >
                    {resendState === "sending" ? "Sending..." : "Resend the confirmation email"}
                  </button>
                  {!email && <p className="text-slate-500 text-xs mt-1">Enter your email below first, then tap resend.</p>}
                  {resendState === "failed" && (
                    <p className="text-red-400 mt-1">Could not send. Wait a minute and try again.</p>
                  )}
                </>
              )}
            </div>
          )}
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-slate-400">Password</label>
                <Link href="/forgot-password" className="text-xs text-[var(--color-accent-blue)] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Your password"
                className="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-[var(--color-accent-blue)] transition-colors"
              />
            </div>
            <Turnstile onToken={setCaptchaToken} resetSignal={captchaReset} />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            {needsConfirm && (
              <div className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm">
                {resendState === "sent" ? (
                  <p className="text-[var(--color-accent-green)]">
                    Confirmation email sent to <span className="font-semibold">{email}</span> from <span className="font-semibold">My-Team Sports (noreply@my-teamsports.com)</span>. Check your inbox (and spam/Promotions), then log in.
                  </p>
                ) : (
                  <>
                    <p className="text-slate-400 mb-2">
                      Your email isn&apos;t confirmed yet. We&apos;ve sent a confirmation link to <span className="text-white font-semibold">{email}</span> from <span className="text-white font-semibold">My-Team Sports (noreply@my-teamsports.com)</span> — check your inbox, and your spam/Promotions folder if it&apos;s not there within a minute or two. Lost the email?
                    </p>
                    <button
                      type="button"
                      onClick={resendConfirmation}
                      disabled={resendState === "sending" || (captchaEnabled && !captchaToken)}
                      className="text-[var(--color-accent-blue)] font-medium hover:underline disabled:opacity-50"
                    >
                      {resendState === "sending" ? "Sending..." : "Resend confirmation email"}
                    </button>
                    {resendState === "failed" && (
                      <p className="text-red-400 mt-1">Could not send. Wait a minute and try again.</p>
                    )}
                  </>
                )}
              </div>
            )}
            <button
              type="submit"
              disabled={loading || (captchaEnabled && !captchaToken)}
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
