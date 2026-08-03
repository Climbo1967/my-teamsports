"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button, Card, ErrorText, Spinner, TextArea } from "@/components/ui";
import { confirmDialog } from "@/components/confirm";

const SUGGESTIONS = [
  "What should we focus on at the next practice?",
  "Who hasn't gotten many touches lately?",
  "Draft a short message to parents about our next game.",
  "How should I handle playing time this weekend?",
];

export default function AiChatPage({ params }) {
  const { teamId } = use(params);
  const supabase = createClient();
  const [team, setTeam] = useState(undefined);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const endRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("teams").select("name, sport, ai_enabled").eq("id", teamId).single();
      setTeam(data || null);
      if (data?.ai_enabled) {
        try {
          const res = await fetch(`/api/ai-coach/chat?teamId=${teamId}`);
          const json = await res.json();
          if (res.ok) setMessages(json.messages || []);
        } catch {}
      }
      setLoading(false);
    })();
  }, [teamId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, busy]);

  async function send(text) {
    const message = (text ?? draft).trim();
    if (!message || busy) return;
    setBusy(true); setError(null); setDraft("");
    setMessages((m) => [...m, { id: `tmp-${Date.now()}`, role: "user", content: message }]);
    try {
      const res = await fetch("/api/ai-coach/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "The assistant coach couldn't answer.");
      setMessages((m) => [...m, { id: `tmp-a-${Date.now()}`, role: "assistant", content: data.reply }]);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function clearChat() {
    if (!(await confirmDialog({ title: "Clear this conversation?", message: "The assistant coach will forget it.", confirmLabel: "Clear chat", danger: true }))) return;
    await fetch(`/api/ai-coach/chat?teamId=${teamId}`, { method: "DELETE" });
    setMessages([]); setError(null);
  }

  if (team === undefined || loading) return <Spinner />;

  if (!team?.ai_enabled) {
    return (
      <div className="max-w-2xl">
        <Card className="border-blue-500/25 text-center">
          <div className="text-5xl mb-3">💬</div>
          <h3 className="font-bold text-lg mb-2">Chat with your AI Assistant Coach</h3>
          <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
            Ask anything about your team &mdash; lineups, practice ideas, what to tell parents &mdash; and get answers grounded in your real roster, schedule, and stats. Available as a paid add-on on your team&apos;s Billing page.
          </p>
          <a href="/pricing" target="_blank" className="inline-block bg-[var(--color-accent-green)] text-white font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-green-500 transition-all">
            Learn more
          </a>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xl font-bold">💬 Coach Chat</h2>
          <p className="text-slate-400 text-sm">
            Ask your assistant coach anything about {team.name}. It knows your roster, schedule, results, and stats.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/teams/${teamId}/ai-coach`} className="text-sm text-slate-400 hover:text-white transition-colors">
            ← AI Coach tools
          </Link>
          {messages.length > 0 && (
            <Button variant="ghost" onClick={clearChat}>Clear chat</Button>
          )}
        </div>
      </div>

      {messages.length === 0 && !busy && (
        <Card className="mb-4">
          <p className="text-slate-400 text-sm mb-3">Try one of these to start:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => send(s)}
                className="text-xs text-slate-300 bg-white/[0.04] border border-white/10 rounded-full px-3 py-1.5 hover:bg-white/[0.08] transition-colors">
                {s}
              </button>
            ))}
          </div>
        </Card>
      )}

      <div className="space-y-3 mb-4">
        {messages.map((m) => (
          <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div className={
              m.role === "user"
                ? "max-w-[85%] bg-[var(--color-accent-green)]/15 border border-green-500/20 rounded-2xl rounded-br-md px-4 py-2.5"
                : "max-w-[85%] bg-white/[0.04] border border-white/10 rounded-2xl rounded-bl-md px-4 py-2.5"
            }>
              <p className="text-slate-200 text-sm whitespace-pre-wrap leading-relaxed">{m.content}</p>
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex justify-start">
            <div className="bg-white/[0.04] border border-white/10 rounded-2xl rounded-bl-md px-4 py-2.5">
              <p className="text-slate-500 text-sm">Reading your team&hellip;</p>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <ErrorText>{error}</ErrorText>

      <div className="flex items-end gap-2">
        <TextArea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
          }}
          rows={2}
          placeholder="Ask your assistant coach... (Enter to send, Shift+Enter for a new line)"
          className="flex-1"
        />
        <Button variant="green" onClick={() => send()} disabled={busy || !draft.trim()}>
          {busy ? "..." : "Send"}
        </Button>
      </div>
      <p className="text-xs text-slate-600 mt-3">
        AI-generated advice grounded in your team&apos;s data &mdash; use your coaching judgment. Conversations are private to you.
      </p>
    </div>
  );
}
