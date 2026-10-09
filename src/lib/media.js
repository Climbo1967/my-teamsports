/**
 * Signed-URL helpers for the private `team-media` bucket.
 *
 * The database stores object PATHS (e.g. `parent-uploads/<teamId>/<file>` or
 * `<teamId>/logo/<file>`), never public URLs. Callers sign paths at read time:
 *  - server components / API routes pass the service-role admin client
 *  - dashboard client components pass the browser client (a coach-scoped
 *    SELECT policy on storage.objects authorizes the signing)
 *
 * Every helper tolerates legacy full public URLs (converted to paths) and
 * external URLs (returned unchanged) so mixed data can never crash a render.
 */
const BUCKET = "team-media";
const PUBLIC_MARKER = `/storage/v1/object/public/${BUCKET}/`;
const TTL_SECONDS = 3600;

/** Normalize a stored value to a bucket path, or null if it isn't ours. */
export function mediaPath(value) {
  if (!value || typeof value !== "string") return null;
  if (!value.includes("://")) return value; // already a bare path
  const i = value.indexOf(PUBLIC_MARKER);
  if (i !== -1) return decodeURIComponent(value.slice(i + PUBLIC_MARKER.length));
  return null; // external URL — leave alone
}

/**
 * Every object we store sits under its team: `<teamId>/logo/…`,
 * `<teamId>/players/…`, `<teamId>/gallery/…`, `parent-uploads/<teamId>/…`.
 * When a caller knows the team, only those paths are signed. Without this a
 * path saved from another team's gallery (add_team_photo accepts any url)
 * was signed with the service role and served from the wrong team's site.
 */
export function pathBelongsToTeam(path, teamId) {
  if (!teamId) return true;
  const id = String(teamId).toLowerCase();
  const p = String(path || "").toLowerCase();
  return p.startsWith(`${id}/`) || p.startsWith(`parent-uploads/${id}/`);
}

/** Sign one stored value. External URLs pass through; failures return null. */
export async function signMediaUrl(supabase, value, ttl = TTL_SECONDS, { teamId } = {}) {
  const path = mediaPath(value);
  if (!path) return value || null;
  if (!supabase || !pathBelongsToTeam(path, teamId)) return null;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, ttl);
  return error ? null : data.signedUrl;
}

/**
 * Sign many stored values in one storage call. Returns a new array aligned
 * with the input: signed URL for bucket paths, the original value for
 * external URLs, null for empties/failures (and for paths outside `teamId`).
 */
export async function signMediaUrls(supabase, values, ttl = TTL_SECONDS, { teamId } = {}) {
  const out = (values || []).map((v) => (v && !mediaPath(v) ? v : null));
  const paths = [];
  const slots = [];
  (values || []).forEach((v, i) => {
    const p = mediaPath(v);
    if (p && pathBelongsToTeam(p, teamId)) { paths.push(p); slots.push(i); }
  });
  if (!paths.length || !supabase) return out;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrls(paths, ttl);
  if (error || !data) return out;
  data.forEach((d, j) => { out[slots[j]] = d?.signedUrl || null; });
  return out;
}
