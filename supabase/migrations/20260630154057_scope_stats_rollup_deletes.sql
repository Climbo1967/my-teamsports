-- Make each rollup delete ONLY the stat_keys it manages, so manually-entered
-- columns (e.g. Runs) and other-source stats survive a re-roll. Fixes the
-- stats double-writer clobber (audit T1-2).

create or replace function public.rollup_game_stats(p_event_id uuid)
returns void
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_team uuid;
begin
  select team_id into v_team from public.events where id = p_event_id;
  if v_team is null then raise exception 'event not found'; end if;
  if not public.is_team_coach(v_team) then raise exception 'not authorized'; end if;

  delete from public.stats
  where event_id = p_event_id and stat_key in ('ab','h','hr','rbi','sb');

  insert into public.stats (team_id, event_id, player_id, stat_key, value)
  select v_team, p_event_id, player_id, stat_key, val
  from (
    select player_id, 'ab' as stat_key,
      count(*) filter (where result in ('single','double','triple','hr','strikeout',
        'groundout','flyout','lineout','popout','fielders_choice','error'))::numeric as val
    from public.at_bats where event_id = p_event_id and player_id is not null group by player_id
    union all
    select player_id, 'h',
      count(*) filter (where result in ('single','double','triple','hr'))::numeric
    from public.at_bats where event_id = p_event_id and player_id is not null group by player_id
    union all
    select player_id, 'hr',
      count(*) filter (where result = 'hr')::numeric
    from public.at_bats where event_id = p_event_id and player_id is not null group by player_id
    union all
    select player_id, 'rbi', coalesce(sum(rbi),0)::numeric
    from public.at_bats where event_id = p_event_id and player_id is not null group by player_id
    union all
    select player_id, 'sb',
      count(*) filter (where result = 'stolen_base')::numeric
    from public.at_bats where event_id = p_event_id and player_id is not null group by player_id
  ) agg
  where val > 0;
end;
$function$;

create or replace function public.rollup_scoreboard_stats(p_event_id uuid)
returns void
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_team uuid;
  v_sport text;
begin
  select team_id into v_team from public.events where id = p_event_id;
  if v_team is null then raise exception 'event not found'; end if;
  if not public.is_team_coach(v_team) then raise exception 'not authorized'; end if;
  select sport into v_sport from public.teams where id = v_team;

  delete from public.stats
  where event_id = p_event_id and stat_key in ('pts','g','td');

  if v_sport = 'basketball' then
    insert into public.stats (team_id, event_id, player_id, stat_key, value)
    select v_team, p_event_id, player_id, 'pts', sum(points)::numeric
    from public.scoring_plays
    where event_id = p_event_id and side = 'us' and player_id is not null
    group by player_id having sum(points) > 0;
  elsif v_sport in ('soccer','hockey') then
    insert into public.stats (team_id, event_id, player_id, stat_key, value)
    select v_team, p_event_id, player_id, 'g', count(*)::numeric
    from public.scoring_plays
    where event_id = p_event_id and side = 'us' and player_id is not null
    group by player_id;
  elsif v_sport in ('football','flag_football') then
    insert into public.stats (team_id, event_id, player_id, stat_key, value)
    select v_team, p_event_id, player_id, 'td', count(*)::numeric
    from public.scoring_plays
    where event_id = p_event_id and side = 'us' and player_id is not null and points = 6
    group by player_id;
  end if;
  -- volleyball: team-only, no per-player rollup
end;
$function$;