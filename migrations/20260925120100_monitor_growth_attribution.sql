-- Monitor growth: split paying and trial->paid by first-touch signup source (2026-09-25).
--
-- Adds two ADDITIVE keys to public.monitor_growth() so Sydney's growth tool
-- reads one structure on both apps (QKM shipped the same keys 2026-09-25):
--
--   paying_by_source         array of {source, paying}. All-time. Σ paying =
--                            funnel.paid (coach with >=1 Stripe season payment
--                            > $0). Ordered paying desc, source.
--   trial_to_paid_by_source  {cohort:{window_start, window_end, lookback_days,
--                            trial_days, decision_buffer_days, maturity_days,
--                            signups, paid, paying_now, rate},
--                            by_source:[{source, signups, paid, paying_now, rate}]}
--
-- Cohort (mirrors QKM, trial length adapted): signups in the trailing 90 days
-- that are at least maturity_days old, so every member has had time to convert
-- or lapse. MTS season trial = 30 days (teams.trial_ends_at default) + 7-day
-- decision buffer = maturity 37 days. paid = coach ever made a season payment
-- (drives rate); paying_now = coach with a team whose paid_through >= today.
-- Both returned so a convert-then-lapse isn't hidden. rate = round(paid /
-- signups, 4); null when signups = 0.
--
-- Source bucket (identical rule to QKM's SOURCE_BUCKET_SQL):
--   signup_landing_path IS NULL          -> 'unknown'   (pre-attribution; never guessed)
--   else coalesce(signup_source,                          (utm_source / ?src=)
--                 host(signup_referrer) without www.,
--                 '(direct)')
--
-- Every existing key is unchanged. Exclusions unchanged (monitor_real_users /
-- monitor_real_teams: monitor_exclusions, admins, @example.com, demo league).
-- Read-only; no new write path. Counts only — never per-user rows.
-- monitor_real_users() has a fixed return signature without signup_referrer,
-- so the bucket joins public.profiles here rather than widening that shared
-- function (trials + coach scopes depend on it).

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
       ),
       -- first-touch source bucket per real user (QKM rule)
       src as (
         select u.id, u.created_at,
                case when p.signup_landing_path is null then 'unknown'
                     else coalesce(
                            p.signup_source,
                            regexp_replace(substring(p.signup_referrer from '^https?://([^/?#]+)'), '^www[.]', ''),
                            '(direct)')
                end as source
         from u
         left join public.profiles p on p.id = u.id
       ),
       -- per coach: ever paid a season; currently in a paid season
       coach_pay as (
         select coach_id,
                bool_or(season_paid > 0) as paid_ever,
                bool_or(season_paid > 0 and paid_through >= current_date) as paying_now
         from t
         group by coach_id
       ),
       -- trial->paid cohort: trailing 90d signups at least maturity_days (37) old
       cohort as (
         select s.source,
                coalesce(cp.paid_ever, false) as paid_ever,
                coalesce(cp.paying_now, false) as paying_now
         from src s
         left join coach_pay cp on cp.coach_id = s.id
         where s.created_at >= now() - interval '90 days'
           and s.created_at <  now() - interval '37 days'
       )
  select jsonb_build_object(
    'generated_at', now(),
    'notes', 'paid = Stripe payment with amount > 0; comped = paid_through set with no payment; league = unlocked by a league/school paid_through; demo league, admins and @example.com excluded. paying_by_source / trial_to_paid_by_source added 2026-09-25: first-touch source, unknown = signed up before attribution (never guessed); paying = coach with >=1 season payment (sum = funnel.paid)',
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
    ),
    'paying_by_source', (
      select coalesce(jsonb_agg(jsonb_build_object('source', source, 'paying', n) order by n desc, source), '[]'::jsonb)
      from (select s.source, count(*) as n
            from src s
            join coach_pay cp on cp.coach_id = s.id and cp.paid_ever
            group by 1) pbs
    ),
    'trial_to_paid_by_source', jsonb_build_object(
      'cohort', (
        select jsonb_build_object(
          'window_start', now() - interval '90 days',
          'window_end', now() - interval '37 days',
          'lookback_days', 90,
          'trial_days', 30,
          'decision_buffer_days', 7,
          'maturity_days', 37,
          'signups', count(*),
          'paid', count(*) filter (where paid_ever),
          'paying_now', count(*) filter (where paying_now),
          'rate', round(count(*) filter (where paid_ever)::numeric / nullif(count(*), 0), 4)
        )
        from cohort
      ),
      'by_source', (
        select coalesce(jsonb_agg(jsonb_build_object(
                 'source', source,
                 'signups', signups,
                 'paid', paid,
                 'paying_now', paying_now,
                 'rate', round(paid::numeric / nullif(signups, 0), 4)
               ) order by signups desc, source), '[]'::jsonb)
        from (select source,
                     count(*) as signups,
                     count(*) filter (where paid_ever) as paid,
                     count(*) filter (where paying_now) as paying_now
              from cohort group by 1) bs
      )
    )
  );
$$;
revoke execute on function public.monitor_growth() from public, anon, authenticated;
