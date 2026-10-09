const BASE = "https://my-teamsports.com";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /team is deliberately not here: those pages carry noindex, and a
        // crawler blocked by robots.txt never sees it (it could still list the
        // URL from links). Letting it fetch the passcode gate is what makes
        // the noindex take effect.
        disallow: [
          "/dashboard",
          "/api",
          "/login",
          "/forgot-password",
          "/reset-password",
        ],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
