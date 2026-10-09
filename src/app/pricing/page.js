import Link from "next/link";
import { SiteNav, SiteFooter, CTASection, PageHero } from "@/components/marketing";
import { pricingCopy } from "@/lib/pricingCopy";
import { OG_IMAGES } from "@/lib/seo";

// Prices and the season year come from lib/pricing.js; re-render hourly so
// the page rolls over on January 1 without a deploy.
export const revalidate = 3600;

export function generateMetadata() {
  const c = pricingCopy();
  const title = c.halfOff ? `Pricing — Half Off for the ${c.year} Season` : `Pricing — ${c.season} per Team for the ${c.year} Season`;
  const description = c.halfOff
    ? `My-Team Sports is half off for the ${c.year} launch season — ${c.season} for your whole team, and parents never pay a cent. One simple plan with rosters, schedules, stats, photos, and game film included.`
    : `My-Team Sports is ${c.season} per team for the ${c.year} season, and parents never pay a cent. One simple plan with rosters, schedules, stats, photos, and game film included.`;
  return {
    title,
    description,
    alternates: { canonical: "/pricing" },
    openGraph: {
      title: `${title} | My-Team Sports`,
      description: c.halfOff
        ? `Half-off launch pricing for the ${c.year} season — ${c.season} per team. Parents never pay. Rosters, schedules, stats, photos, and game film — all included.`
        : `${c.season} per team for the ${c.year} season. Parents never pay. Rosters, schedules, stats, photos, and game film — all included.`,
      url: "https://my-teamsports.com/pricing",
      images: OG_IMAGES,
    },
  };
}

const included = (c) => [
  "Unlimited players and coaches",
  "Full schedule with parent RSVPs",
  "Game stats & automatic season totals",
  "Live scoreboard & scorekeeper for every sport",
  "Game-day push alerts on parents' phones",
  "Coach's play board & printable playbook",
  `AI Assistant Coach — briefings, lineups & practice plans (included in your 30-day free trial, then a ${c.ai} add-on)`,
  "Win-loss record that updates everywhere",
  "Team photo gallery with parent uploads",
  "Game film via YouTube & Vimeo links",
  "Announcements & message board",
  "Coach's notes and practice plans",
  "Your own shareable team link + passcode",
  "Works on every phone, tablet, and computer",
];

export default function PricingPage() {
  const c = pricingCopy();
  const faq = [
    {
      q: "How much does it cost?",
      a: c.halfOff
        ? `Your first 30 days are free — no credit card to start. After that, the Coach Plan is ${c.season} for the entire ${c.year} season (half-off launch pricing), and parents never pay a cent. It is one payment, not a subscription, and a pass bought from October 1 also covers all of ${c.nextYear}.`
        : `Your first 30 days are free — no credit card to start. After that, the Coach Plan is ${c.season} for the entire ${c.year} season, and parents never pay a cent. It is one payment, not a subscription, and a pass bought from October 1 also covers all of ${c.nextYear}.`,
    },
    c.halfOff
      ? {
          q: `What happens after the ${c.year} season?`,
          a: `Parents are always free. Starting with the ${c.nextYear} season, the Coach Plan is ${c.regularSeason} per team — you'll get plenty of notice, and your existing team data stays yours. If you bought your pass on or after October 1, ${c.year}, you are already covered through December 31, ${c.nextYear}.`,
        }
      : {
          q: "What happens when the season ends?",
          a: `Parents are always free. The Coach Plan is ${c.season} per team for each calendar year — one payment, not a subscription — and your team data stays yours between seasons. A pass bought on or after October 1 is good through December 31 of the following year.`,
        },
    {
      q: "Are there any hidden fees or upsells?",
      a: `No. Everything listed above is included. We don't paywall game film, charge per player, or lock features behind paywalls. The only optional extra is the AI Assistant Coach — included in your 30-day free trial, then ${c.ai} for the ${c.year} season (bought from October 1, it covers all of ${c.nextYear} too).`,
    },
    { q: "Do I need to install anything?", a: "Nothing. It runs in any web browser for both coaches and parents — no app store, no downloads." },
  ];
  return (
    <div className="min-h-screen">
      <SiteNav />
      <PageHero
        badge={c.halfOff ? `Launch pricing — half off for ${c.year}` : `${c.season} per team for ${c.year}`}
        title="SIMPLE PRICING."
        accent="NO SURPRISES."
        subtitle={c.halfOff
          ? `One plan. Everything included. Half-off launch pricing for coaches in ${c.year} — and parents never pay a dime, ever.`
          : `One plan. Everything included. One payment covers your team for the ${c.year} season — and parents never pay a dime, ever.`}
      />

      {/* PRICING CARD */}
      <section className="px-6 pb-8 -mt-4">
        <div className="max-w-[520px] mx-auto bg-gradient-to-br from-green-500/[0.08] to-blue-500/[0.05] border border-green-500/25 rounded-3xl p-10 text-center">
          <p className="text-xs uppercase tracking-widest text-green-400 font-bold mb-4">Coach Plan</p>
          <div className="flex items-end justify-center gap-2 mb-2">
            <span className="font-[family-name:var(--font-oswald)] text-7xl font-bold text-white">{c.season}</span>
            <span className="text-slate-400 mb-3 text-lg">/ {c.seasonLabel}</span>
          </div>
          {c.halfOff ? (
            <p className="text-sm text-slate-300 mb-1">Half-off launch price. Then <span className="text-white font-semibold">{c.regularSeason} per team</span> for the {c.nextYear} season.</p>
          ) : (
            <p className="text-sm text-slate-300 mb-1">One payment for the whole calendar year. <span className="text-white font-semibold">Not a subscription.</span></p>
          )}
          <p className="text-sm text-green-400 mb-1">Buy from October 1 and your pass covers the rest of {c.year} and all of {c.nextYear}.</p>
          <p className="text-slate-400 mb-8">Stand up your whole team in about 5 minutes.</p>
          <ul className="text-left space-y-3 mb-9">
            {included(c).map((item) => (
              <li key={item} className="flex items-start gap-3 text-slate-300 text-sm">
                <span className="text-[var(--color-accent-green)] mt-0.5">✓</span>
                {item}
              </li>
            ))}
          </ul>
          <Link
            href="/signup"
            className="block w-full bg-[var(--color-accent-green)] text-white font-[family-name:var(--font-oswald)] text-xl font-semibold tracking-wide px-10 py-4 rounded-xl hover:bg-green-500 transition-all duration-200 hover:-translate-y-0.5 shadow-lg shadow-green-500/25"
          >
            START YOUR FREE TRIAL
          </Link>
          <p className="mt-4 text-xs text-slate-500">No credit card required.</p>
        </div>
        <p className="mt-6 text-center text-sm text-slate-400">
          Running a league? League pricing covers every team on one invoice.{" "}
          <Link href="/leagues" className="text-[var(--color-accent-blue)] hover:text-white transition-colors font-medium">Talk to us →</Link>
        </p>
      </section>

      {/* PARENTS FREE */}
      <section className="px-6 py-16">
        <div className="max-w-[900px] mx-auto bg-gradient-to-br from-blue-500/[0.08] to-green-500/[0.05] border border-blue-500/20 rounded-3xl p-10 md:p-12 text-center">
          <div className="text-4xl mb-4">👨‍👩‍👧‍👦</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">PARENTS PAY NOTHING. EVER.</h2>
          <p className="text-slate-400 text-lg leading-relaxed max-w-[640px] mx-auto">
            No subscriptions to watch your own kid. No app eating phone storage. No paywalled highlights.
            Grandma opens the link on her tablet, types the passcode once, and she&apos;s at every game.
            <span className="text-white"> Parent access is free forever — that will never change.</span>
          </p>
        </div>
      </section>

      {/* PRICING FAQ */}
      <section className="px-6 py-16 bg-[var(--color-navy-mid)]">
        <div className="max-w-[760px] mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">PRICING QUESTIONS</h2>
          <div className="space-y-6">
            {faq.map((item) => (
              <div key={item.q} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-2">{item.q}</h3>
                <p className="text-slate-400 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
      <SiteFooter />
    </div>
  );
}
