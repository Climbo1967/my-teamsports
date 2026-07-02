-- Game results on events
alter table public.events add column if not exists result text;

-- ============ ANNOUNCEMENTS (message board) ============
create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  title text,
  body text not null check (length(body) <= 4000),
  pinned boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.announcements enable row level security;
create policy "Coach manages announcements"
  on public.announcements for all
  using (exists (select 1 from public.teams t where t.id = team_id and t.coach_id = auth.uid()))
  with check (exists (select 1 from public.teams t where t.id = team_id and t.coach_id = auth.uid()));
create index announcements_team_idx on public.announcements (team_id, pinned desc, created_at desc);

-- ============ COACH'S NOTES ============
create table public.notes (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  title text not null check (length(title) <= 120),
  body text not null check (length(body) <= 8000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.notes enable row level security;
create policy "Coach manages notes"
  on public.notes for all
  using (exists (select 1 from public.teams t where t.id = team_id and t.coach_id = auth.uid()))
  with check (exists (select 1 from public.teams t where t.id = team_id and t.coach_id = auth.uid()));
create index notes_team_idx on public.notes (team_id, created_at desc);

-- ============ PHOTOS (gallery; optionally tied to a player) ============
create table public.photos (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  player_id uuid references public.players(id) on delete set null,
  url text not null,
  caption text check (length(caption) <= 200),
  uploaded_by text not null default 'coach' check (uploaded_by in ('coach','parent')),
  created_at timestamptz not null default now()
);
alter table public.photos enable row level security;
create policy "Coach manages photos"
  on public.photos for all
  using (exists (select 1 from public.teams t where t.id = team_id and t.coach_id = auth.uid()))
  with check (exists (select 1 from public.teams t where t.id = team_id and t.coach_id = auth.uid()));
create index photos_team_idx on public.photos (team_id, created_at desc);

-- ============ STORAGE: team-media bucket ============
insert into storage.buckets (id, name, public) values ('team-media', 'team-media', true)
on conflict (id) do nothing;

-- Coaches manage files under <team_id>/ for teams they own
create policy "Coach uploads team media"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'team-media'
    and exists (select 1 from public.teams t where t.id::text = (storage.foldername(name))[1] and t.coach_id = auth.uid())
  );
create policy "Coach updates team media"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'team-media'
    and exists (select 1 from public.teams t where t.id::text = (storage.foldername(name))[1] and t.coach_id = auth.uid())
  );
create policy "Coach deletes team media"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'team-media'
    and exists (select 1 from public.teams t where t.id::text = (storage.foldername(name))[1] and t.coach_id = auth.uid())
  );

-- Parents (anon, passcode-validated in API route) upload only into parent-uploads/<team_id>/
create policy "Parent uploads to parent folder"
  on storage.objects for insert to anon
  with check (
    bucket_id = 'team-media'
    and (storage.foldername(name))[1] = 'parent-uploads'
  );

-- ============ PARENT PHOTO RPC (passcode-validated) ============
create or replace function public.add_team_photo(p_slug text, p_passcode text, p_url text, p_caption text, p_player_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_team_id uuid;
  v_photo_id uuid;
begin
  select t.id into v_team_id
  from public.teams t
  where t.slug = lower(trim(p_slug)) and t.passcode = upper(trim(p_passcode));

  if v_team_id is null then
    raise exception 'invalid team or passcode';
  end if;

  insert into public.photos (team_id, player_id, url, caption, uploaded_by)
  values (v_team_id, p_player_id, p_url, left(p_caption, 200), 'parent')
  returning id into v_photo_id;

  return v_photo_id;
end;
$$;
grant execute on function public.add_team_photo(text, text, text, text, uuid) to anon, authenticated;

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
    ), '[]'::jsonb)
  )
  from public.teams t
  where t.slug = lower(trim(p_slug)) and t.passcode = upper(trim(p_passcode));
$$;