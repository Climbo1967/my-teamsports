import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { sportLabel } from "@/lib/constants";

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

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Pick up any pending assistant-coach invites for this email
  await supabase.rpc("claim_team_invites");

  const { data: teams } = await supabase
    .from("teams")
    .select("id, slug, name, sport, season, passcode, created_at")
    .order("created_at", { ascending: false });

  const firstName =
    user?.user_metadata?.full_name?.split(" ")[0] || "Coach";

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">WELCOME, {firstName.toUpperCase()}</h1>
          <p className="text-slate-400 mt-1">Manage your teams or create a new one.</p>
        </div>
        <Link
          href="/dashboard/new-team"
          className="bg-[var(--color-accent-green)] text-white font-[family-name:var(--font-oswald)] font-semibold tracking-wide px-6 py-3 rounded-xl hover:bg-green-500 transition-all"
        >
          + CREATE A TEAM
        </Link>
      </div>

      {!teams || teams.length === 0 ? (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4">🏟️</div>
          <h2 className="text-xl font-semibold mb-2">No teams yet</h2>
          <p className="text-slate-400 mb-6">Create your first team — it takes about a minute.</p>
          <Link
            href="/dashboard/new-team"
            className="inline-block bg-[var(--color-accent-green)] text-white font-[family-name:var(--font-oswald)] font-semibold tracking-wide px-8 py-3.5 rounded-xl hover:bg-green-500 transition-all"
          >
            CREATE YOUR TEAM
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teams.map((team) => (
            <div
              key={team.id}
              className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:border-blue-500/25 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{SPORT_EMOJI[team.sport] || "🏆"}</span>
                  <div>
                    <h2 className="text-xl font-semibold text-white">{team.name}</h2>
                    <p className="text-sm text-slate-500 capitalize">
                      {sportLabel(team.sport)}{team.season ? ` · ${team.season}` : ""}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white/[0.04] rounded-lg px-4 py-3 mb-4 text-sm">
                <p className="text-slate-400">
                  Team link:{" "}
                  <span className="text-[var(--color-accent-blue)]">my-teamsports.com/team/{team.slug}</span>
                </p>
                <p className="text-slate-400 mt-1">
                  Passcode:{" "}
                  <span className="font-mono font-bold text-white tracking-widest">{team.passcode}</span>
                </p>
              </div>
              <div className="flex gap-3">
                <Link
                  href={`/dashboard/teams/${team.id}`}
                  className="bg-[var(--color-accent-blue)] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-600 transition-all"
                >
                  Manage team
                </Link>
                <Link
                  href={`/team/${team.slug}`}
                  className="text-sm font-medium text-[var(--color-accent-blue)] hover:underline px-2 py-2"
                >
                  View site →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
