import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchLeagueSite } from "@/lib/league";
import { divisionsForSeason, fmtGameDay, gameDayKey, splitRecentAndUpcoming } from "@/lib/leagueFormat";
import { Empty, GameRow, SectionTitle, StandingsTable } from "./LeagueParts";

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const site = await fetchLeagueSite(slug);
  if (!site) return { title: "League not found", robots: { index: false } };
  const seasons = site.currentSeasons.map((s) => s.name).join(", ");
  return {
    title: `${site.league.name} — Schedule, Results & Standings`,
    description: `${site.league.name}${seasons ? ` ${seasons}` : ""}: league schedule, scores and standings. No ads, no app, no login.`,
    alternates: { canonical: `/leagues/${site.league.slug}` },
    openGraph: {
      title: `${site.league.name} — Schedule, Results & Standings | My-Team Sports`,
      description: `${site.league.name}${seasons ? ` ${seasons}` : ""}: league schedule, scores and standings. No ads, no app, no login.`,
      url: `/leagues/${site.league.slug}`,
    },
  };
}

export default async function LeagueHomePage({ params }) {
  const { slug } = await params;
  const site = await fetchLeagueSite(slug);
  if (!site) notFound();

  const games = site.games || [];
  const { finals, upcoming } = splitRecentAndUpcoming(games);
  const base = `/leagues/${site.league.slug}`;

  return (
    <div className="space-y-10">
      {site.currentSeasons.length === 0 && games.length === 0 && (
        <Empty text="This league's season hasn't been published yet. Check back soon." />
      )}

      {site.currentSeasons.map((season) => {
        const divisions = divisionsForSeason(site, season.id);
        if (divisions.length === 0) return null;
        return (
          <section key={season.id}>
            <SectionTitle right={<Link href={`${base}/standings`} className="text-sm text-[var(--color-accent-blue)] hover:underline">Full standings →</Link>}>
              {season.name.toUpperCase()} STANDINGS
            </SectionTitle>
            <div className="grid gap-6 md:grid-cols-2">
              {divisions.map((d) => (
                <div key={d.id} className="min-w-0">
                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-slate-400">{d.name}</h3>
                  <StandingsTable site={site} rows={(site.standings?.[d.id] || []).slice(0, 6)} compact />
                </div>
              ))}
            </div>
          </section>
        );
      })}

      <div className="grid gap-10 lg:grid-cols-2">
        <section className="min-w-0">
          <SectionTitle right={<Link href={`${base}/schedule`} className="text-sm text-[var(--color-accent-blue)] hover:underline">Full schedule →</Link>}>
            UPCOMING
          </SectionTitle>
          {upcoming.length === 0 ? (
            <Empty text="No upcoming games on the schedule." />
          ) : (
            <GroupedByDay site={site} games={upcoming} />
          )}
        </section>

        <section className="min-w-0">
          <SectionTitle>LATEST RESULTS</SectionTitle>
          {finals.length === 0 ? (
            <Empty text="No results yet." />
          ) : (
            <GroupedByDay site={site} games={finals} />
          )}
        </section>
      </div>

      {site.schools.length > 0 && (
        <section>
          <SectionTitle>SCHOOLS</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {site.schools.map((s) => (
              <span key={s.id} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-sm text-slate-300">
                {s.name}{s.city ? <span className="text-slate-600"> · {s.city}</span> : null}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function GroupedByDay({ site, games }) {
  const groups = [];
  for (const g of games) {
    const key = gameDayKey(g);
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.games.push(g);
    else groups.push({ key, label: fmtGameDay(g), games: [g] });
  }
  return (
    <div className="space-y-4">
      {groups.map((grp) => (
        <div key={grp.key}>
          <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">{grp.label}</div>
          <div className="rounded-xl border border-white/[0.08]">
            {grp.games.map((g) => <GameRow key={g.id} site={site} game={g} showDivision />)}
          </div>
        </div>
      ))}
    </div>
  );
}
