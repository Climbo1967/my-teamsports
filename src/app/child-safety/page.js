import { SiteNav, SiteFooter, PageHero } from "@/components/marketing";
import Link from "next/link";

export const metadata = {
  title: "Child Safety",
  description:
    "How My-Team Sports protects kids: what data is stored, who can see photos and videos, who can upload, how passcodes work, and how a coach removes content. Report concerns to support@2bcreations.com.",
  alternates: { canonical: "/child-safety" },
  openGraph: {
    title: "Child Safety | My-Team Sports",
    description: "Built for youth teams — here is exactly how a child's information and photos are protected, and how to remove anything.",
    url: "https://my-teamsports.com/child-safety",
  },
};

const UPDATED = "June 29, 2026";

const PRINCIPLES = [
  { icon: "🙈", title: "No public profiles", desc: "A team site is private. Without the passcode, a visitor sees only a locked screen — never a child's name or photo." },
  { icon: "🚫", title: "No child accounts", desc: "Children never sign up or log in. Every piece of information is added by an adult — the coach, or a parent with the passcode." },
  { icon: "🔍", title: "Hidden from search", desc: "Team pages tell Google and other search engines not to list them, so they don't turn up in search results." },
  { icon: "📵", title: "No ads, no selling", desc: "We show no advertising and never sell personal information. A child's data is never the product." },
];

const STORED = [
  "The player's name, jersey number, and position.",
  "An optional short bio the coach writes (for example, a favorite player or a fun fact).",
  "An optional player photo, plus team photos in the gallery.",
  "Links to game film hosted on YouTube or Vimeo.",
];

const UPLOAD = [
  "The coach can add everything: the roster, player photos, gallery photos, and game-film links.",
  "A parent who has the passcode can upload photos from the team page — images only.",
  "Only the coach can add game-film (video) links. Parents cannot add video.",
  "Photos a parent uploads are labeled, so the coach can always see what came from a parent.",
];

const REMOVE = [
  { label: "Delete a photo", steps: "Dashboard → your team → Photos → hover the photo → Delete. It disappears from the gallery and the file is deleted from storage. A coach can delete any photo, including ones a parent uploaded." },
  { label: "Remove game film", steps: "Dashboard → Videos → Delete. The video link is removed from the team site. (The video itself stays on YouTube or Vimeo, under the coach's control.)" },
  { label: "Remove a player", steps: "Dashboard → Roster → Remove. This deletes that player's entry and photo from the team." },
  { label: "Cut off access instantly", steps: "Dashboard → Settings → Generate a new passcode. The old passcode stops working everywhere the moment it changes." },
  { label: "Delete the whole team", steps: "Dashboard → Settings → Danger Zone → Delete. This permanently removes the roster, schedule, posts, and photos." },
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
      </div>
    </section>
  );
}

export default function ChildSafetyPage() {
  return (
    <div className="min-h-screen">
      <SiteNav />
      <PageHero
        badge="Safety First"
        title="CHILD SAFETY"
        accent="IS THE FOUNDATION."
        subtitle="My-Team Sports is built for youth teams, so protecting kids isn't a feature — it's the whole design. Here is exactly how a child's information and photos are handled, who can see them, and how to remove anything."
      />

      <div className="px-6 pb-8">
        <p className="text-center text-sm text-slate-500 mb-12">Last updated: {UPDATED}</p>

        <div className="max-w-[820px] mx-auto space-y-14">
          {/* PRINCIPLES */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Built differently, on purpose</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PRINCIPLES.map((p) => (
                <div key={p.title} className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
                  <div className="text-3xl mb-3">{p.icon}</div>
                  <h3 className="text-lg font-semibold text-white mb-1.5">{p.title}</h3>
                  <p className="text-slate-400 leading-relaxed text-[15px]">{p.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <Block section={{
            h: "What information is stored about a player",
            body: ["A coach chooses what to add about each player — and the fields are intentionally minimal:"],
            list: STORED,
          }} />
          <p className="-mt-10 text-slate-300 leading-relaxed max-w-[820px]">
            {"There are no fields for a child's home address, phone number, birthday, or school, so that kind of sensitive detail is never collected. Everything is entered by an adult — never by the child."}
          </p>

          <Block section={{
            h: "Who can see a team's photos and videos",
            body: [
              "Only two kinds of people: the coach, and anyone the coach gives the team link and passcode to — parents, grandparents, and family. There is no public version of a team page; without the passcode, a visitor sees only a locked screen.",
              "Team pages are marked “no index,” so they do not appear in Google or other search results. Game film plays through YouTube or Vimeo, and we recommend coaches set videos to “Unlisted” so they are not publicly listed.",
            ],
          }} />

          {/* HONEST CAUTION CALLOUT */}
          <div className="bg-amber-500/[0.07] border border-amber-500/25 rounded-2xl p-6 md:p-7 -mt-6">
            <div className="flex gap-3">
              <span className="text-2xl shrink-0">⚠️</span>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1.5">One honest caution for families</h3>
                <p className="text-slate-300 leading-relaxed text-[15px]">
                  {"Photos are stored as files at long, randomized web links. The team page is locked, but an individual photo's direct link, if someone deliberately copies and shares it outside the team, could be opened without the passcode. Treat the team link and any downloaded photos like a family photo — share them only with people you trust."}
                </p>
              </div>
            </div>
          </div>

          <Block section={{
            h: "Who can upload",
            body: ["Uploading is limited to the people closest to the team:"],
            list: UPLOAD,
          }} />

          <Block section={{
            h: "How passcodes work",
            body: [
              "Every team has a 6-character passcode that the coach controls. The coach shares it with the team's families. A family enters it once, and the site remembers them for the season (about 180 days) with a secure cookie, so they don't retype it every visit.",
              "The passcode is checked on our servers and is not exposed in the page. The coach can generate a new passcode at any time — and the instant they do, the old one stops working everywhere. That is the fastest way to cut off access if a code was shared too widely or someone should no longer be able to view the team.",
            ],
          }} />

          {/* REMOVE CONTENT CALLOUT */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">How a coach removes content</h2>
            <p className="text-slate-300 leading-relaxed mb-6">
              A coach can take anything down in seconds, right from the dashboard:
            </p>
            <div className="bg-gradient-to-br from-green-500/[0.08] to-blue-500/[0.05] border border-green-500/20 rounded-2xl divide-y divide-white/[0.06]">
              {REMOVE.map((r) => (
                <div key={r.label} className="p-5 md:p-6">
                  <h3 className="text-white font-semibold mb-1">{r.label}</h3>
                  <p className="text-slate-400 leading-relaxed text-[15px]">{r.steps}</p>
                </div>
              ))}
            </div>
          </section>

          <Block section={{
            h: "If you're a parent",
            body: [
              "Want a photo of your child taken down, or your child removed from the team site? The fastest way is to ask your coach — they can remove any photo or any player in seconds, using the steps above.",
              "If you can't reach your coach, or you believe something was posted without permission, email us at support@2bcreations.com and we will help get it removed. You never need an account to ask.",
            ],
          }} />

          {/* REPORT CALLOUT */}
          <div className="bg-gradient-to-br from-red-500/[0.08] to-red-700/[0.04] border border-red-500/25 rounded-2xl p-7 md:p-8">
            <div className="text-3xl mb-3">🛡️</div>
            <h2 className="text-2xl font-bold text-white mb-3">Report a safety concern</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              If you see content that worries you — or anything that may exploit, endanger, or inappropriately identify a
              child — please tell us right away. We take every report seriously and act quickly, which can include removing
              content and disabling access or accounts.
            </p>
            <a
              href="mailto:support@2bcreations.com?subject=Child%20Safety%20Report"
              className="inline-block bg-[var(--color-accent-green)] text-white font-semibold px-6 py-3 rounded-xl hover:bg-green-500 transition-all"
            >
              Report to support@2bcreations.com
            </a>
            <p className="text-sm text-slate-400 leading-relaxed mt-5">
              If a child is in immediate danger, contact local law enforcement first by calling 911. Suspected child
              exploitation can also be reported to the National Center for Missing &amp; Exploited Children at
              CyberTipline.org or 1-800-843-5678.
            </p>
          </div>

          <Block section={{
            h: "Permission and consent",
            body: [
              "Because the adults closest to each child manage the content, permission happens where it belongs — with the coach and the parents. In our Terms of Service, every coach agrees that they have a parent's or guardian's permission before adding a child's name or photo.",
              "Children do not have accounts, and we do not knowingly collect personal information directly from a child under 13. If we learn that we have, we delete it. This reflects our obligations under the U.S. Children's Online Privacy Protection Act (COPPA) and our broader commitment to protecting kids' privacy.",
            ],
          }} />

          <section className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-7 md:p-8">
            <h2 className="text-2xl font-bold text-white mb-3">Read more</h2>
            <p className="text-slate-300 leading-relaxed">
              For the full picture, see our{" "}
              <Link href="/privacy" className="text-[var(--color-accent-blue)] hover:underline">Privacy Policy</Link>{" "}
              and{" "}
              <Link href="/terms" className="text-[var(--color-accent-blue)] hover:underline">Terms of Service</Link>.
              Questions any time: <a href="mailto:support@2bcreations.com" className="text-[var(--color-accent-blue)] hover:underline">support@2bcreations.com</a>.
            </p>
          </section>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
