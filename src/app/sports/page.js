import Link from "next/link";
import { SiteNav, SiteFooter, CTASection, PageHero } from "@/components/marketing";
import { getAllSports } from "@/lib/sports";

const SITE_URL = "https://my-teamsports.com";

export const metadata = {
  title: "Team Websites for Every Youth Sport — Free, No App",
  description:
    "Free team websites built for your sport — baseball, softball, basketball, soccer, football, flag football, volleyball, and hockey. Roster, live scores, stats, schedule, and photos. Parents never download an app or pay.",
  keywords: [
    "youth sports team website",
    "team website for every sport",
    "free team website builder",
    "sports team app no download",
  ],
  alternates: { canonical: "/sports" },
  openGraph: {
    title: "Team Websites for Every Youth Sport | My-Team Sports",
    description:
      "Free team websites built for your sport — roster, live scores, stats, schedule, and photos. Parents never download an app or pay.",
    url: `${SITE_URL}/sports`,
    type: "website",
  },
};

export default function SportsIndexPage() {
  const sports = getAllSports();
  return (
    <div className="min-h-screen">
      <SiteNav />
      <PageHero
        badge="Every sport · Half off for 2026"
        title="A TEAM WEBSITE"
        accent="FOR YOUR SPORT"
        subtitle="Same five-minute setup, same free-for-parents promise — with the positions, stats, and plays that fit how your sport actually plays. Pick yours."
      />

      <section className="px-6 pb-24 pt-4 bg-[var(--color-navy)]">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 max-w-[1100px] mx-auto">
          {sports.map((s) => (
            <Link
              key={s.slug}
              href={`/sports/${s.slug}`}
              className="group block bg-white/[0.03] border border-white/[0.07] rounded-2xl p-7 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-blue-500/25 hover:bg-white/[0.05]"
            >
              <div className="text-4xl mb-3">{s.emoji}</div>
              <h2 className="font-[family-name:var(--font-oswald)] text-2xl font-bold text-white mb-1.5">
                {s.sport} Team Website
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Roster, live scores, {s.scoring}, stats, schedule, and photos — built for {s.sport.toLowerCase()}.
              </p>
              <span className={`inline-flex items-center gap-1 mt-4 text-sm font-semibold ${s.accentText}`}>
                See the {s.sport.toLowerCase()} page
                <span className="transition-transform group-hover:translate-x-0.5">→</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <CTASection />
      <SiteFooter />
    </div>
  );
}
