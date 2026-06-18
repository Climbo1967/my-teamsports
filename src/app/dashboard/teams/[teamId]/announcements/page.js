"use client";

import { use, useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input, Label, Button, Card, EmptyState, ErrorText, Spinner, TextArea } from "@/components/ui";

export default function AnnouncementsPage({ params }) {
  const { teamId } = use(params);
  const supabase = createClient();
  const [posts, setPosts] = useState(null);
  const [subscribers, setSubscribers] = useState([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [sendingId, setSendingId] = useState(null);
  const [sentIds, setSentIds] = useState([]);

  const load = useCallback(async () => {
    const [{ data, error: err }, { data: subs }] = await Promise.all([
      supabase.from("announcements").select("*").eq("team_id", teamId)
        .order("pinned", { ascending: false }).order("created_at", { ascending: false }),
      supabase.from("subscribers").select("email").eq("team_id", teamId),
    ]);
    if (err) setError(err.message);
    setPosts(data || []);
    setSubscribers(subs || []);
  }, [teamId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  async function post(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.from("announcements").insert({
      team_id: teamId,
      title: title.trim() || null,
      body: body.trim(),
    });
    setBusy(false);
    if (err) { setError(err.message); return; }
    setTitle("");
    setBody("");
    load();
  }

  async function togglePin(p) {
    await supabase.from("announcements").update({ pinned: !p.pinned }).eq("id", p.id);
    load();
  }

  async function remove(p) {
    if (!confirm("Delete this post?")) return;
    await supabase.from("announcements").delete().eq("id", p.id);
    load();
  }

  async function emailPost(p) {
    setSendingId(p.id);
    setError(null);
    try {
      const res = await fetch("/api/send-announcement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId, subject: p.title || "Team update", body: p.body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not send email.");
      setSentIds((ids) => [...ids, p.id]);
    } catch (e) {
      setError(e.message);
    } finally {
      setSendingId(null);
    }
  }

  if (!posts) return <Spinner />;

  return (
    <div className="max-w-3xl">
      <Card className="mb-8 border-blue-500/25">
        <h3 className="font-bold text-lg mb-4">POST TO THE TEAM</h3>
        <form onSubmit={post} className="space-y-4">
          <div>
            <Label>Title (optional)</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} placeholder="Saturday's game moved to 2pm" />
          </div>
          <div>
            <Label>Message *</Label>
            <TextArea value={body} onChange={(e) => setBody(e.target.value)} rows={3} maxLength={4000} required placeholder="Keep it informational, uplifting, and positive — the whole team sees this." />
          </div>
          <ErrorText>{error}</ErrorText>
          <Button type="submit" variant="green" disabled={busy || !body.trim()}>
            {busy ? "Posting..." : "Post announcement"}
          </Button>
        </form>
      </Card>

      {posts.length === 0 ? (
        <EmptyState icon="💬" text="No announcements yet. Your first post will appear at the top of the team site." />
      ) : (
        <div className="space-y-4">
          {posts.map((p) => (
            <Card key={p.id} className={p.pinned ? "border-yellow-500/30" : ""}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  {p.pinned && <span className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">📌 Pinned</span>}
                  {p.title && <h4 className="font-bold text-white">{p.title}</h4>}
                </div>
                <span className="text-xs text-slate-500 whitespace-nowrap">
                  {new Date(p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
              <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">{p.body}</p>
              <div className="flex gap-4 mt-3">
                <button onClick={() => togglePin(p)} className="text-xs text-slate-400 hover:text-white">
                  {p.pinned ? "Unpin" : "📌 Pin to top"}
                </button>
                {subscribers.length > 0 && (
                  <button
                    onClick={() => emailPost(p)}
                    disabled={sendingId === p.id || sentIds.includes(p.id)}
                    className="text-xs text-[var(--color-accent-green)] hover:underline disabled:opacity-60 disabled:no-underline"
                  >
                    {sendingId === p.id
                      ? "Sending..."
                      : sentIds.includes(p.id)
                      ? `✓ Emailed ${subscribers.length} subscriber${subscribers.length === 1 ? "" : "s"}`
                      : `✉️ Email to ${subscribers.length} subscriber${subscribers.length === 1 ? "" : "s"}`}
                  </button>
                )}
                <button onClick={() => remove(p)} className="text-xs text-red-400 hover:underline">Delete</button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
