import { passOffer, priceFor, regularPriceFor, fmtUsd } from "./pricing";

/**
 * Marketing copy for the current season's price, derived from lib/pricing.js
 * so the public pages flip on January 1 by themselves (bug sweep 2026-10-03,
 * #23: the pricing page, FAQ, homepage and sport pages hard-coded "$15 / 2026
 * season" and "half off for 2026").
 *
 * The pages that use this are statically rendered, so each one also sets
 * `export const revalidate = 3600` (Next needs the literal) to re-render
 * hourly; otherwise the copy would freeze at build time.
 *
 * Returns the price year and the strings the pages share:
 *   year, nextYear   the year whose price applies, and the one after
 *   season, ai       this year's prices, formatted ("$15", "$20")
 *   regularSeason, regularAi   the regular prices ("$30", "$40")
 *   halfOff          true while the launch price is below regular
 *   lateYear         true from October 1 (a pass also covers next year)
 *   badge            "Half off for the 2026 season" / "$30 for the 2027 season"
 *   seasonLabel      "2026 season"
 */
export function pricingCopy(now = new Date()) {
  const offer = passOffer(now);
  const year = offer.priceYear;
  const nextYear = year + 1;
  const seasonCents = priceFor("season", year);
  const aiCents = priceFor("ai", year);
  const season = fmtUsd(seasonCents);
  const ai = fmtUsd(aiCents);
  const regularSeason = fmtUsd(regularPriceFor("season"));
  const regularAi = fmtUsd(regularPriceFor("ai"));
  const halfOff = seasonCents < regularPriceFor("season");
  const seasonLabel = `${year} season`;
  const badge = halfOff ? `Half off for the ${seasonLabel}` : `${season} for the ${seasonLabel}`;
  return {
    year,
    nextYear,
    passYear: offer.passYear,
    lateYear: offer.lateYear,
    season,
    ai,
    regularSeason,
    regularAi,
    halfOff,
    seasonLabel,
    badge,
  };
}
