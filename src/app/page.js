import Link from "next/link";
import ViewPing from "@/components/ViewPing";
import PlayField from "@/components/PlayField";

const FEATURES = [
  { icon: "📋", title: "Team Roster", desc: "Player cards with photos, jersey numbers, positions, and bios. Tap any player for their own page with action shots and season stats." },
  { icon: "📡", title: "Live Scores", desc: "Score the game live from your phone: runs, innings, the clock, and the final all update on your team page in real time. Parents who can't make it follow along from anywhere." },
  { icon: "📅", title: "Schedule + RSVP", desc: "Games, practices, and events — and parents RSVP right on the site. Coaches see exactly who's in before the first pitch." },
  { icon: "📊", title: "Stats & Records", desc: "Track game stats in a simple grid. Season totals, batting averages, points per game, and your win-loss record — computed automatically." },
  { icon: "🎬", title: "Game Film", desc: "Paste a YouTube or Vimeo link and the full game plays right on your team site. Free, unlimited, no subscriptions for anyone." },
  { icon: "💬", title: "Message Board", desc: "Announcements that stay informational, uplifting, and positive. Pin the important stuff. Email subscribers with one click. No group-text chaos." },
  { icon: "📝", title: "Coach's Notes", desc: "Practice plans, game prep, and strategy in one place the whole team can find — not buried in a 200-message thread." },
  { icon: "📸", title: "Team Photos", desc: "A shared gallery for the season. Parents upload their own action shots straight from the bleachers — no account needed." },
  { icon: "🏆", title: "Win-Loss Record", desc: "Post a result like \"W 9-4\" and your record badge updates everywhere. Let the season tell its story." },
  { icon: "🤝", title: "Coaching Staff", desc: "Invite assistant coaches by email. They get full team management — you stay in charge of the big stuff." },
];

const SPORTS = [
  { emoji: "⚾", name: "Baseball", hover: "hover:border-red-500/50 hover:bg-red-500/10" },
  { emoji: "🏈", name: "Football", hover: "hover:border-green-500/50 hover:bg-green-500/10" },
  { emoji: "🚩", name: "Flag Football", hover: "hover:border-emerald-500/50 hover:bg-emerald-500/10" },
  { emoji: "🏀", name: "Basketball", hover: "hover:border-orange-500/50 hover:bg-orange-500/10" },
  { emoji: "⚽", name: "Soccer", hover: "hover:border-blue-500/50 hover:bg-blue-500/10" },
  { emoji: "🥎", name: "Softball", hover: "hover:border-yellow-500/50 hover:bg-yellow-500/10" },
  { emoji: "🏐", name: "Volleyball", hover: "hover:border-purple-500/50 hover:bg-purple-500/10" },
  { emoji: "🏒", name: "Hockey", hover: "hover:border-cyan-500/50 hover:bg-cyan-500/10" },
];

const DEMO_TEAMS = [
  { emoji: "⚾", name: "Riverside Raptors 12U", sport: "Baseball", slug: "riverside-raptors-12u", passcode: "XK7M2P" },
  { emoji: "🏀", name: "Downtown Dragons 16U", sport: "Basketball", slug: "downtown-dragons-16u", passcode: "DRGN24" },
  { emoji: "🚩", name: "Westside Wolves 12U", sport: "Flag Football", slug: "westside-wolves-12u", passcode: "WVS24K" },
];

const DEMO_PLAY = {
  v: 1, los: 0.5,
  tokens: [
    { id: "c", kind: "c", x: 0.50, y: 0.57 },
    { id: "q", kind: "qb", x: 0.50, y: 0.67 },
    { id: "r", kind: "rb", x: 0.37, y: 0.66 },
    { id: "w1", kind: "wr", x: 0.16, y: 0.57 },
    { id: "w2", kind: "wr", x: 0.84, y: 0.57 },
    { id: "o1", kind: "o", x: 0.63, y: 0.57 },
    { id: "x1", kind: "x", x: 0.30, y: 0.40 },
    { id: "x2", kind: "x", x: 0.62, y: 0.40 },
    { id: "x3", kind: "x", x: 0.50, y: 0.28 },
  ],
  lines: [
    { id: "l1", tool: "route", color: "#ffe14d", pts: [{ x: 0.16, y: 0.55 }, { x: 0.16, y: 0.30 }, { x: 0.16, y: 0.16 }] },
    { id: "l2", tool: "route", color: "#ffe14d", pts: [{ x: 0.84, y: 0.55 }, { x: 0.84, y: 0.44 }, { x: 0.66, y: 0.33 }] },
    { id: "l3", tool: "route", color: "#7cc4ff", pts: [{ x: 0.37, y: 0.64 }, { x: 0.24, y: 0.60 }, { x: 0.12, y: 0.58 }] },
    { id: "l4", tool: "route", color: "#ffe14d", pts: [{ x: 0.63, y: 0.55 }, { x: 0.63, y: 0.40 }, { x: 0.74, y: 0.30 }] },
  ],
  texts: [],
};

export default function Home() {
  return (
    <div className="min-h-screen">
      <ViewPing pageKey="homepage" />
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-navy)]/95 backdrop-blur-xl border-b border-white/5 px-6 h-[70px] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-[var(--color-accent-blue)] to-blue-700 rounded-xl flex items-center justify-center text-lg shadow-lg shadow-blue-500/20">
            ⚾
          </div>
          <span className="font-[family-name:var(--font-oswald)] font-bold text-xl tracking-wide text-white">
            MY-TEAM <span className="text-[var(--color-accent-blue)]">SPORTS</span>
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Features</a>
          <a href="#playbook" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Playbook</a>
          <a href="#ai-coach" className="text-sm font-medium text-purple-300 hover:text-white transition-colors">AI Coach</a>
          <a href="#how" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">How It Works</a>
          <a href="#demo" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Live Demo</a>
          <Link href="/pricing" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Pricing</Link>
          <Link href="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Login</Link>
          <Link href="/signup" className="bg-[var(--color-accent-green)] text-white text-sm font-semibold px-5 py-2 rounded-md hover:bg-green-500 transition-all">
            Get Started Free
          </Link>
        </div>
        <Link href="/signup" className="md:hidden bg-[var(--color-accent-green)] text-white text-sm font-semibold px-4 py-2 rounded-md">
          Start Free
        </Link>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-28 pb-16 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-navy)] via-[#0d1f3c] to-[var(--color-navy-mid)]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[60%] bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.08),transparent_70%)]" />
          <div className="absolute bottom-0 left-0 right-0 h-[30%] bg-gradient-to-t from-[rgba(26,92,42,0.12)] to-transparent" />
          {/* floating sport emojis */}
          <div className="hidden lg:block absolute top-[18%] left-[8%] text-5xl opacity-20 animate-float">⚾</div>
          <div className="hidden lg:block absolute top-[30%] right-[10%] text-6xl opacity-20 animate-float-delay">🏀</div>
          <div className="hidden lg:block absolute bottom-[22%] left-[14%] text-5xl opacity-20 animate-float-delay">🏈</div>
          <div className="hidden lg:block absolute bottom-[30%] right-[16%] text-5xl opacity-20 animate-float">⚽</div>
        </div>

        <div className="relative z-10 max-w-[940px] text-center">
          <div className="inline-flex items-center gap-2.5 bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-bold tracking-widest uppercase px-5 py-2.5 rounded-full mb-7">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent-green)] animate-live" />
            Live now · Free for the 2026 season
          </div>

          <h1 className="text-6xl md:text-8xl font-bold leading-none tracking-tight mb-2">
            YOUR TEAM.
            <br />
            <span className="text-[var(--color-accent-blue)]">YOUR WAY.</span>
          </h1>

          <p className="text-lg md:text-xl font-light text-slate-400 max-w-[640px] mx-auto mt-6 mb-9 leading-relaxed">
            A beautiful website for your youth sports team — roster, schedule, stats, photos, and game film.
            Set up in 5 minutes. <span className="text-white font-normal">Parents never download an app, never create an account, never pay a dime.</span>
          </p>

          <div className="flex flex-wrap justify-center items-center gap-4 mb-10">
            <Link
              href="/signup"
              className="bg-[var(--color-accent-green)] text-white font-[family-name:var(--font-oswald)] text-xl font-semibold tracking-wide px-10 py-4 rounded-xl hover:bg-green-500 transition-all duration-200 hover:-translate-y-0.5 shadow-lg shadow-green-500/25 hover:shadow-green-500/40"
            >
              CREATE YOUR TEAM — FREE
            </Link>
            <a
              href="#demo"
              className="border border-white/15 text-white font-[family-name:var(--font-oswald)] text-xl font-semibold tracking-wide px-8 py-4 rounded-xl hover:bg-white/5 transition-all"
            >
              👀 SEE A LIVE TEAM
            </a>
          </div>

          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-slate-500 mb-4">
            <span>⚡ Live in 5 minutes</span>
            <span>📱 Works on any device</span>
            <span>🚫 No app store needed</span>
            <span>💸 $0 for parents — always</span>
          </div>

          <p className="text-center text-sm text-slate-400 mb-12 max-w-xl mx-auto">
            📲 Want one-tap access? Add it to your home screen on any phone, tablet, or computer and it opens just like an app — still no app store, no account.
          </p>

          <div>
            <h3 className="font-[family-name:var(--font-oswald)] text-sm font-medium text-slate-500 tracking-[0.15em] uppercase mb-5">
              Every Sport Welcome
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {SPORTS.map((sport) => (
                <Link
                  key={sport.name}
                  href="/signup"
                  className={`flex items-center gap-2.5 bg-white/[0.04] border border-white/[0.08] px-6 py-3 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${sport.hover}`}
                >
                  <span className="text-2xl">{sport.emoji}</span>
                  <span className="font-[family-name:var(--font-oswald)] text-lg font-semibold text-white tracking-wide">{sport.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="px-6 py-24 bg-gradient-to-b from-[var(--color-navy-mid)] to-[var(--color-navy)] relative scroll-mt-16">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-3">UP AND RUNNING IN MINUTES</h2>
          <p className="text-slate-400 text-lg max-w-[500px] mx-auto">Three steps. That&apos;s it. Your team&apos;s website is live before the next practice.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-[1100px] mx-auto">
          {[
            { num: "01", icon: "🏟️", title: "Create Your Team", desc: "Pick your sport, name your team, upload your logo. You get a shareable team link and a private passcode instantly." },
            { num: "02", icon: "📱", title: "Share the Passcode", desc: "Text the link and passcode to your parents. They open it in any browser — no app to download, no account to create." },
            { num: "03", icon: "🎉", title: "Run Your Season", desc: "Post the schedule, parents RSVP, you track stats, everyone shares photos and game film. The site does the rest." },
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

      {/* FEATURES */}
      <section id="features" className="px-6 py-24 bg-[var(--color-navy)] scroll-mt-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-3">EVERYTHING YOUR TEAM NEEDS</h2>
          <p className="text-slate-400 text-lg">Built for coaches who run teams, not IT departments. All of it live today.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1100px] mx-auto">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.06] rounded-2xl p-8 transition-all duration-300 hover:border-blue-500/25 hover:-translate-y-0.5">
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold mb-2 text-white">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PLAYBOOK SHOWCASE */}
      <section id="playbook" className="px-6 py-24 bg-[var(--color-navy)] scroll-mt-16">
        <div className="max-w-[1100px] mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <span className="inline-block text-xs uppercase tracking-widest text-[var(--color-accent-green)] mb-3">New · Now for every sport</span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">THE COACH&apos;S PLAY BOARD</h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-6">
              Draw up plays on a real dry-erase board, right from your phone — football routes, soccer set pieces, basketball sets, hockey breakouts, volleyball rotations, baseball alignments. Drop players, draw the play, then save it to your team playbook and print clean sheets for practice or the sideline.
            </p>
            <ul className="space-y-2 text-slate-300 mb-8">
              <li className="flex gap-2"><span className="text-[var(--color-accent-green)]">✓</span> Tap to place players, drag to draw the play</li>
              <li className="flex gap-2"><span className="text-[var(--color-accent-green)]">✓</span> Save your whole playbook in one place</li>
              <li className="flex gap-2"><span className="text-[var(--color-accent-green)]">✓</span> Players study the plays on the team site</li>
              <li className="flex gap-2"><span className="text-[var(--color-accent-green)]">✓</span> Print a single play or the full book</li>
            </ul>
            <Link href="/signup" className="inline-block bg-[var(--color-accent-green)] text-white font-[family-name:var(--font-oswald)] text-base font-semibold tracking-wide px-8 py-3 rounded-xl hover:bg-green-500 transition-all duration-200 hover:-translate-y-0.5 shadow-lg shadow-green-500/25">
              START YOUR PLAYBOOK →
            </Link>
          </div>
          <div className="order-1 lg:order-2 mx-auto w-full max-w-[420px]">
            <div className="grid grid-cols-3 gap-3">
              {[
                { sport: "football", label: "Football", diagram: DEMO_PLAY },
                { sport: "soccer", label: "Soccer" },
                { sport: "basketball", label: "Basketball" },
                { sport: "hockey", label: "Hockey" },
                { sport: "volleyball", label: "Volleyball" },
                { sport: "baseball", label: "Baseball" },
              ].map((f) => (
                <div key={f.sport} className="text-center">
                  <div className="rounded-lg overflow-hidden border border-white/10 shadow-lg">
                    <PlayField diagram={f.diagram || {}} theme="turf" sport={f.sport} style={{ display: "block", width: "100%" }} />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5">{f.label}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-slate-500 mt-4">One board, every sport — football, flag football, soccer, basketball, hockey, volleyball, baseball &amp; softball.</p>
          </div>
        </div>
      </section>

      {/* AI ASSISTANT COACH */}
      <section id="ai-coach" className="px-6 py-24 bg-gradient-to-b from-[var(--color-navy)] to-[var(--color-navy-mid)] scroll-mt-16">
        <div className="max-w-[1100px] mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Sample briefing card */}
          <div className="order-1 mx-auto w-full max-w-[440px]">
            <div className="rounded-2xl border border-purple-500/25 bg-[var(--color-navy-mid)] shadow-2xl shadow-purple-900/30 overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10 bg-purple-500/10">
                <span className="text-2xl">🧠</span>
                <div>
                  <p className="text-sm font-semibold text-white leading-tight">Coach&apos;s Briefing</p>
                  <p className="text-[11px] text-slate-400">Riverside Raptors 12U · 7&ndash;2 this season</p>
                </div>
              </div>
              <div className="px-5 py-4 space-y-3 text-sm">
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-purple-300 font-semibold mb-1">What&apos;s working</p>
                  <p className="text-slate-300 leading-snug">Bats are hot &mdash; 6.4 runs a game over the last three. Maya and Jordan are on base at a .480 clip and setting the table.</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-purple-300 font-semibold mb-1">Work on</p>
                  <p className="text-slate-300 leading-snug">5 unearned runs in the last two games &mdash; spend 10 minutes on the routine grounder at practice.</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-purple-300 font-semibold mb-1">Player to watch</p>
                  <p className="text-slate-300 leading-snug">Sam has reached base in 5 straight. Earn him a few more at-bats higher in the order.</p>
                </div>
              </div>
              <div className="px-5 py-3 border-t border-white/10 text-[11px] text-slate-500">
                Built from your real roster, scores &amp; stats &middot; AI-generated &mdash; use your judgment
              </div>
            </div>
          </div>

          {/* Copy */}
          <div className="order-2">
            <span className="inline-block text-xs uppercase tracking-widest text-purple-300 font-semibold bg-purple-500/15 border border-purple-500/30 rounded-full px-3 py-1 mb-4">Premium &middot; Coach Plan</span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">YOUR AI ASSISTANT COACH</h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-6">
              An assistant coach that actually knows your team. It reads your real roster, record, results and player stats &mdash; then gives you three things: a straight-talking briefing, a data-built lineup, and a printable practice plan aimed at where your team needs work. Any sport, any level.
            </p>
            <ul className="space-y-2 text-slate-300 mb-8">
              <li className="flex gap-2"><span className="text-purple-400 shrink-0">✓</span> <span><span className="text-white font-semibold">Coach&apos;s briefing</span> &mdash; what&apos;s working, what to drill, and who to watch, from your real game data</span></li>
              <li className="flex gap-2"><span className="text-purple-400 shrink-0">✓</span> <span><span className="text-white font-semibold">Lineup advisor</span> &mdash; a batting order built from your on-base and power numbers (baseball &amp; softball)</span></li>
              <li className="flex gap-2"><span className="text-purple-400 shrink-0">✓</span> <span><span className="text-white font-semibold">Practice planner</span> &mdash; a timed, printable practice aimed at your team&apos;s weak spots</span></li>
              <li className="flex gap-2"><span className="text-purple-400 shrink-0">✓</span> Works for baseball, softball, soccer, basketball, football &amp; more</li>
            </ul>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/signup" className="inline-block bg-purple-600 text-white font-[family-name:var(--font-oswald)] text-base font-semibold tracking-wide px-8 py-3 rounded-xl hover:bg-purple-500 transition-all duration-200 hover:-translate-y-0.5 shadow-lg shadow-purple-600/25">
                MEET YOUR AI COACH →
              </Link>
              <span className="text-sm text-slate-400">Free to preview for the 2026 season</span>
            </div>
          </div>
        </div>
      </section>

      {/* PARENTS CALLOUT */}
      <section className="px-6 py-20 bg-gradient-to-b from-[var(--color-navy)] to-[var(--color-navy-mid)]">
        <div className="max-w-[900px] mx-auto bg-gradient-to-br from-blue-500/[0.08] to-green-500/[0.05] border border-blue-500/20 rounded-3xl p-10 md:p-12 text-center">
          <div className="text-4xl mb-4">👨‍👩‍👧‍👦</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">PARENTS PAY NOTHING. EVER.</h2>
          <p className="text-slate-400 text-lg leading-relaxed max-w-[640px] mx-auto">
            No subscriptions to watch your own kid. No app eating your storage. No paywalled highlights.
            Grandma opens the link on her tablet, types the passcode once, and she&apos;s at every game.
            <span className="text-white"> That&apos;s how youth sports should work.</span>
          </p>
        </div>
      </section>

      {/* LIVE DEMO */}
      <section id="demo" className="px-6 py-24 bg-[var(--color-navy-mid)] scroll-mt-16">
        <div className="max-w-[1100px] mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-3">DON&apos;T TAKE OUR WORD FOR IT</h2>
          <p className="text-slate-400 text-lg mb-10">
            Walk through real, live team sites — roster, stats, schedule, the works. Three sports, three teams.
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {DEMO_TEAMS.map((team) => (
              <div key={team.slug} className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-8 flex flex-col items-center">
                <div className="text-5xl mb-3">{team.emoji}</div>
                <h3 className="font-[family-name:var(--font-oswald)] text-2xl font-bold mb-1">{team.name}</h3>
                <p className="text-xs uppercase tracking-widest text-slate-500 mb-5">{team.sport}</p>
                <div className="bg-black/20 rounded-xl px-6 py-3 mb-6">
                  <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Demo Passcode</p>
                  <p className="text-2xl font-mono font-bold tracking-[0.3em] text-white">{team.passcode}</p>
                </div>
                <Link
                  href={`/team/${team.slug}`}
                  className="mt-auto inline-block bg-[var(--color-accent-blue)] text-white font-[family-name:var(--font-oswald)] text-base font-semibold tracking-wide px-8 py-3 rounded-xl hover:bg-blue-600 transition-all duration-200 hover:-translate-y-0.5 shadow-lg shadow-blue-500/25"
                >
                  TOUR THIS TEAM →
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs text-slate-500">Enter the passcode when asked — just like a real parent would.</p>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-6 py-24 text-center relative bg-gradient-to-b from-[var(--color-navy-mid)] to-[var(--color-navy)]">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500/30 to-transparent" />
        <div className="max-w-[600px] mx-auto bg-gradient-to-br from-green-500/[0.08] to-blue-500/[0.06] border border-green-500/20 rounded-3xl p-12 md:p-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            YOUR TEAM&apos;S HOME<br />IS WAITING.
          </h2>
          <p className="text-slate-400 mb-8 text-lg leading-relaxed">
            It&apos;s live. It&apos;s ready. It takes 5 minutes, and it&apos;s free for the 2026 season.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-[var(--color-accent-green)] text-white font-[family-name:var(--font-oswald)] text-lg font-semibold tracking-wide px-10 py-4 rounded-xl hover:bg-green-500 transition-all duration-200 hover:-translate-y-0.5 shadow-lg shadow-green-500/25 hover:shadow-green-500/35"
          >
            CREATE YOUR TEAM NOW
          </Link>
          <p className="mt-4 text-xs text-slate-500">No credit card. No app. No catch.</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-6 py-12 text-center border-t border-white/5 bg-[var(--color-navy-mid)]">
        <p className="font-[family-name:var(--font-oswald)] text-sm font-semibold text-slate-500 mb-3">MY-TEAM SPORTS.com</p>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-4 text-xs">
          <Link href="/signup" className="text-slate-500 hover:text-white transition-colors">Create a Team</Link>
          <Link href="/login" className="text-slate-500 hover:text-white transition-colors">Coach Login</Link>
          <Link href="/pricing" className="text-slate-500 hover:text-white transition-colors">Pricing</Link>
          <Link href="/how-it-works" className="text-slate-500 hover:text-white transition-colors">How It Works</Link>
          <Link href="/faq" className="text-slate-500 hover:text-white transition-colors">FAQ</Link>
          <Link href="/about" className="text-slate-500 hover:text-white transition-colors">About</Link>
          <a href="#demo" className="text-slate-500 hover:text-white transition-colors">Live Demo</a>
        </div>
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mb-4 text-xs">
          <Link href="/privacy" className="text-slate-500 hover:text-white transition-colors">Privacy</Link>
          <Link href="/terms" className="text-slate-500 hover:text-white transition-colors">Terms</Link>
          <Link href="/child-safety" className="text-slate-500 hover:text-white transition-colors">Child Safety</Link>
        </div>
        <p className="text-xs text-slate-600">&copy; 2026 My-Team Sports. All rights reserved.</p>
      </footer>
    </div>
  );
}
