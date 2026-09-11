import LeagueConsole from "./LeagueConsole";

export const metadata = { title: "League Admin | My-Team Sports" };

export default async function LeagueAdminPage({ params }) {
  const { leagueId } = await params;
  return <LeagueConsole leagueId={leagueId} />;
}
