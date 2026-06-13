export const SPORT_EMOJI = {
  baseball: "⚾",
  football: "🏈",
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
