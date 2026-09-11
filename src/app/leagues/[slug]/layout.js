import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchLeagueSite } from "@/lib/league";
import { hexToRgba, DEFAULT_TEAM_COLOR } from "@/lib/constants";
import LeagueNav from "./LeagueNav";

// Public league site — no passcode, no login (design v1 §3). ISR so a whole
// league's parents refreshing on game night never touch the DB more than
// once a minute per page.
export const revalidate = 60;

export default async function LeagueLayout({ children, params }) {
  const { slug } = await params;
  const site = await fetchLeagueSite(slug);
  if (!site) notFound(); // unknown slug or a non-public league → 404, nothing leaks

  const { league } = site;
  const color = league.primary_color || DEFAULT_TEAM_COLOR;
  const seasonLine = site.currentSeasons.map((s) => s.name).join(" · ");

  return (
    <div className="min-h-screen bg-[var(--color-navy)]">
      <header className="relative overflow-hidden border-b border-white/5 bg-gradient-to-b from-[#0d1f3c] to-[var(--color-navy)]">
        <div className="absolute inset-x-0 top-0 h-1.5" style={{ backgroundColor: color }} />
        <div
          className="absolute left-1/2 top-0 h-full w-[120%] -translate-x-1/2"
          style={{ background: `radial-gradient(ellipse at top, ${hexToRgba(color, 0.14)}, transparent 70%)` }}
        />
        <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-4 px-6 pb-8 pt-12 text-center sm:flex-row sm:text-left">
          {league.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={league.logo_url}
              alt={league.name}
              className="h-20 w-20 rounded-2xl border border-white/10 object-cover shadow-xl"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-4xl shadow-xl">
              🏆
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight md:text-5xl">{league.name.toUpperCase()}</h1>
            {seasonLine && <p className="mt-1 text-slate-400">{seasonLine}</p>}
          </div>
          {league.website && (
            <a
              href={league.website}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 transition-colors hover:bg-white/5"
            >
              League website ↗
            </a>
          )}
        </div>
        <div className="relative mx-auto max-w-5xl">
          <LeagueNav leagueSlug={league.slug} />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">{children}</main>

      <footer className="border-t border-white/5 px-6 py-10 text-center">
        <p className="text-xs text-slate-600">
          Powered by{" "}
          <Link href="/leagues" className="font-semibold text-slate-500 hover:text-slate-400">
            MY-TEAM SPORTS.com
          </Link>
          {" "}· no ads, ever
        </p>
      </footer>
    </div>
  );
}
