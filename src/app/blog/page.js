import Link from "next/link";
import { SiteNav, SiteFooter, CTASection, PageHero } from "@/components/marketing";
import { getAllPosts } from "@/lib/posts";

export const metadata = {
  title: "Blog — Youth Sports Tips for Coaches & Parents",
  description:
    "Practical guides for youth sports coaches and team parents — practice plans, scorekeeping, team communication, and getting the most out of the season.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Blog | My-Team Sports",
    description:
      "Practical guides for youth sports coaches and parents — practice plans, scorekeeping, and team-management tips.",
    url: "https://my-teamsports.com/blog",
    type: "website",
  },
};

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default function BlogIndex() {
  const posts = getAllPosts();
  return (
    <div className="min-h-screen">
      <SiteNav />
      <PageHero
        badge="The Clubhouse"
        title="YOUTH SPORTS,"
        accent="FIGURED OUT."
        subtitle="Practice plans, scorekeeping how-tos, and team-management tips for the coaches and parents who make the season happen."
      />
      <section className="px-6 pb-24">
        <div className="max-w-[820px] mx-auto grid grid-cols-1 gap-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.06] rounded-2xl p-8 transition-all duration-300 hover:border-blue-500/25 hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3 mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--color-accent-blue)]">
                <span>{post.tag}</span>
                <span className="text-slate-600">&bull;</span>
                <span className="text-slate-500">{post.readingTime}</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2 leading-snug">{post.title}</h2>
              <p className="text-slate-400 leading-relaxed mb-4">{post.excerpt}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">{formatDate(post.date)}</span>
                <span className="text-sm font-semibold text-[var(--color-accent-green)]">Read more &rarr;</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <CTASection />
      <SiteFooter />
    </div>
  );
}
