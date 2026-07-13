import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteNav, SiteFooter, CTASection } from "@/components/marketing";
import { getAllSports, getSport } from "@/lib/sports";

const SITE_URL = "https://my-teamsports.com";

// Universal features, framed the same on every sport page.
const CORE_FEATURES = [
  { icon: "📋", title: "Team Roster", desc: "Player cards with photos, numbers, positions, and bios — each with its own page." },
  { icon: "📅", title: "Schedule + RSVP", desc: "Games, practices, and events, with parents RSVPing right on the site." },
  { icon: "📡", title: "Live Scores", desc: "Score from your phone; the game updates on your team page in real time." },
  { icon: "📊", title: "Season Stats", desc: "Enter games in a simple grid — totals and your record compute themselves." },
  { icon: "🎬", title: "Game Film", desc: "Paste a YouTube or Vimeo link and the full game plays on your team site." },
  { icon: "📸", title: "Team Photos", desc: "A shared gallery parents add to straight from the stands — no account needed." },
  { icon: "🔔", title: "Game-Day Alerts", desc: "Parents tap once for push alerts on announcements and game updates." },
  { icon: "💬", title: "Message Board", desc: "Announcements that stay positive, pinned, and out of a group-text pile-up." },
];

export function generateStaticParams() {
  return getAllSports().map((s) => ({ sport: s.slug }));
}

export async function generateMetadata({ params }) {
  const { sport } = await params;
  const data = getSport(sport);
  if (!data) return { title: "Page Not Found" };
  return {
    title: data.titleTag,
    description: data.metaDescription,
    keywords: data.keywords,
    alternates: { canonical: `/sports/${data.slug}` },
    openGraph: {
      title: `${data.titleTag} | My-Team Sports`,
      description: data.metaDescription,
      url: `${SITE_URL}/sports/${data.slug}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: data.titleTag,
      description: data.metaDescription,
    },
  };
}

export default async function SportPage({ params }) {
  const { sport } = await params;
  const data = getSport(sport);
  if (!data) notFound();

  const pageUrl = `${SITE_URL}/sports/${data.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Sports", item: `${SITE_URL}/sports` },
          { "@type": "ListItem", position: 3, name: `${data.sport} Team Website`, item: pageUrl },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: data.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteNav />

      {/* HERO */}
      <section className="relative px-6 pt-36 pb-16 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-navy)] via-[#0d1f3c] to-[var(--color-navy-mid)]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[70%] bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.08),transparent_70%)]" />
        </div>
        <div className="relative z-10 max-w-[860px] mx-auto text-center">
          <div className={`inline-flex items-center gap-2.5 ${data.accentBg} border ${data.accentBorder} ${data.accentText} text-xs font-bold tracking-widest uppercase px-5 py-2.5 rounded-full mb-7`}>
            <span className="text-lg leading-none">{data.emoji}</span>
            {data.sport} · Half off for the 2026 season
          </div>
          <h1 className="text-5xl md:text-7xl font-bold leading-none tracking-tight mb-5">
            {data.heroTitle}
            <br />
            <span className="text-[var(--color-accent-blue)]">{data.heroAccent}</span>
          </h1>
          <p className="text-lg md:text-xl font-light text-slate-400 max-w-[660px] mx-auto leading-relaxed mb-9">
            {data.heroSub}
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4">
            <Link
              href="/signup"
              className="bg-[var(--color-accent-green)] text-white font-[family-name:var(--font-oswald)] text-xl font-semibold tracking-wide px-10 py-4 rounded-xl hover:bg-green-500 transition-all duration-200 hover:-translate-y-0.5 shadow-lg shadow-green-500/25 hover:shadow-green-500/40"
            >
              CREATE YOUR TEAM — FREE
            </Link>
            <Link
              href="/#demo"
              className="border border-white/15 text-white font-[family-name:var(--font-oswald)] text-xl font-semibold tracking-wide px-8 py-4 rounded-xl hover:bg-white/5 transition-all"
            >
              👀 SEE A LIVE TEAM
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-slate-500 mt-8">
            <span>⚡ Live in 5 minutes</span>
            <span>📱 Works on any device</span>
            <span>🚫 No app store</span>
            <span>💸 $0 for parents — always</span>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="px-6 py-20 bg-[var(--color-navy)]">
        <div className="max-w-[760px] mx-auto text-lg leading-relaxed text-slate-300 space-y-5">
          {data.intro.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </section>

      {/* SPORT SHOWCASE — mockup card + sport-specific highlights */}
      <section className="px-6 py-20 bg-gradient-to-b from-[var(--color-navy)] to-[var(--color-navy-mid)]">
        <div className="max-w-[1100px] mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Mockup */}
          <div className="order-1 mx-auto w-full max-w-[420px]">
            <div className={`rounded-2xl border ${data.accentBorder} bg-[var(--color-navy-mid)] shadow-2xl overflow-hidden`}>
              <div className={`flex items-center justify-between gap-3 px-5 py-4 border-b border-white/10 ${data.accentBg}`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{data.emoji}</span>
                  <div>
                    <p className="text-sm font-semibold text-white leading-tight">{data.mockup.team}</p>
                    <p className="text-[11px] text-slate-400">{data.mockup.record} this season</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${data.accentText}`}>Team Page</span>
              </div>
              <div className="px-5 py-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-accent-green)] animate-live" />
                  <p className="text-sm font-semibold text-white">{data.mockup.live}</p>
                </div>
                <p className="text-[11px] uppercase tracking-widest text-slate-500 font-semibold mb-2">Season leaders</p>
                <div className="space-y-2">
                  {data.mockup.leaders.map((l) => (
                    <div key={l.name} className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">{l.name}</span>
                      <span className={`font-semibold ${data.accentText}`}>{l.line}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="px-5 py-3 border-t border-white/10 text-[11px] text-slate-500">
                Live, roster, stats &amp; film — one passcode link for every family
              </div>
            </div>
          </div>
          {/* Highlights */}
          <div className="order-2">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">BUILT FOR {data.sport.toUpperCase()}</h2>
            <ul className="space-y-4">
              {data.highlights.map((h, i) => (
                <li key={i} className="flex gap-3 text-slate-300 leading-relaxed">
                  <span className={`shrink-0 ${data.accentText}`}>✓</span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-2">
              <span className="text-[11px] uppercase tracking-widest text-slate-500 font-semibold w-full mb-1">Positions, covered</span>
              {data.positions.map((p) => (
                <span key={p} className={`text-xs font-semibold ${data.accentText} ${data.accentBg} border ${data.accentBorder} rounded-md px-2.5 py-1`}>
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES */}
      <section className="px-6 py-20 bg-[var(--color-navy)]">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">EVERYTHING YOUR {data.sport.toUpperCase()} TEAM NEEDS</h2>
          <p className="text-slate-400 text-lg">One page for the roster, the schedule, the {data.scoring}, and the season. All live today.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-[1100px] mx-auto">
          {CORE_FEATURES.map((f) => (
            <div key={f.title} className="bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.06] rounded-2xl p-6 transition-all duration-300 hover:border-blue-500/25 hover:-translate-y-0.5">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="text-base font-semibold mb-1.5 text-white">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-6 py-20 bg-gradient-to-b from-[var(--color-navy)] to-[var(--color-navy-mid)]">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">YOUR {data.sport.toUpperCase()} SITE, LIVE IN MINUTES</h2>
          <p className="text-slate-400 text-lg max-w-[520px] mx-auto">Three steps, and it&apos;s up before the next practice.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-[1000px] mx-auto">
          {[
            { num: "01", icon: "🏟️", title: "Create Your Team", desc: `Pick ${data.sport.toLowerCase()}, name your team, upload your logo. You get a shareable link and a private passcode instantly.` },
            { num: "02", icon: "📱", title: "Share the Passcode", desc: "Text the link and passcode to your parents. They open it in any browser — no app, no account." },
            { num: "03", icon: "🎉", title: "Run Your Season", desc: "Post the schedule, parents RSVP, you track stats and score live, everyone shares photos and film." },
          ].map((step) => (
            <div key={step.num} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 text-center transition-all duration-300 hover:bg-white/[0.05] hover:border-blue-500/20 hover:-translate-y-1">
              <div className="font-[family-name:var(--font-oswald)] text-5xl font-bold text-blue-500/15 mb-3">{step.num}</div>
              <div className="text-4xl mb-4">{step.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-white">{step.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-20 bg-[var(--color-navy)]">
        <div className="max-w-[760px] mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center">{data.sport.toUpperCase()} TEAM WEBSITE — FAQ</h2>
          <div className="space-y-4">
            {data.faqs.map((f, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-2">{f.q}</h3>
                <p className="text-slate-400 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RELATED READING */}
      {data.related?.length ? (
        <section className="px-6 py-20 bg-gradient-to-b from-[var(--color-navy)] to-[var(--color-navy-mid)]">
          <div className="max-w-[900px] mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">More {data.sport} coaching resources</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {data.related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/blog/${r.slug}`}
                  className="block bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 transition-all hover:border-blue-500/25 hover:-translate-y-0.5"
                >
                  <span className={`text-[11px] uppercase tracking-widest font-semibold ${data.accentText}`}>Guide</span>
                  <p className="text-white font-medium mt-1 leading-snug">{r.title}</p>
                </Link>
              ))}
            </div>
            <p className="text-center mt-8">
              <Link href="/sports" className="text-sm text-slate-400 hover:text-white transition-colors">
                ← Every sport we build team websites for
              </Link>
            </p>
          </div>
        </section>
      ) : null}

      <CTASection />
      <SiteFooter />
    </div>
  );
}
