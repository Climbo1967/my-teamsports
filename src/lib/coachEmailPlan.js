// Coach email planning — PURE functions only (no network, no database, no
// environment). Everything here takes plain data and returns plain data, so the
// rules for "who gets which email, and what it says" can be tested directly.
//
// Used by: the daily job (/api/cron/coach-emails), the welcome on email confirm,
// the admin panel's Email Coaches card, and that card's server route.
import { fmtUsd, passOffer, priceFor } from "./pricing.js";

export const SITE_URL = "https://my-teamsports.com";

// All "days" below are calendar days in Central time, so "3 days before" means
// what a person means by it regardless of the hour the daily job runs.
export const REMIND_DAYS = 3;          // send "trial ending" when the end date is 3 days away or less
export const BUNDLE_DAYS = 7;          // ...and mention anything else ending within 7, in the same email
export const ENDED_LOOKBACK_DAYS = 3;  // "trial ended" covers the last 3 days (survives a missed run)
export const WELCOME_LOOKBACK_DAYS = 7; // safety-net welcome for confirms the sign-up hook missed

const DAY_MS = 86_400_000;
const DISPLAY_TZ = "America/Chicago";

// ---------- names, dates, fill-ins ----------

const cap = (w) => (w === w.toUpperCase() || w === w.toLowerCase() ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w);

// How we greet a coach. Uses what they typed, tidied:
//   "RANDY" -> "Randy", "jeff" -> "Jeff", "Rigel DuBrul" -> "Rigel",
//   "Coach Chris" -> "Coach Chris", "Coach Boyd" -> "Coach Boyd" (the word after
//   "Coach" is often a surname, so the title stays), "RS" / "" -> "Coach".
export function coachGreetingName(fullName) {
  const words = String(fullName || "").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "Coach";
  if (/^coach$/i.test(words[0])) {
    return words[1] && words[1].length > 1 ? `Coach ${cap(words[1])}` : "Coach";
  }
  if (words[0].length < 3) return "Coach";
  return cap(words[0]);
}

// "Friday, October 16" — in Central time, where the business runs.
export function formatDay(value) {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", { timeZone: DISPLAY_TZ, weekday: "long", month: "long", day: "numeric" }).format(d);
}

// Calendar-day number in Central time (days since 1970-01-01), for day arithmetic.
const CT_PARTS = new Intl.DateTimeFormat("en-CA", { timeZone: DISPLAY_TZ, year: "numeric", month: "2-digit", day: "2-digit" });
export function centralDay(value) {
  const [y, m, d] = CT_PARTS.format(value instanceof Date ? value : new Date(value)).split("-").map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / DAY_MS);
}

// Stable day key for an end date, used in dedupe keys (so moving a date later
// produces a fresh reminder for the new date).
const dayKey = (value) => new Date(value).toISOString().slice(0, 10);

function joinNames(names) {
  const list = [...new Set(names.filter(Boolean))];
  if (list.length <= 1) return list[0] || "your team";
  if (list.length === 2) return `${list[0]} and ${list[1]}`;
  return `${list.slice(0, -1).join(", ")} and ${list[list.length - 1]}`;
}

// The team we mean when a message says "{team}": the one with the most players,
// oldest first on a tie.
export function primaryTeam(teams) {
  return [...(teams || [])].sort(
    (a, b) => (Number(b.players) || 0) - (Number(a.players) || 0) || new Date(a.created_at) - new Date(b.created_at)
  )[0] || null;
}

export const FILL_INS = [
  { token: "{first_name}", label: "First name", fallback: "Coach" },
  { token: "{team}", label: "Team name", fallback: "your team" },
  { token: "{trial_end}", label: "Free trial end date", fallback: "the end of your free trial" },
  { token: "{ai_trial_end}", label: "AI Coach trial end date", fallback: "the end of your AI Coach trial" },
];

// Per-coach values for the admin panel's fill-ins. `missing` lists the tokens
// that fell back to generic wording for this coach.
export function coachFillIns(coach, ownedTeams, now = new Date()) {
  const today = now.toISOString().slice(0, 10);
  const team = primaryTeam(ownedTeams);
  const missing = [];
  const first = coachGreetingName(coach?.full_name);
  let teamName = team?.name;
  if (!teamName) { teamName = "your team"; missing.push("{team}"); }
  let trialEnd = "";
  if (team && team.trial_ends_at && !(team.paid_through && team.paid_through >= today)) trialEnd = formatDay(team.trial_ends_at);
  if (!trialEnd) { trialEnd = "the end of your free trial"; missing.push("{trial_end}"); }
  const aiSource = team?.ai_trial_ends_at || coach?.ai_trial_ends_at;
  let aiEnd = aiSource ? formatDay(aiSource) : "";
  if (!aiEnd) { aiEnd = "the end of your AI Coach trial"; missing.push("{ai_trial_end}"); }
  return {
    greeting: first,
    values: { "{first_name}": first, "{team}": teamName, "{trial_end}": trialEnd, "{ai_trial_end}": aiEnd },
    missing,
  };
}

export function fillTemplate(text, values) {
  let out = String(text || "");
  for (const [token, value] of Object.entries(values || {})) out = out.split(token).join(value);
  return out;
}

export function tokensUsed(text) {
  return FILL_INS.map((f) => f.token).filter((t) => String(text || "").includes(t));
}

// ---------- unsubscribe ----------

export function unsubscribeLinks(token) {
  return {
    page: `${SITE_URL}/unsubscribe?c=${token}`,
    oneClick: `${SITE_URL}/api/coach-unsubscribe?c=${token}`,
  };
}

export function unsubscribeHeaders(token) {
  return {
    "List-Unsubscribe": `<${unsubscribeLinks(token).oneClick}>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  };
}

// ---------- the three automatic emails ----------

const SIGNATURE = "Ron Blankenship\nFounder, My-Team Sports";

export function welcomeEmail(coach) {
  const name = coachGreetingName(coach?.full_name);
  const subject = name === "Coach" ? "Welcome to My-Team Sports" : `Welcome to My-Team Sports, ${name}`;
  const body = [
    `Hi ${name},`,
    "I'm Ron, the founder of My-Team Sports. Thanks for signing up.",
    "Your first 30 days are free, with everything included: the team site parents open with a passcode, the schedule, the scorekeeper, the play board and the AI Assistant Coach. No card needed.",
    `The fastest way to see what it does is to create your team. It takes about two minutes:\n${SITE_URL}/dashboard`,
    "If you get stuck, or something doesn't work the way you expect, reply to this email. It comes straight to me and I read every one.",
    SIGNATURE,
  ].join("\n\n");
  return { subject, heading: "Welcome to My-Team Sports", body };
}

function billingLink(events) {
  const ids = [...new Set(events.flatMap((e) => e.team_ids))];
  return ids.length === 1 ? `${SITE_URL}/dashboard/teams/${ids[0]}/billing` : `${SITE_URL}/dashboard`;
}

function priceLines(now) {
  const offer = passOffer(now);
  const year = offer.priceYear;
  const date = new Date(`${offer.endDate}T12:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
  // From October 1 a pass also covers the whole next year; say so, it is the
  // reason to buy now rather than wait for January.
  const through = offer.lateYear ? `${date} (the rest of ${offer.priceYear} and all of ${offer.passYear})` : date;
  return { year, through, season: fmtUsd(priceFor("season", year)), ai: fmtUsd(priceFor("ai", year)) };
}

// events: [{ type: "season" | "ai", team_ids, team_names, ends_at }]
export function trialEndingEmail(coach, events, now = new Date()) {
  const name = coachGreetingName(coach?.full_name);
  const season = events.filter((e) => e.type === "season").sort((a, b) => new Date(a.ends_at) - new Date(b.ends_at));
  const ai = events.find((e) => e.type === "ai") || null;
  const p = priceLines(now);
  const link = billingLink(events);
  const multi = new Set(events.flatMap((e) => e.team_ids)).size > 1;
  const where = multi ? "Open each team's Billing tab from your dashboard" : "You can add either one on your team's Billing page";
  const paras = [`Hi ${name},`];

  if (season.length > 0) {
    // Group teams that end the same day into one sentence.
    const byDay = new Map();
    for (const e of season) {
      const k = formatDay(e.ends_at);
      byDay.set(k, [...(byDay.get(k) || []), ...e.team_names]);
    }
    const sentences = [...byDay.entries()].map(([day, names]) => `The free trial for ${joinNames(names)} ends ${day}.`);
    let lead = `Ron here from My-Team Sports. ${sentences.join(" ")}`;
    if (ai) {
      lead += byDay.has(formatDay(ai.ends_at))
        ? " That includes the AI Assistant Coach."
        : ` The AI Assistant Coach free trial ends ${formatDay(ai.ends_at)}.`;
    }
    paras.push(lead);
    paras.push(
      `To keep going, the Season Pass is ${p.season} and covers you through ${p.through}. It is one payment, not a subscription. The AI Assistant Coach is an optional ${p.ai} add-on. ${where}:\n${link}`
    );
    paras.push("If you don't, nothing is deleted. Your team site stays live for parents, and the coach dashboard locks until you add the Season Pass.");
    paras.push("If it isn't working for you, reply and tell me why. I read every one.");
    paras.push(SIGNATURE);
    return { subject: `Your free trial ends ${formatDay(season[0].ends_at)}`, heading: "Your free trial is ending", body: paras.join("\n\n") };
  }

  // AI only
  paras.push(
    `Ron here from My-Team Sports. Your free trial of the AI Assistant Coach ends ${formatDay(ai.ends_at)}. Everything else on ${joinNames(ai.team_names)} keeps working as it does today.`
  );
  paras.push(
    `To keep the AI Coach, it is a ${p.ai} add-on that covers you through ${p.through}. It is one payment, not a subscription. ${multi ? "Open each team's Billing tab from your dashboard" : "You can add it on your team's Billing page"}:\n${link}`
  );
  paras.push("If it hasn't been useful, reply and tell me why. I read every one.");
  paras.push(SIGNATURE);
  return { subject: `Your AI Coach free trial ends ${formatDay(ai.ends_at)}`, heading: "Your AI Coach trial is ending", body: paras.join("\n\n") };
}

export function trialEndedEmail(coach, events, now = new Date()) {
  const name = coachGreetingName(coach?.full_name);
  const season = events.filter((e) => e.type === "season");
  const ai = events.find((e) => e.type === "ai") || null;
  const p = priceLines(now);
  const link = billingLink(events);
  const multi = new Set(events.flatMap((e) => e.team_ids)).size > 1;
  const paras = [`Hi ${name},`];

  if (season.length > 0) {
    const names = joinNames(season.flatMap((e) => e.team_names));
    paras.push(`Ron here from My-Team Sports. The free trial for ${names} has ended${ai ? ", and the AI Assistant Coach trial with it" : ""}.`);
    paras.push("Nothing was deleted, and your team site is still live for parents. The coach dashboard is locked until you add the Season Pass.");
    paras.push(
      `The Season Pass is ${p.season} and covers you through ${p.through}. It is one payment, not a subscription. The AI Assistant Coach is an optional ${p.ai} add-on. ${multi ? "Open each team's Billing tab from your dashboard" : "You can add either one on your team's Billing page"}:\n${link}`
    );
    paras.push("If you decided it's not for you, I'd like to know why. A one-line reply is plenty.");
    paras.push(SIGNATURE);
    return { subject: "Your free trial has ended", heading: "Your free trial has ended", body: paras.join("\n\n") };
  }

  // AI only
  paras.push(`Ron here from My-Team Sports. Your free trial of the AI Assistant Coach has ended. The rest of ${joinNames(ai.team_names)} works as before.`);
  paras.push(
    `To turn the AI Coach back on, it is a ${p.ai} add-on that covers you through ${p.through}. It is one payment, not a subscription. ${multi ? "Open each team's Billing tab from your dashboard" : "You can add it on your team's Billing page"}:\n${link}`
  );
  paras.push("If it wasn't useful, I'd like to know why. A one-line reply is plenty.");
  paras.push(SIGNATURE);
  return { subject: "Your AI Coach free trial has ended", heading: "Your AI Coach trial has ended", body: paras.join("\n\n") };
}

// ---------- who gets what, today ----------

// A coach's open trial "events": each unpaid team's Season Pass trial, and the
// AI trial (one per distinct end date) on teams that are neither AI-paid nor
// comped. An AI trial only counts while that team's dashboard is still open
// around the AI end date — a locked dashboard already hides the AI Coach.
export function coachTrialEvents(ownedTeams, now = new Date()) {
  const today = now.toISOString().slice(0, 10);
  const events = [];
  const aiByDay = new Map();
  for (const t of ownedTeams || []) {
    if (t.league_id) continue; // league teams are covered by their league/school plan
    const seasonPaid = !!(t.paid_through && t.paid_through >= today);
    if (!seasonPaid && t.trial_ends_at) {
      events.push({ type: "season", key: `season:${t.id}:${dayKey(t.trial_ends_at)}`, team_ids: [t.id], team_names: [t.name], ends_at: t.trial_ends_at });
    }
    const aiPaid = !!(t.ai_paid_through && t.ai_paid_through >= today);
    if (!aiPaid && !t.ai_enabled && t.ai_trial_ends_at) {
      const aiEnd = new Date(t.ai_trial_ends_at).getTime();
      const dashboardOpenThen = seasonPaid || (t.trial_ends_at && new Date(t.trial_ends_at).getTime() >= aiEnd - DAY_MS);
      if (dashboardOpenThen) {
        const k = dayKey(t.ai_trial_ends_at);
        const cur = aiByDay.get(k) || { type: "ai", key: `ai:${k}`, team_ids: [], team_names: [], ends_at: t.ai_trial_ends_at };
        cur.team_ids.push(t.id);
        cur.team_names.push(t.name);
        aiByDay.set(k, cur);
      }
    }
  }
  return [...events, ...aiByDay.values()];
}

// snapshot = the coach_email_snapshot() RPC result. Returns the emails to send
// right now: [{ kind, coach, keys, events, subject, heading, body }].
export function planLifecycle(snapshot, { now = new Date() } = {}) {
  const nowMs = now.getTime();
  const sent = new Set((snapshot?.sent_keys || []).map((k) => `${k.coach_id}|${k.key}`));
  const teamsByCoach = new Map();
  for (const t of snapshot?.teams || []) {
    teamsByCoach.set(t.coach_id, [...(teamsByCoach.get(t.coach_id) || []), t]);
  }
  const plan = [];

  for (const coach of snapshot?.coaches || []) {
    if (!coach.email || !coach.confirmed || coach.excluded || coach.opt_out || !coach.unsub_token) continue;
    const has = (key) => sent.has(`${coach.id}|${key}`);

    // Welcome safety net: confirmed recently, never welcomed.
    if (!has("welcome") && nowMs - new Date(coach.created_at).getTime() <= WELCOME_LOOKBACK_DAYS * DAY_MS) {
      plan.push({ kind: "welcome", coach, keys: ["welcome"], events: [], ...welcomeEmail(coach) });
    }

    const events = coachTrialEvents(teamsByCoach.get(coach.id) || [], now);
    if (events.length === 0) continue;
    const endsIn = (e) => new Date(e.ends_at).getTime() - nowMs;
    const today = centralDay(now);
    const daysAway = (e) => centralDay(e.ends_at) - today;

    // Trial ending: triggered by anything ending within REMIND_DAYS; the email
    // then also covers anything else ending within BUNDLE_DAYS.
    const upcoming = events.filter((e) => endsIn(e) > 0 && daysAway(e) <= BUNDLE_DAYS && !has(`trial_ending:${e.key}`));
    if (upcoming.some((e) => daysAway(e) <= REMIND_DAYS)) {
      plan.push({ kind: "trial_ending", coach, keys: upcoming.map((e) => `trial_ending:${e.key}`), events: upcoming, ...trialEndingEmail(coach, upcoming, now) });
    }

    // Trial ended: anything that ended in the last ENDED_LOOKBACK_DAYS.
    // An AI trial that ended while the same team's own trial is about to end
    // (within 36 hours) waits a day, so the coach gets one note for both.
    const seasonEndingSoon = (teamIds) =>
      events.some((s) => s.type === "season" && s.team_ids.some((t) => teamIds.includes(t)) && endsIn(s) > 0 && endsIn(s) <= 1.5 * DAY_MS);
    const ended = events.filter(
      (e) => endsIn(e) <= 0 && -daysAway(e) <= ENDED_LOOKBACK_DAYS && !has(`trial_ended:${e.key}`) && !(e.type === "ai" && seasonEndingSoon(e.team_ids))
    );
    if (ended.length > 0) {
      plan.push({ kind: "trial_ended", coach, keys: ended.map((e) => `trial_ended:${e.key}`), events: ended, ...trialEndedEmail(coach, ended, now) });
    }
  }
  return plan;
}

// Plain-text and footer wording shared by every coach email.
export function coachEmailFooter(token) {
  return `My-Team Sports · my-teamsports.com\nUnsubscribe from these emails: ${unsubscribeLinks(token).page}`;
}
