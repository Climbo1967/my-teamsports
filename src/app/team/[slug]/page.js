import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { SPORT_EMOJI } from "@/lib/constants";
import PasscodeGate from "./PasscodeGate";
import TeamSiteSections from "./TeamSiteSections";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return { title: `Team Site | My-Team Sports`, robots: { index: false } };
}

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

  const emoji = SPORT_EMOJI[site.team.sport] || "🏆";

  return (
    <div className="min-h-screen bg-[var(--color-navy)]">
      {/* TEAM HEADER */}
      <header className="relative bg-gradient-to-b from-[#0d1f3c] to-[var(--color-navy)] border-b border-white/5 px-6 py-14 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-full bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.08),transparent_70%)]" />
        <div className="relative">
          {site.team.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={site.team.logo_url}
              alt={site.team.name}
              className="w-24 h-24 mx-auto mb-4 rounded-2xl object-cover border border-white/10 shadow-xl"
            />
          ) : (
            <div className="text-6xl mb-4">{emoji}</div>
          )}
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">{site.team.name.toUpperCase()}</h1>
          <p className="text-slate-400 mt-2 capitalize">
            {site.team.sport}{site.team.season ? ` · ${site.team.season}` : ""}
          </p>
        </div>
      </header>

      <TeamSiteSections site={site} slug={normalizedSlug} emoji={emoji} />

      <footer className="px-6 py-10 text-center border-t border-white/5">
        <p className="text-xs text-slate-600">
          Powered by{" "}
          <a href="https://my-teamsports.com" className="font-semibold text-slate-500 hover:text-slate-400">
            MY-TEAM SPORTS.com
          </a>
        </p>
      </footer>
    </div>
  );
}
