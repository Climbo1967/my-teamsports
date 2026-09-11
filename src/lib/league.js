// Public league site data + formatting helpers.
//
// Public pages are ISR-cached and must not touch cookies, so they use a plain
// anon supabase-js client (not the @supabase/ssr cookie client). All reads go
// through SECURITY DEFINER RPCs — leagues/schools/divisions/league_games have
// no anon RLS policies on purpose (design v1 §2).

import { cache } from "react";
import { createClient } from "@supabase/supabase-js";

function anonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

/** get_league_site(slug) → { league, seasons, divisions, schools, teams, games, standings } or null. */
export const fetchLeagueSite = cache(async (slug) => {
  const supabase = anonClient();
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("get_league_site", { p_slug: String(slug).toLowerCase() });
  if (error || !data) return null;
  return indexSite(data);
});

/** list_public_leagues() → [{ slug, name, short_name, updated_at }] (sitemap). */
export async function fetchPublicLeagues() {
  const supabase = anonClient();
  if (!supabase) return [];
  const { data } = await supabase.rpc("list_public_leagues");
  return data || [];
}

/** Attach lookup maps so pages don't each re-derive them. */
function indexSite(site) {
  const teamsById = Object.fromEntries((site.teams || []).map((t) => [t.id, t]));
  const schoolsById = Object.fromEntries((site.schools || []).map((s) => [s.id, s]));
  const divisionsById = Object.fromEntries((site.divisions || []).map((d) => [d.id, d]));
  const seasonsById = Object.fromEntries((site.seasons || []).map((s) => [s.id, s]));
  const currentSeasons = (site.seasons || []).filter((s) => s.is_current);
  return { ...site, teamsById, schoolsById, divisionsById, seasonsById, currentSeasons };
}
