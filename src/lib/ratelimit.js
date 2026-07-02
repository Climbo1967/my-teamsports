// Minimal in-memory sliding-window rate limiter (security audit M4).
// Serverless note: state lives per warm instance, so this is best-effort
// throttling against bursts and abuse, not a hard global cap. Good enough
// for current traffic; swap in a DB/Redis-backed limiter if that changes.
const hits = new Map(); // key -> array of timestamps (ms)

function clientIp(request) {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

export function rateLimited(request, name, { limit, windowMs }) {
  const now = Date.now();
  const key = `${name}:${clientIp(request)}`;
  let arr = hits.get(key);
  if (!arr) { arr = []; hits.set(key, arr); }
  while (arr.length && arr[0] <= now - windowMs) arr.shift();
  if (arr.length >= limit) return true;
  arr.push(now);
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (!v.length || v[v.length - 1] <= now - windowMs) hits.delete(k);
    }
  }
  return false;
}

export const RATE_MSG = "Too many attempts. Wait a minute and try again.";
