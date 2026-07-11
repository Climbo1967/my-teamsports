-- TEAM BOARD v1 — ships dark. teams.board_enabled defaults false and there is
-- no coach-facing toggle, so applying this changes nothing user-visible.
-- Parents (no accounts) reach the board only through the passcode-checked
-- SECURITY DEFINER RPCs below, modeled on upsert_rsvp: passcode re-validated
-- inside every function, plus board_enabled and thread-lock checks.

-- Feature flag (flipped manually per team; no UI writes this in v1)
alter table public.teams add column if not exists board_enabled boolean not null default false;

-- ============ Tables ============
create table public.team_board_threads (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  title text not null check (char_length(title) <= 150),
  created_by_coach uuid references auth.users(id),
  -- set null (not cascade) so deleting an announcement never silently deletes
  -- a thread full of parent replies, and never blocks the announcement delete.
  announcement_id uuid references public.announcements(id) on delete set null,
  locked boolean not null default false,
  created_at timestamptz not null default now()
);
create index team_board_threads_team_idx on public.team_board_threads (team_id, created_at desc);
create index team_board_threads_announcement_idx on public.team_board_threads (announcement_id);
create index team_board_threads_coach_idx on public.team_board_threads (created_by_coach);

create table public.team_board_posts (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.team_board_threads(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  author_coach uuid references auth.users(id),
  author_name text check (char_length(author_name) <= 40), -- parent display name
  body text not null check (char_length(body) <= 1000),
  deleted_at timestamptz, -- coach soft-delete
  created_at timestamptz not null default now()
);
create index team_board_posts_thread_idx on public.team_board_posts (thread_id, created_at);
create index team_board_posts_team_idx on public.team_board_posts (team_id);
create index team_board_posts_coach_idx on public.team_board_posts (author_coach);

-- ============ RLS: coaches manage their own board directly ============
alter table public.team_board_threads enable row level security;
alter table public.team_board_posts enable row level security;

create policy "Coach manages board threads" on public.team_board_threads
  for all using (public.is_team_coach(team_id)) with check (public.is_team_coach(team_id));
create policy "Coach manages board posts" on public.team_board_posts
  for all using (public.is_team_coach(team_id)) with check (public.is_team_coach(team_id));
-- No anon policies: parents go through the RPCs below only.

-- ============ Parent RPCs (passcode-checked SECURITY DEFINER) ============

-- Read the board. Soft-deleted posts are excluded from the parent view.
create or replace function public.get_board(p_slug text, p_passcode text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_team_id uuid;
  v_enabled boolean;
begin
  select t.id, t.board_enabled into v_team_id, v_enabled from public.teams t
  where t.slug = lower(trim(p_slug)) and t.passcode = upper(trim(p_passcode));
  if v_team_id is null then raise exception 'invalid team or passcode'; end if;
  if not v_enabled then raise exception 'board not enabled'; end if;

  return jsonb_build_object('threads', coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', th.id, 'title', th.title, 'locked', th.locked, 'created_at', th.created_at,
      'is_announcement', th.announcement_id is not null,
      'posts', coalesce((
        select jsonb_agg(jsonb_build_object(
          'id', po.id, 'author_name', po.author_name, 'is_coach', po.author_coach is not null,
          'body', po.body, 'created_at', po.created_at
        ) order by po.created_at)
        from public.team_board_posts po
        where po.thread_id = th.id and po.deleted_at is null
      ), '[]'::jsonb)
    ) order by th.created_at desc)
    from public.team_board_threads th where th.team_id = v_team_id
  ), '[]'::jsonb));
end;
$$;
grant execute on function public.get_board(text, text) to anon, authenticated;

-- Parent reply: reply-only (no thread creation), display name required,
-- 1000-char cap, refuses when the board is off or the thread is locked.
create or replace function public.add_board_reply(
  p_slug text, p_passcode text, p_thread_id uuid, p_author_name text, p_body text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_team_id uuid;
  v_enabled boolean;
  v_locked boolean;
  v_name text := left(trim(coalesce(p_author_name, '')), 40);
  v_body text := trim(coalesce(p_body, ''));
begin
  select t.id, t.board_enabled into v_team_id, v_enabled from public.teams t
  where t.slug = lower(trim(p_slug)) and t.passcode = upper(trim(p_passcode));
  if v_team_id is null then raise exception 'invalid team or passcode'; end if;
  if not v_enabled then raise exception 'board not enabled'; end if;
  if v_name = '' then raise exception 'display name required'; end if;
  if v_body = '' or char_length(v_body) > 1000 then
    raise exception 'reply must be 1-1000 characters';
  end if;

  select th.locked into v_locked from public.team_board_threads th
  where th.id = p_thread_id and th.team_id = v_team_id;
  if v_locked is null then raise exception 'thread not found'; end if;
  if v_locked then raise exception 'thread is locked'; end if;

  insert into public.team_board_posts (thread_id, team_id, author_name, body)
  values (p_thread_id, v_team_id, v_name, v_body);
  return jsonb_build_object('ok', true);
end;
$$;
grant execute on function public.add_board_reply(text, text, uuid, text, text) to anon, authenticated;

-- Report a post. Returns the post details the server route needs to email the
-- coaches. Deliberately returns NO coach emails/ids — the route looks those up
-- with the service role so an anon caller never sees them.
create or replace function public.report_board_post(p_slug text, p_passcode text, p_post_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_team_id uuid;
  v_enabled boolean;
  v_team_name text;
  r record;
begin
  select t.id, t.board_enabled, t.name into v_team_id, v_enabled, v_team_name from public.teams t
  where t.slug = lower(trim(p_slug)) and t.passcode = upper(trim(p_passcode));
  if v_team_id is null then raise exception 'invalid team or passcode'; end if;
  if not v_enabled then raise exception 'board not enabled'; end if;

  select po.id, po.author_name, po.body, po.created_at, th.title as thread_title
    into r
  from public.team_board_posts po
  join public.team_board_threads th on th.id = po.thread_id
  where po.id = p_post_id and po.team_id = v_team_id and po.deleted_at is null;
  if r.id is null then raise exception 'post not found'; end if;

  return jsonb_build_object(
    'team_id', v_team_id, 'team_name', v_team_name,
    'post_id', r.id, 'author_name', r.author_name, 'body', r.body,
    'created_at', r.created_at, 'thread_title', r.thread_title
  );
end;
$$;
grant execute on function public.report_board_post(text, text, uuid) to anon, authenticated;

-- ============ get_team_site: expose the flag so the team page renders the
-- board section only when it's enabled (body otherwise identical to
-- 20260630172125_batch7_photos_plays_announcements.sql) ============
create or replace function public.get_team_site(p_slug text, p_passcode text)
returns jsonb
language sql
stable
security definer
set search_path to ''
as $function$
  select jsonb_build_object(
    'team', jsonb_build_object(
      'id', t.id, 'name', t.name, 'sport', t.sport, 'season', t.season,
      'slug', t.slug, 'logo_url', t.logo_url, 'primary_color', t.primary_color,
      'board_enabled', t.board_enabled
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
        'id', ph.id, 'url', ph.url, 'caption', ph.caption, 'player_id', ph.player_id,
        'uploaded_by', ph.uploaded_by, 'created_at', ph.created_at
      ) order by ph.created_at desc)
      from public.photos ph where ph.team_id = t.id
    ), '[]'::jsonb),
    'videos', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', v.id, 'title', v.title, 'url', v.url, 'game_date', v.game_date, 'created_at', v.created_at
      ) order by coalesce(v.game_date, v.created_at::date) desc, v.created_at desc)
      from public.videos v where v.team_id = t.id
    ), '[]'::jsonb),
    'plays', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', pl.id, 'name', pl.name, 'category', pl.category, 'formation', pl.formation,
        'diagram', pl.diagram, 'notes', pl.notes
      ) order by pl.sort_order, pl.created_at)
      from public.plays pl where pl.team_id = t.id and pl.is_public
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
$function$;
