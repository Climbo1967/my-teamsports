"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Coach emails (welcome, trial reminders, notes from Ron) carry ?c=<token>.
// Nothing happens until the button is tapped — link scanners that open the URL
// must not unsubscribe anyone.
function CoachUnsubscribe({ token }) {
  const [state, setState] = useState({ status: "idle" });

  async function setOptOut(optOut) {
    setState({ status: "busy" });
    const supabase = createClient();
    const { data, error } = await supabase.rpc("coach_email_opt", { p_token: token, p_opt_out: optOut });
    if (error || !data || !data.ok) {
      setState({ status: "error", msg: "That link didn't work. Reply to the email and we'll take you off the list." });
      return;
    }
    setState({ status: optOut ? "out" : "in" });
  }

  return (
    <div className="min-h-screen bg-[var(--color-navy)] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 text-center">
        <div className="text-4xl mb-3">✉️</div>
        {state.status === "out" ? (
          <>
            <h1 className="text-2xl font-bold text-white mb-2">You&apos;re unsubscribed</h1>
            <p className="text-slate-400 text-sm">
              You won&apos;t get any more emails from My-Team Sports about your trial, your team or product news. Password resets and receipts still come through.
            </p>
            <button onClick={() => setOptOut(false)} className="text-xs text-slate-500 hover:text-white underline mt-6">
              Changed your mind? Turn emails back on
            </button>
          </>
        ) : state.status === "in" ? (
          <>
            <h1 className="text-2xl font-bold text-white mb-2">Emails are back on</h1>
            <p className="text-slate-400 text-sm">You&apos;ll hear from us about your trial and your team again.</p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-white mb-2">Unsubscribe</h1>
            <p className="text-slate-400 text-sm mb-6">
              Stop emails from My-Team Sports about your trial, your team and product news. Password resets and receipts still come through.
            </p>
            {state.status === "error" && <p className="text-red-400 text-sm mb-4">{state.msg}</p>}
            <button
              onClick={() => setOptOut(true)}
              disabled={state.status === "busy"}
              className="w-full bg-[var(--color-accent-green)] text-white font-semibold py-3 rounded-lg hover:bg-green-500 transition-all disabled:opacity-50"
            >
              {state.status === "busy" ? "Working..." : "Unsubscribe me"}
            </button>
            <a href="https://my-teamsports.com" className="block text-xs text-slate-500 hover:text-white mt-6">← My-Team Sports</a>
          </>
        )}
      </div>
    </div>
  );
}

function UnsubscribeInner() {
  const params = useSearchParams();
  const coachToken = params.get("c") || "";
  if (coachToken) return <CoachUnsubscribe token={coachToken} />;
  return <TeamUnsubscribe params={params} />;
}

function TeamUnsubscribe({ params }) {
  const slug = params.get("team") || "";
  const [email, setEmail] = useState(params.get("email") || "");
  const [state, setState] = useState({ status: "idle" });

  async function submit(e) {
    e.preventDefault();
    if (!slug) {
      setState({ status: "error", msg: "This link is missing its team. Reply to the email and we'll remove you." });
      return;
    }
    if (!email.trim()) {
      setState({ status: "error", msg: "Enter the email address you want removed." });
      return;
    }
    setState({ status: "busy" });
    const supabase = createClient();
    const { data, error } = await supabase.rpc("unsubscribe_email", { p_slug: slug, p_email: email.trim() });
    if (error || !data || !data.ok) {
      setState({ status: "error", msg: "Couldn't process that just now. Please try again in a moment." });
      return;
    }
    setState({ status: "done", team: data.team_name, removed: data.removed });
  }

  return (
    <div className="min-h-screen bg-[var(--color-navy)] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 text-center">
        <div className="text-4xl mb-3">✉️</div>
        {state.status === "done" ? (
          <>
            <h1 className="text-2xl font-bold text-white mb-2">You&apos;re unsubscribed</h1>
            <p className="text-slate-400 text-sm">
              {state.removed > 0 ? (
                <>You won&apos;t receive any more email announcements{state.team ? <> from <span className="text-white">{state.team}</span></> : ""}.</>
              ) : (
                <>That email wasn&apos;t on {state.team ? <>{state.team}&apos;s</> : "the"} list — you&apos;re all set.</>
              )}
            </p>
            <p className="text-xs text-slate-600 mt-6">You can still open the team site anytime with your passcode.</p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-white mb-2">Unsubscribe</h1>
            <p className="text-slate-400 text-sm mb-6">Stop receiving email announcements. Confirm your email address below.</p>
            <form onSubmit={submit} className="space-y-4 text-left">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-[var(--color-accent-blue)] transition-colors"
              />
              {state.status === "error" && <p className="text-red-400 text-sm">{state.msg}</p>}
              <button
                type="submit"
                disabled={state.status === "busy"}
                className="w-full bg-[var(--color-accent-green)] text-white font-semibold py-3 rounded-lg hover:bg-green-500 transition-all disabled:opacity-50"
              >
                {state.status === "busy" ? "Removing..." : "Unsubscribe"}
              </button>
            </form>
            <a href="https://my-teamsports.com" className="block text-xs text-slate-500 hover:text-white mt-6">← My-Team Sports</a>
          </>
        )}
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={null}>
      <UnsubscribeInner />
    </Suspense>
  );
}
