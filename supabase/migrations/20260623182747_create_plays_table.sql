create table public.plays (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  name text not null,
  category text not null default 'Offense',
  formation text,
  sport text,
  diagram jsonb not null default '{}'::jsonb,
  notes text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.plays enable row level security;

create policy "coach all plays" on public.plays
  for all
  using (is_team_coach(team_id))
  with check (is_team_coach(team_id));

create index plays_team_id_idx on public.plays (team_id);
create index plays_sort_idx on public.plays (team_id, sort_order, created_at);