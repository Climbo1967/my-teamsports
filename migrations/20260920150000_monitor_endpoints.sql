-- Monitor endpoints for Sydney (Ron's local assistant), 2026-09-20.
-- Same shape as the QKM monitor: bearer tokens hashed in monitor_tokens, one
-- scope per token, revocable with a single UPDATE. The Next routes under
-- /api/monitor/* check the token with the service-role client and then call
-- the read-only functions below. Nothing here is reachable by anon or
-- authenticated users: RLS with no policies on the table, and EXECUTE on the
-- functions is revoked from everyone but the service role (which bypasses),
-- matching the 2026-07-06 revoke-default-grants convention.
--
-- Revoke a token:  update public.monitor_tokens set revoked_at = now() where name = '...';
-- Mint a token:    insert into public.monitor_tokens (name, scope, token_sha256)
--                  values ('sydney-growth', 'growth', encode(sha256('<raw token>'::bytea), 'hex'));
--
-- Exclusions (every function): every email in public.monitor_exclusions,
-- everyone in public.admins, any @example.com address, and every team in the
-- 'demo' league. monitor_exclusions ships EMPTY: Ron's own and test accounts
-- are inserted DB-side after this migration is applied, so no personal address
-- ever lands in the repo. Reviewed with the MTS project 2026-09-20.

create table if not exists public.monitor_tokens (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  scope text not null check (scope in ('growth', 'coach', 'trials')),
  token_sha256 text not null unique check (token_sha256 ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now(),
  revoked_at timestamptz,
  last_used_at timestamptz
);
alter table public.monitor_tokens enable row level security;
revoke all on public.monitor_tokens from public, anon, authenticated;

-- Accounts the monitor must never count or name. Rows are inserted DB-side
-- (never in the repo):  insert into public.monitor_exclusions (email, note)
-- values ('<address>', 'owner');
create table if not exists public.monitor_exclusions (
  email text primary key check (email = lower(email)),
  note text,
  created_at timestamptz not null default now()
);
alter table public.monitor_exclusions enable row level security;
revoke all on public.monitor_exclusions from public, anon, authenticated;

-- Real coaches: auth.users minus the exclusions (monitor_exclusions, admins, @example.com). Shared by all three functions.
create or replace function public.monitor_real_users()
returns table (id uuid, email text, full_name text, created_at timestamptz, email_confirmed_at timestamptz,
               last_sign_in_at timestamptz, signup_landing_path text, signup_source text, ai_trial_ends_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select u.id, lower(u.email), p.full_name, u.created_at, u.email_confirmed_at, u.last_sign_in_at,
         p.signup_landing_path, p.signup_source, p.ai_trial_ends_at
  from auth.users u
  left join public.profiles p on p.id = u.id
  where lower(u.email) not in (select x.email from public.monitor_exclusions x)
    and lower(u.email) not in (select a.email from public.admins a)
    and lower(u.email) not like '%@example.com'
$$;
revoke execute on function public.monitor_real_users() from public, anon, authenticated;

-- Real teams: teams of real coaches, minus the demo league, with the billing
-- facts resolved. "paid" = a Stripe payment with amount_cents > 0 (status has
-- only ever been 'paid'; a 100% promo code writes a $0 row). paid_through
-- alone is NOT payment: the 2026-07-06 billing migration comped then-existing
-- teams to 2026-12-31. A current league or school paid_through unlocks a team
-- with no payments row at all, and league money never appears in payments.
create or replace function public.monitor_real_teams()
returns table (id uuid, name text, sport text, coach_id uuid, coach_email text, coach_name text,
               coach_last_sign_in timestamptz, created_at timestamptz, trial_ends_at timestamptz,
               paid_through date, ai_paid_through date, ai_trial_ends_at timestamptz, ai_enabled boolean,
               league_slug text, league_paid_through date, school_paid_through date,
               players bigint, events bigint, season_paid bigint, ai_paid bigint, last_ai_chat_at timestamptz,
               status text)
language sql
stable
security definer
set search_path = ''
as $$
  with t as (
    select t.id, t.name, t.sport, t.coach_id, u.email as coach_email, u.full_name as coach_name,
           u.last_sign_in_at as coach_last_sign_in, t.created_at, t.trial_ends_at,
           t.paid_through, t.ai_paid_through, t.ai_trial_ends_at, coalesce(t.ai_enabled, false) as ai_enabled,
           l.slug as league_slug, l.paid_through as league_paid_through, s.paid_through as school_paid_through,
           (select count(*) from public.players p where p.team_id = t.id) as players,
           (select count(*) from public.events e where e.team_id = t.id) as events,
           (select count(*) from public.payments pay where pay.team_id = t.id and pay.status = 'paid' and pay.product = 'season' and pay.amount_cents > 0) as season_paid,
           (select count(*) from public.payments pay where pay.team_id = t.id and pay.status = 'paid' and pay.product = 'ai' and pay.amount_cents > 0) as ai_paid,
           (select max(m.created_at) from public.ai_chat_messages m where m.team_id = t.id) as last_ai_chat_at
    from public.teams t
    join public.monitor_real_users() u on u.id = t.coach_id
    left join public.leagues l on l.id = t.league_id
    left join public.schools s on s.id = t.school_id
    where l.slug is distinct from 'demo'
  )
  select t.*,
    case
      when season_paid > 0 then 'paid'
      when league_paid_through >= current_date or school_paid_through >= current_date then 'league'
      when trial_ends_at > now() then 'trial_open'
      when paid_through >= current_date then 'comped'
      else 'expired_unpaid'
    end as status
  from t
$$;
revoke execute on function public.monitor_real_teams() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- growth: aggregates only. No names, no emails. Scope 'growth'.
-- ---------------------------------------------------------------------------
create or replace function public.monitor_growth()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with u as (select * from public.monitor_real_users()),
       t as (select * from public.monitor_real_teams()),
       pay as (
         select pay.* from public.payments pay
         join t on t.id = pay.team_id
         where pay.status = 'paid' and pay.amount_cents > 0
       )
  select jsonb_build_object(
    'generated_at', now(),
    'notes', 'paid = Stripe payment with amount > 0; comped = paid_through set with no payment; league = unlocked by a league/school paid_through; demo league, admins and @example.com excluded',
    'signups', jsonb_build_object(
      'total', (select count(*) from u),
      'confirmed', (select count(*) from u where email_confirmed_at is not null),
      'last_7d', (select count(*) from u where created_at > now() - interval '7 days'),
      'last_30d', (select count(*) from u where created_at > now() - interval '30 days'),
      'signed_in_7d', (select count(*) from u where last_sign_in_at > now() - interval '7 days'),
      'no_team_yet', (select count(*) from u where not exists (select 1 from t where t.coach_id = u.id)),
      'latest_at', (select max(created_at) from u)
    ),
    'funnel', jsonb_build_object(
      'signed_up', (select count(*) from u),
      'confirmed', (select count(*) from u where email_confirmed_at is not null),
      'created_team', (select count(distinct coach_id) from t),
      'added_players', (select count(distinct coach_id) from t where players > 0),
      'paid', (select count(distinct coach_id) from t where season_paid > 0),
      'rates', jsonb_build_object(
        'confirmed_of_signups', (select round(count(*) filter (where email_confirmed_at is not null)::numeric / nullif(count(*), 0), 4) from u),
        'team_of_confirmed', (select round((select count(distinct coach_id) from t)::numeric / nullif(count(*) filter (where email_confirmed_at is not null), 0), 4) from u),
        'players_of_team', (select round(count(distinct coach_id) filter (where players > 0)::numeric / nullif(count(distinct coach_id), 0), 4) from t),
        'paid_of_team', (select round(count(distinct coach_id) filter (where season_paid > 0)::numeric / nullif(count(distinct coach_id), 0), 4) from t)
      )
    ),
    'teams', jsonb_build_object(
      'total', (select count(*) from t),
      'with_players', (select count(*) from t where players > 0),
      'players_total', (select coalesce(sum(players), 0) from t),
      'by_status', (select coalesce(jsonb_object_agg(status, n), '{}'::jsonb) from (select status, count(*) as n from t group by status) s),
      'trial_ending_7d', (select count(*) from t where status = 'trial_open' and trial_ends_at <= now() + interval '7 days'),
      'access_active', (select count(*) from t where status in ('paid', 'league', 'trial_open', 'comped')),
      'ai_trial_open', (select count(*) from t where ai_trial_ends_at > now() and ai_paid = 0 and not ai_enabled),
      'ai_paid', (select count(*) from t where ai_paid > 0),
      'ai_paid_through_current', (select count(*) from t where ai_paid_through >= current_date),
      'ai_comped', (select count(*) from t where ai_enabled and ai_paid = 0),
      'ai_chat_active_7d', (select count(*) from t where last_ai_chat_at > now() - interval '7 days'),
      'by_sport', (select coalesce(jsonb_object_agg(sport, n), '{}'::jsonb) from (select sport, count(*) as n from t group by sport) s)
    ),
    'revenue', jsonb_build_object(
      'currency', 'usd',
      'all_time_cents', (select coalesce(sum(amount_cents), 0) from pay),
      'last_30d_cents', (select coalesce(sum(amount_cents), 0) from pay where created_at > now() - interval '30 days'),
      'last_90d_cents', (select coalesce(sum(amount_cents), 0) from pay where created_at > now() - interval '90 days'),
      'payments_total', (select count(*) from pay),
      'latest_at', (select max(created_at) from pay),
      'note', 'season/AI Stripe payments only; league and school billing is not in the payments table'
    ),
    'landing_paths_30d', (
      select coalesce(jsonb_agg(jsonb_build_object('path', path, 'signups', n) order by n desc), '[]'::jsonb)
      from (select coalesce(signup_landing_path, '(unknown)') as path, count(*) as n
            from u where created_at > now() - interval '30 days' group by 1 order by n desc limit 10) lp
    )
  );
$$;
revoke execute on function public.monitor_growth() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- trials: per-team board. PII (coach name + email) by design. Scope 'trials'.
-- ---------------------------------------------------------------------------
create or replace function public.monitor_trials()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with u as (select * from public.monitor_real_users()),
       t as (select * from public.monitor_real_teams())
  select jsonb_build_object(
    'generated_at', now(),
    'counts', (select coalesce(jsonb_object_agg(status, n), '{}'::jsonb) from (select status, count(*) as n from t group by status) c),
    'teams', coalesce((
      select jsonb_agg(jsonb_build_object(
        'team_id', id, 'team', name, 'sport', sport, 'status', status,
        'coach_name', coach_name, 'coach_email', coach_email, 'coach_last_sign_in', coach_last_sign_in,
        'players', players, 'events', events, 'created_at', created_at,
        'trial_ends_at', trial_ends_at, 'paid_through', paid_through,
        'league', league_slug, 'league_paid_through', league_paid_through, 'school_paid_through', school_paid_through,
        'ai_trial_ends_at', ai_trial_ends_at, 'ai_paid_through', ai_paid_through, 'ai_enabled', ai_enabled,
        'season_payments', season_paid, 'ai_payments', ai_paid, 'last_ai_chat_at', last_ai_chat_at
      ) order by
        case status when 'expired_unpaid' then 0 when 'trial_open' then 1 when 'comped' then 2 when 'league' then 3 else 4 end,
        players desc, trial_ends_at asc)
      from t
    ), '[]'::jsonb),
    'no_team_yet', coalesce((
      select jsonb_agg(jsonb_build_object('coach_name', u.full_name, 'coach_email', u.email, 'signed_up', u.created_at,
        'confirmed', u.email_confirmed_at is not null, 'last_sign_in', u.last_sign_in_at,
        'ai_trial_ends_at', u.ai_trial_ends_at, 'landing_path', u.signup_landing_path) order by u.created_at desc)
      from u where not exists (select 1 from t where t.coach_id = u.id)
    ), '[]'::jsonb)
  );
$$;
revoke execute on function public.monitor_trials() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- coach chats: AI Coach transcripts (public.ai_chat_messages). PII by design.
-- Scope 'coach'. A chat is one (team, coach) pair; the coach can hard-delete
-- it from the app ("clear"), so an empty history is not "never used".
-- Default returns METADATA ONLY (counts and times): transcripts carry kids'
-- names from rosters. p_content = true includes messages, cut to the newest 40
-- per chat (flagged); p_chat = '<team_id>:<coach_id>' returns that chat whole.
-- ---------------------------------------------------------------------------
create or replace function public.monitor_coach_chats(
  p_since_hours int default 24, p_limit int default 10,
  p_chat text default null, p_content boolean default false)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with t as (select * from public.monitor_real_teams()),
  chats as (
    select m.team_id, m.coach_id, count(*) as messages,
           count(*) filter (where m.role = 'user') as coach_messages,
           min(m.created_at) as first_at, max(m.created_at) as last_at
    from public.ai_chat_messages m
    join t on t.id = m.team_id
    where (p_chat is not null and (m.team_id::text || ':' || m.coach_id::text) = p_chat)
       or (p_chat is null and m.created_at > now() - make_interval(hours => greatest(1, least(coalesce(p_since_hours, 24), 336))))
    group by m.team_id, m.coach_id
    order by last_at desc
    limit case when p_chat is not null then 1 else greatest(1, least(coalesce(p_limit, 10), 50)) end
  )
  select jsonb_build_object(
    'generated_at', now(),
    'window_hours', case when p_chat is null then greatest(1, least(coalesce(p_since_hours, 24), 336)) else null end,
    'content_included', (p_chat is not null or coalesce(p_content, false)),
    'chats', coalesce((
      select jsonb_agg(jsonb_build_object(
        'chat_id', c.team_id::text || ':' || c.coach_id::text,
        'team', t.name, 'sport', t.sport, 'team_status', t.status,
        'coach_name', t.coach_name, 'coach_email', t.coach_email,
        'messages_total', c.messages, 'coach_messages', c.coach_messages, 'first_at', c.first_at, 'last_at', c.last_at,
        'truncated', (p_chat is null and c.messages > 40),
        'messages', case when (p_chat is not null or coalesce(p_content, false)) then (
          select jsonb_agg(jsonb_build_object('role', x.role, 'content', x.content, 'at', x.created_at) order by x.created_at)
          from (
            select role, content, created_at from public.ai_chat_messages m
            where m.team_id = c.team_id and m.coach_id = c.coach_id
            order by created_at desc
            limit case when p_chat is not null then null else 40 end
          ) x
        ) else null end
      ) order by c.last_at desc)
      from chats c
      join t on t.id = c.team_id
    ), '[]'::jsonb)
  );
$$;
revoke execute on function public.monitor_coach_chats(int, int, text, boolean) from public, anon, authenticated;
