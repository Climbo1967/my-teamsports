-- Batch 3 of the 2026-10-03 bug sweep (findings 11 and 13). Ron said go
-- 2026-10-04.
--
-- 1. A coach email claimed as "sending" and then interrupted (function killed,
--    Resend call hung, final status write failed) used to count as sent forever:
--    coach_email_snapshot() listed every row with a dedupe_key, so the planner
--    never offered that email again and the unique index blocked a new claim.
--    Now a row still "sending" after 10 minutes is left out of sent_keys, and
--    src/lib/coachEmail.js releases such a row and claims again. The interval
--    here and STALE_SENDING_MINUTES in that file must agree.
--
-- 2. The 2026-10-02 seed marked every existing profile as already welcomed,
--    including sign-ups that had not confirmed their email. When one of them
--    confirms later, the welcome hook finds the key taken and sends nothing.
--    Those seed rows give up their key (status stays "seeded" for the record),
--    so the confirm hook can claim it and send the welcome.
--
-- Safe to run more than once.

begin;

create or replace function public.coach_email_snapshot()
returns jsonb
language sql
stable
security definer
set search_path to ''
as $$
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
        -- A claim left in "sending" this long was interrupted; let the planner
        -- offer the email again (src/lib/coachEmail.js releases the row).
        and not (e.status = 'sending' and e.created_at < now() - interval '10 minutes')
    ), '[]'::jsonb)
  );
$$;

-- Seed rows for sign-ups that had not confirmed when the seed ran: give the
-- key back so the welcome goes out when (if) they confirm.
update public.coach_emails e
   set dedupe_key = null,
       meta = coalesce(e.meta, '{}'::jsonb) || jsonb_build_object('key_released', 'unconfirmed at seed time', 'released_at', now())
  from auth.users u
 where u.id = e.coach_id
   and e.kind = 'welcome'
   and e.status = 'seeded'
   and e.dedupe_key = 'welcome'
   and u.email_confirmed_at is null;

commit;
