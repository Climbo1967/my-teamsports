import { getAllPosts } from "@/lib/posts";
import { getAllSports } from "@/lib/sports";

const BASE = "https://my-teamsports.com";

export default function sitemap() {
  // Fixed date of the last substantive change to the static marketing/legal
  // pages. Do NOT use new Date() here: that stamps every static page as
  // "changed" on every build, which misleads crawlers. Bump this only when
  // these pages actually change.
  const now = new Date("2026-07-13");
  const posts = getAllPosts();
  const sports = getAllSports();
  return [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/sports`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    ...sports.map((s) => ({
      url: `${BASE}/sports/${s.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    })),
    { url: `${BASE}/how-it-works`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    ...posts.map((p) => ({
      url: `${BASE}/blog/${p.slug}`,
      lastModified: new Date(p.updated || p.date),
      changeFrequency: "monthly",
      priority: 0.6,
    })),
    { url: `${BASE}/child-safety`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${BASE}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
  ];
}
