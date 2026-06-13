import Link from "next/link";
import { SiteNav, SiteFooter, CTASection, PageHero } from "@/components/marketing";

export const metadata = {
  title: "How It Works — Live in 5 Minutes",
  description:
    "Create your youth sports team site in three steps: create your team, share the passcode with parents, and run your season. No app, no parent accounts.",
  alternates: { canonical: "/how-it-works" },
  openGraph: {
    title: "How It Works — Live in 5 Minutes | My-Team Sports",
    description:
      "Three steps to a live team website: create your team, share a passcode, run your season. Parents need no app and no account.",
    url: "https://my-teamsports.com/how-it-works",
  },
};

const STEPS = [
  { num: "01", icon: "🏟️", title: "Create Your Team", desc: "Pick your sport, name your team, and upload your logo. You instantly get a shareable team link and a private 6-character passcode — no setup wizard, no waiting." },
  { num: "02", icon: "📱", title: "Share the Passcode", desc: "Text the link and passcode to your parents. They open it in any browser and type the passcode once. No app to download, no account to create, no password to forget." },
  { num: "03", icon: "🎉", title: "Run Your Season", desc: "Post the schedule, parents RSVP, you track stats and results, and everyone shares photos and game film. The site keeps your record, totals, and gallery up to date automatically." },
];

const COACH_TOOLS = [
  { icon: "📋", title: "Roster editor", desc: "Add players with photos, numbers, positions, and bios." },
  { icon: "📅", title: "Schedule builder", desc: "Games, practices, and events — see who's RSVP'd at a glance." },
  { icon: "📊", title: "Stat grid", desc: "Enter game stats in a simple grid; season totals compute themselves." },
  { icon: "🎬", title: "Film links", desc: "Paste a YouTube or Vimeo link and it plays right on the team site." },
  { icon: "💬", title: "Announcements", desc: "Post updates, pin the important ones, email subscribers in one click." },
  { icon: "🤝", title: "Staff invites", desc: "Invite assistant coaches by email with full team management." },
];

const PARENT_EXPERIENCE = [
  "Open the team link on any phone, tablet, or computer",
  "Type the passcode once — it's remembered for 6 months",
  "See the roster, schedule, stats, photos, and game film",
  "RSVP their player to upcoming games and practices",
  "Upload action shots straight from the bleachers",
  "No app, no account, no password, no cost",
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen">
      <SiteNav />
      <PageHero
        badge="Up and running in minutes"
        title="HOW IT"
        accent="WORKS."
        subtitle="Three steps and your team's website is live before the next practice. Here's exactly what happens."
      />

      {/* STEPS */}
      <section className="px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-[1100px] mx-auto">
          {STEPS.map((step) => (
            <div key={step.num} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 text-center transition-all duration-300 hover:bg-white/[0.05] hover:border-blue-500/20 hover:-translate-y-1">
              <div className="font-[family-name:var(--font-oswald)] text-5xl font-bold text-blue-500/15 mb-3">{step.num}</div>
              <div className="text-4xl mb-4">{step.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-white">{step.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* COACH SIDE */}
      <section className="px-6 py-20 bg-[var(--color-navy-mid)]">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-5xl font-bold mb-3">WHAT THE COACH GETS</h2>
          <p className="text-slate-400 text-lg max-w-[560px] mx-auto">A private dashboard to run the whole team — built for coaches, not IT departments.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1100px] mx-auto">
          {COACH_TOOLS.map((tool) => (
            <div key={tool.title} className="bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.06] rounded-2xl p-7 transition-all duration-300 hover:border-blue-500/25 hover:-translate-y-0.5">
              <div className="text-3xl mb-3">{tool.icon}</div>
              <h3 className="text-lg font-semibold mb-1.5 text-white">{tool.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{tool.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PARENT SIDE */}
      <section className="px-6 py-20">
        <div className="max-w-[760px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-3">WHAT PARENTS GET</h2>
            <p className="text-slate-400 text-lg">The simplest experience in youth sports. One link. One passcode. Everything.</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500/[0.08] to-green-500/[0.05] border border-blue-500/20 rounded-3xl p-8 md:p-10">
            <ul className="space-y-4">
              {PARENT_EXPERIENCE.map((item) => (
                <li key={item} className="flex items-start gap-3 text-slate-300">
                  <span className="text-[var(--color-accent-green)] mt-0.5">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* DEMO CTA */}
      <section className="px-6 py-20 bg-[var(--color-navy-mid)]">
        <div className="max-w-[700px] mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-3">SEE IT FOR YOURSELF</h2>
          <p className="text-slate-400 text-lg mb-10">Walk through a real, live team site exactly the way a parent would.</p>
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-10">
            <div className="text-5xl mb-3">⚾</div>
            <h3 className="font-[family-name:var(--font-oswald)] text-2xl font-bold mb-6">RIVERSIDE RAPTORS 12U</h3>
            <div className="bg-black/20 rounded-xl px-6 py-3 inline-block mb-8">
              <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Demo Passcode</p>
              <p className="text-2xl font-mono font-bold tracking-[0.3em] text-white">XK7M2P</p>
            </div>
            <Link
              href="/team/riverside-raptors-12u"
              className="block bg-[var(--color-accent-blue)] text-white font-[family-name:var(--font-oswald)] text-lg font-semibold tracking-wide px-10 py-4 rounded-xl hover:bg-blue-600 transition-all duration-200 hover:-translate-y-0.5 shadow-lg shadow-blue-500/25"
            >
              TOUR THE DEMO TEAM →
            </Link>
          </div>
        </div>
      </section>

      <CTASection />
      <SiteFooter />
    </div>
  );
}
