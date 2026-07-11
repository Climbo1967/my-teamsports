"use client";

import { use, useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input, Label, Button, Card, EmptyState, ErrorText, Spinner, TextArea } from "@/components/ui";

// Coach-side board: thread creation, lock, and post soft-delete. Parents are
// reply-only and come in through the passcode RPCs — coaches work directly
// against the tables under RLS. Coach posts push (via /api/board/notify);
// parent replies never do.
export default function BoardPage({ params }) {
  const { teamId } = use(params);
  const supabase = createClient();
  const [team, setTeam] = useState(null);
  const [threads, setThreads] = useState(null);
  const [posts, setPosts] = useState([]);
  const [userId, setUserId] = useState(null);
  const [title, setTitle] = useState("");
  const [firstMessage, setFirstMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    const [{ data: t }, { data: th, error: err }, { data: po }, { data: { user } }] = await Promise.all([
      supabase.from("teams").select("id, name, board_enabled").eq("id", teamId).single(),
      supabase.from("team_board_threads").select("*").eq("team_id", teamId)
        .order("created_at", { ascending: false }),
      supabase.from("team_board_posts").select("*").eq("team_id", teamId)
        .order("created_at", { ascending: true }),
      supabase.auth.getUser(),
    ]);
    if (err) setError(err.message);
    setTeam(t || null);
    setThreads(th || []);
    setPosts(po || []);
    setUserId(user?.id || null);
  }, [teamId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  function notifyTeam(threadTitle, body) {
    // Fire-and-forget: a push hiccup should never block the post itself.
    fetch("/api/board/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId, title: threadTitle, body }),
    }).catch(() => {});
  }

  async function createThread(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const cleanTitle = title.trim();
    const { data: thread, error: err } = await supabase
      .from("team_board_threads")
      .insert({ team_id: teamId, title: cleanTitle, created_by_coach: userId })
      .select()
      .single();
    if (err) { setBusy(false); setError(err.message); return; }
    const cleanFirst = firstMessage.trim();
    if (cleanFirst) {
      const { error: postErr } = await supabase.from("team_board_posts").insert({
        thread_id: thread.id, team_id: teamId, author_coach: userId, body: cleanFirst,
      });
      if (postErr) { setBusy(false); setError(postErr.message); return; }
    }
    setBusy(false);
    setTitle("");
    setFirstMessage("");
    notifyTeam(cleanTitle, cleanFirst || "The coach started a new thread.");
    load();
  }

  async function toggleLock(t) {
    await supabase.from("team_board_threads").update({ locked: !t.locked }).eq("id", t.id);
    load();
  }

  async function removeThread(t) {
    if (!confirm("Delete this thread and all its replies? This can't be undone.")) return;
    const { error: err } = await supabase.from("team_board_threads").delete().eq("id", t.id);
    if (err) { setError(err.message); return; }
    load();
  }

  async function softDelete(p) {
    await supabase.from("team_board_posts")
      .update({ deleted_at: new Date().toISOString() }).eq("id", p.id);
    load();
  }

  async function restore(p) {
    await supabase.from("team_board_posts").update({ deleted_at: null }).eq("id", p.id);
    load();
  }

  if (!threads || !team) return <Spinner />;

  return (
    <div className="max-w-3xl">
      {!team.board_enabled && (
        <Card className="mb-8 border-yellow-500/25">
          <p className="text-sm text-slate-300">
            The board isn&apos;t enabled for this team yet, so parents can&apos;t see it.
            Anything you set up here goes live the moment it&apos;s switched on.
          </p>
        </Card>
      )}

      <Card className="mb-8 border-blue-500/25">
        <h3 className="font-bold text-lg mb-4">START A THREAD</h3>
        <p className="text-sm text-slate-400 mb-4">
          Only coaches can start threads. Parents can reply with their name — no accounts needed.
        </p>
        <form onSubmit={createThread} className="space-y-4">
          <div>
            <Label>Topic *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={150} required placeholder="Carpool for Saturday's tournament" />
          </div>
          <div>
            <Label>First message (optional)</Label>
            <TextArea value={firstMessage} onChange={(e) => setFirstMessage(e.target.value)} rows={2} maxLength={1000} placeholder="Kick things off — parents reply below it." />
          </div>
          <ErrorText>{error}</ErrorText>
          <Button type="submit" variant="green" disabled={busy || !title.trim()}>
            {busy ? "Posting..." : "Start thread"}
          </Button>
        </form>
      </Card>

      {threads.length === 0 ? (
        <EmptyState icon="🗣️" text="No threads yet. Start one above — announcements can also open threads automatically." />
      ) : (
        <div className="space-y-6">
          {threads.map((t) => (
            <ThreadCard
              key={t.id}
              thread={t}
              posts={posts.filter((p) => p.thread_id === t.id)}
              userId={userId}
              supabase={supabase}
              teamId={teamId}
              onLock={() => toggleLock(t)}
              onDelete={() => removeThread(t)}
              onSoftDelete={softDelete}
              onRestore={restore}
              onReplied={(body) => { notifyTeam(t.title, body); load(); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ThreadCard({ thread, posts, userId, supabase, teamId, onLock, onDelete, onSoftDelete, onRestore, onReplied }) {
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function submitReply(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const clean = reply.trim();
    const { error: err } = await supabase.from("team_board_posts").insert({
      thread_id: thread.id, team_id: teamId, author_coach: userId, body: clean,
    });
    setBusy(false);
    if (err) { setError(err.message); return; }
    setReply("");
    onReplied(clean);
  }

  return (
    <Card className={thread.locked ? "border-yellow-500/30" : ""}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          {thread.locked && <span className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">🔒 Locked</span>}
          {thread.announcement_id && <span className="text-xs font-semibold text-[var(--color-accent-blue)] uppercase tracking-wider ml-2 first:ml-0">📣 From announcement</span>}
          <h4 className="font-bold text-white">{thread.title}</h4>
        </div>
        <span className="text-xs text-slate-500 whitespace-nowrap">
          {new Date(thread.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </span>
      </div>

      <div className="space-y-2">
        {posts.length === 0 && <p className="text-sm text-slate-500">No replies yet.</p>}
        {posts.map((p) => (
          <div key={p.id} className={`rounded-lg px-3 py-2 ${p.deleted_at ? "bg-red-500/[0.04] border border-red-500/15 opacity-60" : "bg-white/[0.03]"}`}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-white">
                {p.author_coach ? "🧢 Coach" : p.author_name}
                {p.deleted_at && <span className="ml-2 text-xs text-red-400">removed</span>}
              </p>
              <span className="text-xs text-slate-500 whitespace-nowrap">
                {new Date(p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}{" "}
                {new Date(p.created_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
              </span>
            </div>
            <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">{p.body}</p>
            <div className="text-right mt-1">
              {p.deleted_at ? (
                <button onClick={() => onRestore(p)} className="text-xs text-slate-400 hover:text-white">Restore</button>
              ) : (
                <button onClick={() => onSoftDelete(p)} className="text-xs text-red-400 hover:underline">Remove</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {!thread.locked && (
        <form onSubmit={submitReply} className="mt-3 flex gap-2">
          <input
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            maxLength={1000}
            placeholder="Reply as coach…"
            className="flex-1 bg-white/[0.05] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[var(--color-accent-blue)]"
          />
          <button
            type="submit"
            disabled={busy || !reply.trim()}
            className="bg-[var(--color-accent-blue)] hover:bg-blue-600 text-white text-sm font-semibold px-4 rounded-lg transition-all disabled:opacity-50"
          >
            {busy ? "…" : "Reply"}
          </button>
        </form>
      )}
      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}

      <div className="flex gap-4 mt-3 pt-3 border-t border-white/[0.06]">
        <button onClick={onLock} className="text-xs text-slate-400 hover:text-white">
          {thread.locked ? "🔓 Unlock thread" : "🔒 Lock thread"}
        </button>
        <button onClick={onDelete} className="text-xs text-red-400 hover:underline">Delete thread</button>
      </div>
    </Card>
  );
}
