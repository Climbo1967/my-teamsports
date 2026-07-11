"use client";

import { useEffect, useState } from "react";

// Parent-facing team board. Rendered only when the team's board_enabled flag
// is on (the server checks before mounting this). Parents are reply-only and
// post with a typed display name — text only, no images, no DMs.
export default function BoardSection({ slug }) {
  const [board, setBoard] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    async function poll() {
      try {
        const res = await fetch(`/api/board?slug=${encodeURIComponent(slug)}`, { cache: "no-store" });
        if (!res.ok) return;
        const json = await res.json();
        if (active) { setBoard(json.board || null); setLoaded(true); }
      } catch {
        // ignore — try again next tick
      }
    }
    poll();
    const id = setInterval(poll, 30000);
    // A successful reply dispatches this so the new post shows immediately
    // instead of waiting out the poll interval.
    window.addEventListener("mts-board-refresh", poll);
    return () => {
      active = false;
      clearInterval(id);
      window.removeEventListener("mts-board-refresh", poll);
    };
  }, [slug]);

  const threads = board?.threads || [];

  return (
    <section id="board" className="scroll-mt-20">
      <h2 className="text-2xl md:text-3xl font-bold mb-2">🗣️ TEAM BOARD</h2>
      <p className="text-slate-400 text-sm mb-6">
        Reply to the coach&apos;s threads below. Keep it positive — the whole team can read this.
      </p>
      {!loaded ? null : threads.length === 0 ? (
        <div className="bg-white/[0.02] border border-dashed border-white/[0.08] rounded-2xl p-10 text-center">
          <p className="text-slate-500">No threads yet — the coach will start the first conversation.</p>
        </div>
      ) : (
        <div className="space-y-6 max-w-3xl">
          {threads.map((t) => <Thread key={t.id} thread={t} slug={slug} />)}
        </div>
      )}
    </section>
  );
}

function Thread({ thread, slug }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
      <div className="flex items-start justify-between gap-3 mb-4">
        <h3 className="font-bold text-white text-lg">
          {thread.title}
          {thread.locked && (
            <span className="ml-2 text-xs font-semibold text-yellow-400 uppercase tracking-wider">🔒 Locked</span>
          )}
        </h3>
        <span className="text-xs text-slate-500 whitespace-nowrap">
          {new Date(thread.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </span>
      </div>

      <div className="space-y-3">
        {thread.posts.length === 0 && (
          <p className="text-sm text-slate-500">No replies yet — be the first.</p>
        )}
        {thread.posts.map((p) => <Post key={p.id} post={p} slug={slug} />)}
      </div>

      {!thread.locked ? (
        <ReplyForm threadId={thread.id} slug={slug} />
      ) : (
        <p className="text-xs text-slate-500 mt-4 pt-4 border-t border-white/[0.06]">
          The coach locked this thread — no new replies.
        </p>
      )}
    </div>
  );
}

function Post({ post, slug }) {
  const [reported, setReported] = useState(false);
  const [error, setError] = useState(null);

  async function report() {
    if (!confirm("Report this post to the coach?")) return;
    setError(null);
    const res = await fetch("/api/board/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, postId: post.id }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Could not send the report. Try again.");
      return;
    }
    setReported(true);
  }

  return (
    <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-3">
      <div className="flex items-center justify-between gap-3 mb-1">
        <p className="text-sm font-semibold text-white">
          {post.is_coach ? (
            <>
              {post.author_name || "Coach"}
              <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-[var(--color-accent-blue)] bg-blue-500/10 border border-blue-500/25 rounded-full px-2 py-0.5">
                Coach
              </span>
            </>
          ) : (
            post.author_name
          )}
        </p>
        <span className="text-xs text-slate-500 whitespace-nowrap">
          {new Date(post.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}{" "}
          {new Date(post.created_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
        </span>
      </div>
      <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">{post.body}</p>
      <div className="mt-1.5 text-right">
        {reported ? (
          <span className="text-xs text-slate-500">✓ Reported to the coach</span>
        ) : (
          <button onClick={report} className="text-xs text-slate-600 hover:text-red-400 transition-colors">
            Report
          </button>
        )}
      </div>
      {error && <p className="text-red-400 text-xs mt-1 text-right">{error}</p>}
    </div>
  );
}

function ReplyForm({ threadId, slug }) {
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  // Remember the display name on this device, like the RSVP player picker.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`mts_board_name_${slug}`);
      if (saved) setName(saved);
    } catch {}
  }, [slug]);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try { localStorage.setItem(`mts_board_name_${slug}`, name.trim()); } catch {}
    const res = await fetch("/api/board/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, threadId, name, body }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Could not post your reply. Try again.");
      return;
    }
    setBody("");
    window.dispatchEvent(new Event("mts-board-refresh"));
  }

  return (
    <form onSubmit={submit} className="mt-4 pt-4 border-t border-white/[0.06] space-y-3">
      <div className="flex flex-wrap gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={40}
          required
          placeholder="Your name"
          className="flex-1 min-w-[140px] bg-white/[0.05] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[var(--color-accent-blue)]"
        />
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        maxLength={1000}
        rows={2}
        required
        placeholder="Write a reply… (text only)"
        className="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[var(--color-accent-blue)]"
      />
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-slate-600">{body.length}/1000</span>
        <button
          type="submit"
          disabled={busy || !name.trim() || !body.trim()}
          className="bg-[var(--color-accent-blue)] hover:bg-blue-600 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-all disabled:opacity-50"
        >
          {busy ? "Posting…" : "Reply"}
        </button>
      </div>
    </form>
  );
}
