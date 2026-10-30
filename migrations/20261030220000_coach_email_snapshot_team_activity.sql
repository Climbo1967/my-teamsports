-- Coach nudge emails (Ron approved the wording and said go, 2026-10-30).
-- coach_email_snapshot() gains three per-team counts so the planner can tell a
-- team that has been set up from one that has not: events (anything on the
-- schedule), games (event_type = 'game') and plays (play board). Additive:
-- every existing key is unchanged.
--
-- Safe to run more than once.

begin;

create or replace function public.coach_email_snapshot()
returns jsonb
language sql
stable
security definer
set search_path = ''
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
        'players', (select count(*) from public.players pl where pl.team_id = t.id),
        'events', (select count(*) from public.events ev where ev.team_id = t.id),
        'games', (select count(*) from public.events ev where ev.team_id = t.id and ev.event_type = 'game'),
        'plays', (select count(*) from public.plays py where py.team_id = t.id)
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

revoke all on function public.coach_email_snapshot() from public, anon, authenticated;
grant execute on function public.coach_email_snapshot() to service_role;

commit;
