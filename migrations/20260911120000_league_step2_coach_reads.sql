-- League layer, step 2: coach-facing read of a team's league coverage.
-- leagues/schools/divisions are RLS'd to league admins only, so coaches need a
-- SECURITY DEFINER read to learn "my team is in <league>, covered through <date>".
-- Returns NULL for solo teams (league_id is null) — every existing team.
-- Auth: team coach/assistant, site admin, or an admin of that league.

create or replace function public.team_league_info(p_team_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_team    public.teams%rowtype;
  v_league  public.leagues%rowtype;
begin
  select * into v_team from public.teams where id = p_team_id;
  if not found or v_team.league_id is null then
    return null;
  end if;

  if not public.is_team_coach(p_team_id)
     and not public.is_admin()
     and not public.is_league_admin(v_team.league_id) then
    return null;
  end if;

  select * into v_league from public.leagues where id = v_team.league_id;
  if not found then
    return null;
  end if;

  return jsonb_build_object(
    'league', jsonb_build_object(
      'id', v_league.id, 'slug', v_league.slug, 'name', v_league.name,
      'short_name', v_league.short_name, 'paid_through', v_league.paid_through,
      'is_public', v_league.is_public
    ),
    'school', (
      select jsonb_build_object(
        'id', sc.id, 'slug', sc.slug, 'name', sc.name,
        'short_name', sc.short_name, 'paid_through', sc.paid_through)
      from public.schools sc where sc.id = v_team.school_id
    ),
    'division', (
      select jsonb_build_object('id', d.id, 'name', d.name, 'season_id', d.season_id)
      from public.divisions d where d.id = v_team.division_id
    ),
    'season', (
      select jsonb_build_object('id', s.id, 'name', s.name, 'sport', s.sport,
                                'is_current', s.is_current)
      from public.divisions d
      join public.seasons s on s.id = d.season_id
      where d.id = v_team.division_id
    )
  );
end;
$$;

revoke all on function public.team_league_info(uuid) from public, anon;
grant execute on function public.team_league_info(uuid) to authenticated, service_role;

-- Sitemap + directory: public leagues only, slug + updated_at (never internals).
create or replace function public.list_public_leagues()
returns table(slug text, name text, short_name text, updated_at timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select l.slug, l.name, l.short_name, l.updated_at
  from public.leagues l
  where l.is_public
  order by l.name;
$$;

grant execute on function public.list_public_leagues() to anon, authenticated, service_role;
