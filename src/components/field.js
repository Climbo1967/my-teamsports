"use client";

// Shared baseball field. Used two ways:
//  - interactive (live scoring): tap to set `loc` via onTap.
//  - display (scouting): plot `points` = [{ x, y, hit }] spray chart.
export function BaseballField({ points = [], loc = null, onTap = null, interactive = false, className = "" }) {
  return (
    <svg
      viewBox="0 0 300 270"
      onClick={interactive ? onTap : undefined}
      className={`w-full rounded-xl select-none ${interactive ? "cursor-crosshair" : ""} ${className}`}
      style={{ touchAction: "manipulation" }}
    >
      <rect x="0" y="0" width="300" height="270" fill="#0c2a16" />
      {/* outfield grass */}
      <path d="M 30 250 A 230 230 0 0 1 270 250 Z" fill="#10401f" />
      {/* foul lines */}
      <line x1="150" y1="240" x2="20" y2="118" stroke="#ffffff" strokeOpacity="0.5" strokeWidth="2" />
      <line x1="150" y1="240" x2="280" y2="118" stroke="#ffffff" strokeOpacity="0.5" strokeWidth="2" />
      {/* infield dirt */}
      <polygon points="150,240 205,185 150,130 95,185" fill="#7a4a23" />
      {/* bases */}
      <rect x="144" y="234" width="12" height="12" fill="#fff" transform="rotate(45 150 240)" />
      <rect x="199" y="179" width="11" height="11" fill="#fff" transform="rotate(45 205 185)" />
      <rect x="144" y="124" width="11" height="11" fill="#fff" transform="rotate(45 150 130)" />
      <rect x="90" y="179" width="11" height="11" fill="#fff" transform="rotate(45 95 185)" />
      {/* pitcher */}
      <circle cx="150" cy="185" r="4" fill="#fff" fillOpacity="0.6" />

      {/* plotted spray points */}
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x * 300}
          cy={p.y * 270}
          r="5"
          fill={p.hit ? "var(--color-accent-green)" : "#94a3b8"}
          fillOpacity={p.hit ? "0.85" : "0.55"}
          stroke="#0c2a16"
          strokeWidth="1"
        />
      ))}

      {/* current tap marker */}
      {loc && (
        <g>
          <circle cx={loc.x * 300} cy={loc.y * 270} r="9" fill="var(--color-accent-green)" fillOpacity="0.35" />
          <circle cx={loc.x * 300} cy={loc.y * 270} r="4" fill="var(--color-accent-green)" />
        </g>
      )}
    </svg>
  );
}
