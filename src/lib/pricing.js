// Season-pass pricing. One-time payments, calendar-year passes.
// 2026 is the half-off launch year; regular prices apply after.

export const REGULAR_PRICES = { season: 3000, ai: 4000 }; // cents
export const INTRO_2026 = { season: 1500, ai: 2000 };

export const PRODUCT_NAMES = {
  season: "Season Pass",
  ai: "AI Assistant Coach",
};

export function currentSeasonYear(now = new Date()) {
  return now.getFullYear();
}

export function priceFor(product, year) {
  const table = year === 2026 ? INTRO_2026 : REGULAR_PRICES;
  return table[product];
}

export function regularPriceFor(product) {
  return REGULAR_PRICES[product];
}

export function fmtUsd(cents) {
  const dollars = cents / 100;
  return Number.isInteger(dollars) ? `$${dollars}` : `$${dollars.toFixed(2)}`;
}

export function seasonEndDate(year) {
  return `${year}-12-31`;
}

/**
 * What a pass bought right now costs and covers.
 *
 * Late-year rule (Ron, 2026-10-02): a pass bought from October 1 covers the
 * rest of that calendar year AND all of the next one, so nobody pays in the
 * fall and again in January. It is still a one-time calendar-year pass: the
 * price is the price of the year it is bought in, and it ends on a Dec 31.
 *
 *   priceYear  the year whose price applies (the year of purchase)
 *   passYear   the last year the pass covers; stored as the purchase's
 *              season_year, which is what fulfilment turns into paid_through
 *   endDate    `${passYear}-12-31`
 *   lateYear   true from October 1 through December 31
 *
 * Uses UTC so the browser and the server always agree on the offer.
 */
export const LATE_YEAR_FROM_MONTH = 10; // October

export function passOffer(now = new Date()) {
  const priceYear = now.getUTCFullYear();
  const lateYear = now.getUTCMonth() + 1 >= LATE_YEAR_FROM_MONTH;
  const passYear = lateYear ? priceYear + 1 : priceYear;
  return { priceYear, passYear, lateYear, endDate: seasonEndDate(passYear) };
}

/**
 * Compute a team's access state from its billing columns.
 * Lock model: expired teams lose the coach dashboard only —
 * the public team site never locks.
 *
 * `league` is the optional result of the `team_league_info` RPC (null for
 * every solo team). A team is league-covered when its school's plan or the
 * league's own paid_through is current — that unlocks the coach dashboard
 * exactly like a Season Pass. The AI add-on is never bundled (design v1 §7).
 */
export function teamAccess(team, now = new Date(), league = null) {
  const today = now.toISOString().slice(0, 10);
  const paid = !!(team.paid_through && team.paid_through >= today);
  const trialActive = !!(team.trial_ends_at && new Date(team.trial_ends_at) > now);
  const aiPaid = !!(team.ai_paid_through && team.ai_paid_through >= today);
  // AI Coach: free for the trial (30 days from the coach's signup since 2026-10-02; stored
  // per-team as ai_trial_ends_at), then paid. ai_enabled is a manual comp override.
  const aiTrialActive = !!(team.ai_trial_ends_at && new Date(team.ai_trial_ends_at) > now);
  const ai = aiPaid || aiTrialActive || !!team.ai_enabled;

  const schoolPaidThrough = league?.school?.paid_through || null;
  const leaguePaidThrough = league?.league?.paid_through || null;
  const schoolActive = !!(schoolPaidThrough && schoolPaidThrough >= today);
  const leagueActive = schoolActive || !!(leaguePaidThrough && leaguePaidThrough >= today);
  // Whichever coverage reaches furthest is the date we show the coach.
  const leaguePaidThroughShown = [schoolPaidThrough, leaguePaidThrough]
    .filter((d) => d && d >= today).sort().pop() || null;

  return {
    active: paid || trialActive || leagueActive,
    paid,
    trialActive,
    leagueActive,
    ai,
    aiPaid,
    aiTrialActive,
    paidThrough: team.paid_through || null,
    aiPaidThrough: team.ai_paid_through || null,
    aiTrialEndsAt: team.ai_trial_ends_at || null,
    trialEndsAt: team.trial_ends_at || null,
    leaguePaidThrough: leaguePaidThroughShown,
    leagueName: league?.league?.name || null,
    leagueSlug: league?.league?.slug || null,
    schoolName: league?.school?.name || null,
    divisionName: league?.division?.name || null,
  };
}
