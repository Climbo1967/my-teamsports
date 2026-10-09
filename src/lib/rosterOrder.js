// Next sort_order for a new player: one past the current last. A single add
// used to leave sort_order at the default 0, so the new player jumped to the
// top of the roster the first time the coach reordered anyone.
export async function nextSortOrder(supabase, teamId) {
  const { data } = await supabase
    .from("players")
    .select("sort_order")
    .eq("team_id", teamId)
    .order("sort_order", { ascending: false })
    .limit(1);
  const last = data?.[0]?.sort_order;
  return Number.isFinite(last) ? last + 1 : 0;
}
