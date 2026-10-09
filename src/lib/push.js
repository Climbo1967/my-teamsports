import webpush from "web-push";

// Configures web-push once, from VAPID env keys. Mirrors lib/email.js's "no key -> graceful no-op".
let ready = false;
function ensureConfigured() {
  if (ready) return true;
  const pub = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) return false;
  try {
    webpush.setVapidDetails(process.env.VAPID_SUBJECT || "mailto:support@2bcreations.com", pub, priv);
  } catch (e) {
    // A malformed key used to throw out of sendPush, which callers assume
    // never throws (the announcement route had already sent the email).
    console.error(`[push] VAPID setup failed: ${String(e?.message || e).slice(0, 200)}`);
    return false;
  }
  ready = true;
  return true;
}

// Browser push services. Subscriptions whose endpoint is anywhere else are
// refused at subscribe time: otherwise anyone with a team passcode could make
// the server POST to an arbitrary https URL on every announcement, and a slow
// one could hang the send.
const PUSH_HOSTS = [
  /(^|\.)fcm\.googleapis\.com$/,          // Chrome, Edge (new), Brave, Opera, Samsung
  /(^|\.)push\.apple\.com$/,               // Safari (web.push.apple.com)
  /(^|\.)push\.services\.mozilla\.com$/,  // Firefox (updates.push.services.mozilla.com)
  /(^|\.)notify\.windows\.com$/,           // Edge (WNS)
  /(^|\.)push\.samsungosp\.com$/,          // Samsung Internet
];
export function isPushEndpoint(url) {
  try {
    const u = new URL(String(url || ""));
    return u.protocol === "https:" && PUSH_HOSTS.some((re) => re.test(u.hostname));
  } catch {
    return false;
  }
}

// subs: [{ endpoint, p256dh, auth }]. payload: { title, body, url }.
// Returns { ok, sent, stale: [endpoint...] }. Never throws.
//
// timeout: a push service that never answers used to hold the whole request
// (the announcement route then hit the platform limit and the coach resent
// to everyone). TTL: the default was 4 weeks, so a "game starting" alert to a
// phone that was off could arrive days later; an hour is plenty for anything
// we send.
export async function sendPush(subs, payload, { timeout = 8000, TTL = 3600 } = {}) {
  if (!ensureConfigured()) return { ok: false, error: "Push not configured.", sent: 0, stale: [] };
  const body = JSON.stringify(payload || {});
  let sent = 0;
  const stale = [];
  await Promise.allSettled(
    (subs || []).map(async (s) => {
      try {
        if (!isPushEndpoint(s.endpoint)) { stale.push(s.endpoint); return; }
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          body,
          { timeout, TTL }
        );
        sent += 1;
      } catch (e) {
        // 404/410 = the browser dropped this subscription; mark it for cleanup.
        if (e && (e.statusCode === 404 || e.statusCode === 410)) stale.push(s.endpoint);
      }
    })
  );
  return { ok: true, sent, stale };
}

export function pushConfigured() {
  return Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}
