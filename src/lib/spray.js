// ============ THE SCOREKEEPER — Tier 2 batter tendencies ============
// Turns the hit locations captured during live scoring (at_bats.hit_x / hit_y,
// normalized 0..1 with home plate at bottom-center, deep outfield at top) into
// spray-chart points and a plain-English tendency readout for the coach.

const HIT_RESULTS = ["single", "double", "triple", "hr"];

// Horizontal field thirds. x: 0 = left-field line, 1 = right-field line.
export function horizontalZone(x) {
  if (x < 0.4) return "left";
  if (x > 0.6) return "right";
  return "center";
}

// Depth. y: small = deep (outfield), large = near home (infield).
export function depthZone(y) {
  return y < 0.46 ? "outfield" : "infield";
}

export const ZONE_LABEL = {
  left: "left field",
  center: "up the middle",
  right: "right field",
};

export const DEPTH_LABEL = {
  outfield: "the outfield",
  infield: "the infield",
};

export function isHitResult(result) {
  return HIT_RESULTS.includes(result);
}

// at_bats: [{ result, hit_x, hit_y, hit_type }]
export function computeTendencies(atBats) {
  const inPlay = (atBats || []).filter(
    (a) => a.hit_x !== null && a.hit_x !== undefined && a.hit_y !== null && a.hit_y !== undefined
  );
  const n = inPlay.length;

  const h = { left: 0, center: 0, right: 0 };
  const d = { infield: 0, outfield: 0 };
  const types = {};
  let hits = 0;

  for (const a of inPlay) {
    h[horizontalZone(Number(a.hit_x))] += 1;
    d[depthZone(Number(a.hit_y))] += 1;
    if (a.hit_type) types[a.hit_type] = (types[a.hit_type] || 0) + 1;
    if (isHitResult(a.result)) hits += 1;
  }

  const pct = (c) => (n ? c / n : 0);
  const horizontal = [
    { zone: "left", count: h.left, pct: pct(h.left) },
    { zone: "center", count: h.center, pct: pct(h.center) },
    { zone: "right", count: h.right, pct: pct(h.right) },
  ];
  const primary = [...horizontal].sort((a, b) => b.count - a.count)[0];
  const depthPrimary = d.outfield >= d.infield
    ? { zone: "outfield", count: d.outfield, pct: pct(d.outfield) }
    : { zone: "infield", count: d.infield, pct: pct(d.infield) };

  return {
    n,
    points: inPlay.map((a) => ({
      x: Number(a.hit_x),
      y: Number(a.hit_y),
      hit: isHitResult(a.result),
      result: a.result,
    })),
    horizontal,
    depth: depthPrimary,
    primary, // { zone, count, pct }
    hits,
    hitRate: pct(hits),
    types, // { grounder: n, ... }
  };
}

export function pctText(p) {
  return `${Math.round(p * 100)}%`;
}

// One-line summary, e.g. "Likely to right field — 62% (8 balls in play)".
export function tendencySentence(t, minSample = 4) {
  if (!t || t.n === 0) return "No tracked hits yet.";
  if (t.n < minSample) return `Only ${t.n} tracked ${t.n === 1 ? "ball" : "balls"} in play so far — keep scoring to build a read.`;
  return `Likely to ${ZONE_LABEL[t.primary.zone]} — ${pctText(t.primary.pct)} of ${t.n} balls in play.`;
}
