"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function UnsubscribeInner() {
  const params = useSearchParams();
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
