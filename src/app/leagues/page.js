import Link from "next/link";
import { SiteNav, SiteFooter, PageHero } from "@/components/marketing";

export const metadata = {
  title: "Youth Sports League Websites — Schedules, Standings, No Ads",
  description:
    "Run your whole league on one site: central schedule, automatic standings, divisions, and a full team website for every coach. No ads, no app, and parents never pay. Now onboarding leagues for the 2026–27 season.",
  alternates: { canonical: "/leagues" },
  openGraph: {
    title: "Youth Sports League Websites — Schedules, Standings, No Ads | My-Team Sports",
    description:
      "Central schedule and standings for the league office. A full team website for every coach. No ads, no app, parents never pay. Now onboarding leagues for winter 2026–27.",
    url: "https://my-teamsports.com/leagues",
  },
};

const LEAGUE_EMAIL = "ron@2bcreations.com";

const MAILTO =
  `mailto:${LEAGUE_EMAIL}?subject=` +
  encodeURIComponent("League inquiry — My-Team Sports") +
  "&body=" +
  encodeURIComponent(
    "League name:\nSports:\nApprox. number of teams:\nSeason start:\nComing from (which platform / spreadsheet):\n"
  );

const OFFICE = [
  { icon: "📅", title: "Central schedule", desc: "Load the season once. Every team's page updates automatically; reschedules push to both teams." },
  { icon: "🏆", title: "Automatic standings", desc: "Finals roll up from the scorekeeper. W-L, points for and against, head-to-head tiebreakers, per division." },
  { icon: "🏫", title: "Schools and divisions", desc: "Varsity, JV, middle school, boys, girls — organize teams the way your league actually runs." },
  { icon: "🌐", title: "Public league site", desc: "Schedule, results and standings anyone can open. No login, no passcode, no app." },
  { icon: "🔒", title: "Score control", desc: "Home team reports, the league can correct and lock. One official score, everywhere." },
  { icon: "🧾", title: "One invoice", desc: "The league pays once and every team is covered. Teams that want to go it alone can, at regular team pricing." },
];

const FAQS = [
  {
    q: "When can my league start?",
    a: "We're onboarding our first leagues for the 2026–27 winter season, starting with basketball. If your season starts in November, talk to us now — we'll load your schedule and have you live before tip-off.",
  },
  {
    q: "How do we get our schedule in?",
    a: "Send it as a spreadsheet — date, time, division, home team, away team, location. We import it and every team's schedule fills in. Changes during the season go through the league admin console.",
  },
  {
    q: "Who enters scores?",
    a: "Coaches already run the live scoreboard from their phone. The home team's final becomes the official score; the league can review, correct and lock any result.",
  },
  {
    q: "What does it cost?",
    a: "League pricing depends on how many teams and sports you run, and it's a lot less per team than our regular $15 season pass. Ask us — you'll get a number, not a sales call.",
  },
  {
    q: "Can a school use it without the league?",
    a: "Yes. Any team can sign up on its own at regular pricing. Joining a league later just adds the league schedule and standings on top.",
  },
  {
    q: "What about registration, waivers and payments?",
    a: "Not yet. We're focused on schedule, standings and team sites first. If registration is a must-have for you, tell us — it shapes what we build next.",
  },
  {
    q: "Is there really no ads tier?",
    a: "Really. We're paid by leagues and coaches, not advertisers. Your families will never see a third-party ad on their team site.",
  },
];

export default function LeaguesPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const btn =
    "inline-block bg-[var(--color-accent-green)] text-white font-[family-name:var(--font-oswald)] text-lg font-semibold tracking-wide px-10 py-4 rounded-xl hover:bg-green-500 transition-all duration-200 hover:-translate-y-0.5 shadow-lg shadow-green-500/25 hover:shadow-green-500/35";

  return (
    <div className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteNav />
      <PageHero
        badge="Now onboarding leagues for winter 2026–27"
        title="YOUR WHOLE LEAGUE."
        accent="ONE SITE. NO ADS."
        subtitle="Central schedule and standings for the league office. A full team website for every coach. Nothing for parents to download, sign up for, or pay for — ever."
      />

      {/* HERO CTA */}
      <section className="px-6 pt-2 pb-16 text-center bg-[var(--color-navy-mid)]">
        <a href={MAILTO} className={btn}>TALK TO RON →</a>
        <p className="mt-4 text-xs text-slate-500">Real person, usually same day. No sales team.</p>
      </section>

      {/* SWITCHING FROM ANOTHER LEAGUE SITE */}
      <section className="px-6 py-16 bg-[var(--color-navy-mid)]">
        <div className="max-w-[820px] mx-auto bg-gradient-to-br from-blue-500/[0.08] to-green-500/[0.05] border border-blue-500/20 rounded-3xl p-10 md:p-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">SWITCHING FROM ANOTHER LEAGUE SITE?</h2>
          <p className="text-slate-400 text-lg leading-relaxed mb-6">
            If you&apos;re moving your league off another platform — and what you liked was a simple public site with
            your schedule, results and standings, and what you didn&apos;t like was the ads — that&apos;s exactly what
            we&apos;re building, and we&apos;d like to build it with a few leagues who are moving now.
          </p>
          <ul className="space-y-3">
            {[
              "Bring your schedule as a spreadsheet. We load it for you.",
              "Every team in your league gets its own site, included.",
              "No third-party ads. Not on any tier. There is no free-with-ads tier.",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3 text-slate-300">
                <span className="text-[var(--color-accent-green)] mt-0.5">✓</span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* LEAGUE OFFICE */}
      <section className="px-6 py-20">
        <div className="max-w-[1000px] mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">BUILT FOR THE LEAGUE OFFICE</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {OFFICE.map((c) => (
              <div key={c.title} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
                <div className="text-3xl mb-3">{c.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{c.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EVERY COACH */}
      <section className="px-6 py-16 bg-[var(--color-navy-mid)]">
        <div className="max-w-[820px] mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">EVERY COACH GETS THE FULL TEAM SITE</h2>
          <p className="text-slate-400 text-lg leading-relaxed mb-6">
            Each team in your league gets everything a solo My-Team Sports team gets — roster, schedule with parent
            RSVPs, live scoreboard, stats and season totals, photo gallery, game film, announcements, push alerts, and a
            printable playbook. Coaches manage their own team; the league manages the league.
          </p>
          <Link href="/pricing" className="text-[var(--color-accent-blue)] hover:text-white transition-colors font-medium">
            See everything included on the pricing page →
          </Link>
        </div>
      </section>

      {/* PARENTS FREE */}
      <section className="px-6 py-16">
        <div className="max-w-[900px] mx-auto bg-gradient-to-br from-blue-500/[0.08] to-green-500/[0.05] border border-blue-500/20 rounded-3xl p-10 md:p-12 text-center">
          <div className="text-4xl mb-4">👨‍👩‍👧‍👦</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">PARENTS PAY NOTHING. EVER.</h2>
          <p className="text-slate-400 text-lg leading-relaxed max-w-[640px] mx-auto">
            No family plan to watch their own kid. No app eating phone storage. No password to reset every season. They
            open the team link, type a passcode once, and they&apos;re at every game — grandparents included.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-16 bg-[var(--color-navy-mid)]">
        <div className="max-w-[760px] mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">STRAIGHT ANSWERS</h2>
          <div className="space-y-6">
            {FAQS.map((item) => (
              <div key={item.q} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-2">{item.q}</h3>
                <p className="text-slate-400 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 text-center relative bg-gradient-to-b from-[var(--color-navy-mid)] to-[var(--color-navy)]">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500/30 to-transparent" />
        <div className="max-w-[600px] mx-auto bg-gradient-to-br from-green-500/[0.08] to-blue-500/[0.06] border border-green-500/20 rounded-3xl p-12 md:p-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">TALK TO RON</h2>
          <p className="text-slate-400 mb-8 text-lg leading-relaxed">
            My-Team Sports is built and run by one person, and you&apos;ll be talking to him. Tell us about your league —
            sports, number of teams, when your season starts — and you&apos;ll hear back, usually the same day.
          </p>
          <a href={MAILTO} className={btn}>EMAIL RON ABOUT YOUR LEAGUE</a>
          <p className="mt-4 text-xs text-slate-500">Or just reply to the email that brought you here.</p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
