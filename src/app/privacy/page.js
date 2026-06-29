import { SiteNav, SiteFooter, PageHero } from "@/components/marketing";
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy",
  description:
    "How My-Team Sports handles your data: what we store, who can see team rosters and photos, the passcode model, the services we use, and how to delete your information.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Privacy Policy | My-Team Sports",
    description: "What we store, who can see it, and how to remove it — in plain language.",
    url: "https://my-teamsports.com/privacy",
  },
};

const UPDATED = "June 29, 2026";

const SUMMARY = [
  "We store only what a coach or parent chooses to add, plus the basic technical data needed to run the site.",
  "Team pages are private — locked behind a passcode the coach controls, and hidden from search engines.",
  "We never sell your information, and there are no ads.",
  "A coach can delete any photo, remove any player, or delete the whole team at any time.",
  "Children do not have accounts. Adults manage everything.",
];

const SECTIONS = [
  {
    h: "Who we are",
    body: [
      "My-Team Sports is a team-website service operated by 2bcreations. It gives a youth sports coach a simple, private website for one team — roster, schedule, stats, photos, and game film — that families reach with a link and a passcode. There is no app to download and no parent accounts to create.",
      "This policy explains what information the service stores, why, who can see it, and the choices you have. If you have a question about anything here, email us at support@2bcreations.com.",
    ],
  },
  {
    h: "Information we store",
    body: ["We only hold information that an adult adds to run a team, plus a small amount of technical data needed to operate the site:"],
    list: [
      "Coach account: your name, email address, and a password (stored securely and hashed by our login provider — we never see it in plain text).",
      "Team details: the team name, sport, season, and an optional team logo the coach uploads.",
      "Roster: for each player, only what the coach chooses to add — name, jersey number, position, an optional short bio, and an optional photo.",
      "Photos: images uploaded by the coach or by a parent who has the passcode, with an optional caption and the player a photo is tagged to.",
      "Game film: when a coach adds a video, we store the title, the date, and the link to YouTube or Vimeo. The video itself lives on YouTube or Vimeo — we do not host or store it.",
      "Team activity: schedule, scores, announcements, coach's notes, and RSVPs that the coach or team add.",
      "Technical data: basic log information (such as IP address and browser type) needed to operate and secure the site, a secure cookie that remembers a family entered the passcode, and aggregate analytics.",
    ],
    after: [
      "We do not ask for or store a child's home address, phone number, birthday, or school — there are no fields for that kind of sensitive detail.",
    ],
  },
  {
    h: "How we use information",
    body: ["We use the information above to:"],
    list: [
      "build and show a team site to the coach and to families who have the passcode;",
      "keep accounts secure and the service running;",
      "understand, in aggregate, how the site is used so we can improve it;",
      "respond to support questions and safety requests.",
    ],
    after: ["We do not sell or rent personal information, and we do not show advertising."],
  },
  {
    h: "Who can see team content",
    body: [
      "A team's roster, photos, schedule, and game film are visible only to the coach and to people the coach gives the team link and passcode to. There are no public team profiles — without the passcode, a visitor sees only a locked screen.",
      "Team pages are set to “no index,” so search engines such as Google do not list them, and our site instructions ask web crawlers to stay out of team areas.",
      "An honest note about photos: images are stored as files at long, randomized web addresses. The team page is passcode-protected, but an individual photo's direct file link, if someone deliberately copies and shares it outside the team, could be opened without the passcode. Share team links and downloaded photos only with people you trust.",
      "Game film is shown through YouTube or Vimeo. We recommend coaches set videos to “Unlisted” so they are not publicly listed.",
    ],
  },
  {
    h: "Services we rely on",
    body: ["We use a small number of trusted providers to run the service, and share information with them only as needed to operate it:"],
    list: [
      "Supabase — secure database, file storage, and coach login.",
      "Vercel — website hosting.",
      "Google Analytics — aggregate, non-identifying usage statistics.",
      "YouTube and Vimeo — only when a coach chooses to embed a video link; viewing is governed by their own policies.",
    ],
    after: [
      "We may also disclose information if required by law, to enforce our Terms, or to protect the safety of a child or any person.",
    ],
  },
  {
    h: "Cookies",
    body: [
      "A secure “team access” cookie remembers that a family entered the correct passcode, so they do not have to retype it all season (about 180 days). It is set as http-only, meaning browser scripts cannot read it.",
      "Login cookies keep a coach signed in to the dashboard. Google Analytics sets cookies for aggregate measurement. We do not use third-party advertising cookies.",
    ],
  },
  {
    h: "Children's privacy",
    body: [
      "My-Team Sports is built for coaches, parents, and guardians — the adults running a team — not for children. Children do not create accounts and cannot sign in.",
      "All information about a player, including names and photos, is added by an adult: the coach, or a parent who has the passcode. We do not knowingly collect personal information directly from a child under 13.",
      "Because the adults closest to each child manage the content, coaches and parents are responsible for having permission to add a child's name or photo. Our Terms require it, and our Child Safety page explains exactly how viewing, uploading, and removal work.",
      "We keep this information only as long as the team is active, and we remove it on request. If you believe a child's information was added without a parent's or guardian's permission, contact the team's coach or email support@2bcreations.com, and we will remove it promptly. If we learn we have collected information directly from a child under 13, we will delete it.",
    ],
  },
  {
    h: "How long we keep information, and deletion",
    body: [
      "We keep team information while the team is in use. We do not keep children's personal information longer than is reasonably needed to run the team site.",
      "A coach can delete any photo, remove any player, or delete the entire team at any time from the dashboard. Deleting a team permanently removes its roster, schedule, posts, and photos.",
      "To delete a coach account, or to request removal of specific information, email support@2bcreations.com.",
    ],
  },
  {
    h: "Your choices and rights",
    body: [
      "You can review and update most information directly — coaches in the dashboard, and families by asking their coach.",
      "Depending on where you live (including Texas and other U.S. states), you may have rights to access, correct, or delete personal information, or to opt out of certain processing. We honor these requests — just email support@2bcreations.com — and we will not treat you differently for exercising them.",
    ],
  },
  {
    h: "Security",
    body: [
      "Passwords are hashed by our login provider, information is encrypted in transit, and our database is configured so each coach can see only their own teams. Team content is gated behind a passcode the coach controls.",
      "No online service can promise perfect security, but we work hard to protect your information. Please help by keeping your password and your team's passcode private.",
    ],
  },
  {
    h: "Changes to this policy",
    body: [
      "We may update this policy from time to time. When we do, we will change the date at the top of this page, and for significant changes we will make reasonable efforts to let coaches know.",
    ],
  },
];

function Block({ section }) {
  return (
    <section>
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">{section.h}</h2>
      <div className="space-y-4 text-slate-300 leading-relaxed">
        {section.body?.map((p, i) => <p key={i}>{p}</p>)}
        {section.list ? (
          <ul className="space-y-2.5 pl-1">
            {section.list.map((li, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-[var(--color-accent-green)] mt-1 shrink-0">▸</span>
                <span>{li}</span>
              </li>
            ))}
          </ul>
        ) : null}
        {section.after?.map((p, i) => <p key={i}>{p}</p>)}
      </div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <SiteNav />
      <PageHero
        title="PRIVACY"
        accent="IN PLAIN ENGLISH."
        subtitle="What My-Team Sports stores, who can see it, and how to remove it — written so you don't need a lawyer to understand it."
      />

      <div className="px-6 pb-8">
        <p className="text-center text-sm text-slate-500 mb-12">Last updated: {UPDATED}</p>

        <div className="max-w-[760px] mx-auto mb-14 bg-gradient-to-br from-blue-500/[0.08] to-green-500/[0.05] border border-blue-500/20 rounded-2xl p-7 md:p-8">
          <h2 className="text-lg font-bold text-white mb-4 tracking-wide">THE SHORT VERSION</h2>
          <ul className="space-y-2.5 text-slate-300">
            {SUMMARY.map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-[var(--color-accent-green)] mt-1 shrink-0">✓</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="max-w-[760px] mx-auto space-y-12">
          {SECTIONS.map((s) => <Block key={s.h} section={s} />)}

          <section className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-7 md:p-8">
            <h2 className="text-2xl font-bold text-white mb-3">Contact us</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Questions about your privacy, or a request to access or delete information? We are happy to help.
            </p>
            <a
              href="mailto:support@2bcreations.com"
              className="inline-block bg-[var(--color-accent-green)] text-white font-semibold px-6 py-3 rounded-xl hover:bg-green-500 transition-all"
            >
              support@2bcreations.com
            </a>
            <p className="text-sm text-slate-500 mt-5">
              See also our{" "}
              <Link href="/child-safety" className="text-[var(--color-accent-blue)] hover:underline">Child Safety</Link>{" "}
              page and our{" "}
              <Link href="/terms" className="text-[var(--color-accent-blue)] hover:underline">Terms of Service</Link>.
            </p>
          </section>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
