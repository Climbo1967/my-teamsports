import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteNav, SiteFooter, CTASection } from "@/components/marketing";
import { getAllPosts, getPost } from "@/lib/posts";

const SITE_URL = "https://my-teamsports.com";

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Post Not Found" };
  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: `${post.title} | My-Team Sports`,
      description: post.description,
      url: `${SITE_URL}/blog/${post.slug}`,
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.updated || post.date,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function Block({ block }) {
  if (block.h2) return <h2 className="text-2xl md:text-3xl font-bold text-white mt-10 mb-4">{block.h2}</h2>;
  if (block.p) return <p className="mb-5">{block.p}</p>;
  if (block.ul)
    return (
      <ul className="list-disc pl-6 mb-6 space-y-2 marker:text-[var(--color-accent-blue)]">
        {block.ul.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ul>
    );
  if (block.ol)
    return (
      <ol className="list-decimal pl-6 mb-6 space-y-2 marker:text-[var(--color-accent-blue)] marker:font-semibold">
        {block.ol.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ol>
    );
  return null;
}

export default async function BlogPost({ params }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updated || post.date,
    author: { "@type": "Organization", name: "My-Team Sports", url: SITE_URL },
    publisher: { "@type": "Organization", name: "My-Team Sports", url: SITE_URL },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/blog/${post.slug}` },
    keywords: post.keywords.join(", "),
  };

  return (
    <div className="min-h-screen">
      <SiteNav />
      <article className="px-6 pt-32 pb-16">
        <div className="max-w-[720px] mx-auto">
          <Link href="/blog" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
            &larr; All posts
          </Link>
          <div className="flex items-center gap-3 mt-6 mb-4 text-xs font-semibold uppercase tracking-widest text-[var(--color-accent-blue)]">
            <span>{post.tag}</span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-slate-500">{post.readingTime}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight mb-4">{post.title}</h1>
          <p className="text-slate-500 text-sm mb-10">{formatDate(post.date)}</p>
          <div className="text-slate-300 text-lg leading-relaxed">
            {post.body.map((b, i) => (
              <Block key={i} block={b} />
            ))}
          </div>
        </div>
      </article>
      <CTASection />
      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}
