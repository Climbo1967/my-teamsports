import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SPORT_EMOJI } from "@/lib/constants";
import { RosterQuickAdd } from "./GettingStartedForms";

/**
 * Getting Started wizard.
 *
 * ARCHITECTURE RULE: the current step is DERIVED FROM DATA, never read from a
 * flag. We query what actually exists:
 *   - no team owned by this user            -> step 1 (create a team)
 *   - team owned, zero players on it        -> step 2 (add first players)
 *   - team + players                        -> render null, wizard is done
 *
 * profiles.onboarding_step / onboarding_completed are written as an analytics
 * record only. The single exception is the explicit "skip" -- onboarding_completed
 * is read purely as a suppressor so a coach who dismissed the banner stays
 * dismissed. It can never pull anyone INTO onboarding, only out of it.
 *
 * Step 1 intentionally routes to the existing /dashboard/new-team flow rather
 * than duplicating it -- that page already handles slug collisions, passcode
 * generation (^[A-Z0-9]{6,8}$), logo upload and team color.
 */
export default async function GettingStarted({ standalone = false }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Only the coach who owns a team gets walked through setup. Assistant coaches
  // added to someone else's team are not the target user for this flow.
  const { data: ownedTeams } = await supabase
    .from("teams")
    .select("id, name, sport, slug, created_at")
    .eq("coach_id", user.id)
    .order("created_at", { ascending: true });

  const teams = ownedTeams || [];

  // ---- Step 1: no team yet -------------------------------------------------
  if (teams.length === 0) {
    // The banner variant stays quiet here; the dashboard's own no-team branch
    // renders the standalone variant.
    if (!standalone) return null;

    const firstName = user.user_metadata?.full_name?.split(" ")[0] || "Coach";

    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🏟️</div>
          <h1 className="text-3xl md:text-4xl font-bold">
            WELCOME, {firstName.toUpperCase()}
          </h1>
          <p className="text-slate-400 mt-2">
            Let&apos;s get your team set up. It takes about two minutes.
          </p>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8">
          <StepRow n={1} active label="Create your team" />
          <p className="text-slate-400 text-sm mt-2 mb-6 pl-11">
            Name it, pick your sport, and you&apos;ll get a shareable link and
            passcode for parents right away.
          </p>

          <StepRow n={2} label="Add your players" />
          <p className="text-slate-500 text-sm mt-2 mb-8 pl-11">
            Type in your roster — names are all you need to start.
          </p>

          <Link
            href="/dashboard/new-team"
            className="block w-full text-center bg-[var(--color-accent-green)] text-white font-[family-name:var(--font-oswald)] text-lg font-semibold tracking-wide py-4 rounded-xl hover:bg-green-500 transition-all"
          >
            CREATE YOUR TEAM
          </Link>
        </div>
      </div>
    );
  }

  // ---- Step 2: team exists, does it have players? --------------------------
  const teamIds = teams.map((t) => t.id);
  const { data: playerRows } = await supabase
    .from("players")
    .select("team_id")
    .in("team_id", teamIds);

  const withPlayers = new Set((playerRows || []).map((p) => p.team_id));
  const emptyTeam = teams.find((t) => !withPlayers.has(t.id));

  // Every owned team has a roster -> onboarding is done. Nothing to show.
  if (!emptyTeam) return null;

  // Explicit skip is the only flag we honour, and only to suppress.
  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.onboarding_completed) return null;

  return (
    <div className={standalone ? "max-w-2xl mx-auto" : "mb-10"}>
      <div className="bg-gradient-to-br from-blue-500/[0.08] to-white/[0.02] border border-[var(--color-accent-blue)]/25 rounded-2xl p-6 md:p-8">
        <div className="flex items-start gap-3 mb-1">
          <span className="text-3xl leading-none">
            {SPORT_EMOJI[emptyTeam.sport] || "🏆"}
          </span>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-widest text-[var(--color-accent-blue)] font-semibold">
              Step 2 of 2 · Finish setting up
            </p>
            <h2 className="text-xl md:text-2xl font-bold text-white mt-0.5">
              Add your players to {emptyTeam.name}
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              {emptyTeam.name} is live, but it&apos;s empty. Once you add your{" "}
              {playerNoun(emptyTeam.sport)}, you can start posting schedules,
              taking attendance and tracking stats.
            </p>
          </div>
        </div>

        <RosterQuickAdd
          teamId={emptyTeam.id}
          teamName={emptyTeam.name}
          sport={emptyTeam.sport}
        />
      </div>
    </div>
  );
}

function StepRow({ n, label, active = false }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-sm font-bold ${
          active
            ? "bg-[var(--color-accent-green)] text-white"
            : "bg-white/[0.06] text-slate-500"
        }`}
      >
        {n}
      </span>
      <span
        className={`font-semibold ${active ? "text-white" : "text-slate-500"}`}
      >
        {label}
      </span>
    </div>
  );
}

function playerNoun(sport) {
  return sport === "hockey" ? "skaters" : "players";
}
