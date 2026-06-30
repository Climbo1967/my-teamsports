"use client";

import { use, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button, Card, EmptyState, ErrorText, Spinner } from "@/components/ui";

export default function AiCoachPage({ params }) {
  const { teamId } = use(params);
  const supabase = createClient();
  const [team, setTeam] = useState(undefined);
  const [busy, setBusy] = useState(false);
  const [briefing, setBriefing] = useState(null);
  const [generatedAt, setGeneratedAt] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("teams").select("sport, ai_enabled").eq("id", teamId).single();
      setTeam(data || null);
    })();
  }, [teamId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function generate() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/ai-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not generate the briefing.");
      setBriefing(data.briefing);
      setGeneratedAt(data.generatedAt);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (team === undefined) return <Spinner />;

  if (!team?.ai_enabled) {
    return (
      <div className="max-w-2xl">
        <Card className="border-blue-500/25 text-center">
          <div className="text-5xl mb-3">🧠</div>
          <h3 className="font-bold text-lg mb-2">AI Assistant Coach</h3>
          <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
            Your own assistant coach that reads this team&apos;s data &mdash; record, stats, and schedule &mdash; and hands you a specific game plan: who&apos;s hot, what to work on, and a focus for the next practice. Part of an upcoming subscription.
          </p>
          <a href="/pricing" target="_blank" className="inline-block bg-[var(--color-accent-green)] text-white font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-green-500 transition-all">
            See pricing
          </a>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xl font-bold">🧠 AI Assistant Coach</h2>
          <p className="text-slate-400 text-sm">A coach&apos;s briefing built from your team&apos;s own data.</p>
        </div>
        <Button variant="green" onClick={generate} disabled={busy}>
          {busy ? "Reading your team..." : briefing ? "Regenerate" : "Generate briefing"}
        </Button>
      </div>

      <ErrorText>{error}</ErrorText>

      {!briefing && !busy && !error && (
        <EmptyState icon="🧠" text="Tap Generate briefing and your assistant coach will read your record, stats, and schedule, then hand you a specific plan." />
      )}

      {busy && <Spinner />}

      {briefing && !busy && (
        <Card>
          <p className="text-slate-200 text-sm whitespace-pre-wrap leading-relaxed">{briefing}</p>
          {generatedAt && (
            <p className="text-xs text-slate-600 mt-5">
              Generated {new Date(generatedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })} · AI-generated advice — use your coaching judgment.
            </p>
          )}
        </Card>
      )}
    </div>
  );
}
