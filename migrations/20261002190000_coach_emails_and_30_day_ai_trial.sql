-- 2026-10-02 — coach email log, coach unsubscribe, and a 30-day AI trial for new signups.
--
-- Why (Ron, 2026-10-02): every message a coach got from us was hand-written and
-- hand-sent from Gmail (8 of 25 welcomes went out twice), and the app itself
-- sent nothing after the confirm email: no welcome, no "your trial is ending",
-- no "your trial ended". This adds what the app needs to send those itself:
--
--   1. coach_emails          — one row per email the app sends a coach. It is the
--                              duplicate guard (unique per coach + dedupe_key)
--                              and the record the admin panel shows.
--   2. profiles opt-out      — email_opt_out + an unguessable unsub_token, so
--                              every coach email can carry an unsubscribe link.
--   3. coach_email_opt()     — the unsubscribe / resubscribe RPC (token only).
--   4. coach_email_snapshot()— everything the daily job and the admin panel need
--                              in one call. service_role only.
--   5. AI trial 14 -> 30 days for NEW signups (Ron: "move all to 30 days for
--      now"). Existing coaches are NOT touched: their dates stay as set on
--      2026-10-02.
--
-- Additive and safe to apply before the code ships: nothing live reads or writes
-- any of these objects until the new code is deployed. Idempotent.

begin;

-- 1. Sent log ---------------------------------------------------------------
create table if not exists public.coach_emails (
  id          uuid primary key default gen_random_uuid(),
  coach_id    uuid references public.profiles(id) on delete set null,
  email       text not null,
  kind        text not null,          -- welcome | trial_ending | trial_ended | admin
  dedupe_key  text,                   -- null for one-off admin sends
  subject     text not null,
  team_id     uuid references public.teams(id) on delete set null,
  meta        jsonb not null default '{}'::jsonb,
  provider_id text,                   -- Resend message id
  status      text not null default 'sent',   -- sending | sent | failed | seeded
  sent_by     uuid,                   -- admin's user id for panel sends; null = automatic
  created_at  timestamptz not null default now()
);

-- The duplicate guard: a coach can hold a given key once. The app claims the row
-- BEFORE sending, so two overlapping runs cannot both send. A failed send clears
-- its key so the next run can retry.
create unique index if not exists coach_emails_dedupe
  on public.coach_emails (coach_id, dedupe_key)
  where dedupe_key is not null;
create index if not exists coach_emails_created on public.coach_emails (created_at desc);

-- RLS on with zero policies: only the service role (server code) touches it.
-- Same convention as the admins table.
alter table public.coach_emails enable row level security;
revoke all on public.coach_emails from anon, authenticated;

-- 2. Opt-out on profiles -----------------------------------------------------
alter table public.profiles add column if not exists email_opt_out boolean not null default false;
alter table public.profiles add column if not exists email_opt_out_at timestamptz;
alter table public.profiles add column if not exists unsub_token uuid not null default gen_random_uuid();
create unique index if not exists profiles_unsub_token on public.profiles (unsub_token);

-- 3. Unsubscribe / resubscribe by token --------------------------------------
-- Called from the link in every coach email, so it must work signed-out. The
-- token is a random uuid; knowing it is the only credential.
create or replace function public.coach_email_opt(p_token uuid, p_opt_out boolean default true)
 returns jsonb
 language plpgsql
 security definer
 set search_path to ''
as $function$
declare
  v_id uuid;
begin
  if p_token is null then
    return jsonb_build_object('ok', false);
  end if;
  update public.profiles
     set email_opt_out = coalesce(p_opt_out, true),
         email_opt_out_at = case when coalesce(p_opt_out, true) then now() else null end
   where unsub_token = p_token
  returning id into v_id;
  return jsonb_build_object('ok', v_id is not null, 'opted_out', coalesce(p_opt_out, true));
end;
$function$;

revoke all on function public.coach_email_opt(uuid, boolean) from public;
grant execute on function public.coach_email_opt(uuid, boolean) to anon, authenticated, service_role;

-- 4. One-call snapshot for the daily job and the admin panel -----------------
-- 'excluded' reuses monitor_exclusions (owner / test / baseline accounts), so
-- the automatic emails skip the same accounts the stats skip.
create or replace function public.coach_email_snapshot()
 returns jsonb
 language sql
 stable
 security definer
 set search_path to ''
as $function$
  select jsonb_build_object(
    'now', now(),
    'coaches', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', p.id,
        'email', lower(u.email),
        'full_name', p.full_name,
        'created_at', p.created_at,
        'confirmed', u.email_confirmed_at is not null,
        'opt_out', p.email_opt_out,
        'unsub_token', p.unsub_token,
        'excluded', exists (select 1 from public.monitor_exclusions x where lower(x.email) = lower(u.email)),
        'ai_trial_ends_at', p.ai_trial_ends_at
      ))
      from public.profiles p
      join auth.users u on u.id = p.id
    ), '[]'::jsonb),
    'teams', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', t.id,
        'coach_id', t.coach_id,
        'name', t.name,
        'sport', t.sport,
        'created_at', t.created_at,
        'trial_ends_at', t.trial_ends_at,
        'paid_through', t.paid_through,
        'ai_trial_ends_at', t.ai_trial_ends_at,
        'ai_paid_through', t.ai_paid_through,
        'ai_enabled', t.ai_enabled,
        'league_id', t.league_id,
        'players', (select count(*) from public.players pl where pl.team_id = t.id)
      ))
      from public.teams t
    ), '[]'::jsonb),
    'sent_keys', coalesce((
      select jsonb_agg(jsonb_build_object('coach_id', e.coach_id, 'key', e.dedupe_key))
      from public.coach_emails e
      where e.dedupe_key is not null
    ), '[]'::jsonb)
  );
$function$;

revoke all on function public.coach_email_snapshot() from public, anon, authenticated;
grant execute on function public.coach_email_snapshot() to service_role;

-- Every coach who exists today was welcomed by hand (or can never be reached).
-- Mark them so the automatic welcome only ever goes to signups from here on.
insert into public.coach_emails (coach_id, email, kind, dedupe_key, subject, status)
select p.id, lower(u.email), 'welcome', 'welcome',
       'Welcome (handled by hand before automatic welcomes, 2026-10-02)', 'seeded'
  from public.profiles p
  join auth.users u on u.id = p.id
on conflict do nothing;

-- 5. AI trial: 30 days for new signups ---------------------------------------
-- Still per coach, anchored at signup (Ron's 2026-09-18 model); only the length
-- changes. A coach normally creates their team minutes after signing up, so the
-- AI trial and the team's 30-day trial end the same day.
alter table public.profiles
  alter column ai_trial_ends_at set default (now() + interval '30 days');

create or replace function public.set_team_ai_trial()
 returns trigger
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
begin
  if new.ai_trial_ends_at is null then
    new.ai_trial_ends_at := (select ai_trial_ends_at from public.profiles where id = new.coach_id);
  end if;
  if new.ai_trial_ends_at is null then
    new.ai_trial_ends_at := now() + interval '30 days';
  end if;
  return new;
end $function$;

commit;
