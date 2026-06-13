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

export function inviteMessage(team) {
  return `Join our team site! https://my-teamsports.com/team/${team.slug} — Passcode: ${team.passcode}`;
}
