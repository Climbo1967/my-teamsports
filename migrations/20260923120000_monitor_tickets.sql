-- Monitor endpoint: tickets (coach support requests) for Sydney, 2026-09-23.
-- Fourth read-only scope alongside growth / trials / coach. Sydney reads the
-- support queue so she can ping Ron when a request lands; Ron works the queue.
-- Same shape as the other monitor_* functions: SECURITY DEFINER, service-role
-- only, exclusions applied inside the function.
--
-- Source table: public.support_requests (coach_id, coach_email, coach_name,
-- team_id, team_name, subject, message, status ['open' | 'resolved'],
-- created_at). No updated_at / priority / admin_notes columns exist, so the
-- response reports updated_at = null, priority = null, has_admin_notes = false;
-- the window filters on created_at only.
--
-- Exclusions match monitor_trials: every email in public.monitor_exclusions,
-- everyone in public.admins, any @example.com address, and any ticket tied to
-- a team in the 'demo' league.
--
-- Mint the token (raw token never stored, sha256 only):
--   insert into public.monitor_tokens (name, scope, token_sha256)
--   values ('sydney-tickets', 'tickets', encode(sha256('<raw token>'::bytea), 'hex'));

-- Widen the scope whitelist so a 'tickets' token can be minted.
alter table public.monitor_tokens drop constraint if exists monitor_tokens_scope_check;
alter table public.monitor_tokens add constraint monitor_tokens_scope_check
  check (scope in ('growth', 'coach', 'trials', 'tickets'));

-- ---------------------------------------------------------------------------
-- tickets: coach support requests. PII (coach email + name) by design.
-- Scope 'tickets'.
--   p_since_hours  window on created_at, clamped 1..336 (default 24)
--   p_status       'open' | 'all' (default 'all'); anything not 'open' = all
--   p_limit        rows, clamped 1..100 (default 20)
--   p_ticket_id    one request by id, in full (message uncapped), window ignored
-- List rows cap message at the first 600 chars and flag message_truncated; a
-- single-ticket fetch (p_ticket_id) returns the whole message, matching the
-- coach-chats "one chat whole" convention. coach_* columns are mapped to
-- user_* in the response so all apps look the same to Sydney.
-- ---------------------------------------------------------------------------
create or replace function public.monitor_tickets(
  p_since_hours int default 24, p_status text default 'all',
  p_limit int default 20, p_ticket_id uuid default null)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with excluded_emails as (
    select email from public.monitor_exclusions
    union
    select lower(email) from public.admins
  ),
  demo_teams as (
    select t.id from public.teams t
    join public.leagues l on l.id = t.league_id
    where l.slug = 'demo'
  ),
  sr as (
    select s.id, s.created_at, s.status, s.coach_email, s.coach_name,
           s.team_name, s.subject, s.message
    from public.support_requests s
    where lower(s.coach_email) not in (select email from excluded_emails)
      and lower(s.coach_email) not like '%@example.com'
      and (s.team_id is null or s.team_id not in (select id from demo_teams))
  ),
  win as (
    -- the window + status population the returned list is a limited slice of
    select * from sr
    where p_ticket_id is null
      and created_at > now() - make_interval(hours => greatest(1, least(coalesce(p_since_hours, 24), 336)))
      and (coalesce(p_status, 'all') <> 'open' or status = 'open')
  ),
  filtered as (
    select * from sr where p_ticket_id is not null and id = p_ticket_id
    union all
    select * from win where p_ticket_id is null
    order by created_at desc
    limit case when p_ticket_id is not null then 1
               else greatest(1, least(coalesce(p_limit, 20), 100)) end
  )
  select jsonb_build_object(
    'generated_at', now(),
    'counts', jsonb_build_object(
      'open_total', (select count(*) from sr where status = 'open'),
      'in_window', case
        when p_ticket_id is not null then (select count(*) from sr where id = p_ticket_id)
        else (select count(*) from win)
      end
    ),
    'tickets', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', f.id,
        'created_at', f.created_at,
        'updated_at', null,
        'status', f.status,
        'priority', null,
        'user_email', f.coach_email,
        'user_name', f.coach_name,
        'team_name', f.team_name,
        'subject', f.subject,
        'message', case when p_ticket_id is not null then f.message else left(f.message, 600) end,
        'message_truncated', case when p_ticket_id is not null then false else char_length(f.message) > 600 end,
        'has_admin_notes', false
      ) order by f.created_at desc)
      from filtered f
    ), '[]'::jsonb)
  );
$$;
revoke execute on function public.monitor_tickets(int, text, int, uuid) from public, anon, authenticated;
