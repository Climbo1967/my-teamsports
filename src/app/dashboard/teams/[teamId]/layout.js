import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { signMediaUrl } from "@/lib/media";
import { SPORT_EMOJI, sportLabel } from "@/lib/constants";
import TeamTabs from "./TeamTabs";
import BillingGate from "./BillingGate";
import { teamAccess } from "@/lib/pricing";

export default async function TeamManageLayout({ children, params }) {
  const { teamId } = await params;
  const supabase = await createClient();

  const { data: team } = await supabase
    .from("teams")
    .select("id, slug, name, sport, season, passcode, logo_url, paid_through, ai_paid_through, trial_ends_at, ai_enabled")
    .eq("id", teamId)
    .single();

  if (!team) notFound(); // RLS hides teams the coach doesn't own

  // logo_url stores a private-bucket path; sign it for this render.
  const logoSrc = await signMediaUrl(createAdminClient(), team.logo_url);

  const access = teamAccess(team);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4 mb-6">
        {logoSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoSrc} alt={team.name} className="w-14 h-14 rounded-xl object-cover border border-white/10" />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-700/20 border border-white/10 flex items-center justify-center text-3xl">
            {SPORT_EMOJI[team.sport] || "🏆"}
          </div>
        )}
        <div className="flex-1 min-w-[200px]">
          <h1 className="text-2xl md:text-3xl font-bold">{team.name.toUpperCase()}</h1>
          <p className="text-sm text-slate-500 capitalize">
            {sportLabel(team.sport)}{team.season ? ` · ${team.season}` : ""}
          </p>
        </div>
        <Link
          href={`/team/${team.slug}`}
          target="_blank"
          className="text-sm font-medium text-[var(--color-accent-blue)] border border-blue-500/25 px-4 py-2 rounded-lg hover:bg-blue-500/10 transition-colors"
        >
          View public site ↗
        </Link>
      </div>

      <TeamTabs teamId={team.id} />

      <div className="mt-8">
        <BillingGate teamId={team.id} expired={!access.active}>
          {children}
        </BillingGate>
      </div>
    </div>
  );
}
