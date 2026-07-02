-- ============ PROFILES ============
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "Users manage own profile"
  on public.profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ TEAMS ============
create table public.teams (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references auth.users(id) on delete cascade,
  slug text not null unique check (slug = lower(slug) and length(slug) between 2 and 80),
  name text not null check (length(name) between 1 and 60),
  sport text not null,
  season text,
  passcode text not null check (length(passcode) = 6),
  logo_url text,
  primary_color text,
  created_at timestamptz not null default now()
);
alter table public.teams enable row level security;

create policy "Coach manages own teams"
  on public.teams for all
  using (auth.uid() = coach_id)
  with check (auth.uid() = coach_id);

create index teams_coach_id_idx on public.teams (coach_id);

-- ============ PLAYERS ============
create table public.players (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  name text not null check (length(name) between 1 and 80),
  jersey_number text,
  position text,
  photo_url text,
  bio text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.players enable row level security;

create policy "Coach manages players on own teams"
  on public.players for all
  using (exists (select 1 from public.teams t where t.id = team_id and t.coach_id = auth.uid()))
  with check (exists (select 1 from public.teams t where t.id = team_id and t.coach_id = auth.uid()));

create index players_team_id_idx on public.players (team_id);

-- ============ EVENTS (games / practices) ============
create table public.events (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  event_type text not null default 'game' check (event_type in ('game', 'practice', 'other')),
  title text,
  opponent text,
  location text,
  starts_at timestamptz not null,
  notes text,
  created_at timestamptz not null default now()
);
alter table public.events enable row level security;

create policy "Coach manages events on own teams"
  on public.events for all
  using (exists (select 1 from public.teams t where t.id = team_id and t.coach_id = auth.uid()))
  with check (exists (select 1 from public.teams t where t.id = team_id and t.coach_id = auth.uid()));

create index events_team_id_starts_at_idx on public.events (team_id, starts_at);

-- ============ PUBLIC TEAM SITE ACCESS (passcode-gated) ============
-- Parents/players access via link + passcode; no accounts.
-- Security definer fn returns the whole team site in one call,
-- only when slug + passcode match.
create or replace function public.get_team_site(p_slug text, p_passcode text)
returns jsonb
language sql
security definer
set search_path = ''
stable
as $$
  select jsonb_build_object(
    'team', jsonb_build_object(
      'id', t.id,
      'name', t.name,
      'sport', t.sport,
      'season', t.season,
      'slug', t.slug,
      'logo_url', t.logo_url,
      'primary_color', t.primary_color
    ),
    'players', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', p.id,
        'name', p.name,
        'jersey_number', p.jersey_number,
        'position', p.position,
        'photo_url', p.photo_url,
        'bio', p.bio
      ) order by p.sort_order, p.name)
      from public.players p where p.team_id = t.id
    ), '[]'::jsonb),
    'events', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', e.id,
        'event_type', e.event_type,
        'title', e.title,
        'opponent', e.opponent,
        'location', e.location,
        'starts_at', e.starts_at,
        'notes', e.notes
      ) order by e.starts_at)
      from public.events e where e.team_id = t.id
    ), '[]'::jsonb)
  )
  from public.teams t
  where t.slug = lower(trim(p_slug))
    and t.passcode = upper(trim(p_passcode));
$$;

-- Allow anonymous (parents) and authed users to call it
grant execute on function public.get_team_site(text, text) to anon, authenticated;
