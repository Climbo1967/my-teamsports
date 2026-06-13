"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const NAV = [
  { id: "announcements", label: "News", icon: "💬" },
  { id: "schedule", label: "Schedule", icon: "📅" },
  { id: "roster", label: "Roster", icon: "📋" },
  { id: "notes", label: "Coach's Notes", icon: "📝" },
  { id: "photos", label: "Photos", icon: "📸" },
];

export default function TeamSiteSections({ site, slug, emoji }) {
  const { team, players, events, announcements, notes, photos } = site;
  const [activePlayer, setActivePlayer] = useState(null);
  const [lightbox, setLightbox] = useState(null);

  const playerById = useMemo(() => {
    const map = {};
    for (const p of players) map[p.id] = p;
    return map;
  }, [players]);

  const playerPhotos = (playerId) => photos.filter((ph) => ph.player_id === playerId);

  return (
    <>
      {/* SECTION NAV */}
      <nav className="sticky top-0 z-40 bg-[var(--color-navy)]/95 backdrop-blur-xl border-b border-white/5 px-4 overflow-x-auto">
        <div className="max-w-[1100px] mx-auto flex gap-1">
          {NAV.map((n) => (
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
        <AnnouncementsSection announcements={announcements} />
        <ScheduleSection events={events} />
        <RosterSection players={players} emoji={emoji} onSelect={setActivePlayer} />
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
          onClose={() => setActivePlayer(null)}
          onViewPhoto={setLightbox}
        />
      )}

      {lightbox && (
        <Lightbox photo={lightbox} playerById={playerById} onClose={() => setLightbox(null)} />
      )}
    </>
  );
}

/* ---------- Announcements ---------- */
function AnnouncementsSection({ announcements }) {
  if (announcements.length === 0) return null;
  return (
    <section id="announcements" className="scroll-mt-20">
      <h2 className="text-2xl md:text-3xl font-bold mb-6">💬 TEAM NEWS</h2>
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
function ScheduleSection({ events }) {
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
              {upcoming.map((e) => <EventCard key={e.id} event={e} />)}
            </div>
          )}
          {past.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-500 mb-3">Results &amp; past events</h3>
              <div className="space-y-3">
                {past.map((e) => <EventCard key={e.id} event={e} past />)}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function EventCard({ event, past }) {
  const d = new Date(event.starts_at);
  return (
    <div className={`flex flex-wrap items-center gap-4 bg-white/[0.03] border border-white/[0.06] rounded-xl px-6 py-4 ${past ? "opacity-85" : ""}`}>
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

function PlayerModal({ player, emoji, photos, onClose, onViewPhoto }) {
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
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full border border-dashed border-white/20 rounded-xl p-6 text-center hover:border-blue-500/40 transition-colors"
              >
                {file ? (
                  <span className="text-sm text-white">✓ {file.name}</span>
                ) : (
                  <span className="text-sm text-slate-400">Tap to choose a photo</span>
                )}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />

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

function Lightbox({ photo, playerById, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm" onClick={onClose}>
      <div className="max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo.url} alt={photo.caption || "Team photo"} className="w-full max-h-[75vh] object-contain rounded-xl" />
        <div className="flex items-center justify-between mt-3">
          <p className="text-sm text-slate-300">
            {photo.caption || (photo.player_id ? playerById[photo.player_id]?.name : "")}
          </p>
          <button onClick={onClose} className="text-sm text-slate-400 hover:text-white border border-white/10 px-4 py-2 rounded-lg">
            Close
          </button>
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
