import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import CopyInviteButton from "./CopyInviteButton";

export default async function TeamOverviewPage({ params }) {
  const { teamId } = await params;
  const supabase = await createClient();

  const [{ data: team }, players, events, announcements, photos] = await Promise.all([
    supabase.from("teams").select("*").eq("id", teamId).single(),
    supabase.from("players").select("id", { count: "exact", head: true }).eq("team_id", teamId),
    supabase.from("events").select("id", { count: "exact", head: true }).eq("team_id", teamId),
    supabase.from("announcements").select("id", { count: "exact", head: true }).eq("team_id", teamId),
    supabase.from("photos").select("id", { count: "exact", head: true }).eq("team_id", teamId),
  ]);

  const { data: nextEvents } = await supabase
    .from("events")
    .select("id, event_type, opponent, title, location, starts_at")
    .eq("team_id", teamId)
    .gte("starts_at", new Date().toISOString())
    .order("starts_at")
    .limit(3);

  const stats = [
    { label: "Players", count: players.count ?? 0, href: "roster", icon: "📋" },
    { label: "Events", count: events.count ?? 0, href: "schedule", icon: "📅" },
    { label: "Posts", count: announcements.count ?? 0, href: "announcements", icon: "💬" },
    { label: "Photos", count: photos.count ?? 0, href: "photos", icon: "📸" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* SHARE CARD */}
      <div className="lg:col-span-2 bg-gradient-to-br from-green-500/[0.08] to-blue-500/[0.06] border border-green-500/20 rounded-2xl p-7">
        <h2 className="text-xl font-bold mb-1">SHARE YOUR TEAM SITE</h2>
        <p className="text-sm text-slate-400 mb-5">
          Text this to parents — they open the link in any browser and enter the passcode. No app, no accounts.
        </p>
        <div className="grid sm:grid-cols-2 gap-4 mb-5">
          <div className="bg-black/20 rounded-xl px-5 py-4">
            <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Team Link</p>
            <p className="text-[var(--color-accent-blue)] font-semibold break-all">
              my-teamsports.com/team/{team.slug}
            </p>
          </div>
          <div className="bg-black/20 rounded-xl px-5 py-4">
            <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Passcode</p>
            <p className="text-2xl font-mono font-bold tracking-[0.3em] text-white">{team.passcode}</p>
          </div>
        </div>
        <CopyInviteButton team={{ slug: team.slug, passcode: team.passcode }} />
      </div>

      {/* NEXT UP */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-7">
        <h2 className="text-lg font-bold mb-4">NEXT UP</h2>
        {!nextEvents || nextEvents.length === 0 ? (
          <p className="text-sm text-slate-500">
            Nothing scheduled.{" "}
            <Link href={`/dashboard/teams/${teamId}/schedule`} className="text-[var(--color-accent-blue)] hover:underline">
              Add a game →
            </Link>
          </p>
        ) : (
          <ul className="space-y-3">
            {nextEvents.map((e) => {
              const d = new Date(e.starts_at);
              return (
                <li key={e.id} className="text-sm">
                  <p className="font-semibold text-white">
                    {e.event_type === "game" && e.opponent ? `vs ${e.opponent}` : e.title || (e.event_type === "practice" ? "Practice" : "Event")}
                  </p>
                  <p className="text-slate-500">
                    {d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                    {" · "}
                    {d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* STAT LINKS */}
      {stats.map((s) => (
        <Link
          key={s.label}
          href={`/dashboard/teams/${teamId}/${s.href}`}
          className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:border-blue-500/25 transition-all flex items-center gap-4"
        >
          <span className="text-3xl">{s.icon}</span>
          <div>
            <p className="font-[family-name:var(--font-oswald)] text-3xl font-bold text-white">{s.count}</p>
            <p className="text-sm text-slate-500">{s.label}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
