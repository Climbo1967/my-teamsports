export const SPORT_EMOJI = {
  baseball: "⚾",
  football: "🏈",
  flag_football: "🚩",
  basketball: "🏀",
  soccer: "⚽",
  softball: "🥎",
  volleyball: "🏐",
  hockey: "🏒",
  other: "🏆",
};

export const SPORTS = [
  { value: "baseball", label: "Baseball", emoji: "⚾" },
  { value: "football", label: "Football", emoji: "🏈" },
  { value: "flag_football", label: "Flag Football", emoji: "🚩" },
  { value: "basketball", label: "Basketball", emoji: "🏀" },
  { value: "soccer", label: "Soccer", emoji: "⚽" },
  { value: "softball", label: "Softball", emoji: "🥎" },
  { value: "volleyball", label: "Volleyball", emoji: "🏐" },
  { value: "hockey", label: "Hockey", emoji: "🏒" },
  { value: "other", label: "Other", emoji: "🏆" },
];

export const POSITIONS = {
  baseball: ["Pitcher", "Catcher", "First Base", "Second Base", "Third Base", "Shortstop", "Left Field", "Center Field", "Right Field", "Utility"],
  softball: ["Pitcher", "Catcher", "First Base", "Second Base", "Third Base", "Shortstop", "Left Field", "Center Field", "Right Field", "Utility"],
  football: ["Quarterback", "Running Back", "Wide Receiver", "Tight End", "Offensive Line", "Defensive Line", "Linebacker", "Cornerback", "Safety", "Kicker"],
  flag_football: ["Quarterback", "Center", "Wide Receiver", "Running Back", "Rusher", "Safety", "Cornerback"],
  basketball: ["Point Guard", "Shooting Guard", "Small Forward", "Power Forward", "Center"],
  soccer: ["Goalkeeper", "Defender", "Midfielder", "Forward", "Striker", "Winger"],
  volleyball: ["Setter", "Outside Hitter", "Opposite Hitter", "Middle Blocker", "Libero", "Defensive Specialist"],
  hockey: ["Goalie", "Defenseman", "Center", "Left Wing", "Right Wing"],
  other: [],
};

// Stat columns per sport: key (stored), abbr (column header), label (tooltip)
export const STAT_KEYS = {
  baseball: [
    { key: "ab", abbr: "AB", label: "At Bats" },
    { key: "r", abbr: "R", label: "Runs" },
    { key: "h", abbr: "H", label: "Hits" },
    { key: "hr", abbr: "HR", label: "Home Runs" },
    { key: "rbi", abbr: "RBI", label: "Runs Batted In" },
    { key: "sb", abbr: "SB", label: "Stolen Bases" },
  ],
  softball: [
    { key: "ab", abbr: "AB", label: "At Bats" },
    { key: "r", abbr: "R", label: "Runs" },
    { key: "h", abbr: "H", label: "Hits" },
    { key: "hr", abbr: "HR", label: "Home Runs" },
    { key: "rbi", abbr: "RBI", label: "Runs Batted In" },
    { key: "sb", abbr: "SB", label: "Stolen Bases" },
  ],
  basketball: [
    { key: "pts", abbr: "PTS", label: "Points" },
    { key: "reb", abbr: "REB", label: "Rebounds" },
    { key: "ast", abbr: "AST", label: "Assists" },
    { key: "stl", abbr: "STL", label: "Steals" },
    { key: "blk", abbr: "BLK", label: "Blocks" },
  ],
  football: [
    { key: "td", abbr: "TD", label: "Touchdowns" },
    { key: "yds", abbr: "YDS", label: "Yards" },
    { key: "rec", abbr: "REC", label: "Receptions" },
    { key: "tkl", abbr: "TKL", label: "Tackles" },
    { key: "int", abbr: "INT", label: "Interceptions" },
  ],
  flag_football: [
    { key: "td", abbr: "TD", label: "Touchdowns" },
    { key: "yds", abbr: "YDS", label: "Yards" },
    { key: "rec", abbr: "REC", label: "Receptions" },
    { key: "flg", abbr: "FLG", label: "Flag Pulls" },
    { key: "int", abbr: "INT", label: "Interceptions" },
  ],
  soccer: [
    { key: "g", abbr: "G", label: "Goals" },
    { key: "a", abbr: "A", label: "Assists" },
    { key: "sog", abbr: "SOG", label: "Shots on Goal" },
    { key: "sv", abbr: "SV", label: "Saves" },
  ],
  volleyball: [
    { key: "k", abbr: "K", label: "Kills" },
    { key: "ast", abbr: "AST", label: "Assists" },
    { key: "dig", abbr: "DIG", label: "Digs" },
    { key: "blk", abbr: "BLK", label: "Blocks" },
    { key: "ace", abbr: "ACE", label: "Aces" },
  ],
  hockey: [
    { key: "g", abbr: "G", label: "Goals" },
    { key: "a", abbr: "A", label: "Assists" },
    { key: "sog", abbr: "SOG", label: "Shots on Goal" },
    { key: "sv", abbr: "SV", label: "Saves" },
    { key: "pim", abbr: "PIM", label: "Penalty Minutes" },
  ],
  other: [
    { key: "pts", abbr: "PTS", label: "Points" },
  ],
};

export function inviteMessage(team) {
  return `Join our team site! https://my-teamsports.com/team/${team.slug} — Passcode: ${team.passcode}`;
}

// Win/loss record parsed from event result strings ("W 9-4", "L 3-5", "T 2-2")
export function computeRecord(events) {
  let w = 0, l = 0, t = 0;
  for (const e of events || []) {
    const m = /^\s*([WLT])/i.exec(e.result || "");
    if (!m) continue;
    const c = m[1].toUpperCase();
    if (c === "W") w++;
    else if (c === "L") l++;
    else t++;
  }
  return { w, l, t, played: w + l + t };
}

export function formatRecord(r) {
  return r.t > 0 ? `${r.w}-${r.l}-${r.t}` : `${r.w}-${r.l}`;
}

// Derived season stats, computed from totals and games played
export const DERIVED_STATS = {
  baseball: [
    { abbr: "AVG", label: "Batting Average", compute: (t) => (t.ab ? (t.h || 0) / t.ab : null), format: "avg" },
  ],
  softball: [
    { abbr: "AVG", label: "Batting Average", compute: (t) => (t.ab ? (t.h || 0) / t.ab : null), format: "avg" },
  ],
  basketball: [
    { abbr: "PPG", label: "Points Per Game", compute: (t, gp) => (gp ? (t.pts || 0) / gp : null), format: "pg" },
    { abbr: "RPG", label: "Rebounds Per Game", compute: (t, gp) => (gp ? (t.reb || 0) / gp : null), format: "pg" },
    { abbr: "APG", label: "Assists Per Game", compute: (t, gp) => (gp ? (t.ast || 0) / gp : null), format: "pg" },
  ],
  football: [
    { abbr: "YPG", label: "Yards Per Game", compute: (t, gp) => (gp ? (t.yds || 0) / gp : null), format: "pg" },
  ],
  flag_football: [
    { abbr: "YPG", label: "Yards Per Game", compute: (t, gp) => (gp ? (t.yds || 0) / gp : null), format: "pg" },
    { abbr: "TD/GM", label: "Touchdowns Per Game", compute: (t, gp) => (gp ? (t.td || 0) / gp : null), format: "pg" },
  ],
  soccer: [
    { abbr: "G/GM", label: "Goals Per Game", compute: (t, gp) => (gp ? (t.g || 0) / gp : null), format: "pg" },
  ],
  hockey: [
    { abbr: "G/GM", label: "Goals Per Game", compute: (t, gp) => (gp ? (t.g || 0) / gp : null), format: "pg" },
  ],
  volleyball: [
    { abbr: "K/GM", label: "Kills Per Game", compute: (t, gp) => (gp ? (t.k || 0) / gp : null), format: "pg" },
  ],
  other: [
    { abbr: "PPG", label: "Points Per Game", compute: (t, gp) => (gp ? (t.pts || 0) / gp : null), format: "pg" },
  ],
};

export function formatDerived(value, format) {
  if (value === null || value === undefined || Number.isNaN(value)) return null;
  if (format === "avg") return value.toFixed(3).replace(/^0/, "");
  return String(Math.round(value * 10) / 10);
}

// ============ THE SCOREKEEPER (live baseball/softball scoring) ============
// Plate-appearance results. field=true → prompt to tap where the ball went.
// out=true → records an out. hit=true → counts as a hit in the stat rollup.
export const AB_RESULTS = [
  { key: "single", label: "Single", short: "1B", field: true, out: false, hit: true, color: "green" },
  { key: "double", label: "Double", short: "2B", field: true, out: false, hit: true, color: "green" },
  { key: "triple", label: "Triple", short: "3B", field: true, out: false, hit: true, color: "green" },
  { key: "hr", label: "Home Run", short: "HR", field: true, out: false, hit: true, color: "green" },
  { key: "walk", label: "Walk", short: "BB", field: false, out: false, hit: false, color: "blue" },
  { key: "hbp", label: "Hit By Pitch", short: "HBP", field: false, out: false, hit: false, color: "blue" },
  { key: "error", label: "On Error", short: "E", field: true, out: false, hit: false, color: "blue" },
  { key: "fielders_choice", label: "Fielder's Choice", short: "FC", field: true, out: true, hit: false, color: "slate" },
  { key: "strikeout", label: "Strikeout", short: "K", field: false, out: true, hit: false, color: "red" },
  { key: "groundout", label: "Groundout", short: "GO", field: true, out: true, hit: false, color: "slate" },
  { key: "flyout", label: "Flyout", short: "FO", field: true, out: true, hit: false, color: "slate" },
  { key: "lineout", label: "Lineout", short: "LO", field: true, out: true, hit: false, color: "slate" },
  { key: "popout", label: "Popout", short: "PO", field: true, out: true, hit: false, color: "slate" },
  { key: "sacrifice", label: "Sacrifice", short: "SAC", field: true, out: true, hit: false, color: "slate" },
];

// Sports that use the baseball-style live Scorekeeper.
export const SCOREKEEPER_SPORTS = ["baseball", "softball"];

// ============ UNIVERSAL SCOREBOARD (clock/period sports) ============
// Sports scored with the generic scoreboard (score + periods + optional clock),
// as opposed to the baseball-style at-bat Scorekeeper above.
export const SCOREBOARD_SPORTS = ["basketball", "soccer", "hockey", "football", "flag_football", "volleyball"];

// Per-sport scoreboard config.
//   periods      : number of regulation periods
//   periodLabel  : what one period is called
//   clockMinutes : minutes on the clock per period (null = untimed, e.g. volleyball sets)
//   increments   : scoring buttons -> { points, label }
//   statKey      : season stat each "us" score credits to a player (null = team-only, no attribution)
//   statMode     : 'sum' adds points to the stat (basketball points); 'unit' adds +1 when points === statUnit
//   statUnit     : the points value that equals one unit of statKey (for statMode 'unit')
export const SCOREBOARD = {
  basketball: {
    periods: 4, periodLabel: "Quarter", clockMinutes: 8,
    increments: [{ points: 1, label: "+1" }, { points: 2, label: "+2" }, { points: 3, label: "+3" }],
    statKey: "pts", statMode: "sum",
  },
  soccer: {
    periods: 2, periodLabel: "Half", clockMinutes: 30,
    increments: [{ points: 1, label: "Goal" }],
    statKey: "g", statMode: "unit", statUnit: 1,
  },
  hockey: {
    periods: 3, periodLabel: "Period", clockMinutes: 15,
    increments: [{ points: 1, label: "Goal" }],
    statKey: "g", statMode: "unit", statUnit: 1,
  },
  football: {
    periods: 4, periodLabel: "Quarter", clockMinutes: 10,
    increments: [{ points: 6, label: "TD" }, { points: 3, label: "FG" }, { points: 1, label: "XP" }, { points: 2, label: "2pt" }],
    statKey: "td", statMode: "unit", statUnit: 6,
  },
  flag_football: {
    periods: 2, periodLabel: "Half", clockMinutes: 20,
    increments: [{ points: 6, label: "TD" }, { points: 1, label: "XP" }, { points: 2, label: "2pt" }],
    statKey: "td", statMode: "unit", statUnit: 6,
  },
  volleyball: {
    periods: 5, periodLabel: "Set", clockMinutes: null,
    increments: [{ points: 1, label: "+1" }],
    statKey: null,
  },
};

export function scoreboardConfig(sport) {
  return SCOREBOARD[sport] || null;
}

// "Q3", "H2", "P1", "Set 4" style short label for the current period.
export function periodShort(sport, period) {
  const c = SCOREBOARD[sport];
  if (!c) return `#${period}`;
  const L = c.periodLabel;
  if (L === "Quarter") return `Q${period}`;
  if (L === "Half") return `H${period}`;
  if (L === "Period") return `P${period}`;
  return `${L} ${period}`;
}

// mm:ss from a number of seconds.
export function formatClock(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds || 0));
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return `${m}:${String(ss).padStart(2, "0")}`;
}

// ============ UNIVERSAL SCOREBOARD (clock/period sports) ============
// Sports scored with the generic scoreboard (score + periods + optional clock),
// as opposed to the baseball-style at-bat Scorekeeper above.
export const SCOREBOARD_SPORTS = ["basketball", "soccer", "hockey", "football", "flag_football", "volleyball"];

// Per-sport scoreboard config.
//   periods      : number of regulation periods
//   periodLabel  : what one period is called
//   clockMinutes : minutes on the clock per period (null = untimed, e.g. volleyball sets)
//   increments   : scoring buttons -> { points, label }
//   statKey      : season stat each "us" score credits to a player (null = team-only, no attribution)
//   statMode     : 'sum' adds points to the stat (basketball points); 'unit' adds +1 when points === statUnit
//   statUnit     : the points value that equals one unit of statKey (for statMode 'unit')
export const SCOREBOARD = {
  basketball: {
    periods: 4, periodLabel: "Quarter", clockMinutes: 8,
    increments: [{ points: 1, label: "+1" }, { points: 2, label: "+2" }, { points: 3, label: "+3" }],
    statKey: "pts", statMode: "sum",
  },
  soccer: {
    periods: 2, periodLabel: "Half", clockMinutes: 30,
    increments: [{ points: 1, label: "Goal" }],
    statKey: "g", statMode: "unit", statUnit: 1,
  },
  hockey: {
    periods: 3, periodLabel: "Period", clockMinutes: 15,
    increments: [{ points: 1, label: "Goal" }],
    statKey: "g", statMode: "unit", statUnit: 1,
  },
  football: {
    periods: 4, periodLabel: "Quarter", clockMinutes: 10,
    increments: [{ points: 6, label: "TD" }, { points: 3, label: "FG" }, { points: 1, label: "XP" }, { points: 2, label: "2pt" }],
    statKey: "td", statMode: "unit", statUnit: 6,
  },
  flag_football: {
    periods: 2, periodLabel: "Half", clockMinutes: 20,
    increments: [{ points: 6, label: "TD" }, { points: 1, label: "XP" }, { points: 2, label: "2pt" }],
    statKey: "td", statMode: "unit", statUnit: 6,
  },
  volleyball: {
    periods: 5, periodLabel: "Set", clockMinutes: null,
    increments: [{ points: 1, label: "+1" }],
    statKey: null,
  },
};

export function scoreboardConfig(sport) {
  return SCOREBOARD[sport] || null;
}

// "Q3", "H2", "P1", "Set 4" style short label for the current period.
export function periodShort(sport, period) {
  const c = SCOREBOARD[sport];
  if (!c) return `#${period}`;
  const L = c.periodLabel;
  if (L === "Quarter") return `Q${period}`;
  if (L === "Half") return `H${period}`;
  if (L === "Period") return `P${period}`;
  return `${L} ${period}`;
}

// mm:ss from a number of seconds.
export function formatClock(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds || 0));
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return `${m}:${String(ss).padStart(2, "0")}`;
}

export const HIT_TYPES = [
  { key: "grounder", label: "Grounder" },
  { key: "line_drive", label: "Line drive" },
  { key: "fly", label: "Fly ball" },
  { key: "popup", label: "Pop up" },
];

// Build the "W 7-3" style result string from the final live score (our-opp).
export function gameResultString(our, opp) {
  const wlt = our > opp ? "W" : our < opp ? "L" : "T";
  return `${wlt} ${our}-${opp}`;
}
