import { SiteNav, SiteFooter, PageHero } from "@/components/marketing";
import Link from "next/link";

export const metadata = {
  title: "Terms of Service",
  description:
    "The terms for using My-Team Sports: coach responsibilities, permission for minors' photos and information, acceptable use, content ownership, and more.",
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "Terms of Service | My-Team Sports",
    description: "Coach responsibilities, acceptable use, and the rules of the road for My-Team Sports.",
    url: "https://my-teamsports.com/terms",
  },
};

const UPDATED = "July 9, 2026";

const SECTIONS = [
  {
    h: "1. Agreement to these terms",
    body: [
      "These Terms of Service are a contract between you and 2bcreations (“we,” “us,” or “our”), which operates My-Team Sports (the “service”). By creating a coach account or otherwise using the service, you agree to these Terms. If you do not agree, please do not use the service.",
    ],
  },
  {
    h: "2. What the service is",
    body: [
      "My-Team Sports gives a youth sports coach a private website for one team — roster, schedule, stats, photos, and links to game film. Families view a team using a link and a passcode; they do not need to download an app or create an account.",
    ],
  },
  {
    h: "3. Pricing and billing",
    body: [
      "The Coach Plan is offered at half-off launch pricing for the 2026 season ($15 per team), with an optional AI Coach add-on ($20). Regular pricing of $30 per team (plus any add-ons) applies from the 2027 season. Coach accounts begin with a 30-day free trial, and parents never pay. We may add, change, or discontinue features, and we will give reasonable notice of any pricing changes.",
    ],
  },
  {
    h: "4. Who may use it",
    body: [
      "You must be at least 18 years old and able to enter into a binding contract to create a coach account. By creating a team, you represent that you are a coach, team manager, or other adult authorized to manage that team. The service is intended for adults; children do not create accounts.",
    ],
  },
  {
    h: "5. Your account",
    body: [
      "Keep your email and password secure. You are responsible for activity that happens under your account, and you agree to notify us promptly at support@2bcreations.com of any unauthorized use.",
    ],
  },
  {
    h: "6. Coach responsibilities and consent",
    body: ["You decide what goes on your team site, and you are responsible for it. In particular:"],
    list: [
      "Permission for minors: Before you add a child's name, photo, or other information, you must have permission from that child's parent or legal guardian. By uploading it, you confirm you have that permission. If a parent asks you not to include their child, do not add them — or remove them.",
      "Your content: You are responsible for the roster, photos, posts, and video links that you and your team add.",
      "Your passcode: You control your team's passcode. Share it only with your team's families, and generate a new one (which instantly disables the old one) if it may have been shared too widely or if someone should no longer have access.",
      "Outside rules: You are responsible for following your league's, school's, or organization's own rules about player photos and information.",
    ],
  },
  {
    h: "7. Acceptable use",
    body: ["You — and anyone using your team site — agree not to:"],
    list: [
      "upload content you do not have the right to share, or that infringes someone else's rights;",
      "add a person's information or image without the necessary permission;",
      "upload unlawful, harassing, hateful, sexual, or otherwise harmful content — and absolutely nothing that exploits or endangers a child;",
      "attempt to bypass a passcode or access teams that are not yours;",
      "disrupt, overload, reverse-engineer, or attempt to break the service;",
      "use the service to send spam or to harvest other people's information.",
    ],
  },
  {
    h: "8. Content you add: ownership and license",
    body: [
      "You keep ownership of the content you add. You grant us a limited license to store, process, and display that content for the sole purpose of providing your team site to the people you authorize.",
      "This license ends when you delete the content or your team, except for routine backups kept briefly in the ordinary course of operating the service or as required by law.",
    ],
  },
  {
    h: "9. Game film and third-party links",
    body: [
      "Video is provided through YouTube or Vimeo when a coach adds a link; the video is hosted there, not by us. Your use of those services is governed by their own terms, and you are responsible for the privacy settings on any video you link (we recommend “Unlisted”).",
    ],
  },
  {
    h: "10. Content moderation and removal",
    body: [
      "We want the service to be safe, especially for kids. We may remove content, disable a passcode, or suspend or terminate an account that violates these Terms or that we reasonably believe is harmful — with or without notice. Coaches can also remove any content themselves at any time from the dashboard.",
    ],
  },
  {
    h: "11. Deleting content, teams, and accounts",
    body: [
      "You may delete content, delete a team, or request deletion of your account at any time. Deleting a team permanently removes its roster, schedule, posts, and photos. To close your account, email support@2bcreations.com.",
    ],
  },
  {
    h: "12. Disclaimers",
    body: [
      "The service is provided “as is” and “as available,” without warranties of any kind, express or implied. We do not guarantee that the service will be uninterrupted or error-free, or that content will always be preserved. Please keep your own copies of photos and film you care about.",
    ],
  },
  {
    h: "13. Limitation of liability",
    body: [
      "To the fullest extent permitted by law, we will not be liable for any indirect, incidental, special, or consequential damages, or for any loss of data, arising from your use of the service. Our total liability to you for any claim is limited to the greater of the amount you paid us in the prior 12 months (which may be zero) or US$100.",
    ],
  },
  {
    h: "14. Indemnification",
    body: [
      "You agree to defend, indemnify, and hold us harmless from claims, damages, and costs arising out of content you add or your failure to obtain a necessary permission — including a parent's or guardian's permission for a minor.",
    ],
  },
  {
    h: "15. Changes to these terms",
    body: [
      "We may update these Terms from time to time. We will update the date at the top of this page, and for material changes we will make reasonable efforts to notify coaches. Continuing to use the service after an update means you accept the revised Terms.",
    ],
  },
  {
    h: "16. Governing law",
    body: [
      "These Terms are governed by the laws of the State of Texas, without regard to its conflict-of-laws rules. Any dispute that is not resolved informally will be brought in the state or federal courts located in Texas, and you consent to that jurisdiction and venue — except where applicable law gives you the right to bring a claim in your own location.",
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
      </div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <SiteNav />
      <PageHero
        title="TERMS OF"
        accent="SERVICE."
        subtitle="The rules of the road for My-Team Sports — what we provide, and what we ask of every coach who runs a team here."
      />

      <div className="px-6 pb-8">
        <p className="text-center text-sm text-slate-500 mb-12">Last updated: {UPDATED}</p>

        <div className="max-w-[760px] mx-auto space-y-12">
          {SECTIONS.map((s) => <Block key={s.h} section={s} />)}

          <section className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-7 md:p-8">
            <h2 className="text-2xl font-bold text-white mb-3">Questions?</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              If anything here is unclear, reach out — we would rather answer a question than have you guess.
            </p>
            <a
              href="mailto:support@2bcreations.com"
              className="inline-block bg-[var(--color-accent-green)] text-white font-semibold px-6 py-3 rounded-xl hover:bg-green-500 transition-all"
            >
              support@2bcreations.com
            </a>
            <p className="text-sm text-slate-500 mt-5">
              Related:{" "}
              <Link href="/privacy" className="text-[var(--color-accent-blue)] hover:underline">Privacy Policy</Link>{" "}
              and{" "}
              <Link href="/child-safety" className="text-[var(--color-accent-blue)] hover:underline">Child Safety</Link>.
            </p>
          </section>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
