// PURE: turns AI Coach use-log rows into the numbers the admin page shows.
// No server or browser imports, so it can be tested on its own.

export const AI_TOOL_KINDS = ["briefing", "practice", "lineup", "chat"];
export const AI_VIEW_KINDS = ["hub_view", "locked_view"];
export const AI_USE_KINDS = [...AI_TOOL_KINDS, ...AI_VIEW_KINDS];

export const AI_TOOL_LABELS = {
  briefing: "Coach's briefing",
  practice: "Practice planner",
  lineup: "Lineup advisor",
  chat: "Coach chat",
};

const DAY_MS = 86_400_000;

/**
 * @param events  rows { team_id, user_id, kind, created_at }
 * @param teams   rows { id, coach_id, name } (every team)
 * @param coaches rows { id, email, excluded } (every coach; excluded = owner/test account)
 * @returns numbers for real coaches only. A row is left out when the person
 *          who did it, or the team's owner, is an excluded account.
 */
export function summarizeAiUse(events = [], teams = [], coaches = [], now = new Date()) {
  const coachById = new Map(coaches.map((c) => [c.id, c]));
  const teamById = new Map(teams.map((t) => [t.id, t]));
  const isExcluded = (id) => !!coachById.get(id)?.excluded;
  const since7 = now.getTime() - 7 * DAY_MS;

  const realTeams = teams.filter((t) => !isExcluded(t.coach_id));
  const rows = [];
  for (const e of events) {
    if (!AI_USE_KINDS.includes(e.kind)) continue;
    const team = teamById.get(e.team_id);
    if (!team) continue; // team gone, or not in the directory
    if (isExcluded(team.coach_id) || (e.user_id && isExcluded(e.user_id))) continue;
    const at = new Date(e.created_at).getTime();
    if (Number.isNaN(at)) continue;
    rows.push({ ...e, at, team });
  }

  const tools = AI_TOOL_KINDS.map((kind) => {
    const mine = rows.filter((r) => r.kind === kind);
    const recent = mine.filter((r) => r.at >= since7);
    return {
      kind,
      label: AI_TOOL_LABELS[kind],
      d7: recent.length,
      all: mine.length,
      teams7: new Set(recent.map((r) => r.team_id)).size,
      teamsAll: new Set(mine.map((r) => r.team_id)).size,
    };
  });

  // Reach: a team "opened" the AI Coach if anything at all was logged for it;
  // it "used" it if a tool returned a result; "locked" if a coach saw the
  // locked card.
  const reach = (list) => {
    const opened = new Set(list.map((r) => r.team_id));
    const used = new Set(list.filter((r) => AI_TOOL_KINDS.includes(r.kind)).map((r) => r.team_id));
    const locked = new Set(list.filter((r) => r.kind === "locked_view").map((r) => r.team_id));
    const openedOnly = [...opened].filter((id) => !used.has(id) && !locked.has(id));
    return { opened: opened.size, used: used.size, openedNoUse: openedOnly.length, locked: locked.size };
  };

  const byTeamMap = new Map();
  for (const r of rows) {
    let t = byTeamMap.get(r.team_id);
    if (!t) {
      t = {
        teamId: r.team_id,
        name: r.team.name || "(unnamed team)",
        coachEmail: coachById.get(r.team.coach_id)?.email || "",
        briefing: 0, practice: 0, lineup: 0, chat: 0,
        lastOpenedAt: null, lastLockedAt: null, lastUseAt: null, lastAt: 0,
      };
      byTeamMap.set(r.team_id, t);
    }
    const iso = new Date(r.at).toISOString();
    if (AI_TOOL_KINDS.includes(r.kind)) {
      t[r.kind] += 1;
      if (!t.lastUseAt || iso > t.lastUseAt) t.lastUseAt = iso;
    } else if (r.kind === "hub_view") {
      if (!t.lastOpenedAt || iso > t.lastOpenedAt) t.lastOpenedAt = iso;
    } else if (r.kind === "locked_view") {
      if (!t.lastLockedAt || iso > t.lastLockedAt) t.lastLockedAt = iso;
    }
    if (r.at > t.lastAt) t.lastAt = r.at;
  }
  const byTeam = [...byTeamMap.values()]
    .sort((a, b) => b.lastAt - a.lastAt)
    .map(({ lastAt, ...rest }) => ({ ...rest, lastAt: new Date(lastAt).toISOString() }));

  const firstAt = rows.length ? new Date(Math.min(...rows.map((r) => r.at))).toISOString() : null;

  return {
    realTeams: realTeams.length,
    since: firstAt,
    tools,
    reach7: reach(rows.filter((r) => r.at >= since7)),
    reachAll: reach(rows),
    byTeam,
  };
}
