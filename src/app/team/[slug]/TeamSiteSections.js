"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { STAT_KEYS, DERIVED_STATS, formatDerived } from "@/lib/constants";
import { videoEmbedUrl } from "@/lib/video";
import PlayField from "@/components/PlayField";
import BoardSection from "./BoardSection";

const NAV = [
  { id: "announcements", label: "News", icon: "💬" },
  { id: "schedule", label: "Schedule", icon: "📅" },
  { id: "roster", label: "Roster", icon: "📋" },
  { id: "stats", label: "Stats", icon: "📊" },
  { id: "videos", label: "Game Film", icon: "🎬" },
  { id: "notes", label: "Coach's Notes", icon: "📝" },
  { id: "photos", label: "Photos", icon: "📸" },
];

export default function TeamSiteSections({ site, slug, emoji }) {
  const { team, players, events, announcements, notes, photos } = site;
  const stats = site.stats || [];
  const rsvps = site.rsvps || [];
  const videos = site.videos || [];
  const plays = site.plays || [];
  const [activePlayer, setActivePlayer] = useState(null);
  const [lightbox, setLightbox] = useState(null);

  const playerById = useMemo(() => {
    const map = {};
    for (const p of players) map[p.id] = p;
    return map;
  }, [players]);

  const playerPhotos = (playerId) => photos.filter((ph) => ph.player_id === playerId);

  const playbookNav = plays.length ? [{ id: "playbook", label: "Playbook", icon: "✏️" }] : [];
  // Board rides the ships-dark flag: no nav item, no section unless enabled.
  const boardNav = team.board_enabled ? [{ id: "board", label: "Board", icon: "🗣️" }] : [];
  const navItems = [...NAV.slice(0, 1), ...boardNav, ...NAV.slice(1, 4), ...playbookNav, ...NAV.slice(4)];

  return (
    <>
      {/* SECTION NAV */}
      <nav className="sticky top-0 z-40 bg-[var(--color-navy)]/95 backdrop-blur-xl border-b border-white/5 px-4 overflow-x-auto">
        <div className="max-w-[1100px] mx-auto flex gap-1">
          {navItems.map((n) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              className="whitespace-nowrap px-4 py-3.5 text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              <span className="mr-1.5">{n.icon}</span>
              {n.label}
            </a>
          ))}
        </div>
      </nav>

      <main className="max-w-[1100px] mx-auto px-6 py-12 space-y-16">
        <AnnouncementsSection announcements={announcements} slug={slug} />
        {team.board_enabled && <BoardSection slug={slug} />}
        <ScheduleSection events={events} players={players} rsvps={rsvps} slug={slug} />
        <RosterSection players={players} emoji={emoji} onSelect={setActivePlayer} />
        <StatsSection players={players} stats={stats} sport={team.sport} />
        <PlaybookSection plays={plays} sport={team.sport} />
        <VideosSection videos={videos} />
        <NotesSection notes={notes} />
        <PhotosSection
          photos={photos}
          players={players}
          slug={slug}
          playerById={playerById}
          onView={setLightbox}
        />
      </main>

      {activePlayer && (
        <PlayerModal
          player={activePlayer}
          emoji={emoji}
          photos={playerPhotos(activePlayer.id)}
          stats={stats.filter((s) => s.player_id === activePlayer.id)}
          sport={team.sport}
          onClose={() => setActivePlayer(null)}
          onViewPhoto={setLightbox}
        />
      )}

      {lightbox && (
        <Lightbox photo={lightbox} playerById={playerById} slug={slug} onClose={() => setLightbox(null)} />
      )}
    </>
  );
}

/* ---------- Announcements ---------- */
function AnnouncementsSection({ announcements, slug }) {
  return (
    <section id="announcements" className="scroll-mt-20">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl md:text-3xl font-bold">💬 TEAM NEWS</h2>
        <SubscribeButton slug={slug} />
      </div>
      {announcements.length === 0 && (
        <Empty text="No announcements yet — subscribe above and you won't miss the first one." />
      )}
      <div className="space-y-4 max-w-3xl">
        {announcements.map((a) => (
          <div
            key={a.id}
            className={`bg-white/[0.03] border rounded-2xl p-6 ${a.pinned ? "border-yellow-500/30" : "border-white/[0.06]"}`}
          >
            <div className="flex items-start justify-between gap-3 mb-1.5">
              <div>
                {a.pinned && <span className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">📌 Pinned</span>}
                {a.title && <h3 className="font-bold text-white text-lg">{a.title}</h3>}
              </div>
              <span className="text-xs text-slate-500 whitespace-nowrap">
                {new Date(a.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </div>
            <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">{a.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- Schedule ---------- */
function ScheduleSection({ events, players, rsvps, slug }) {
  const now = Date.now();
  const upcoming = events.filter((e) => new Date(e.starts_at) >= now);
  const past = events.filter((e) => new Date(e.starts_at) < now).reverse();

  return (
    <section id="schedule" className="scroll-mt-20">
      <h2 className="text-2xl md:text-3xl font-bold mb-6">📅 SCHEDULE</h2>
      {events.length === 0 ? (
        <Empty text="No games or practices posted yet. Check back soon!" />
      ) : (
        <div className="space-y-10">
          {upcoming.length > 0 && (
            <div className="space-y-3">
              {upcoming.map((e) => (
                <EventCard key={e.id} event={e} players={players} rsvps={rsvps.filter((r) => r.event_id === e.id)} slug={slug} />
              ))}
            </div>
          )}
          {past.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-500 mb-3">Results &amp; past events</h3>
              <div className="space-y-3">
                {past.map((e) => <EventCard key={e.id} event={e} past players={players} rsvps={[]} slug={slug} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function EventCard({ event, past, players, rsvps, slug }) {
  const d = new Date(event.starts_at);
  return (
    <div className={`bg-white/[0.03] border border-white/[0.06] rounded-xl px-6 py-4 ${past ? "opacity-85" : ""}`}>
      <div className="flex flex-wrap items-center gap-4">
        <div className="text-center min-w-[64px]">
          <p className="text-xs uppercase tracking-widest text-slate-500">{d.toLocaleDateString("en-US", { month: "short" })}</p>
          <p className="text-2xl font-bold text-white">{d.getDate()}</p>
        </div>
        <div className="flex-1 min-w-[200px]">
          <p className="font-semibold text-white">
            {event.event_type === "game" && event.opponent
              ? `vs ${event.opponent}`
              : event.title || (event.event_type === "practice" ? "Practice" : "Team Event")}
            {event.result && <span className="ml-2 text-[var(--color-accent-green)] font-bold">{event.result}</span>}
          </p>
          <p className="text-sm text-slate-400">
            {d.toLocaleDateString("en-US", { weekday: "short" })} · {d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
            {event.location ? ` · ${event.location}` : ""}
          </p>
          {event.notes && <p className="text-xs text-slate-500 mt-1">{event.notes}</p>}
        </div>
        <span className={`text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full ${
          event.event_type === "game"
            ? "bg-blue-500/10 text-[var(--color-accent-blue)] border border-blue-500/25"
            : "bg-green-500/10 text-green-400 border border-green-500/25"
        }`}>
          {event.event_type}
        </span>
      </div>
      {!past && players.length > 0 && (
        <RsvpWidget event={event} players={players} rsvps={rsvps} slug={slug} />
      )}
    </div>
  );
}

function RsvpWidget({ event, players, rsvps, slug }) {
  const router = useRouter();
  const [playerId, setPlayerId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  // Remember which player this device belongs to
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`mts_player_${slug}`);
      if (saved && players.some((p) => p.id === saved)) setPlayerId(saved);
    } catch {}
  }, [slug, players]);

  const going = rsvps.filter((r) => r.status === "going").length;
  const maybe = rsvps.filter((r) => r.status === "maybe").length;
  const out = rsvps.filter((r) => r.status === "not_going").length;
  const mine = rsvps.find((r) => r.player_id === playerId)?.status;

  async function respond(status) {
    if (!playerId) { setError("Pick your player first."); return; }
    setBusy(true);
    setError(null);
    try { localStorage.setItem(`mts_player_${slug}`, playerId); } catch {}
    const res = await fetch("/api/rsvp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, eventId: event.id, playerId, status }),
    });
    setBusy(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Could not save. Try again.");
      return;
    }
    router.refresh();
  }

  const btn = (status, label, activeClass) => (
    <button
      onClick={() => respond(status)}
      disabled={busy}
      className={`text-xs font-semibold px-3.5 py-2 rounded-lg border transition-all disabled:opacity-50 ${
        mine === status
          ? activeClass
          : "border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="mt-3 pt-3 border-t border-white/[0.06]">
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={playerId}
          onChange={(e) => setPlayerId(e.target.value)}
          className="bg-white/[0.05] border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[var(--color-accent-blue)] [&>option]:bg-[#132140]"
        >
          <option value="">Who's RSVPing?</option>
          {players.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        {btn("going", "✓ Going", "border-green-500/50 bg-green-500/15 text-green-400")}
        {btn("maybe", "? Maybe", "border-yellow-500/50 bg-yellow-500/15 text-yellow-400")}
        {btn("not_going", "✗ Can't", "border-red-500/50 bg-red-500/15 text-red-400")}
        {(going > 0 || maybe > 0 || out > 0) && (
          <span className="text-xs text-slate-500 ml-auto">
            <span className="text-green-400 font-semibold">{going} going</span>
            {maybe > 0 && ` · ${maybe} maybe`}
            {out > 0 && ` · ${out} out`}
          </span>
        )}
      </div>
      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
    </div>
  );
}

/* ---------- Roster ---------- */
function RosterSection({ players, emoji, onSelect }) {
  return (
    <section id="roster" className="scroll-mt-20">
      <h2 className="text-2xl md:text-3xl font-bold mb-6">📋 TEAM ROSTER</h2>
      {players.length === 0 ? (
        <Empty text="The roster is being put together. Players coming soon!" />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {players.map((player) => (
            <button
              key={player.id}
              onClick={() => onSelect(player)}
              className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 text-center hover:border-blue-500/30 hover:bg-white/[0.05] hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              {player.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={player.photo_url} alt={player.name} className="w-20 h-20 mx-auto mb-3 rounded-full object-cover border border-white/10" />
              ) : (
                <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-700/20 border border-white/10 flex items-center justify-center text-2xl">
                  {emoji}
                </div>
              )}
              {player.jersey_number && (
                <p className="font-[family-name:var(--font-oswald)] text-2xl font-bold text-[var(--color-accent-blue)]">#{player.jersey_number}</p>
              )}
              <p className="font-semibold text-white">{player.name}</p>
              {player.position && <p className="text-xs text-slate-500 mt-0.5">{player.position}</p>}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

function PlayerModal({ player, emoji, photos, stats, sport, onClose, onViewPhoto }) {
  const keys = STAT_KEYS[sport] || STAT_KEYS.other;
  const derived = DERIVED_STATS[sport] || DERIVED_STATS.other;
  const statTotal = (key) => stats.find((s) => s.stat_key === key)?.total;
  const hasStats = stats.length > 0;
  const totals = {};
  let gp = 0;
  for (const s of stats) {
    totals[s.stat_key] = Number(s.total);
    gp = Math.max(gp, Number(s.games) || 0);
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-[var(--color-navy-mid)] border border-white/10 rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-8 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {player.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={player.photo_url} alt={player.name} className="w-32 h-32 mx-auto mb-4 rounded-full object-cover border-2 border-blue-500/30" />
        ) : (
          <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-700/20 border border-white/10 flex items-center justify-center text-5xl">
            {emoji}
          </div>
        )}
        {player.jersey_number && (
          <p className="font-[family-name:var(--font-oswald)] text-4xl font-bold text-[var(--color-accent-blue)]">#{player.jersey_number}</p>
        )}
        <h3 className="text-2xl font-bold text-white mb-1">{player.name}</h3>
        {player.position && <p className="text-slate-400 mb-4">{player.position}</p>}
        {player.bio && <p className="text-slate-300 text-sm leading-relaxed mb-5 whitespace-pre-wrap">{player.bio}</p>}

        {hasStats && (
          <div className="mb-5">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">
              Season stats{gp > 0 ? ` · ${gp} game${gp === 1 ? "" : "s"}` : ""}
            </h4>
            <div className="flex flex-wrap justify-center gap-3">
              {keys.map((k) => {
                const total = statTotal(k.key);
                if (total === undefined) return null;
                return (
                  <div key={k.key} className="bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2.5 min-w-[64px]" title={k.label}>
                    <p className="font-[family-name:var(--font-oswald)] text-2xl font-bold text-[var(--color-accent-blue)]">{Number(total)}</p>
                    <p className="text-[10px] uppercase tracking-widest text-slate-500">{k.abbr}</p>
                  </div>
                );
              })}
              {derived.map((dk) => {
                const formatted = formatDerived(dk.compute(totals, gp), dk.format);
                if (formatted === null) return null;
                return (
                  <div key={dk.abbr} className="bg-blue-500/10 border border-blue-500/30 rounded-xl px-4 py-2.5 min-w-[64px]" title={dk.label}>
                    <p className="font-[family-name:var(--font-oswald)] text-2xl font-bold text-[var(--color-accent-green)]">{formatted}</p>
                    <p className="text-[10px] uppercase tracking-widest text-slate-500">{dk.abbr}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {photos.length > 0 && (
          <div className="text-left">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Action shots</h4>
            <div className="grid grid-cols-3 gap-2">
              {photos.map((ph) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={ph.id}
                  src={ph.url}
                  alt={ph.caption || player.name}
                  className="w-full aspect-square object-cover rounded-lg cursor-pointer hover:opacity-80"
                  onClick={() => onViewPhoto(ph)}
                  loading="lazy"
                />
              ))}
            </div>
          </div>
        )}

        <button onClick={onClose} className="mt-6 text-sm text-slate-400 hover:text-white border border-white/10 px-6 py-2.5 rounded-lg transition-colors">
          Close
        </button>
      </div>
    </div>
  );
}

/* ---------- Stats ---------- */
function playerTotals(stats, playerId) {
  const totals = {};
  let gp = 0;
  for (const s of stats) {
    if (s.player_id !== playerId) continue;
    totals[s.stat_key] = Number(s.total);
    gp = Math.max(gp, Number(s.games) || 0);
  }
  return { totals, gp };
}

function StatsSection({ players, stats, sport }) {
  if (stats.length === 0) return null;
  const keys = STAT_KEYS[sport] || STAT_KEYS.other;
  const derived = DERIVED_STATS[sport] || DERIVED_STATS.other;
  const playersWithStats = players.filter((p) => stats.some((s) => s.player_id === p.id));
  const rows = playersWithStats.map((p) => ({ player: p, ...playerTotals(stats, p.id) }));
  const firstKey = keys[0]?.key;
  rows.sort((a, b) => (b.totals[firstKey] || 0) - (a.totals[firstKey] || 0));

  return (
    <section id="stats" className="scroll-mt-20">
      <h2 className="text-2xl md:text-3xl font-bold mb-6">📊 SEASON STATS</h2>
      <div className="overflow-x-auto rounded-2xl border border-white/[0.06]">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.04]">
            <tr className="text-left">
              <th className="py-3 px-4 text-slate-400 font-medium">Player</th>
              <th className="py-3 px-3 text-slate-400 font-medium text-center" title="Games Played">GP</th>
              {keys.map((k) => (
                <th key={k.key} className="py-3 px-3 text-slate-400 font-medium text-center" title={k.label}>{k.abbr}</th>
              ))}
              {derived.map((dk) => (
                <th key={dk.abbr} className="py-3 px-3 text-[var(--color-accent-blue)] font-semibold text-center" title={dk.label}>{dk.abbr}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ player: p, totals, gp }) => (
              <tr key={p.id} className="border-t border-white/[0.05] hover:bg-white/[0.02]">
                <td className="py-3 px-4 text-white whitespace-nowrap">
                  {p.jersey_number ? <span className="text-[var(--color-accent-blue)] font-bold">#{p.jersey_number} </span> : ""}{p.name}
                </td>
                <td className="py-3 px-3 text-center text-slate-400 font-mono">{gp || "—"}</td>
                {keys.map((k) => {
                  const v = totals[k.key];
                  return (
                    <td key={k.key} className="py-3 px-3 text-center text-slate-300 font-mono">
                      {v === undefined ? <span className="text-slate-700">—</span> : v}
                    </td>
                  );
                })}
                {derived.map((dk) => {
                  const formatted = formatDerived(dk.compute(totals, gp), dk.format);
                  return (
                    <td key={dk.abbr} className="py-3 px-3 text-center text-[var(--color-accent-blue)] font-mono font-semibold">
                      {formatted === null ? <span className="text-slate-700">—</span> : formatted}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* ---------- Subscribe ---------- */
function SubscribeButton({ slug }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, email, name }),
    });
    setBusy(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Could not subscribe. Try again.");
      return;
    }
    setDone(true);
    setTimeout(() => { setOpen(false); setDone(false); setEmail(""); setName(""); }, 1800);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-sm font-semibold text-[var(--color-accent-blue)] border border-blue-500/25 px-4 py-2 rounded-lg hover:bg-blue-500/10 transition-colors"
      >
        🔔 Get updates
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="bg-[var(--color-navy-mid)] border border-white/10 rounded-3xl max-w-md w-full p-7" onClick={(e) => e.stopPropagation()}>
            {done ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-3">✅</div>
                <p className="font-bold text-white">You&apos;re on the list!</p>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold mb-1">GET TEAM UPDATES</h3>
                <p className="text-sm text-slate-400 mb-5">The coach can email announcements straight to you.</p>
                <form onSubmit={submit} className="space-y-4">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={80}
                    placeholder="Your name (optional)"
                    className="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-4 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-[var(--color-accent-blue)]"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-4 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-[var(--color-accent-blue)]"
                  />
                  {error && <p className="text-red-400 text-sm">{error}</p>}
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={busy || !email.trim()}
                      className="flex-1 bg-[var(--color-accent-blue)] hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50"
                    >
                      {busy ? "Subscribing..." : "Subscribe"}
                    </button>
                    <button type="button" onClick={() => setOpen(false)} className="border border-white/10 text-slate-300 px-5 rounded-lg hover:bg-white/5">
                      Cancel
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

/* ---------- Game Film ---------- */
function PlaybookSection({ plays, sport }) {
  if (!plays || plays.length === 0) return null;
  return (
    <section id="playbook" className="scroll-mt-20">
      <h2 className="text-2xl md:text-3xl font-bold mb-2">✏️ PLAYBOOK</h2>
      <p className="text-slate-400 text-sm mb-6">Study the plays your coach drew up — routes, assignments, and notes.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {plays.map((p) => (
          <div key={p.id} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
            <div className="rounded-xl overflow-hidden border border-white/10 bg-[#2f8a4a] mb-3">
              <PlayField diagram={p.diagram} theme="turf" sport={sport} style={{ display: "block", width: "100%" }} />
            </div>
            <h3 className="font-bold text-white">{p.name}</h3>
            <div className="flex flex-wrap gap-1.5 mt-1">
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--color-accent-blue)]/15 text-[var(--color-accent-blue)] border border-blue-500/20">{p.category}</span>
              {p.formation ? <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10">{p.formation}</span> : null}
            </div>
            {p.notes ? <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed mt-2">{p.notes}</p> : null}
          </div>
        ))}
      </div>
    </section>
  );
}

function VideosSection({ videos }) {
  if (videos.length === 0) return null;
  return (
    <section id="videos" className="scroll-mt-20">
      <h2 className="text-2xl md:text-3xl font-bold mb-6">🎬 GAME FILM</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {videos.map((v) => {
          const embed = videoEmbedUrl(v.url);
          return (
            <div key={v.id} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
              {embed ? (
                <div className="aspect-video rounded-xl overflow-hidden bg-black mb-3">
                  <iframe
                    src={embed}
                    title={v.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              ) : (
                <a
                  href={v.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="aspect-video rounded-xl bg-white/[0.04] border border-white/10 mb-3 flex items-center justify-center text-5xl hover:bg-white/[0.07] transition-colors"
                >
                  🎬
                </a>
              )}
              <p className="font-semibold text-white">{v.title}</p>
              {v.game_date && (
                <p className="text-xs text-slate-500">
                  {new Date(v.game_date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ---------- Notes ---------- */
function NotesSection({ notes }) {
  if (notes.length === 0) return null;
  return (
    <section id="notes" className="scroll-mt-20">
      <h2 className="text-2xl md:text-3xl font-bold mb-6">📝 COACH&apos;S NOTES</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {notes.map((n) => (
          <div key={n.id} className="bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.06] rounded-2xl p-6">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="font-bold text-white">{n.title}</h3>
              <span className="text-xs text-slate-500 whitespace-nowrap">
                {new Date(n.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </div>
            <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">{n.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- Photos ---------- */
function PhotosSection({ photos, players, slug, playerById, onView }) {
  return (
    <section id="photos" className="scroll-mt-20">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl md:text-3xl font-bold">📸 TEAM PHOTOS</h2>
        <ParentUpload slug={slug} players={players} />
      </div>
      {photos.length === 0 ? (
        <Empty text="No photos yet — be the first to share an action shot!" />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((ph) => (
            <button
              key={ph.id}
              onClick={() => onView(ph)}
              className="group relative rounded-xl overflow-hidden border border-white/[0.08] bg-white/[0.02] cursor-pointer"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ph.url} alt={ph.caption || "Team photo"} className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
              {(ph.caption || ph.player_id) && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-left">
                  <p className="text-xs text-slate-200 truncate">
                    {ph.caption || playerById[ph.player_id]?.name}
                  </p>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

function ParentUpload({ slug, players }) {
  const router = useRouter();
  const fileRef = useRef(null);
  const cameraRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [playerId, setPlayerId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    setError(null);
    const form = new FormData();
    form.append("slug", slug);
    form.append("file", file);
    form.append("caption", caption);
    if (playerId) form.append("playerId", playerId);

    const res = await fetch("/api/team-photos", { method: "POST", body: form });
    setBusy(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Upload failed. Try again.");
      return;
    }
    setOpen(false);
    setFile(null);
    setCaption("");
    setPlayerId("");
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-[var(--color-accent-green)] hover:bg-green-500 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-all"
      >
        📷 Share a photo
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="bg-[var(--color-navy-mid)] border border-white/10 rounded-3xl max-w-md w-full p-7" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-1">SHARE A PHOTO</h3>
            <p className="text-sm text-slate-400 mb-5">Action shots, team moments — they go straight into the gallery.</p>
            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => cameraRef.current?.click()}
                  className="border border-dashed border-white/20 rounded-xl p-5 text-center hover:border-blue-500/40 transition-colors"
                >
                  <span className="text-sm text-slate-400">📷 Take Photo</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="border border-dashed border-white/20 rounded-xl p-5 text-center hover:border-blue-500/40 transition-colors"
                >
                  <span className="text-sm text-slate-400">🖼️ Choose from Gallery</span>
                </button>
              </div>
              {file && <p className="text-sm text-white text-center">✓ {file.name}</p>}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />

              <input
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                maxLength={200}
                placeholder="Caption (optional)"
                className="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-4 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-[var(--color-accent-blue)]"
              />

              {players.length > 0 && (
                <select
                  value={playerId}
                  onChange={(e) => setPlayerId(e.target.value)}
                  className="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[var(--color-accent-blue)] [&>option]:bg-[#132140]"
                >
                  <option value="">Tag a player (optional)</option>
                  {players.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              )}

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={busy || !file}
                  className="flex-1 bg-[var(--color-accent-green)] hover:bg-green-500 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50"
                >
                  {busy ? "Uploading..." : "Upload"}
                </button>
                <button type="button" onClick={() => setOpen(false)} className="border border-white/10 text-slate-300 px-5 rounded-lg hover:bg-white/5">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function Lightbox({ photo, playerById, slug, onClose }) {
  const router = useRouter();
  const [removing, setRemoving] = useState(false);
  async function removePhoto() {
    if (!confirm("Remove this photo from the gallery?")) return;
    setRemoving(true);
    const res = await fetch("/api/team-photos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, photoId: photo.id }),
    });
    setRemoving(false);
    if (res.ok) { onClose(); router.refresh(); }
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm" onClick={onClose}>
      <div className="max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo.url} alt={photo.caption || "Team photo"} className="w-full max-h-[75vh] object-contain rounded-xl" />
        <div className="flex items-center justify-between gap-3 mt-3">
          <p className="text-sm text-slate-300">
            {photo.caption || (photo.player_id ? playerById[photo.player_id]?.name : "")}
          </p>
          <div className="flex items-center gap-2 shrink-0">
            {photo.uploaded_by === "parent" && (
              <button onClick={removePhoto} disabled={removing} className="text-sm text-red-400 hover:text-red-300 border border-red-500/30 px-4 py-2 rounded-lg disabled:opacity-50">
                {removing ? "Removing..." : "Remove"}
              </button>
            )}
            <button onClick={onClose} className="text-sm text-slate-400 hover:text-white border border-white/10 px-4 py-2 rounded-lg">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Empty({ text }) {
  return (
    <div className="bg-white/[0.02] border border-dashed border-white/[0.08] rounded-2xl p-10 text-center">
      <p className="text-slate-500">{text}</p>
    </div>
  );
}
