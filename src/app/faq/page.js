import { SiteNav, SiteFooter, CTASection, PageHero } from "@/components/marketing";

export const metadata = {
  title: "FAQ — Common Questions",
  description:
    "Answers to common questions about My-Team Sports: do parents need an app, is it really free, how passcodes work, which sports are supported, and how team privacy works.",
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "FAQ | My-Team Sports",
    description:
      "Do parents need an app? Is it free? How do passcodes work? Answers to the most common questions.",
    url: "https://my-teamsports.com/faq",
  },
};

const FAQS = [
  {
    q: "Do parents need to download an app?",
    a: "No. My-Team Sports runs entirely in a web browser. Parents open your team link on any phone, tablet, or computer — there is nothing to install from an app store.",
  },
  {
    q: "Is it really free?",
    a: "Yes. It is free for coaches for the entire 2026 season, and parents never pay anything at all. You can build a complete team site without entering a credit card.",
  },
  {
    q: "Do parents have to create an account?",
    a: "No. Parents simply open your team link and enter a 6-character passcode once. The passcode is remembered on their device for about six months, so they don't have to type it every visit.",
  },
  {
    q: "How do the passcodes work?",
    a: "When you create a team you get a private 6-character passcode. You share it with your parents along with the team link. Anyone with the passcode can view the team site; you can regenerate the passcode anytime from your settings if you need to.",
  },
  {
    q: "Which sports are supported?",
    a: "Baseball, softball, football, basketball, soccer, volleyball, and hockey — plus an 'Other' option for anything else. Positions and stat categories adapt to the sport you choose.",
  },
  {
    q: "Can I invite assistant coaches?",
    a: "Yes. You can invite assistant coaches by email and give them full team management. You stay the owner and keep control of the big settings like deleting the team.",
  },
  {
    q: "Is my team's information private?",
    a: "Yes. Team sites are gated behind the passcode you control, so your roster, schedule, and photos are not openly published on the web. Search engines are blocked from indexing team pages.",
  },
  {
    q: "How do parents RSVP and upload photos?",
    a: "Right on the team site. Parents pick their player and respond going / maybe / not going to upcoming events, and they can upload action shots straight from the bleachers — all without an account.",
  },
  {
    q: "How does game film work?",
    a: "Paste a YouTube or Vimeo link into your team's Game Film section and the full video plays right on the site. It's free and unlimited, with no extra subscriptions for anyone.",
  },
  {
    q: "How long does setup take?",
    a: "About five minutes. Pick your sport, name your team, upload a logo, and you immediately get a shareable link and passcode. You can add the roster and schedule whenever you're ready.",
  },
];

export default function FAQPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteNav />
      <PageHero
        title="QUESTIONS?"
        accent="ANSWERS."
        subtitle="Everything coaches and parents ask before getting started. Don't see yours? It's probably a five-minute answer once you create a team."
      />

      {/* FAQ LIST */}
      <section className="px-6 py-16">
        <div className="max-w-[820px] mx-auto space-y-5">
          {FAQS.map((item) => (
            <div key={item.q} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-7 transition-all duration-300 hover:border-blue-500/20">
              <h2 className="text-lg md:text-xl font-semibold text-white mb-2">{item.q}</h2>
              <p className="text-slate-400 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <CTASection />
      <SiteFooter />
    </div>
  );
}
