import Link from "next/link";
import { SiteNav, SiteFooter, CTASection, PageHero } from "@/components/marketing";

export const metadata = {
  title: "Pricing — Free for the 2026 Season",
  description:
    "My-Team Sports is free for the entire 2026 season, and parents never pay a cent. One simple plan with rosters, schedules, stats, photos, and game film included.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Pricing — Free for the 2026 Season | My-Team Sports",
    description:
      "Free for coaches all 2026 season. Parents never pay. Rosters, schedules, stats, photos, and game film — all included.",
    url: "https://my-teamsports.com/pricing",
  },
};

const INCLUDED = [
  "Unlimited players and coaches",
  "Full schedule with parent RSVPs",
  "Game stats & automatic season totals",
  "Win-loss record that updates everywhere",
  "Team photo gallery with parent uploads",
  "Game film via YouTube & Vimeo links",
  "Announcements & message board",
  "Coach's notes and practice plans",
  "Your own shareable team link + passcode",
  "Works on every phone, tablet, and computer",
];

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      <SiteNav />
      <PageHero
        badge="Free for the 2026 season"
        title="SIMPLE PRICING."
        accent="NO SURPRISES."
        subtitle="One plan. Everything included. Free for coaches all season — and parents never pay a dime, ever."
      />

      {/* PRICING CARD */}
      <section className="px-6 pb-8 -mt-4">
        <div className="max-w-[520px] mx-auto bg-gradient-to-br from-green-500/[0.08] to-blue-500/[0.05] border border-green-500/25 rounded-3xl p-10 text-center">
          <p className="text-xs uppercase tracking-widest text-green-400 font-bold mb-4">Coach Plan</p>
          <div className="flex items-end justify-center gap-2 mb-2">
            <span className="font-[family-name:var(--font-oswald)] text-7xl font-bold text-white">$0</span>
            <span className="text-slate-400 mb-3 text-lg">/ 2026 season</span>
          </div>
          <p className="text-slate-400 mb-8">Stand up your whole team in about 5 minutes.</p>
          <ul className="text-left space-y-3 mb-9">
            {INCLUDED.map((item) => (
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
            CREATE YOUR TEAM — FREE
          </Link>
          <p className="mt-4 text-xs text-slate-500">No credit card required.</p>
        </div>
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
            {[
              { q: "Is it really free?", a: "Yes. Coaches pay nothing for the entire 2026 season, and parents never pay at all. You can build a full team site without entering a credit card." },
              { q: "What happens after the 2026 season?", a: "We'll always keep a free tier for parent access. If we introduce paid coach features later, you'll get plenty of notice and your existing team data stays yours." },
              { q: "Are there any hidden fees or upsells?", a: "No. Everything listed above is included. We don't paywall game film, charge per player, or lock features behind add-ons." },
              { q: "Do I need to install anything?", a: "Nothing. It runs in any web browser for both coaches and parents — no app store, no downloads." },
            ].map((item) => (
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
