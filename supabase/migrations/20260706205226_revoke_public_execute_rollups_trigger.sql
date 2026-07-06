-- Follow-up to revoke_default_function_grants: the default EXECUTE comes from PUBLIC,
-- so revoke there and grant back only the roles that actually call these.

-- Trigger function: nobody needs direct API execute (trigger fires regardless).
revoke execute on function public.add_owner_membership() from public;

-- Rollups: coach dashboards (authenticated) + server admin (service_role) only.
revoke execute on function public.rollup_game_stats(uuid) from public;
revoke execute on function public.rollup_scoreboard_stats(uuid) from public;
grant execute on function public.rollup_game_stats(uuid) to authenticated, service_role;
grant execute on function public.rollup_scoreboard_stats(uuid) to authenticated, service_role;
