-- ============ THE SCOREKEEPER — Tier 1 live scoring ============

-- Live game state (one row per game/event being scored)
create table if not exists public.game_scores (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  event_id uuid not null unique references public.events(id) on delete cascade,
  status text not null default 'in_progress' check (status in ('in_progress','final')),
  is_home boolean not null default true,
  our_score int not null default 0 check (our_score >= 0),
  opp_score int not null default 0 check (opp_score >= 0),
  inning int not null default 1 check (inning between 1 and 30),
  half text not null default 'top' check (half in ('top','bottom')),
  outs int not null default 0 check (outs between 0 and 3),
  balls int not null default 0 check (balls between 0 and 4),
  strikes int not null default 0 check (strikes between 0 and 3),
  current_spot int not null default 1,
  updated_at timestamptz not null default now()
);

-- Batting order for a game
create table if not exists public.game_lineups (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  spot int not null check (spot between 1 and 40),
  unique (event_id, player_id),
  unique (event_id, spot)
);

-- Each plate appearance / scoring play
create table if not exists public.at_bats (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  player_id uuid references public.players(id) on delete set null,
  inning int not null default 1,
  half text not null default 'top',
  result text not null check (result in (
    'single','double','triple','hr','walk','hbp','strikeout',
    'groundout','flyout','lineout','popout','fielders_choice',
    'error','sacrifice','out','stolen_base')),
  rbi int not null default 0 check (rbi between 0 and 4),
  runs int not null default 0 check (runs between 0 and 4),
  hit_x numeric check (hit_x >= 0 and hit_x <= 1),
  hit_y numeric check (hit_y >= 0 and hit_y <= 1),
  hit_type text check (hit_type in ('grounder','line_drive','fly','popup')),
  balls int not null default 0,
  strikes int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists at_bats_event_idx on public.at_bats(event_id);
create index if not exists at_bats_player_idx on public.at_bats(player_id);
create index if not exists game_lineups_event_idx on public.game_lineups(event_id);

-- ============ RLS: coach-membership full access ============
alter table public.game_scores enable row level security;
alter table public.game_lineups enable row level security;
alter table public.at_bats enable row level security;

create policy "coach all game_scores" on public.game_scores
  for all using (public.is_team_coach(team_id)) with check (public.is_team_coach(team_id));
create policy "coach all game_lineups" on public.game_lineups
  for all using (public.is_team_coach(team_id)) with check (public.is_team_coach(team_id));
create policy "coach all at_bats" on public.at_bats
  for all using (public.is_team_coach(team_id)) with check (public.is_team_coach(team_id));

-- ============ Roll live at-bats into the existing stats table ============
-- Recomputes ab/h/hr/rbi/sb for one game from at_bats, replacing that game's
-- stats rows (mirrors the manual StatsEditor wholesale-replace behavior).
create or replace function public.rollup_game_stats(p_event_id uuid)
returns void
language plpgsql
security definer
set search_path to ''
as $$
declare
  v_team uuid;
begin
  select team_id into v_team from public.events where id = p_event_id;
  if v_team is null then raise exception 'event not found'; end if;
  if not public.is_team_coach(v_team) then raise exception 'not authorized'; end if;

  delete from public.stats where event_id = p_event_id;

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
$$;

-- ============ Public (passcode-gated) live game read ============
create or replace function public.get_live_game(p_slug text, p_passcode text)
returns jsonb
language sql
stable security definer
set search_path to ''
as $$
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
$$;