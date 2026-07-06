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
 * Compute a team's access state from its billing columns.
 * Lock model: expired teams lose the coach dashboard only —
 * the public team site never locks.
 */
export function teamAccess(team, now = new Date()) {
  const today = now.toISOString().slice(0, 10);
  const paid = !!(team.paid_through && team.paid_through >= today);
  const trialActive = !!(team.trial_ends_at && new Date(team.trial_ends_at) > now);
  const aiPaid = !!(team.ai_paid_through && team.ai_paid_through >= today);
  const ai = aiPaid || !!team.ai_enabled; // ai_enabled doubles as a comp/override flag
  return {
    active: paid || trialActive,
    paid,
    trialActive,
    ai,
    aiPaid,
    paidThrough: team.paid_through || null,
    aiPaidThrough: team.ai_paid_through || null,
    trialEndsAt: team.trial_ends_at || null,
  };
}
