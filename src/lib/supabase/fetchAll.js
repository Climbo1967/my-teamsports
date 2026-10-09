// PostgREST returns at most 1,000 rows per request and says nothing when it
// truncates. Season-long tables (stats: one row per game × player × key;
// at_bats: ~36 per game) pass that mid-season, and every whole-season read
// (AI coach, scouting, lineup suggestions) silently went wrong from there.
//
// `build()` returns a fresh query (a builder cannot be awaited twice); the
// helper adds a stable order and pages through until a short page comes back.
// Works with the browser and server clients alike.
export async function fetchAll(build, { page = 1000, order = "id" } = {}) {
  const rows = [];
  for (let from = 0; ; from += page) {
    const { data, error } = await build().order(order, { ascending: true }).range(from, from + page - 1);
    if (error) return { data: rows, error };
    rows.push(...(data || []));
    if (!data || data.length < page) break;
  }
  return { data: rows, error: null };
}
