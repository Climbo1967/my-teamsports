"use client";

import { use, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input, Label, Button, Card, TextArea, ErrorText } from "@/components/ui";

export default function SupportPage({ params }) {
  const { teamId } = use(params);
  const supabase = createClient();
  const [teamName, setTeamName] = useState(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    supabase.from("teams").select("name").eq("id", teamId).single().then(({ data }) => {
      if (data) setTeamName(data.name);
    });
  }, [teamId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message, teamId, teamName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not submit.");
      setSent(true);
      setSubject("");
      setMessage("");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <Card className="border-blue-500/25">
        <h3 className="font-bold text-lg mb-1">🛟 GET SUPPORT</h3>
        <p className="text-sm text-slate-400 mb-5">
          Found a bug, have a question, or want to suggest a feature? Send it straight to the My-Team Sports team — we read every one.
        </p>
        {sent ? (
          <div className="bg-green-500/10 border border-green-500/25 rounded-lg p-6 text-center">
            <div className="text-3xl mb-2">✅</div>
            <p className="text-white font-semibold mb-1">Thanks — we got it.</p>
            <p className="text-sm text-slate-400">We&apos;ll reply by email to your account address.</p>
            <button onClick={() => setSent(false)} className="mt-4 text-sm text-[var(--color-accent-blue)] hover:underline">
              Send another
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label>Subject *</Label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={150} required placeholder="Scores aren't saving on my phone" />
            </div>
            <div>
              <Label>What&apos;s going on? *</Label>
              <TextArea value={message} onChange={(e) => setMessage(e.target.value)} rows={6} maxLength={5000} required placeholder="Describe what happened, what you expected, and which page you were on." />
            </div>
            <ErrorText>{error}</ErrorText>
            <Button type="submit" variant="green" disabled={busy || !subject.trim() || !message.trim()}>
              {busy ? "Sending..." : "Send to support"}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
