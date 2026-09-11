// Pure formatting/lookup helpers for league pages. No server deps, so client
// components (schedule filter) can import them without dragging supabase-js
// into the browser bundle.

// Game times display in the league's local zone. Every league we onboard in
// 2026–27 is in Texas; a per-league timezone column is the follow-up when the
// first non-Central league signs.
export const LEAGUE_TZ = "America/Chicago";

export function teamLabel(site, teamId) {
  const t = site.teamsById[teamId];
  if (!t) return "TBD";
  const school = t.school_id ? site.schoolsById[t.school_id] : null;
  // "St. Mark's Varsity Boys" reads better than a bare team name when the
  // school is known and the team name doesn't already carry it.
  if (school && !t.name.toLowerCase().includes((school.short_name || school.name).toLowerCase())) {
    return `${school.short_name || school.name} ${t.name}`;
  }
  return t.name;
}

export function divisionsForSeason(site, seasonId) {
  return (site.divisions || []).filter((d) => d.season_id === seasonId);
}

export function isFinal(g) {
  return g.status === "final" || g.status === "forfeit";
}

export function gameDate(g) {
  return new Date(g.starts_at);
}

export function fmtGameDay(g) {
  return gameDate(g).toLocaleDateString("en-US", {
    timeZone: LEAGUE_TZ, weekday: "short", month: "short", day: "numeric",
  });
}

export function fmtGameTime(g) {
  return gameDate(g).toLocaleTimeString("en-US", {
    timeZone: LEAGUE_TZ, hour: "numeric", minute: "2-digit",
  });
}

/** Stable YYYY-MM-DD in league time — used as a grouping key. */
export function gameDayKey(g) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: LEAGUE_TZ, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(gameDate(g));
  const get = (type) => parts.find((p) => p.type === type)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export const STATUS_LABEL = {
  scheduled: "",
  in_progress: "LIVE",
  final: "Final",
  postponed: "Postponed",
  forfeit: "Forfeit",
  cancelled: "Cancelled",
};

export function fmtPct(pct) {
  const n = Number(pct || 0);
  if (n >= 1) return "1.000";
  return n.toFixed(3).replace(/^0/, "");
}

/**
 * Home-page slices: latest finals (newest first) and the next games, where
 * "next" tolerates games that started up to 3h ago (still in progress or
 * not yet reported). Lives here, not in the component, so the ISR render
 * reads the clock once per revalidation rather than during render.
 */
export function splitRecentAndUpcoming(games, now = Date.now()) {
  const finals = games
    .filter(isFinal)
    .sort((a, b) => new Date(b.starts_at) - new Date(a.starts_at))
    .slice(0, 8);
  const upcoming = games
    .filter((g) => !isFinal(g) && g.status !== "cancelled" && new Date(g.starts_at).getTime() >= now - 3 * 3600 * 1000)
    .slice(0, 10);
  return { finals, upcoming };
}
