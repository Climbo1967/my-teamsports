/** @type {import('next').NextConfig} */

// Security response headers.
// Content-Security-Policy is enforced. The allowlist reflects every external
// origin the client actually loads, verified against the running app:
//   - Cloudflare Turnstile (captcha)           challenges.cloudflare.com
//   - Stripe Checkout (server-redirect)        js/api/checkout.stripe.com
//   - Supabase (auth, storage, realtime)       *.supabase.co (+ wss)
//   - Google Analytics / gtag                  *.googletagmanager.com, *.google-analytics.com
//   - Game-film embeds                         www.youtube.com, player.vimeo.com
// 'unsafe-inline' is retained for script/style: the app ships inline styles and
// inline bootstrap scripts, so removing it would require a nonce pipeline and is
// out of scope for this change. Add a new origin here before shipping code that
// loads from it, or the browser will block it.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://js.stripe.com https://*.googletagmanager.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.supabase.co https://*.googletagmanager.com https://*.google-analytics.com",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://*.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com",
  "frame-src https://challenges.cloudflare.com https://js.stripe.com https://checkout.stripe.com https://www.youtube.com https://player.vimeo.com",
  "frame-ancestors 'self'",
  "form-action 'self' https://checkout.stripe.com",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "Content-Security-Policy", value: csp },
];

const nextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
