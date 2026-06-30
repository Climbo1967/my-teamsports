import webpush from "web-push";

// Configures web-push once, from VAPID env keys. Mirrors lib/email.js's "no key -> graceful no-op".
let ready = false;
function ensureConfigured() {
  if (ready) return true;
  const pub = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) return false;
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || "mailto:support@2bcreations.com", pub, priv);
  ready = true;
  return true;
}

// subs: [{ endpoint, p256dh, auth }]. payload: { title, body, url }.
// Returns { ok, sent, stale: [endpoint...] }. Never throws.
export async function sendPush(subs, payload) {
  if (!ensureConfigured()) return { ok: false, error: "Push not configured.", sent: 0, stale: [] };
  const body = JSON.stringify(payload || {});
  let sent = 0;
  const stale = [];
  await Promise.allSettled(
    (subs || []).map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          body
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
