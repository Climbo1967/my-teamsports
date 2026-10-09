-- Passcode throttle, second pass (bug sweep 2026-10-09, findings 1 and 2).
--
-- 1. The 2026-10-04 gate inserted the wrong-guess row and then ten of the
--    thirteen passcode functions raised 'invalid team or passcode'. The raise
--    aborts the request's transaction, so the row was rolled back: only
--    get_team_site, get_live_game and get_push_prefs (which return null) ever
--    counted anything. Those ten now return a sentinel instead of raising, so
--    the attempt row commits. The API routes map the sentinel to the same 401.
--
-- 2. The lockout was per team: 60 wrong guesses from anyone and every parent
--    holding the right passcode was refused for the rest of the 15-minute
--    window. It is now per team AND caller IP. Direct REST callers are keyed by
--    the x-forwarded-for the platform sets; our own API routes call with the
--    service role and forward the parent's real IP in x-mts-client-ip, which
--    is trusted only on service-role requests (an anon caller cannot forge it).
--
-- Each request keeps its own per-IP limiter in the Next.js routes; this is
-- the layer that holds when the RPCs are called directly with the public key.

begin;

-- ---------------------------------------------------------------- table
alter table public.passcode_attempts add column if not exists ip text not null default 'none';
alter table public.passcode_attempts drop constraint if exists passcode_attempts_pkey;
alter table public.passcode_attempts add primary key (slug, ip, guess_hash, window_start);
create index if not exists passcode_attempts_window_idx on public.passcode_attempts (window_start);

-- ---------------------------------------------------------------- gate
create or replace function public.passcode_gate(p_slug text, p_passcode text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_slug   text   := lower(trim(coalesce(p_slug, '')));
  v_code   text   := upper(trim(coalesce(p_passcode, '')));
  v_window bigint := floor(extract(epoch from now()) / 900);
  v_hdr    jsonb;
  v_ip     text;
  v_fails  int;
  v_team   uuid;
begin
  -- Caller IP. PostgREST exposes the request headers as a JSON GUC.
  begin
    v_hdr := coalesce(current_setting('request.headers', true), '{}')::jsonb;
  exception when others then
    v_hdr := '{}'::jsonb;
  end;
  if coalesce(auth.role(), '') = 'service_role' and coalesce(v_hdr->>'x-mts-client-ip', '') <> '' then
    v_ip := left(trim(v_hdr->>'x-mts-client-ip'), 64);
  else
    v_ip := left(trim(split_part(coalesce(v_hdr->>'x-forwarded-for', ''), ',', 1)), 64);
  end if;
  if v_ip = '' then v_ip := 'none'; end if;

  select count(*) into v_fails
  from public.passcode_attempts a
  where a.slug = v_slug and a.ip = v_ip and a.window_start = v_window;

  if v_fails >= 60 then
    raise exception 'too many attempts';
  end if;

  select t.id into v_team from public.teams t
  where t.slug = v_slug and t.passcode = v_code;

  if v_team is null then
    -- Prune closed windows (all slugs) and record this guess once.
    delete from public.passcode_attempts a where a.window_start < v_window;
    insert into public.passcode_attempts (slug, ip, guess_hash, window_start)
    values (v_slug, v_ip, md5(v_code), v_window)
    on conflict do nothing;
  end if;

  return v_team;
end;
$$;

revoke all on function public.passcode_gate(text, text) from public, anon, authenticated;
grant execute on function public.passcode_gate(text, text) to service_role;

-- ---------------------------------------------------------------- the ten
-- Each one: gate → null means wrong team or passcode → return the sentinel.
-- jsonb functions return {"error":"invalid team or passcode"}; boolean and
-- uuid functions return null; the three former void functions now return
-- boolean (true on success, null when denied) so a caller can tell.

create or replace function public.get_board(p_slug text, p_passcode text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_team_id uuid;
  v_enabled boolean;
begin
  v_team_id := public.passcode_gate(p_slug, p_passcode);
  if v_team_id is null then return jsonb_build_object('error', 'invalid team or passcode'); end if;
  select t.board_enabled into v_enabled from public.teams t where t.id = v_team_id;
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

create or replace function public.add_board_reply(p_slug text, p_passcode text, p_thread_id uuid, p_author_name text, p_body text)
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
  v_team_id := public.passcode_gate(p_slug, p_passcode);
  if v_team_id is null then return jsonb_build_object('error', 'invalid team or passcode'); end if;
  select t.board_enabled into v_enabled from public.teams t where t.id = v_team_id;
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

create or replace function public.report_board_post(p_slug text, p_passcode text, p_post_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_team_id uuid;
  v_enabled boolean;
  v_team_name text;
  r record;
begin
  v_team_id := public.passcode_gate(p_slug, p_passcode);
  if v_team_id is null then return jsonb_build_object('error', 'invalid team or passcode'); end if;
  select t.board_enabled, t.name into v_enabled, v_team_name from public.teams t where t.id = v_team_id;
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

create or replace function public.delete_team_photo(p_slug text, p_passcode text, p_photo_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare v_team_id uuid; v_url text; v_deleted int := 0;
begin
  v_team_id := public.passcode_gate(p_slug, p_passcode);
  if v_team_id is null then return jsonb_build_object('error', 'invalid team or passcode'); end if;
  delete from public.photos p
  where p.id = p_photo_id and p.team_id = v_team_id and p.uploaded_by = 'parent'
  returning p.url into v_url;
  get diagnostics v_deleted = row_count;
  return jsonb_build_object('ok', true, 'removed', v_deleted, 'url', v_url);
end;
$$;

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
  v_team_id := public.passcode_gate(p_slug, p_passcode);
  if v_team_id is null then return null; end if;

  insert into public.photos (team_id, player_id, url, caption, uploaded_by)
  values (v_team_id, p_player_id, p_url, left(p_caption, 200), 'parent')
  returning id into v_photo_id;

  return v_photo_id;
end;
$$;

create or replace function public.subscribe_team(p_slug text, p_passcode text, p_email text, p_name text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_team_id uuid;
  v_email text := lower(trim(p_email));
begin
  v_team_id := public.passcode_gate(p_slug, p_passcode);
  if v_team_id is null then return null; end if;
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
set search_path = ''
as $$
declare
  v_team_id uuid;
begin
  v_team_id := public.passcode_gate(p_slug, p_passcode);
  if v_team_id is null then return null; end if;
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

-- The three void functions become boolean: a changed return type needs drop + create.
drop function if exists public.add_push_subscription(text, text, text, text, text, text);
create function public.add_push_subscription(p_slug text, p_passcode text, p_endpoint text, p_p256dh text, p_auth text, p_user_agent text default null)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare v_team_id uuid; v_count int;
begin
  v_team_id := public.passcode_gate(p_slug, p_passcode);
  if v_team_id is null then return null; end if;
  if p_endpoint is null or p_endpoint !~ '^https://' then raise exception 'invalid endpoint'; end if;
  select count(*) into v_count from public.push_subscriptions where team_id = v_team_id;
  if v_count >= 1000 then raise exception 'subscription limit reached'; end if;
  insert into public.push_subscriptions (team_id, endpoint, p256dh, auth, user_agent)
  values (v_team_id, p_endpoint, p_p256dh, p_auth, p_user_agent)
  on conflict (team_id, endpoint) do update
    set p256dh = excluded.p256dh, auth = excluded.auth, user_agent = excluded.user_agent;
  return true;
end;
$$;

drop function if exists public.remove_push_subscription(text, text, text);
create function public.remove_push_subscription(p_slug text, p_passcode text, p_endpoint text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare v_team_id uuid;
begin
  v_team_id := public.passcode_gate(p_slug, p_passcode);
  if v_team_id is null then return null; end if;
  delete from public.push_subscriptions where team_id = v_team_id and endpoint = p_endpoint;
  return true;
end;
$$;

drop function if exists public.set_push_prefs(text, text, text, boolean, boolean, boolean);
create function public.set_push_prefs(p_slug text, p_passcode text, p_endpoint text, p_announcements boolean, p_games boolean, p_schedule boolean)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare v_team_id uuid;
begin
  v_team_id := public.passcode_gate(p_slug, p_passcode);
  if v_team_id is null then return null; end if;
  update public.push_subscriptions
     set want_announcements = coalesce(p_announcements, want_announcements),
         want_games         = coalesce(p_games, want_games),
         want_schedule      = coalesce(p_schedule, want_schedule)
   where team_id = v_team_id and endpoint = p_endpoint;
  return true;
end;
$$;

grant execute on function public.add_push_subscription(text, text, text, text, text, text) to anon, authenticated, service_role;
grant execute on function public.remove_push_subscription(text, text, text) to anon, authenticated, service_role;
grant execute on function public.set_push_prefs(text, text, text, boolean, boolean, boolean) to anon, authenticated, service_role;

commit;
