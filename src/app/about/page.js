import { SiteNav, SiteFooter, CTASection, PageHero } from "@/components/marketing";

export const metadata = {
  title: "About — Youth Sports Without the App",
  description:
    "My-Team Sports gives every youth sports team a simple, beautiful website — no app downloads, no parent accounts, and never a paywall to watch your own kid.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About | My-Team Sports",
    description:
      "Why we built a youth sports team website with no app, no accounts, and no paywall for parents.",
    url: "https://my-teamsports.com/about",
  },
};

const VALUES = [
  { icon: "🚫", title: "No app, ever", desc: "Every other platform wants parents to download an app and create an account. We built the whole thing to live in a web browser, so anyone with a link can be at the game." },
  { icon: "💸", title: "Free for families", desc: "Parents should never pay a subscription to watch their own child play. Grandparents shouldn't hit a paywall. Parent access is free, and it always will be." },
  { icon: "⚡", title: "Five-minute setup", desc: "Coaches are volunteers, not web developers. Pick a sport, name the team, share a passcode — the site does the rest. No training, no manual." },
  { icon: "🔒", title: "Private by default", desc: "Team sites are gated behind a passcode you control. Rosters, photos, and schedules stay with your team — not splashed across the public internet." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <SiteNav />
      <PageHero
        title="YOUTH SPORTS,"
        accent="MINUS THE HASSLE."
        subtitle="My-Team Sports started with a simple frustration: keeping a youth team organized shouldn't require an app, a login for every parent, or a subscription to watch your own kid."
      />

      {/* STORY */}
      <section className="px-6 py-16">
        <div className="max-w-[760px] mx-auto space-y-6 text-slate-300 text-lg leading-relaxed">
          <p>
            Coaching a youth team already means juggling lineups, snack schedules, rained-out games, and a group text
            that never stops buzzing. The tools that promise to help often make it worse — another app to install,
            another account for every parent, and highlights of your own child locked behind a paywall.
          </p>
          <p>
            We thought it should be the opposite. A coach should be able to spin up a real team website in the time it
            takes to fill out a lineup card. Parents — and grandparents three states away — should be able to open one
            link, type a passcode once, and see everything: the roster, the schedule, the stats, the photos, and the
            game film.
          </p>
          <p>
            <span className="text-white font-medium">That&apos;s the whole idea.</span> One simple, beautiful home for
            your team that everyone can reach, nobody has to pay for, and no one needs to download.
          </p>
        </div>
      </section>

      {/* VALUES */}
      <section className="px-6 py-16 bg-[var(--color-navy-mid)]">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-5xl font-bold mb-3">WHAT WE STAND FOR</h2>
          <p className="text-slate-400 text-lg max-w-[560px] mx-auto">A few principles we won&apos;t compromise on.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[900px] mx-auto">
          {VALUES.map((v) => (
            <div key={v.title} className="bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.06] rounded-2xl p-8 transition-all duration-300 hover:border-blue-500/25 hover:-translate-y-0.5">
              <div className="text-3xl mb-4">{v.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-white">{v.title}</h3>
              <p className="text-slate-400 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHO IT'S FOR */}
      <section className="px-6 py-16">
        <div className="max-w-[760px] mx-auto bg-gradient-to-br from-blue-500/[0.08] to-green-500/[0.05] border border-blue-500/20 rounded-3xl p-10 md:p-12 text-center">
          <div className="text-4xl mb-4">🏆</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">BUILT FOR EVERY TEAM</h2>
          <p className="text-slate-400 text-lg leading-relaxed max-w-[640px] mx-auto">
            Baseball, softball, football, basketball, soccer, volleyball, hockey — rec leagues, travel teams, and
            everything in between. If you&apos;ve got a roster and a season, you&apos;ve got a home here.
          </p>
        </div>
      </section>

      <CTASection />
      <SiteFooter />
    </div>
  );
}
