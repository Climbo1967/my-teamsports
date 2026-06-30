// ============ COACH'S PLAY BOARD — shared geometry & helpers ============
// Pure module (no React). Shared by the interactive editor (PlaybookBoard),
// the read-only renderer (PlayField), and the printable sheets.
//
// All saved coordinates are normalized 0..1 relative to the field viewBox,
// so a play scales cleanly on any screen size and prints sharp.

// Field viewBox. Portrait so the line of scrimmage sits horizontally across
// the middle (offense one side, defense the other) and it fits a Letter page.
export const VB = { w: 1000, h: 1240 };

// Inset of the playing surface inside the viewBox (fraction of each side).
export const FIELD_MARGIN = 0.05;

// Number of yard-line bands drawn between the top and bottom sidelines.
export const YARD_BANDS = 10;

// Default line-of-scrimmage position (fraction down the field).
export const DEFAULT_LOS = 0.52;

// Two looks for the same play: green turf on screen, ink-friendly on paper.
export const THEMES = {
  turf: {
    fieldA: "#2f8a4a", fieldB: "#2b8044",
    line: "#ffffff", lineOp: 0.38,
    hash: "#ffffff", hashOp: 0.6,
    los: "#ffffff", losOp: 0.95,
    frame: "#ffffff", frameOp: 0.85,
    losLabel: "#eafff0",
  },
  paper: {
    fieldA: "#ffffff", fieldB: "#f1f7f2",
    line: "#cde0d3", lineOp: 1,
    hash: "#9cbfa7", hashOp: 1,
    los: "#15803d", losOp: 1,
    frame: "#15803d", frameOp: 0.9,
    losLabel: "#14532d",
  },
};

// Player tokens. shape: circle | x | square | ball. text override optional.
export const TOKENS = {
  o:    { label: "O",  shape: "circle", color: "#ffffff", text: "#12331e" },
  x:    { label: "X",  shape: "x",      color: "#ff5d5d", text: "#ffffff" },
  qb:   { label: "QB", shape: "circle", color: "#ffe14d", text: "#3a2c00" },
  rb:   { label: "RB", shape: "circle", color: "#ffffff", text: "#12331e" },
  wr:   { label: "WR", shape: "circle", color: "#ffffff", text: "#12331e" },
  te:   { label: "TE", shape: "circle", color: "#ffffff", text: "#12331e" },
  c:    { label: "C",  shape: "square", color: "#ffffff", text: "#12331e" },
  ball: { label: "",   shape: "ball",   color: "#8b4a2b", text: "#ffffff" },
  gk:   { label: "GK", shape: "circle", color: "#ffe14d", text: "#3a2c00" },
  cone: { label: "",   shape: "cone",   color: "#fb923c", text: "#ffffff" },
  sball:{ label: "",   shape: "soccerball", color: "#ffffff", text: "#111827" },
  bball:{ label: "",   shape: "basketball", color: "#f97316", text: "#111827" },
};

// Order shown in the toolbar.
export const TOKEN_TOOLS = ["o", "x", "qb", "rb", "wr", "te", "c", "ball"];

// Drawn lines. cap: arrow (route/run) | tee (block) | none (freehand).
export const LINE_TOOLS = {
  route:  { label: "Route",  cap: "arrow", dash: null,    color: "#ffe14d" },
  block:  { label: "Block",  cap: "tee",   dash: null,    color: "#ffffff" },
  motion: { label: "Motion", cap: "arrow", dash: "16 12", color: "#7cc4ff" },
  pen:    { label: "Pen",    cap: "none",  dash: null,    color: "#ffffff" },
};

// Color swatches offered in the editor.
export const PALETTE = ["#ffffff", "#ffe14d", "#ff5d5d", "#7cc4ff", "#34d27b", "#111827"];

export const PLAY_CATEGORIES = ["Offense", "Defense", "Special Teams", "Drill"];

// Token visual sizes (viewBox units).
export const TOKEN_R = 28;     // circle / square radius
export const TOKEN_FONT = 30;  // label font size
export const LINE_W = 7;       // line stroke width
export const ARROW = 34;       // arrowhead length
export const TEE = 26;         // block-cap half width

// ----- small helpers -----
let _seq = 0;
export function uid(prefix = "e") {
  _seq += 1;
  return `${prefix}${Date.now().toString(36)}${_seq.toString(36)}`;
}

export function clamp01(n) {
  return Math.max(0, Math.min(1, n));
}

// normalized point -> viewBox pixels
export function px(p) {
  return [p.x * VB.w, p.y * VB.h];
}

// "x,y x,y x,y" string for a <polyline>, from normalized points
export function polyStr(pts) {
  return pts.map((p) => `${(p.x * VB.w).toFixed(1)},${(p.y * VB.h).toFixed(1)}`).join(" ");
}

// Arrowhead path (px space) at `end`, pointing away from `prev`.
export function arrowHead(prev, end, size = ARROW) {
  const [ex, ey] = px(end);
  const [pxv, pyv] = px(prev);
  const dx = ex - pxv, dy = ey - pyv;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len, uy = dy / len;
  const ang = 0.45; // ~26°
  const cos = Math.cos(ang), sin = Math.sin(ang);
  const lx = ex - size * (ux * cos - uy * sin);
  const ly = ey - size * (uy * cos + ux * sin);
  const rx = ex - size * (ux * cos + uy * sin);
  const ry = ey - size * (uy * cos - ux * sin);
  return `M ${lx.toFixed(1)} ${ly.toFixed(1)} L ${ex.toFixed(1)} ${ey.toFixed(1)} L ${rx.toFixed(1)} ${ry.toFixed(1)}`;
}

// Perpendicular "T" cap (px space) at `end` — a blocking assignment.
export function teeCap(prev, end, half = TEE) {
  const [ex, ey] = px(end);
  const [pxv, pyv] = px(prev);
  const dx = ex - pxv, dy = ey - pyv;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len; // perpendicular
  const ax = ex + half * nx, ay = ey + half * ny;
  const bx = ex - half * nx, by = ey - half * ny;
  return `M ${ax.toFixed(1)} ${ay.toFixed(1)} L ${bx.toFixed(1)} ${by.toFixed(1)}`;
}

export function emptyDiagram(los = DEFAULT_LOS) {
  return { v: 1, los, tokens: [], lines: [], texts: [] };
}

// Defensive read of whatever is stored in the DB column.
export function normalizeDiagram(d) {
  const base = emptyDiagram();
  if (!d || typeof d !== "object") return base;
  return {
    v: 1,
    los: typeof d.los === "number" ? clamp01(d.los) : DEFAULT_LOS,
    tokens: Array.isArray(d.tokens) ? d.tokens : [],
    lines: Array.isArray(d.lines) ? d.lines : [],
    texts: Array.isArray(d.texts) ? d.texts : [],
  };
}

export function isEmptyDiagram(d) {
  const n = normalizeDiagram(d);
  return n.tokens.length === 0 && n.lines.length === 0 && n.texts.length === 0;
}

// Sports with a play board. Football/flag use the gridiron; soccer uses the pitch.
export const BOARD_SPORTS = ["football", "flag_football", "soccer", "basketball"];
export function hasBoard(sport) {
  return BOARD_SPORTS.includes(sport);
}

// Which field backdrop a sport draws on.
export function fieldForSport(sport) {
  if (sport === "soccer") return "pitch";
  if (sport === "basketball") return "court";
  return "gridiron";
}

// Token tools offered in the editor, per sport.
export const SOCCER_TOKEN_TOOLS = ["o", "x", "gk", "sball", "cone"];
export const BASKETBALL_TOKEN_TOOLS = ["o", "x", "bball", "cone"];
export function tokenToolsForSport(sport) {
  if (sport === "soccer") return SOCCER_TOKEN_TOOLS;
  if (sport === "basketball") return BASKETBALL_TOKEN_TOOLS;
  return TOKEN_TOOLS;
}

// Play categories, per sport.
export const SOCCER_CATEGORIES = ["Attack", "Defense", "Set Piece", "Drill"];
export const BASKETBALL_CATEGORIES = ["Offense", "Defense", "Inbound", "Drill"];
export function playCategoriesForSport(sport) {
  if (sport === "soccer") return SOCCER_CATEGORIES;
  if (sport === "basketball") return BASKETBALL_CATEGORIES;
  return PLAY_CATEGORIES;
}
