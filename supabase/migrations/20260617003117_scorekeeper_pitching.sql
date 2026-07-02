-- ============ THE SCOREKEEPER — Tier 2 pitcher tracking ============

-- Remember the current pitcher across half-innings.
alter table public.game_scores
  add column if not exists pitcher_id uuid references public.players(id) on delete set null;

-- One aggregated line per (game, our pitcher).
create table if not exists public.pitching_lines (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  pitches int not null default 0 check (pitches >= 0),
  strikes int not null default 0 check (strikes >= 0),
  outs int not null default 0 check (outs >= 0),
  walks int not null default 0 check (walks >= 0),
  strikeouts int not null default 0 check (strikeouts >= 0),
  hits int not null default 0 check (hits >= 0),
  runs int not null default 0 check (runs >= 0),
  updated_at timestamptz not null default now(),
  unique (event_id, player_id)
);

create index if not exists pitching_lines_event_idx on public.pitching_lines(event_id);
create index if not exists pitching_lines_player_idx on public.pitching_lines(player_id);

alter table public.pitching_lines enable row level security;

create policy "coach all pitching_lines" on public.pitching_lines
  for all using (public.is_team_coach(team_id)) with check (public.is_team_coach(team_id));