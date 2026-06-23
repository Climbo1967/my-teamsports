// Read-only renderer for a saved play. Draws the gridiron + all tokens, lines
// and text from a diagram JSON. Shared by the editor base layer, the play-card
// thumbnails, and the printable sheets. No hooks -> usable anywhere.

import {
  VB, FIELD_MARGIN, YARD_BANDS, THEMES, TOKENS, TOKEN_R, TOKEN_FONT,
  LINE_W, LINE_TOOLS, arrowHead, teeCap, polyStr, px, normalizeDiagram,
} from "@/lib/playbook";

const MX = FIELD_MARGIN * VB.w;
const MY = FIELD_MARGIN * VB.h;
const X0 = MX, X1 = VB.w - MX;
const Y0 = MY, Y1 = VB.h - MY;
const INNER_H = Y1 - Y0;
const BAND = INNER_H / YARD_BANDS;
const HASH1 = X0 + (X1 - X0) * 0.36;
const HASH2 = X0 + (X1 - X0) * 0.64;

export function tokenStyle(t) {
  const base = TOKENS[t.kind] || TOKENS.o;
  return {
    shape: base.shape,
    color: t.color || base.color,
    text: base.text || "#12331e",
    label: t.label != null ? t.label : base.label,
  };
}

export function FieldBackdrop({ theme = "turf", los = 0.52 }) {
  const c = THEMES[theme] || THEMES.turf;
  const losY = Y0 + los * INNER_H;
  const bands = [];
  for (let i = 0; i < YARD_BANDS; i++) {
    if (i % 2 === 1) bands.push(i);
  }
  const yardYs = [];
  for (let i = 0; i <= YARD_BANDS; i++) yardYs.push(Y0 + i * BAND);

  return (
    <g>
      {/* turf */}
      <rect x="0" y="0" width={VB.w} height={VB.h} fill={c.fieldA} />
      {bands.map((i) => (
        <rect key={i} x={X0} y={Y0 + i * BAND} width={X1 - X0} height={BAND} fill={c.fieldB} />
      ))}

      {/* yard lines */}
      {yardYs.map((y, i) => (
        <line key={i} x1={X0} y1={y} x2={X1} y2={y} stroke={c.line} strokeOpacity={c.lineOp} strokeWidth={i === 0 || i === YARD_BANDS ? 4 : 3} />
      ))}

      {/* hash ticks on each yard line */}
      {yardYs.map((y, i) =>
        [HASH1, HASH2].map((hx, j) => (
          <line key={`${i}-${j}`} x1={hx - 9} y1={y} x2={hx + 9} y2={y} stroke={c.hash} strokeOpacity={c.hashOp} strokeWidth={3} />
        ))
      )}

      {/* sideline frame */}
      <rect x={X0} y={Y0} width={X1 - X0} height={INNER_H} fill="none" stroke={c.frame} strokeOpacity={c.frameOp} strokeWidth={5} />

      {/* line of scrimmage */}
      <line x1={X0} y1={losY} x2={X1} y2={losY} stroke={c.los} strokeOpacity={c.losOp} strokeWidth={6} strokeDasharray="2 0" />
      <text x={X0 + 8} y={losY - 12} fill={c.losLabel} fontSize="22" fontWeight="700" letterSpacing="2">LOS</text>
      {/* ball spot */}
      <ellipse cx={(X0 + X1) / 2} cy={losY} rx="17" ry="11" fill="#8b4a2b" stroke="#fff" strokeWidth="2" />
      <line x1={(X0 + X1) / 2 - 8} y1={losY} x2={(X0 + X1) / 2 + 8} y2={losY} stroke="#fff" strokeWidth="2" />
    </g>
  );
}

export function TokenMark({ t }) {
  const s = tokenStyle(t);
  const [cx, cy] = px(t);
  const r = TOKEN_R;

  if (s.shape === "ball") {
    return (
      <g>
        <ellipse cx={cx} cy={cy} rx={r * 0.92} ry={r * 0.6} fill={s.color} stroke="#fff" strokeWidth="3" />
        <line x1={cx - r * 0.5} y1={cy} x2={cx + r * 0.5} y2={cy} stroke="#fff" strokeWidth="3" />
        {[-0.28, 0, 0.28].map((o, i) => (
          <line key={i} x1={cx + o * r} y1={cy - 6} x2={cx + o * r} y2={cy + 6} stroke="#fff" strokeWidth="2" />
        ))}
      </g>
    );
  }
  if (s.shape === "x") {
    const a = r * 0.82;
    return (
      <g>
        <line x1={cx - a} y1={cy - a} x2={cx + a} y2={cy + a} stroke={s.color} strokeWidth="9" strokeLinecap="round" />
        <line x1={cx - a} y1={cy + a} x2={cx + a} y2={cy - a} stroke={s.color} strokeWidth="9" strokeLinecap="round" />
      </g>
    );
  }
  return (
    <g>
      {s.shape === "square" ? (
        <rect x={cx - r} y={cy - r} width={r * 2} height={r * 2} rx="6" fill={s.color} stroke="#0c2a16" strokeWidth="3" />
      ) : (
        <circle cx={cx} cy={cy} r={r} fill={s.color} stroke="#0c2a16" strokeWidth="3" />
      )}
      {s.label ? (
        <text x={cx} y={cy} dy="0.34em" textAnchor="middle" fontSize={TOKEN_FONT} fontWeight="800" fill={s.text}>{s.label}</text>
      ) : null}
    </g>
  );
}

export function LineMark({ line }) {
  const cfg = LINE_TOOLS[line.tool] || LINE_TOOLS.route;
  const color = line.color || cfg.color;
  const pts = line.pts || [];
  if (pts.length < 2) return null;
  const prev = pts[pts.length - 2];
  const end = pts[pts.length - 1];
  return (
    <g fill="none" stroke={color} strokeWidth={LINE_W} strokeLinecap="round" strokeLinejoin="round">
      <polyline points={polyStr(pts)} strokeDasharray={cfg.dash || undefined} />
      {cfg.cap === "arrow" && <path d={arrowHead(prev, end)} />}
      {cfg.cap === "tee" && <path d={teeCap(prev, end)} />}
    </g>
  );
}

export function TextMark({ t, halo = "rgba(8,28,16,0.65)" }) {
  const [x, y] = px(t);
  return (
    <text
      x={x} y={y} dy="0.34em" textAnchor="middle"
      fontSize={t.size || 30} fontWeight="800" fill={t.color || "#ffffff"}
      stroke={halo} strokeWidth="5" paintOrder="stroke"
      style={{ strokeLinejoin: "round" }}
    >
      {t.text}
    </text>
  );
}

export default function PlayField({ diagram, theme = "turf", className = "", style }) {
  const d = normalizeDiagram(diagram);
  const halo = theme === "paper" ? "rgba(255,255,255,0.92)" : "rgba(8,28,16,0.65)";
  return (
    <svg viewBox={`0 0 ${VB.w} ${VB.h}`} className={className} style={style} preserveAspectRatio="xMidYMid meet">
      <FieldBackdrop theme={theme} los={d.los} />
      {d.lines.map((l) => <LineMark key={l.id} line={l} />)}
      {d.tokens.map((t) => <TokenMark key={t.id} t={t} />)}
      {d.texts.map((t) => <TextMark key={t.id} t={t} halo={halo} />)}
    </svg>
  );
}
