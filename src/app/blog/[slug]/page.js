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
  if (block.h3) return <h3 className="text-xl font-bold text-white mt-8 mb-3">{block.h3}</h3>;
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
  if (block.download)
    return (
      <a
        href={block.download.href}
        download
        className="flex flex-wrap items-center gap-4 my-8 p-5 rounded-2xl no-underline bg-gradient-to-br from-green-500/[0.08] to-blue-500/[0.06] border border-green-500/20 transition-all hover:border-green-500/40"
      >
        <div className="flex-1 min-w-[200px]">
          <div className="text-lg font-bold text-white">{block.download.label}</div>
          {block.download.note ? (
            <div className="mt-0.5 text-sm text-slate-400">{block.download.note}</div>
          ) : null}
        </div>
        <span className="bg-[var(--color-accent-green)] text-white text-sm font-semibold px-6 py-3 rounded-xl">
          Download PDF
        </span>
      </a>
    );
  if (block.table)
    return (
      <div className="my-6 overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/[0.04] text-slate-200">
            <tr>
              {block.table.headers.map((h, i) => (
                <th key={i} className="px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.table.rows.map((row, ri) => (
              <tr key={ri} className="border-t border-white/5">
                {row.map((cell, ci) => (
                  <td key={ci} className="px-4 py-3 align-top text-slate-300">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  return null;
}

function RelatedLinks({ items }) {
  if (!items || !items.length) return null;
  return (
    <div className="mt-14">
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Related football coaching tools</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((it, i) => (
          <Link
            key={i}
            href={it.href}
            className="block rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 no-underline transition-all hover:border-blue-500/30"
          >
            <div className="font-semibold text-white">{it.label}</div>
            {it.note ? <div className="text-sm text-slate-400 mt-0.5">{it.note}</div> : null}
          </Link>
        ))}
      </div>
    </div>
  );
}

function FaqSection({ faqs }) {
  if (!faqs || !faqs.length) return null;
  return (
    <div className="mt-14">
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Frequently asked questions</h2>
      <div className="space-y-3">
        {faqs.map((f, i) => (
          <details key={i} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
            <summary className="cursor-pointer font-semibold text-white list-none">{f.q}</summary>
            <p className="mt-3 text-slate-300">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
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

  const faqLd =
    post.faqs && post.faqs.length
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: post.faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }
      : null;

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
          <RelatedLinks items={post.related} />
          <FaqSection faqs={post.faqs} />
        </div>
      </article>
      <CTASection />
      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {faqLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      ) : null}
    </div>
  );
}
