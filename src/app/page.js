import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen">
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
          <Link href="#" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Home</Link>
          <Link href="#" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Team Roster</Link>
          <Link href="#" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Game Schedule</Link>
          <Link href="#" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Photos</Link>
          <Link href="#" className="bg-[var(--color-accent-blue)] text-white text-sm font-semibold px-5 py-2 rounded-md hover:bg-blue-600 transition-all">Login</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-24 pb-16 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-navy)] via-[#0d1f3c] to-[var(--color-navy-mid)]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[60%] bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.06),transparent_70%)]" />
          <div className="absolute bottom-0 left-0 right-0 h-[30%] bg-gradient-to-t from-[rgba(26,92,42,0.1)] to-transparent" />
        </div>

        <div className="relative z-10 max-w-[900px] text-center">
          {/* Badge */}
          <div className="inline-block bg-blue-500/10 border border-blue-500/25 text-[var(--color-accent-blue)] text-xs font-semibold tracking-widest uppercase px-5 py-2 rounded-full mb-6 animate-fade-in">
            Now accepting teams for Spring 2026
          </div>

          {/* Headline */}
          <h1 className="text-6xl md:text-8xl font-bold leading-none tracking-tight mb-2">
            YOUR TEAM.
            <br />
            <span className="text-[var(--color-accent-blue)]">YOUR WAY.</span>
          </h1>

          <p className="text-lg md:text-xl font-light text-slate-400 max-w-[600px] mx-auto mt-6 mb-10 leading-relaxed">
            Give your team a home on the web. Rosters, schedules, photos, and team communication — set up in 5 minutes. No app download. No subscription for parents.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {["📋 Team Roster", "📅 Game Schedule", "📸 Player Photos", "👤 Player Pages", "💬 Message Board", "📝 Coach's Notes"].map((item) => (
              <span key={item} className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] px-4 py-2 rounded-full text-sm text-slate-400 font-medium">
                {item}
              </span>
            ))}
          </div>

          {/* Sport selection */}
          <div>
            <h3 className="font-[family-name:var(--font-oswald)] text-sm font-medium text-slate-500 tracking-[0.15em] uppercase mb-5">
              Choose Your Sport
            </h3>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { emoji: "⚾", name: "Baseball", hover: "hover:border-red-500/50 hover:bg-red-500/10" },
                { emoji: "🏈", name: "Football", hover: "hover:border-green-500/50 hover:bg-green-500/10" },
                { emoji: "🏀", name: "Basketball", hover: "hover:border-orange-500/50 hover:bg-orange-500/10" },
                { emoji: "⚽", name: "Soccer", hover: "hover:border-blue-500/50 hover:bg-blue-500/10" },
              ].map((sport) => (
                <Link
                  key={sport.name}
                  href="#"
                  className={`flex items-center gap-3 bg-white/[0.04] border border-white/[0.08] px-7 py-3.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${sport.hover}`}
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
      <section className="px-6 py-24 bg-gradient-to-b from-[var(--color-navy-mid)] to-[var(--color-navy)] relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-3">UP AND RUNNING IN MINUTES</h2>
          <p className="text-slate-400 text-lg max-w-[500px] mx-auto">Three steps. That&apos;s it. Your team&apos;s website is live before the next practice.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-[1100px] mx-auto">
          {[
            { num: "01", icon: "🏟️", title: "Create Your Team", desc: "Pick your sport, name your team, upload your logo. You get a shareable team link and a private passcode instantly." },
            { num: "02", icon: "📱", title: "Share the Passcode", desc: "Text the link and passcode to your parents. They open it in any browser — no app to download, no account to create." },
            { num: "03", icon: "🎉", title: "You're Live", desc: "Add your roster, post the schedule, and start communicating. Parents upload their own player photos. Done." },
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
      <section className="px-6 py-24 bg-[var(--color-navy)]">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-3">EVERYTHING YOUR TEAM NEEDS</h2>
          <p className="text-slate-400 text-lg">Built for coaches who run teams, not IT departments.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1100px] mx-auto">
          {[
            { icon: "📋", title: "Team Roster", desc: "Player cards with photos, jersey numbers, and positions. Looks sharp on any device. Parents see the whole squad at a glance." },
            { icon: "📅", title: "Game Schedule", desc: "Games, practices, and events with opponent info, location, and time. Add to calendar with one tap. No more \"when's the next game?\" texts." },
            { icon: "👤", title: "Player Pages", desc: "Every player gets their own page with photos, stats, and info. Parents upload action shots directly. Share with family and recruiters." },
            { icon: "💬", title: "Message Board", desc: "Team-wide communication that's informational, uplifting, and positive. Pinned announcements from coaches. No more group text chaos." },
            { icon: "📝", title: "Coach's Notes", desc: "Practice plans, game prep, and strategy updates. One central place for everything the team needs to know from the coaching staff." },
            { icon: "📸", title: "Team Photos", desc: "A shared photo gallery for the whole season. Action shots, team photos, tournament memories — all in one place." },
          ].map((feature) => (
            <div key={feature.title} className="bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.06] rounded-2xl p-8 transition-all duration-300 hover:border-blue-500/25">
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold mb-2 text-white">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 text-center relative bg-gradient-to-b from-[var(--color-navy)] to-[var(--color-navy-mid)]">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500/30 to-transparent" />
        <div className="max-w-[600px] mx-auto bg-gradient-to-br from-green-500/[0.08] to-blue-500/[0.06] border border-green-500/20 rounded-3xl p-12 md:p-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            READY TO BUILD YOUR<br />TEAM&apos;S HOME?
          </h2>
          <p className="text-slate-400 mb-8 text-lg leading-relaxed">
            Set up your team page in 5 minutes. Free for the 2026 season while we&apos;re in early access.
          </p>
          <Link
            href="#"
            className="inline-block bg-[var(--color-accent-green)] text-white font-[family-name:var(--font-oswald)] text-lg font-semibold tracking-wide px-10 py-4 rounded-xl hover:bg-green-500 transition-all duration-200 hover:-translate-y-0.5 shadow-lg shadow-green-500/25 hover:shadow-green-500/35"
          >
            CREATE YOUR TEAM
          </Link>
          <p className="mt-4 text-xs text-slate-500">No credit card required. No app to download.</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-6 py-12 text-center border-t border-white/5 bg-[var(--color-navy-mid)]">
        <p className="font-[family-name:var(--font-oswald)] text-sm font-semibold text-slate-500 mb-1">MY-TEAM SPORTS.com</p>
        <p className="text-xs text-slate-600">&copy; 2026 My-Team Sports. All rights reserved.</p>
      </footer>
    </div>
  );
}