-- 1) Extend game_scores with generic period/clock state (baseball ignores these)
alter table public.game_scores
  add column if not exists period int not null default 1,
  add column if not exists clock_seconds int,
  add column if not exists clock_running boolean not null default false,
  add column if not exists clock_updated_at timestamptz;

-- 2) Per-play scoring log (powers undo + season-stat rollup for non-baseball sports)
create table if not exists public.scoring_plays (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  player_id uuid references public.players(id) on delete set null,
  side text not null default 'us',
  points int not null default 1,
  period int not null default 1,
  created_at timestamptz not null default now()
);
create index if not exists scoring_plays_event_idx on public.scoring_plays(event_id);
alter table public.scoring_plays enable row level security;
drop policy if exists "coach all scoring_plays" on public.scoring_plays;
create policy "coach all scoring_plays" on public.scoring_plays
  for all using (public.is_team_coach(team_id)) with check (public.is_team_coach(team_id));

-- 3) Extend get_live_game to also surface sport + period + clock for the generic banner
create or replace function public.get_live_game(p_slug text, p_passcode text)
returns jsonb language sql stable security definer set search_path to '' as $function$
  select case when g.id is null then null else jsonb_build_object(
    'event_id', g.event_id,
    'status', g.status,
    'is_home', g.is_home,
    'our_score', g.our_score,
    'opp_score', g.opp_score,
    'inning', g.inning,
    'half', g.half,
    'outs', g.outs,
    'balls', g.balls,
    'strikes', g.strikes,
    'sport', t.sport,
    'period', g.period,
    'clock_seconds', g.clock_seconds,
    'clock_running', g.clock_running,
    'clock_updated_at', g.clock_updated_at,
    'team_name', t.name,
    'opponent', e.opponent,
    'updated_at', g.updated_at,
    'batter', (
      select jsonb_build_object('name', p.name, 'jersey_number', p.jersey_number)
      from public.game_lineups l join public.players p on p.id = l.player_id
      where l.event_id = g.event_id and l.spot = g.current_spot limit 1
    )
  ) end
  from public.teams t
  left join lateral (
    select gs.* from public.game_scores gs
    where gs.team_id = t.id and gs.status = 'in_progress'
    order by gs.updated_at desc limit 1
  ) g on true
  left join public.events e on e.id = g.event_id
  where t.slug = lower(trim(p_slug)) and t.passcode = upper(trim(p_passcode));
$function$;

-- 4) Roll scoring_plays into per-player season stats, mapped per sport
create or replace function public.rollup_scoreboard_stats(p_event_id uuid)
returns void language plpgsql security definer set search_path to '' as $function$
declare
  v_team uuid;
  v_sport text;
begin
  select team_id into v_team from public.events where id = p_event_id;
  if v_team is null then raise exception 'event not found'; end if;
  if not public.is_team_coach(v_team) then raise exception 'not authorized'; end if;
  select sport into v_sport from public.teams where id = v_team;

  delete from public.stats where event_id = p_event_id;

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