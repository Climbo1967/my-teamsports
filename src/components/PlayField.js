// Read-only renderer for a saved play. Draws the gridiron + all tokens, lines
// and text from a diagram JSON. Shared by the editor base layer, the play-card
// thumbnails, and the printable sheets. No hooks -> usable anywhere.

import {
  VB, FIELD_MARGIN, YARD_BANDS, THEMES, TOKENS, TOKEN_R, TOKEN_FONT,
  LINE_W, LINE_TOOLS, arrowHead, teeCap, polyStr, px, normalizeDiagram, fieldForSport,
} from "@/lib/playbook";

// On the paper (print) theme, map bright on-turf colors to darker, ink-friendly
// equivalents so routes and labels stay legible on white (incl. B&W printers).
const INK = {
  "#ffe14d": "#a16207", "#ffffff": "#1f2937", "#7cc4ff": "#1d4ed8",
  "#34d27b": "#15803d", "#ff5d5d": "#dc2626", "#111827": "#111827",
};
function inkColor(color, theme) {
  if (theme !== "paper") return color;
  return INK[color] || color;
}

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

export function FieldBackdrop({ theme = "turf", los = 0.52, field = "gridiron" }) {
  if (field === "pitch") return <SoccerBackdrop theme={theme} />;
  if (field === "court") return <BasketballBackdrop theme={theme} />;
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

// Soccer pitch backdrop (portrait full pitch). Uses the same turf/paper themes.
function SoccerBackdrop({ theme = "turf" }) {
  const c = THEMES[theme] || THEMES.turf;
  const cx = (X0 + X1) / 2;
  const FW = X1 - X0;
  const midY = Y0 + INNER_H / 2;
  const stripes = 10;
  const sH = INNER_H / stripes;
  const paW = FW * 0.62, paH = INNER_H * 0.165;
  const gaW = FW * 0.34, gaH = INNER_H * 0.07;
  const spotOff = INNER_H * 0.105;
  const PR = FW * 0.20, ccR = FW * 0.18;
  const goalW = FW * 0.20, goalD = INNER_H * 0.022;
  const a = Math.asin(Math.max(-1, Math.min(1, (paH - spotOff) / PR)));
  const arc = (axx, ayy, r, a0, a1, n = 30) => {
    const out = [];
    for (let i = 0; i <= n; i++) {
      const ang = a0 + (a1 - a0) * (i / n);
      out.push(`${(axx + r * Math.cos(ang)).toFixed(1)},${(ayy + r * Math.sin(ang)).toFixed(1)}`);
    }
    return out.join(" ");
  };
  const lp = { stroke: c.line, strokeOpacity: c.lineOp, strokeWidth: 4, fill: "none" };
  return (
    <g>
      <rect x="0" y="0" width={VB.w} height={VB.h} fill={c.fieldA} />
      {Array.from({ length: stripes }).map((_, i) =>
        i % 2 === 1 ? <rect key={i} x={X0} y={Y0 + i * sH} width={FW} height={sH} fill={c.fieldB} /> : null
      )}
      <rect x={X0} y={Y0} width={FW} height={INNER_H} fill="none" stroke={c.frame} strokeOpacity={c.frameOp} strokeWidth={5} />
      <line x1={X0} y1={midY} x2={X1} y2={midY} {...lp} />
      <circle cx={cx} cy={midY} r={ccR} {...lp} />
      <circle cx={cx} cy={midY} r={6} fill={c.line} fillOpacity={c.lineOp} />
      {/* top box */}
      <rect x={cx - paW / 2} y={Y0} width={paW} height={paH} {...lp} />
      <rect x={cx - gaW / 2} y={Y0} width={gaW} height={gaH} {...lp} />
      <circle cx={cx} cy={Y0 + spotOff} r={5} fill={c.line} fillOpacity={c.lineOp} />
      <polyline points={arc(cx, Y0 + spotOff, PR, a, Math.PI - a)} {...lp} />
      {/* bottom box */}
      <rect x={cx - paW / 2} y={Y1 - paH} width={paW} height={paH} {...lp} />
      <rect x={cx - gaW / 2} y={Y1 - gaH} width={gaW} height={gaH} {...lp} />
      <circle cx={cx} cy={Y1 - spotOff} r={5} fill={c.line} fillOpacity={c.lineOp} />
      <polyline points={arc(cx, Y1 - spotOff, PR, Math.PI + a, 2 * Math.PI - a)} {...lp} />
      {/* goals */}
      <rect x={cx - goalW / 2} y={Y0 - goalD} width={goalW} height={goalD} fill="none" stroke={c.frame} strokeOpacity={c.frameOp} strokeWidth={4} />
      <rect x={cx - goalW / 2} y={Y1} width={goalW} height={goalD} fill="none" stroke={c.frame} strokeOpacity={c.frameOp} strokeWidth={4} />
    </g>
  );
}

// Basketball half-court backdrop (portrait; hoop at the top).
function BasketballBackdrop({ theme = "turf" }) {
  const paper = theme === "paper";
  const woodA = paper ? "#ffffff" : "#c98a4e";
  const woodB = paper ? "#f1f7f2" : "#c0824a";
  const line = paper ? "#6b7280" : "#ffffff";
  const lineOp = paper ? 1 : 0.92;
  const bcx = (X0 + X1) / 2;
  const FW = X1 - X0;
  const hoopY = Y0 + INNER_H * 0.055;
  const laneW = FW * 0.34, laneH = INNER_H * 0.36;
  const ftY = Y0 + laneH, ftR = FW * 0.17;
  const tpX = FW * 0.42, tpR = FW * 0.55;
  const endY = hoopY + Math.sqrt(Math.max(0, tpR * tpR - tpX * tpX));
  const ccR = FW * 0.16;
  const stripes = 10, sH = INNER_H / stripes;
  const lp = { stroke: line, strokeOpacity: lineOp, strokeWidth: 4, fill: "none" };
  const arc = (axx, ayy, r, a0, a1, n = 40) => {
    const o = [];
    for (let i = 0; i <= n; i++) { const ang = a0 + (a1 - a0) * (i / n); o.push(`${(axx + r * Math.cos(ang)).toFixed(1)},${(ayy + r * Math.sin(ang)).toFixed(1)}`); }
    return o.join(" ");
  };
  const tA = Math.acos(Math.max(-1, Math.min(1, tpX / tpR)));
  return (
    <g>
      <rect x="0" y="0" width={VB.w} height={VB.h} fill={woodA} />
      {Array.from({ length: stripes }).map((_, i) => (i % 2 === 1 ? <rect key={i} x={X0} y={Y0 + i * sH} width={FW} height={sH} fill={woodB} /> : null))}
      <rect x={X0} y={Y0} width={FW} height={INNER_H} fill="none" stroke={line} strokeOpacity={lineOp} strokeWidth={5} />
      {/* backboard + rim */}
      <line x1={bcx - FW * 0.09} y1={Y0 + INNER_H * 0.022} x2={bcx + FW * 0.09} y2={Y0 + INNER_H * 0.022} stroke={line} strokeOpacity={lineOp} strokeWidth={6} />
      <circle cx={bcx} cy={hoopY} r={FW * 0.03} {...lp} />
      {/* lane (key) + free-throw circle */}
      <rect x={bcx - laneW / 2} y={Y0} width={laneW} height={laneH} {...lp} />
      <circle cx={bcx} cy={ftY} r={ftR} {...lp} />
      {/* three-point line: straight sides + arc */}
      <line x1={bcx - tpX} y1={Y0} x2={bcx - tpX} y2={endY} {...lp} />
      <line x1={bcx + tpX} y1={Y0} x2={bcx + tpX} y2={endY} {...lp} />
      <polyline points={arc(bcx, hoopY, tpR, tA, Math.PI - tA)} {...lp} />
      {/* restricted area under the rim */}
      <polyline points={arc(bcx, hoopY, FW * 0.09, 0.18, Math.PI - 0.18)} {...lp} />
      {/* halfcourt line + center half-circle (bottom) */}
      <line x1={X0} y1={Y1} x2={X1} y2={Y1} {...lp} />
      <polyline points={arc(bcx, Y1, ccR, Math.PI, 2 * Math.PI)} {...lp} />
    </g>
  );
}

export function TokenMark({ t }) {
  const s = tokenStyle(t);
  const [cx, cy] = px(t);
  const r = TOKEN_R;

  if (s.shape === "cone") {
    return (
      <g>
        <path d={`M ${cx} ${cy - r} L ${cx + r * 0.92} ${cy + r * 0.82} L ${cx - r * 0.92} ${cy + r * 0.82} Z`} fill={s.color} stroke="#7c2d12" strokeWidth="3" strokeLinejoin="round" />
        <line x1={cx - r * 0.55} y1={cy + r * 0.18} x2={cx + r * 0.55} y2={cy + r * 0.18} stroke="#ffffff" strokeWidth="4" />
      </g>
    );
  }
  if (s.shape === "soccerball") {
    const rp = r * 0.34;
    const penta = [0, 1, 2, 3, 4].map((kk) => { const ang = -Math.PI / 2 + (kk * 2 * Math.PI) / 5; return `${(cx + rp * Math.cos(ang)).toFixed(1)},${(cy + rp * Math.sin(ang)).toFixed(1)}`; }).join(" ");
    return (
      <g>
        <circle cx={cx} cy={cy} r={r * 0.82} fill="#ffffff" stroke="#111827" strokeWidth="3" />
        <polygon points={penta} fill="#111827" />
        {[0, 1, 2, 3, 4].map((kk) => { const ang = -Math.PI / 2 + (kk * 2 * Math.PI) / 5; return <line key={kk} x1={cx + rp * Math.cos(ang)} y1={cy + rp * Math.sin(ang)} x2={cx + r * 0.78 * Math.cos(ang + Math.PI / 5)} y2={cy + r * 0.78 * Math.sin(ang + Math.PI / 5)} stroke="#111827" strokeWidth="2.5" />; })}
      </g>
    );
  }

  if (s.shape === "basketball") {
    const rr = r * 0.82;
    return (
      <g>
        <circle cx={cx} cy={cy} r={rr} fill="#f97316" stroke="#7c2d12" strokeWidth="3" />
        <line x1={cx} y1={cy - rr} x2={cx} y2={cy + rr} stroke="#7c2d12" strokeWidth="2.5" />
        <line x1={cx - rr} y1={cy} x2={cx + rr} y2={cy} stroke="#7c2d12" strokeWidth="2.5" />
        <path d={`M ${cx - rr} ${cy} Q ${cx} ${cy - rr * 0.62} ${cx + rr} ${cy}`} fill="none" stroke="#7c2d12" strokeWidth="2" />
        <path d={`M ${cx - rr} ${cy} Q ${cx} ${cy + rr * 0.62} ${cx + rr} ${cy}`} fill="none" stroke="#7c2d12" strokeWidth="2" />
      </g>
    );
  }

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

export function LineMark({ line, theme }) {
  const cfg = LINE_TOOLS[line.tool] || LINE_TOOLS.route;
  const color = inkColor(line.color || cfg.color, theme);
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

export function TextMark({ t, halo = "rgba(8,28,16,0.65)", theme }) {
  const [x, y] = px(t);
  return (
    <text
      x={x} y={y} dy="0.34em" textAnchor="middle"
      fontSize={t.size || 30} fontWeight="800" fill={inkColor(t.color || "#ffffff", theme)}
      stroke={halo} strokeWidth="5" paintOrder="stroke"
      style={{ strokeLinejoin: "round" }}
    >
      {t.text}
    </text>
  );
}

export default function PlayField({ diagram, theme = "turf", className = "", style, sport }) {
  const d = normalizeDiagram(diagram);
  const halo = theme === "paper" ? "rgba(255,255,255,0.92)" : "rgba(8,28,16,0.65)";
  return (
    <svg viewBox={`0 0 ${VB.w} ${VB.h}`} className={className} style={style} preserveAspectRatio="xMidYMid meet">
      <FieldBackdrop theme={theme} los={d.los} field={fieldForSport(sport)} />
      {d.lines.map((l) => <LineMark key={l.id} line={l} theme={theme} />)}
      {d.tokens.map((t) => <TokenMark key={t.id} t={t} />)}
      {d.texts.map((t) => <TextMark key={t.id} t={t} halo={halo} theme={theme} />)}
    </svg>
  );
}
