-- Advisor-scan tightening 2026-07-06: remove default EXECUTE grants that were never needed.
-- rollup_* are only called by authenticated coach screens; add_owner_membership is a
-- trigger function on public.teams and needs no direct API execute at all.

revoke execute on function public.add_owner_membership() from anon, authenticated;
revoke execute on function public.rollup_game_stats(uuid) from anon;
revoke execute on function public.rollup_scoreboard_stats(uuid) from anon;
