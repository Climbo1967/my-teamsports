-- ============ MULTI-COACH: team_coaches membership ============
create table public.team_coaches (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  email text not null check (email = lower(email)),
  user_id uuid references auth.users(id) on delete cascade,
  role text not null default 'coach' check (role in ('owner', 'coach')),
  created_at timestamptz not null default now(),
  unique (team_id, email)
);
alter table public.team_coaches enable row level security;
create index team_coaches_user_idx on public.team_coaches (user_id);
create index team_coaches_team_idx on public.team_coaches (team_id);

-- Membership helpers (SECURITY DEFINER avoids RLS recursion; not in API surface for anon)
create or replace function public.is_team_coach(p_team_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.team_coaches tc
    where tc.team_id = p_team_id and tc.user_id = auth.uid()
  );
$$;
revoke execute on function public.is_team_coach(uuid) from public, anon;
grant execute on function public.is_team_coach(uuid) to authenticated;

create or replace function public.is_team_owner(p_team_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.team_coaches tc
    where tc.team_id = p_team_id and tc.user_id = auth.uid() and tc.role = 'owner'
  );
$$;
revoke execute on function public.is_team_owner(uuid) from public, anon;
grant execute on function public.is_team_owner(uuid) to authenticated;

-- Seed owner rows for existing teams
insert into public.team_coaches (team_id, email, user_id, role)
select t.id, coalesce(lower(u.email), ''), t.coach_id, 'owner'
from public.teams t join auth.users u on u.id = t.coach_id
on conflict do nothing;

-- Auto-add owner membership when a team is created
create or replace function public.handle_new_team()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.team_coaches (team_id, email, user_id, role)
  select new.id, coalesce(lower(u.email), ''), new.coach_id, 'owner'
  from auth.users u where u.id = new.coach_id
  on conflict do nothing;
  return new;
end;
$$;
revoke execute on function public.handle_new_team() from public, anon, authenticated;
create trigger on_team_created after insert on public.teams
  for each row execute function public.handle_new_team();

-- Invited assistants claim their membership after signing up
create or replace function public.claim_team_invites()
returns integer language plpgsql security definer set search_path = '' as $$
declare
  v_email text;
  v_count integer;
begin
  select lower(email) into v_email from auth.users where id = auth.uid();
  if v_email is null then return 0; end if;
  update public.team_coaches set user_id = auth.uid()
  where user_id is null and email = v_email;
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;
revoke execute on function public.claim_team_invites() from public, anon;
grant execute on function public.claim_team_invites() to authenticated;

-- team_coaches policies
create policy "Members view team staff" on public.team_coaches for select
  using (public.is_team_coach(team_id));
create policy "Owner invites coaches" on public.team_coaches for insert
  with check (public.is_team_owner(team_id) and role = 'coach');
create policy "Owner removes coaches" on public.team_coaches for delete
  using (public.is_team_owner(team_id) and role <> 'owner');

-- ============ REWIRE RLS TO MEMBERSHIP ============
drop policy "Coach manages own teams" on public.teams;
create policy "Members view teams" on public.teams for select using (public.is_team_coach(id));
create policy "Coach creates own team" on public.teams for insert with check (auth.uid() = coach_id);
create policy "Members update team" on public.teams for update
  using (public.is_team_coach(id)) with check (public.is_team_coach(id));
create policy "Owner deletes team" on public.teams for delete using (public.is_team_owner(id));

drop policy "Coach manages players on own teams" on public.players;
create policy "Members manage players" on public.players for all
  using (public.is_team_coach(team_id)) with check (public.is_team_coach(team_id));

drop policy "Coach manages events on own teams" on public.events;
create policy "Members manage events" on public.events for all
  using (public.is_team_coach(team_id)) with check (public.is_team_coach(team_id));

drop policy "Coach manages announcements" on public.announcements;
create policy "Members manage announcements" on public.announcements for all
  using (public.is_team_coach(team_id)) with check (public.is_team_coach(team_id));

drop policy "Coach manages notes" on public.notes;
create policy "Members manage notes" on public.notes for all
  using (public.is_team_coach(team_id)) with check (public.is_team_coach(team_id));

drop policy "Coach manages photos" on public.photos;
create policy "Members manage photos" on public.photos for all
  using (public.is_team_coach(team_id)) with check (public.is_team_coach(team_id));

drop policy "Coach uploads team media" on storage.objects;
drop policy "Coach updates team media" on storage.objects;
drop policy "Coach deletes team media" on storage.objects;
create policy "Members upload team media" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'team-media'
    and (storage.foldername(name))[1] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    and public.is_team_coach(((storage.foldername(name))[1])::uuid)
  );
create policy "Members update team media" on storage.objects for update to authenticated
  using (
    bucket_id = 'team-media'
    and (storage.foldername(name))[1] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    and public.is_team_coach(((storage.foldername(name))[1])::uuid)
  );
create policy "Members delete team media" on storage.objects for delete to authenticated
  using (
    bucket_id = 'team-media'
    and (storage.foldername(name))[1] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    and public.is_team_coach(((storage.foldername(name))[1])::uuid)
  );

-- ============ STATS ============
create table public.stats (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  stat_key text not null check (length(stat_key) <= 12),
  value numeric not null default 0,
  unique (event_id, player_id, stat_key)
);
alter table public.stats enable row level security;
create policy "Members manage stats" on public.stats for all
  using (public.is_team_coach(team_id)) with check (public.is_team_coach(team_id));
create index stats_team_idx on public.stats (team_id);
create index stats_event_idx on public.stats (event_id);

-- ============ RSVPS ============
create table public.rsvps (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  status text not null check (status in ('going', 'maybe', 'not_going')),
  note text check (length(note) <= 200),
  updated_at timestamptz not null default now(),
  unique (event_id, player_id)
);
alter table public.rsvps enable row level security;
create policy "Members manage rsvps" on public.rsvps for all
  using (public.is_team_coach(team_id)) with check (public.is_team_coach(team_id));
create index rsvps_event_idx on public.rsvps (event_id);

create or replace function public.upsert_rsvp(p_slug text, p_passcode text, p_event_id uuid, p_player_id uuid, p_status text, p_note text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare
  v_team_id uuid;
begin
  select t.id into v_team_id from public.teams t
  where t.slug = lower(trim(p_slug)) and t.passcode = upper(trim(p_passcode));
  if v_team_id is null then raise exception 'invalid team or passcode'; end if;
  if p_status not in ('going', 'maybe', 'not_going') then raise exception 'invalid status'; end if;
  if not exists (select 1 from public.events e where e.id = p_event_id and e.team_id = v_team_id) then
    raise exception 'invalid event';
  end if;
  if not exists (select 1 from public.players p where p.id = p_player_id and p.team_id = v_team_id) then
    raise exception 'invalid player';
  end if;
  insert into public.rsvps (team_id, event_id, player_id, status, note)
  values (v_team_id, p_event_id, p_player_id, p_status, left(p_note, 200))
  on conflict (event_id, player_id)
  do update set status = excluded.status, note = excluded.note, updated_at = now();
  return true;
end;
$$;
grant execute on function public.upsert_rsvp(text, text, uuid, uuid, text, text) to anon, authenticated;

-- ============ SUBSCRIBERS (update notifications) ============
create table public.subscribers (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  email text not null,
  name text check (length(name) <= 80),
  created_at timestamptz not null default now(),
  unique (team_id, email)
);
alter table public.subscribers enable row level security;
create policy "Members manage subscribers" on public.subscribers for all
  using (public.is_team_coach(team_id)) with check (public.is_team_coach(team_id));

create or replace function public.subscribe_team(p_slug text, p_passcode text, p_email text, p_name text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare
  v_team_id uuid;
  v_email text := lower(trim(p_email));
begin
  select t.id into v_team_id from public.teams t
  where t.slug = lower(trim(p_slug)) and t.passcode = upper(trim(p_passcode));
  if v_team_id is null then raise exception 'invalid team or passcode'; end if;
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'invalid email'; end if;
  insert into public.subscribers (team_id, email, name)
  values (v_team_id, v_email, left(trim(p_name), 80))
  on conflict (team_id, email) do nothing;
  return true;
end;
$$;
grant execute on function public.subscribe_team(text, text, text, text) to anon, authenticated;

-- ============ UPDATED TEAM SITE RPC ============
create or replace function public.get_team_site(p_slug text, p_passcode text)
returns jsonb
language sql
security definer
set search_path = ''
stable
as $$
  select jsonb_build_object(
    'team', jsonb_build_object(
      'id', t.id, 'name', t.name, 'sport', t.sport, 'season', t.season,
      'slug', t.slug, 'logo_url', t.logo_url, 'primary_color', t.primary_color
    ),
    'players', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', p.id, 'name', p.name, 'jersey_number', p.jersey_number,
        'position', p.position, 'photo_url', p.photo_url, 'bio', p.bio
      ) order by p.sort_order, p.name)
      from public.players p where p.team_id = t.id
    ), '[]'::jsonb),
    'events', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', e.id, 'event_type', e.event_type, 'title', e.title, 'opponent', e.opponent,
        'location', e.location, 'starts_at', e.starts_at, 'notes', e.notes, 'result', e.result
      ) order by e.starts_at)
      from public.events e where e.team_id = t.id
    ), '[]'::jsonb),
    'announcements', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', a.id, 'title', a.title, 'body', a.body, 'pinned', a.pinned, 'created_at', a.created_at
      ) order by a.pinned desc, a.created_at desc)
      from public.announcements a where a.team_id = t.id
    ), '[]'::jsonb),
    'notes', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', n.id, 'title', n.title, 'body', n.body, 'created_at', n.created_at
      ) order by n.created_at desc)
      from public.notes n where n.team_id = t.id
    ), '[]'::jsonb),
    'photos', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', ph.id, 'url', ph.url, 'caption', ph.caption, 'player_id', ph.player_id, 'created_at', ph.created_at
      ) order by ph.created_at desc)
      from public.photos ph where ph.team_id = t.id
    ), '[]'::jsonb),
    'stats', coalesce((
      select jsonb_agg(jsonb_build_object(
        'player_id', s.player_id, 'stat_key', s.stat_key, 'total', s.total, 'games', s.games
      ))
      from (
        select player_id, stat_key, sum(value) as total, count(distinct event_id) as games
        from public.stats where team_id = t.id group by player_id, stat_key
      ) s
    ), '[]'::jsonb),
    'rsvps', coalesce((
      select jsonb_agg(jsonb_build_object(
        'event_id', r.event_id, 'player_id', r.player_id, 'status', r.status
      ))
      from public.rsvps r where r.team_id = t.id
    ), '[]'::jsonb)
  )
  from public.teams t
  where t.slug = lower(trim(p_slug)) and t.passcode = upper(trim(p_passcode));
$$;