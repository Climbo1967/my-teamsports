// ============ THE SCOREKEEPER — Tier 3 batting-order recommendation ============
// Builds an offensive profile per player from their at_bats, then recommends a
// batting order weighted toward getting on base (table-setters bat first).

const HITS = { single: 1, double: 2, triple: 3, hr: 4 };
const AB_RESULTS = new Set([
  "single", "double", "triple", "hr", "strikeout",
  "groundout", "flyout", "lineout", "popout", "fielders_choice", "error",
]);
// Plate appearances exclude pure base-running events.
const NON_PA = new Set(["stolen_base"]);

export function playerOffense(atBats) {
  let pa = 0, ab = 0, h = 0, bb = 0, hbp = 0, hr = 0, rbiPA = 0, tb = 0, sb = 0;
  for (const a of atBats || []) {
    if (a.result === "stolen_base") { sb += 1; continue; }
    if (NON_PA.has(a.result)) continue;
    pa += 1;
    if (AB_RESULTS.has(a.result)) ab += 1;
    if (HITS[a.result]) { h += 1; tb += HITS[a.result]; }
    if (a.result === "walk") bb += 1;
    if (a.result === "hbp") hbp += 1;
    if (a.result === "hr") hr += 1;
    rbiPA += a.rbi || 0;
  }
  const avg = ab ? h / ab : 0;
  const obp = pa ? (h + bb + hbp) / pa : 0;
  const slg = ab ? tb / ab : 0;
  const ops = obp + slg;
  return { pa, ab, h, bb, hbp, hr, sb, avg, obp, slg, ops, rbi: rbiPA };
}

// Minimum plate appearances before a player is ranked on merit.
export const MIN_PA = 3;

// byPlayer: { player_id: [at_bats] }. Returns ordered entries with metrics.
export function recommendLineup(players, byPlayer) {
  const scored = (players || []).map((p) => {
    const o = playerOffense(byPlayer[p.id] || []);
    const hasData = o.pa >= MIN_PA;
    // On-base weighted, with OPS mixing in extra-base/power value.
    const score = hasData ? o.obp * 0.6 + o.ops * 0.4 : -1;
    return { player: p, o, score, hasData };
  });
  const ranked = scored.filter((s) => s.hasData).sort((a, b) => b.score - a.score);
  const rest = scored.filter((s) => !s.hasData); // keep roster order at the bottom
  return [...ranked, ...rest];
}

export function fmtAvg(v) {
  if (!v) return ".000";
  return v.toFixed(3).replace(/^0/, "");
}
