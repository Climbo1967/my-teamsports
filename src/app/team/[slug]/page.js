import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import PasscodeGate from "./PasscodeGate";

const SPORT_EMOJI = {
  baseball: "⚾",
  football: "🏈",
  basketball: "🏀",
  soccer: "⚽",
  softball: "🥎",
  volleyball: "🏐",
  hockey: "🏒",
  other: "🏆",
};

export default async function TeamPage({ params }) {
  const { slug } = await params;
  const normalizedSlug = String(slug).toLowerCase();

  const cookieStore = await cookies();
  const passcode = cookieStore.get(`team_access_${normalizedSlug}`)?.value;

  let site = null;
  if (passcode) {
    const supabase = await createClient();
    const { data } = await supabase.rpc("get_team_site", {
      p_slug: normalizedSlug,
      p_passcode: passcode,
    });
    site = data;
  }

  if (!site) {
    return <PasscodeGate slug={normalizedSlug} />;
  }

  const { team, players, events } = site;
  const emoji = SPORT_EMOJI[team.sport] || "🏆";
  const upcoming = (events || []).filter((e) => new Date(e.starts_at) >= new Date(Date.now() - 24 * 60 * 60 * 1000));

  return (
    <div className="min-h-screen bg-[var(--color-navy)]">
      {/* TEAM HEADER */}
      <header className="bg-gradient-to-b from-[#0d1f3c] to-[var(--color-navy)] border-b border-white/5 px-6 py-14 text-center">
        <div className="text-6xl mb-4">{emoji}</div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">{team.name.toUpperCase()}</h1>
        <p className="text-slate-400 mt-2 capitalize">
          {team.sport}{team.season ? ` · ${team.season}` : ""}
        </p>
      </header>

      <main className="max-w-[1100px] mx-auto px-6 py-12 space-y-14">
        {/* SCHEDULE */}
        <section>
          <h2 className="text-2xl md:text-3xl font-bold mb-6">📅 UPCOMING SCHEDULE</h2>
          {upcoming.length === 0 ? (
            <EmptyCard text="No games or practices posted yet. Check back soon!" />
          ) : (
            <div className="space-y-3">
              {upcoming.map((event) => {
                const d = new Date(event.starts_at);
                return (
                  <div
                    key={event.id}
                    className="flex flex-wrap items-center gap-4 bg-white/[0.03] border border-white/[0.06] rounded-xl px-6 py-4"
                  >
                    <div className="text-center min-w-[64px]">
                      <p className="text-xs uppercase tracking-widest text-slate-500">
                        {d.toLocaleDateString("en-US", { month: "short" })}
                      </p>
                      <p className="text-2xl font-bold text-white">{d.getDate()}</p>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                      <p className="font-semibold text-white">
                        {event.event_type === "game" && event.opponent
                          ? `vs ${event.opponent}`
                          : event.title || (event.event_type === "practice" ? "Practice" : "Team Event")}
                      </p>
                      <p className="text-sm text-slate-400">
                        {d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                        {event.location ? ` · ${event.location}` : ""}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full ${
                        event.event_type === "game"
                          ? "bg-blue-500/10 text-[var(--color-accent-blue)] border border-blue-500/25"
                          : "bg-green-500/10 text-green-400 border border-green-500/25"
                      }`}
                    >
                      {event.event_type}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ROSTER */}
        <section>
          <h2 className="text-2xl md:text-3xl font-bold mb-6">📋 TEAM ROSTER</h2>
          {(players || []).length === 0 ? (
            <EmptyCard text="The roster is being put together. Players coming soon!" />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {players.map((player) => (
                <div
                  key={player.id}
                  className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 text-center hover:border-blue-500/25 transition-all"
                >
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-700/20 border border-white/10 flex items-center justify-center text-2xl">
                    {player.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={player.photo_url} alt={player.name} className="w-16 h-16 rounded-full object-cover" />
                    ) : (
                      emoji
                    )}
                  </div>
                  {player.jersey_number && (
                    <p className="font-[family-name:var(--font-oswald)] text-2xl font-bold text-[var(--color-accent-blue)]">
                      #{player.jersey_number}
                    </p>
                  )}
                  <p className="font-semibold text-white">{player.name}</p>
                  {player.position && <p className="text-xs text-slate-500 mt-0.5">{player.position}</p>}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="px-6 py-10 text-center border-t border-white/5">
        <p className="text-xs text-slate-600">
          Powered by <span className="font-semibold text-slate-500">MY-TEAM SPORTS.com</span>
        </p>
      </footer>
    </div>
  );
}

function EmptyCard({ text }) {
  return (
    <div className="bg-white/[0.02] border border-dashed border-white/[0.08] rounded-2xl p-10 text-center">
      <p className="text-slate-500">{text}</p>
    </div>
  );
}
