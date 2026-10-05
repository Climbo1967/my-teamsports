-- Bug sweep 2026-10-03, smaller item: the league console showed every team's
-- parent passcode to all league roles. get_league_admin() now returns the
-- passcode only to a commissioner (or a site admin); schedulers and scorers
-- get null and the console hides the column. Ron said go 2026-10-05.
--
-- Same body as before otherwise. Safe to run more than once.

create or replace function public.get_league_admin(p_league_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path to 'public'
as $function$
declare
  v_out jsonb;
  v_role text;
  v_show_passcode boolean;
begin
  perform public.league_require(p_league_id, 'scorer');

  select la.role into v_role
    from public.league_admins la
   where la.league_id = p_league_id
     and (la.user_id = auth.uid() or la.email = lower(coalesce(auth.jwt() ->> 'email', '')))
   order by case la.role when 'commissioner' then 3 when 'scheduler' then 2 else 1 end desc
   limit 1;

  -- Site admins pass league_require with no league_admins row; they see it too.
  v_show_passcode := (v_role = 'commissioner') or (v_role is null and public.is_admin());

  select jsonb_build_object(
    'league', (select to_jsonb(l) from public.leagues l where l.id = p_league_id),
    'role', v_role,
    'seasons', coalesce((select jsonb_agg(to_jsonb(s) order by s.starts_on desc nulls last, s.name)
                         from public.seasons s where s.league_id = p_league_id), '[]'::jsonb),
    'divisions', coalesce((select jsonb_agg(to_jsonb(d) order by d.sort_order, d.name)
                           from public.divisions d join public.seasons s on s.id = d.season_id
                           where s.league_id = p_league_id), '[]'::jsonb),
    'schools', coalesce((select jsonb_agg(to_jsonb(sc) order by sc.name)
                         from public.schools sc where sc.league_id = p_league_id), '[]'::jsonb),
    'teams', coalesce((select jsonb_agg(jsonb_build_object(
                'id', t.id, 'name', t.name, 'slug', t.slug, 'sport', t.sport,
                'school_id', t.school_id, 'division_id', t.division_id,
                'paid_through', t.paid_through, 'trial_ends_at', t.trial_ends_at,
                'passcode', case when v_show_passcode then t.passcode else null end,
                'coaches', (select coalesce(jsonb_agg(jsonb_build_object('email', tc.email, 'role', tc.role, 'claimed', tc.user_id is not null)), '[]'::jsonb)
                            from public.team_coaches tc where tc.team_id = t.id),
                'players', (select count(*) from public.players p where p.team_id = t.id)
              ) order by t.name)
              from public.teams t where t.league_id = p_league_id), '[]'::jsonb),
    'games', coalesce((select jsonb_agg(to_jsonb(g) order by g.starts_at)
                       from public.league_games g where g.league_id = p_league_id), '[]'::jsonb),
    'admins', coalesce((select jsonb_agg(jsonb_build_object('id', la.id, 'email', la.email, 'role', la.role, 'claimed', la.user_id is not null) order by la.email)
                        from public.league_admins la where la.league_id = p_league_id), '[]'::jsonb)
  ) into v_out;
  return v_out;
end;
$function$;
