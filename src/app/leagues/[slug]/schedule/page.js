import { notFound } from "next/navigation";
import { fetchLeagueSite } from "@/lib/league";
import { fmtGameDay, gameDayKey, LEAGUE_TZ } from "@/lib/leagueFormat";
import ScheduleList from "./ScheduleList";

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const site = await fetchLeagueSite(slug);
  if (!site) return { title: "League not found", robots: { index: false } };
  return {
    title: `${site.league.name} Schedule & Results`,
    description: `Full ${site.league.name} game schedule with locations and final scores, by division and school.`,
    alternates: { canonical: `/leagues/${site.league.slug}/schedule` },
    openGraph: {
      title: `${site.league.name} Schedule & Results | My-Team Sports`,
      description: `Full ${site.league.name} game schedule with locations and final scores, by division and school.`,
      url: `/leagues/${site.league.slug}/schedule`,
    },
  };
}

function todayKeyInLeagueTz() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: LEAGUE_TZ, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export default async function LeagueSchedulePage({ params }) {
  const { slug } = await params;
  const site = await fetchLeagueSite(slug);
  if (!site) notFound();

  // Pre-compute day keys/labels server-side (Intl with a fixed TZ) so the
  // client list only sorts and filters.
  const games = (site.games || []).map((g) => ({ ...g, dayKey: gameDayKey(g) }));
  const dayLabels = {};
  for (const g of games) if (!dayLabels[g.dayKey]) dayLabels[g.dayKey] = fmtGameDay(g);

  // Strip the parts the client doesn't need (standings, raw games) to keep
  // the RSC payload small.
  const { games: _g, standings: _s, ...clientSite } = site;

  return (
    <ScheduleList site={clientSite} games={games} dayLabels={dayLabels} todayKey={todayKeyInLeagueTz()} />
  );
}
