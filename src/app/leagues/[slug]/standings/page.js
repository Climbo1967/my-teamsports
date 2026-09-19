import { notFound } from "next/navigation";
import { fetchLeagueSite } from "@/lib/league";
import { divisionsForSeason } from "@/lib/leagueFormat";
import { Empty, SectionTitle, StandingsTable } from "../LeagueParts";

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const site = await fetchLeagueSite(slug);
  if (!site) return { title: "League not found", robots: { index: false } };
  return {
    title: `${site.league.name} Standings`,
    description: `Current standings for every division in ${site.league.name}. Updated as finals come in.`,
    alternates: { canonical: `/leagues/${site.league.slug}/standings` },
    openGraph: {
      title: `${site.league.name} Standings | My-Team Sports`,
      description: `Current standings for every division in ${site.league.name}. Updated as finals come in.`,
      url: `/leagues/${site.league.slug}/standings`,
    },
  };
}

export default async function LeagueStandingsPage({ params }) {
  const { slug } = await params;
  const site = await fetchLeagueSite(slug);
  if (!site) notFound();

  // get_league_site computes standings for current seasons only.
  const seasons = site.currentSeasons;

  return (
    <div className="space-y-10">
      {seasons.length === 0 && <Empty text="Standings will appear once the season is published." />}
      {seasons.map((season) => {
        const divisions = divisionsForSeason(site, season.id);
        return (
          <section key={season.id}>
            <SectionTitle>{season.name.toUpperCase()}</SectionTitle>
            {divisions.length === 0 ? (
              <Empty text="No divisions yet." />
            ) : (
              <div className="space-y-6">
                {divisions.map((d) => (
                  <div key={d.id}>
                    <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-slate-400">{d.name}</h3>
                    <StandingsTable site={site} rows={site.standings?.[d.id] || []} />
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}
      <p className="text-xs text-slate-600">
        Ties broken by head-to-head, then point differential. Forfeits count as a win for the team awarded the game.
      </p>
    </div>
  );
}
