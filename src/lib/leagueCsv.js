// CSV parsing + normalization for the league schedule importer. Pure, no deps.
// Accepts the spreadsheet a migrating league actually has: any column order,
// friendly headers, US dates, 12h or 24h times. Output rows feed the
// league_import_games RPC: { import_key, division, home, away, starts_local, location }.

/** Minimal RFC-4180 parser: quotes, escaped quotes, CRLF. Returns array of arrays. */
export function parseCsv(text) {
  const rows = [];
  let row = [], field = "", inQ = false;
  const src = String(text || "").replace(/^﻿/, "");
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQ) {
      if (c === '"') {
        if (src[i + 1] === '"') { field += '"'; i++; } else inQ = false;
      } else field += c;
    } else if (c === '"') inQ = true;
    else if (c === "," || c === "\t") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && src[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.some((f) => f.trim() !== "")) rows.push(row);
      row = [];
    } else field += c;
  }
  row.push(field);
  if (row.some((f) => f.trim() !== "")) rows.push(row);
  return rows;
}

const HEADER_ALIASES = {
  date: ["date", "game date", "day"],
  time: ["time", "start", "start time", "tip", "tipoff", "tip-off"],
  datetime: ["datetime", "date time", "start datetime", "starts_at", "starts at"],
  division: ["division", "div", "league", "bracket", "level", "class"],
  home: ["home", "home team", "host"],
  away: ["away", "away team", "visitor", "visitors", "visiting", "guest"],
  location: ["location", "venue", "site", "gym", "field", "court", "facility"],
  import_key: ["import_key", "key", "game id", "id", "game #", "game number", "#"],
};

function norm(h) { return String(h || "").trim().toLowerCase().replace(/[_\s]+/g, " "); }

/** Map header row → { field: columnIndex }. Unmatched fields are absent. */
export function detectColumns(headerRow) {
  const map = {};
  headerRow.forEach((h, idx) => {
    const n = norm(h);
    for (const [field, aliases] of Object.entries(HEADER_ALIASES)) {
      if (map[field] === undefined && aliases.includes(n)) map[field] = idx;
    }
  });
  return map;
}

const MONTHS = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12 };

/** "11/3/2026", "2026-11-03", "Nov 3, 2026", "11/3" (year from fallback) → "YYYY-MM-DD" or null. */
export function normalizeDate(s, fallbackYear) {
  const t = String(s || "").trim();
  if (!t) return null;
  let m;
  if ((m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(t))) return ymd(m[1], m[2], m[3]);
  if ((m = /^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})$/.exec(t))) {
    const y = m[3].length === 2 ? `20${m[3]}` : m[3];
    return ymd(y, m[1], m[2]);
  }
  if ((m = /^(\d{1,2})[\/.-](\d{1,2})$/.exec(t)) && fallbackYear) return ymd(fallbackYear, m[1], m[2]);
  if ((m = /^(?:[a-z]+,?\s+)?([a-z]{3,9})\.?\s+(\d{1,2})(?:,?\s+(\d{4}))?$/i.exec(t))) {
    const mo = MONTHS[m[1].slice(0, 4).toLowerCase()] ?? MONTHS[m[1].slice(0, 3).toLowerCase()];
    if (mo) return ymd(m[3] || fallbackYear, mo, m[2]);
  }
  if ((m = /^(\d{1,2})\s+([a-z]{3,9})\.?(?:,?\s+(\d{4}))?$/i.exec(t))) {
    const mo = MONTHS[m[2].slice(0, 3).toLowerCase()];
    if (mo) return ymd(m[3] || fallbackYear, mo, m[1]);
  }
  return null;
}

function ymd(y, m, d) {
  const yy = Number(y), mm = Number(m), dd = Number(d);
  if (!yy || mm < 1 || mm > 12 || dd < 1 || dd > 31) return null;
  return `${yy}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
}

/** "6:00 PM", "6pm", "18:00", "6:30" (assumed PM for 1–6 if no meridiem? no — ambiguous stays as typed) → "HH:MM" or null. */
export function normalizeTime(s, defaultTime = "18:00") {
  const t = String(s || "").trim().toLowerCase().replace(/\s+/g, "");
  if (!t) return defaultTime;
  if (t === "tbd" || t === "tba") return defaultTime;
  const m = /^(\d{1,2})(?::(\d{2}))?(?::\d{2})?(am|pm|a|p)?$/.exec(t);
  if (!m) return null;
  let h = Number(m[1]);
  const min = m[2] ? Number(m[2]) : 0;
  const mer = m[3];
  if (mer) {
    if (h === 12) h = mer.startsWith("a") ? 0 : 12;
    else if (mer.startsWith("p")) h += 12;
  }
  if (h > 23 || min > 59) return null;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

/**
 * Turn parsed CSV into importer rows. Returns { rows, columns, problems }.
 * `problems` are client-side parse issues (bad date etc.), reported by row.
 */
export function buildImportRows(csvRows, { fallbackYear } = {}) {
  if (!csvRows.length) return { rows: [], columns: {}, problems: ["No rows found."] };
  const columns = detectColumns(csvRows[0]);
  const problems = [];
  const need = ["division", "home", "away"];
  const missing = need.filter((f) => columns[f] === undefined);
  if (columns.date === undefined && columns.datetime === undefined) missing.push("date");
  if (missing.length) {
    return { rows: [], columns, problems: [`Missing column(s): ${missing.join(", ")}. Headers seen: ${csvRows[0].join(" | ")}`] };
  }
  const rows = [];
  for (let i = 1; i < csvRows.length; i++) {
    const r = csvRows[i];
    const get = (f) => (columns[f] === undefined ? "" : String(r[columns[f]] ?? "").trim());
    let date = null, time = null;
    if (columns.datetime !== undefined && get("datetime")) {
      const parts = get("datetime").split(/\s+/);
      date = normalizeDate(parts[0], fallbackYear);
      time = normalizeTime(parts.slice(1).join(""), "18:00");
    } else {
      date = normalizeDate(get("date"), fallbackYear);
      time = normalizeTime(get("time"), "18:00");
    }
    if (!date) { problems.push(`Row ${i + 1}: can't read date "${get("date") || get("datetime")}"`); continue; }
    if (!time) { problems.push(`Row ${i + 1}: can't read time "${get("time")}"`); continue; }
    rows.push({
      row: i + 1,
      import_key: get("import_key") || null,
      division: get("division"),
      home: get("home"),
      away: get("away"),
      starts_local: `${date} ${time}`,
      location: get("location") || null,
    });
  }
  return { rows, columns, problems };
}

export const SAMPLE_CSV = `Date,Time,Division,Home,Away,Location
11/3/2026,6:00 PM,Varsity Boys,Oakridge,Riverbend,Oakridge Gym
11/3/2026,7:30 PM,Varsity Girls,Oakridge,Riverbend,Oakridge Gym
11/6/2026,6:00 PM,Varsity Boys,Summit,Westlake,Summit Gym`;
