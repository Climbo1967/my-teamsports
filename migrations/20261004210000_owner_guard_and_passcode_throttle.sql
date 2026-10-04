-- Batch 2 of the 2026-10-03 bug sweep (findings 16 and 18). Ron said go
-- 2026-10-04.
--
-- 1. The head coach of a team (teams.coach_id) can only be changed by the
--    server, an admin, or a league flow that has already made the new coach an
--    "owner" on the team's staff list. Before this, the row policy let any
--    invited assistant set coach_id to themselves from the browser and then
--    pass the owner-only delete rule.
--
-- 2. Passcode guessing is throttled inside the database. The thirteen
--    passcode functions can be called straight from the public API with the
--    publishable key, which skips the per-IP limit on /api/team-access. Each
--    now runs passcode_gate() first: after 60 DIFFERENT wrong passcodes for one
--    team inside 15 minutes, every call for that team (right or wrong) raises
--    'too many attempts' until the window turns over. Counting distinct wrong
--    guesses, not calls, means a parent whose saved cookie went stale after a
--    passcode change counts once however often their open tab polls, so a
--    real team cannot be locked out by accident. Only a guesser produces
--    distinct wrong codes.
--
--    get_team_site, get_live_game and get_push_prefs were SQL functions marked
--    STABLE and get_board / report_board_post were STABLE plpgsql; all five
--    become VOLATILE plpgsql so the gate may record a failure. The app calls
--    every one of them with POST, which is unaffected.
--
-- Safe to run more than once. No drop statements.
--
-- Applied to production 2026-10-04 in two pieces: part 1 through the Supabase
-- connector (migration "guard_team_owner_column"), part 2 through the
-- dashboard SQL editor, because the connector refuses any text containing a
-- DELETE statement, even inside a function body. The revoke on the guard
-- function was run separately afterwards. Verified: 13 of 13 passcode
-- functions gated, the gate not callable by anon/authenticated, the demo team
-- site still answering, /api/team-access 401 on a wrong code and 200 on the
-- right one.

begin;

---------------------------------------------------------------------------
-- 1. Head-coach column guard
---------------------------------------------------------------------------

create or replace function public.guard_team_owner_column()
returns trigger
language plpgsql
security definer
set search_path to ''
as $$
begin
  if new.coach_id is distinct from old.coach_id then
    -- The server (service key, direct session) and admins may do anything.
    if public.billing_write_allowed() or public.is_admin() then
      return new;
    end if;
    -- League flows: league_invite_coach and promote_league_head_coach both
    -- write the 'owner' staff row for the new coach before touching coach_id.
    -- An assistant cannot create or change an owner row (team_coaches
    -- policies are owner-only), so this cannot be satisfied from the browser.
    if exists (
      select 1 from public.team_coaches tc
      where tc.team_id = new.id and tc.user_id = new.coach_id and tc.role = 'owner'
    ) then
      return new;
    end if;
    raise exception 'Only the server can change a team''s head coach' using errcode = '42501';
  end if;
  return new;
end;
$$;

create or replace trigger trg_guard_team_owner
  before update on public.teams
  for each row execute function public.guard_team_owner_column();

-- Trigger functions cannot be called through the API anyway; this keeps the
-- security advisor quiet about it.
revoke all on function public.guard_team_owner_column() from public, anon, authenticated;

---------------------------------------------------------------------------
-- 2. Passcode throttle
---------------------------------------------------------------------------

create table if not exists public.passcode_attempts (
  slug         text   not null,
  guess_hash   text   not null,
  window_start bigint not null,
  primary key (slug, guess_hash, window_start)
);

alter table public.passcode_attempts enable row level security;
-- Intentionally NO policies: only the gate (SECURITY DEFINER) and the service
-- role touch this table.

-- Returns the team id when slug + passcode match, null when they do not (and
-- records the wrong guess), and raises 'too many attempts' once a team has
-- seen 60 distinct wrong guesses in the current 15-minute window.
create or replace function public.passcode_gate(p_slug text, p_passcode text)
returns uuid
language plpgsql
security definer
set search_path to ''
as $$
declare
  v_slug   text   := lower(trim(coalesce(p_slug, '')));
  v_code   text   := upper(trim(coalesce(p_passcode, '')));
  v_window bigint := floor(extract(epoch from now()) / 900);
  v_fails  int;
  v_team   uuid;
begin
  select count(*) into v_fails
  from public.passcode_attempts a
  where a.slug = v_slug and a.window_start = v_window;

  if v_fails >= 60 then
    raise exception 'too many attempts';
  end if;

  select t.id into v_team from public.teams t
  where t.slug = v_slug and t.passcode = v_code;

  if v_team is null then
    delete from public.passcode_attempts a
    where a.slug = v_slug and a.window_start < v_window;
    insert into public.passcode_attempts (slug, guess_hash, window_start)
    values (v_slug, md5(v_code), v_window)
    on conflict do nothing;
  end if;

  return v_team;
end;
$$;

revoke all on function public.passcode_gate(text, text) from public, anon, authenticated;
grant execute on function public.passcode_gate(text, text) to service_role;

-- The thirteen passcode functions, each with the gate as its first statement.
-- Bodies are otherwise the production bodies as of 2026-10-04.

create or replace function public.get_team_site(p_slug text, p_passcode text)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $$
begin
  perform public.passcode_gate(p_slug, p_passcode);
  return (
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
  where t.slug = lower(trim(p_slug)) and t.passcode = upper(trim(p_passcode))
  );
end;
$$;

create or replace function public.get_live_game(p_slug text, p_passcode text)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $$
begin
  perform public.passcode_gate(p_slug, p_passcode);
  return (
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
  where t.slug = lower(trim(p_slug)) and t.passcode = upper(trim(p_passcode))
  );
end;
$$;

create or replace function public.get_push_prefs(p_slug text, p_passcode text, p_endpoint text)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $$
begin
  perform public.passcode_gate(p_slug, p_passcode);
  return (
  select jsonb_build_object(
    'announcements', ps.want_announcements,
    'games', ps.want_games,
    'schedule', ps.want_schedule
  )
  from public.push_subscriptions ps
  join public.teams t on t.id = ps.team_id
  where t.slug = lower(trim(p_slug)) and t.passcode = upper(trim(p_passcode))
    and ps.endpoint = p_endpoint
  );
end;
$$;

create or replace function public.get_board(p_slug text, p_passcode text)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $$
declare
  v_team_id uuid;
  v_enabled boolean;
begin
  perform public.passcode_gate(p_slug, p_passcode);
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

create or replace function public.report_board_post(p_slug text, p_passcode text, p_post_id uuid)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $$
declare
  v_team_id uuid;
  v_enabled boolean;
  v_team_name text;
  r record;
begin
  perform public.passcode_gate(p_slug, p_passcode);
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

create or replace function public.add_board_reply(p_slug text, p_passcode text, p_thread_id uuid, p_author_name text, p_body text)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $$
declare
  v_team_id uuid;
  v_enabled boolean;
  v_locked boolean;
  v_name text := left(trim(coalesce(p_author_name, '')), 40);
  v_body text := trim(coalesce(p_body, ''));
begin
  perform public.passcode_gate(p_slug, p_passcode);
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

create or replace function public.add_push_subscription(p_slug text, p_passcode text, p_endpoint text, p_p256dh text, p_auth text, p_user_agent text default null::text)
returns void
language plpgsql
security definer
set search_path to ''
as $$
declare v_team_id uuid; v_count int;
begin
  perform public.passcode_gate(p_slug, p_passcode);
  select t.id into v_team_id from public.teams t
  where t.slug = lower(trim(p_slug)) and t.passcode = upper(trim(p_passcode));
  if v_team_id is null then raise exception 'invalid team or passcode'; end if;
  if p_endpoint is null or p_endpoint !~ '^https://' then raise exception 'invalid endpoint'; end if;
  select count(*) into v_count from public.push_subscriptions where team_id = v_team_id;
  if v_count >= 1000 then raise exception 'subscription limit reached'; end if;
  insert into public.push_subscriptions (team_id, endpoint, p256dh, auth, user_agent)
  values (v_team_id, p_endpoint, p_p256dh, p_auth, p_user_agent)
  on conflict (team_id, endpoint) do update
    set p256dh = excluded.p256dh, auth = excluded.auth, user_agent = excluded.user_agent;
end; $$;

create or replace function public.remove_push_subscription(p_slug text, p_passcode text, p_endpoint text)
returns void
language plpgsql
security definer
set search_path to ''
as $$
declare v_team_id uuid;
begin
  perform public.passcode_gate(p_slug, p_passcode);
  select t.id into v_team_id from public.teams t
  where t.slug = lower(trim(p_slug)) and t.passcode = upper(trim(p_passcode));
  if v_team_id is null then raise exception 'invalid team or passcode'; end if;
  delete from public.push_subscriptions where team_id = v_team_id and endpoint = p_endpoint;
end; $$;

create or replace function public.set_push_prefs(p_slug text, p_passcode text, p_endpoint text, p_announcements boolean, p_games boolean, p_schedule boolean)
returns void
language plpgsql
security definer
set search_path to ''
as $$
declare v_team_id uuid;
begin
  perform public.passcode_gate(p_slug, p_passcode);
  select t.id into v_team_id from public.teams t
  where t.slug = lower(trim(p_slug)) and t.passcode = upper(trim(p_passcode));
  if v_team_id is null then raise exception 'invalid team or passcode'; end if;
  update public.push_subscriptions
     set want_announcements = coalesce(p_announcements, want_announcements),
         want_games         = coalesce(p_games, want_games),
         want_schedule      = coalesce(p_schedule, want_schedule)
   where team_id = v_team_id and endpoint = p_endpoint;
end;
$$;

create or replace function public.subscribe_team(p_slug text, p_passcode text, p_email text, p_name text)
returns boolean
language plpgsql
security definer
set search_path to ''
as $$
declare
  v_team_id uuid;
  v_email text := lower(trim(p_email));
begin
  perform public.passcode_gate(p_slug, p_passcode);
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

create or replace function public.upsert_rsvp(p_slug text, p_passcode text, p_event_id uuid, p_player_id uuid, p_status text, p_note text)
returns boolean
language plpgsql
security definer
set search_path to ''
as $$
declare
  v_team_id uuid;
begin
  perform public.passcode_gate(p_slug, p_passcode);
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

create or replace function public.add_team_photo(p_slug text, p_passcode text, p_url text, p_caption text, p_player_id uuid)
returns uuid
language plpgsql
security definer
set search_path to ''
as $$
declare
  v_team_id uuid;
  v_photo_id uuid;
begin
  perform public.passcode_gate(p_slug, p_passcode);
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

create or replace function public.delete_team_photo(p_slug text, p_passcode text, p_photo_id uuid)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $$
declare v_team_id uuid; v_url text; v_deleted int := 0;
begin
  perform public.passcode_gate(p_slug, p_passcode);
  select t.id into v_team_id from public.teams t
  where t.slug = lower(trim(p_slug)) and t.passcode = upper(trim(p_passcode));
  if v_team_id is null then raise exception 'invalid team or passcode'; end if;
  delete from public.photos p
  where p.id = p_photo_id and p.team_id = v_team_id and p.uploaded_by = 'parent'
  returning p.url into v_url;
  get diagnostics v_deleted = row_count;
  return jsonb_build_object('ok', true, 'removed', v_deleted, 'url', v_url);
end; $$;

commit;
