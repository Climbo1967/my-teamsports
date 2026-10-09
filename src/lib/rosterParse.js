// Roster paste parser shared by the Roster page and the first-run wizard.
// One player per line. Forgiving on purpose: a coach pastes whatever their
// league handed them (spreadsheet columns, "Last, First", numbers front or
// back). Returns { name, jersey_number, position } or null for a blank line.
// One player per line. Forgiving parser: a leading or trailing number becomes
// the jersey, anything after a comma becomes the position, the rest is the name.
//   "#7 Cody Sharp, QB"  ->  Cody Sharp / 7 / QB
//   "Maya Torres 12"     ->  Maya Torres / 12
//   "Owen Blake"         ->  Owen Blake
//   "Smith, John"        ->  John Smith          (Last, First from a spreadsheet)
//   "Smith, John, SS 4"  ->  John Smith / 4 / SS
// A tab-separated paste (straight from a spreadsheet) is treated like commas.
export function parsePlayerLine(line) {
  let rest = line.replace(/\t+/g, ", ").trim();
  if (!rest) return null;
  const parts = rest.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return null;

  // "Last, First": the first part is one word with no digits and the second
  // part starts with a capitalized word (not an all-caps position like SS
  // or QB). Rejoin as "First Last"; anything after is the position.
  const lastFirst = parts.length >= 2
    && /^[A-Za-z'\-]+$/.test(parts[0])
    && /^[A-Z][A-Za-z'\-]*[a-z][A-Za-z'\-]*(\s|$)/.test(parts[1]);
  let position = null;
  let jersey = null;
  if (lastFirst) {
    let first = parts[1];
    // "Smith, John 12": the number rides on the first name.
    const jm = first.match(/^(.+?)[\s]+#?(\d{1,3})$/);
    if (jm) { first = jm[1].trim(); jersey = jm[2]; }
    rest = `${first} ${parts[0]}`;
    position = parts.slice(2).join(", ") || null;
  } else if (parts.length >= 2 && /^#?\d{1,3}$/.test(parts[0])) {
    // "12, John Smith, C" (number column first).
    jersey = parts[0].replace(/^#/, "");
    rest = parts[1];
    position = parts.slice(2).join(", ") || null;
  } else if (parts.length >= 2 && /^#?\d{1,3}$/.test(parts[1])) {
    // "John Smith, 12, Pitcher": the number is its own column.
    rest = parts[0];
    jersey = parts[1].replace(/^#/, "");
    position = parts.slice(2).join(", ") || null;
  } else {
    rest = parts[0];
    position = parts.slice(1).join(", ") || null;
  }

  // "John Smith - 12": a dash before the number.
  if (!jersey) {
    const dm = rest.match(/^(.+?)\s*[-\u2013]\s*#?(\d{1,3})$/);
    if (dm) { rest = dm[1].trim(); jersey = dm[2]; }
  }

  let m = jersey ? null : rest.match(/^#?(\d{1,3})[\s.\-]+(.+)$/);
  if (m) { jersey = m[1]; rest = m[2].trim(); }
  else if (!jersey) {
    m = rest.match(/^(.+?)[\s]+#?(\d{1,3})$/);
    if (m) { rest = m[1].trim(); jersey = m[2]; }
  }
  // "Smith, John, SS 4": the number rides on the position.
  if (!jersey && position) {
    m = position.match(/^(.*?)[\s]*#?(\d{1,3})$/);
    if (m && !/\d/.test(m[1])) { position = m[1].trim() || null; jersey = m[2]; }
  }
  if (!rest) return null;
  return { name: rest.slice(0, 60), jersey_number: jersey, position: position ? position.slice(0, 30) : null };
}

/** Parse a whole pasted block; blank lines are dropped. */
export function parseRosterText(text) {
  return String(text || "").split(/\r?\n/).map(parsePlayerLine).filter(Boolean);
}
