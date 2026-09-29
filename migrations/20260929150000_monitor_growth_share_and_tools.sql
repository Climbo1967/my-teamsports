-- Monitor growth: add share_actions + coach_tools (2026-09-29).
--
-- Spec: SydneyKB\_handoffs\to-sydney-claude\2026-09-29-1450-from-mts-claude-spec-monitor-growth-share-actions-and-coach-tools.md
-- Built by Cloud Claude from the LIVE monitor_growth() body (pg_proc, checked
-- identical to migrations/20260925120100_monitor_growth_attribution.sql apart
-- from the three inline comments and CRLF line endings). Every existing key is
-- unchanged; the two new keys are ADDITIVE and MTS-only (QKM has no share action
-- and no coach tools, so nothing is mirrored there).
--
--   share_actions  {since, invite_copied, team_site_viewed, parent_site_views,
--                   homepage_views, note}. Global cumulative site_counter tallies.
--                   invite_copied / team_site_viewed went live 2026-09-29
--                   19:31Z at 0; their rows may not exist yet, so a missing row
--                   reads as 0. parent_site_views = site_counter 'team' (coach
--                   previews excluded since e1e8f8f); homepage_views = 'homepage'.
--   coach_tools    {note, teams, teams_with_any_tool_use,
--                   teams_with_any_tool_use_30d, plays_created, games_scored,
--                   stat_lines, announcements, events_created, by_team[]}.
--                   Real teams only (monitor_real_teams(), no re-implemented
--                   exclusions). games_scored = distinct game_scores.event_id,
--                   no status filter. stats has no timestamp: all-time only,
--                   excluded from recency and _30d. by_team lists only teams
--                   with >= 1 tool action, ordered by last_tool_use_at desc.
--
-- Why: Syd's 2026-09-29 wizard review found the share counters invisible to
-- /api/monitor/* and the coach-tool value path (Playbook, Scorekeeper, stats,
-- announcements) unmeasured in her read path. With these she can answer
-- "was the gate the value block" (team_site_viewed deltas) and "do activated
-- coaches use the tools or just the site" (teams_with_any_tool_use vs
-- funnel.roster_3plus).
--
-- Read-only; no new write path. site_counter has RLS with no policies and is
-- reachable here only because the function is SECURITY DEFINER.
-- Idempotent (create or replace). Apply: Supabase SQL editor (the connector's
-- production guard blocks apply_migration); MTS Claude verifies after apply.

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
       ),
       -- share_actions (2026-09-29): global site_counter tallies. The two share
       -- counters were created empty on 2026-09-29; a missing row reads as 0.
       ctr as (
         select id, views from public.site_counter
       ),
       -- coach_tools (2026-09-29): per real team, has the coach used anything
       -- beyond the site. stats has no timestamp, so it counts all-time only
       -- and is left out of the recency and _30d figures.
       tools as (
         select t.id as team_id, t.name, t.coach_email,
                (select count(*) from public.plays p where p.team_id = t.id) as plays,
                (select count(*) from public.plays p where p.team_id = t.id and p.created_at >= now() - interval '30 days') as plays_30d,
                (select count(distinct gs.event_id) from public.game_scores gs where gs.team_id = t.id) as games_scored,
                (select count(distinct gs.event_id) from public.game_scores gs where gs.team_id = t.id and gs.updated_at >= now() - interval '30 days') as games_scored_30d,
                (select count(*) from public.stats s where s.team_id = t.id) as stat_lines,
                (select count(*) from public.announcements a where a.team_id = t.id) as announcements,
                (select count(*) from public.announcements a where a.team_id = t.id and a.created_at >= now() - interval '30 days') as announcements_30d,
                (select count(*) from public.events e where e.team_id = t.id) as events,
                (select count(*) from public.events e where e.team_id = t.id and e.created_at >= now() - interval '30 days') as events_30d,
                greatest(
                  (select max(p.created_at) from public.plays p where p.team_id = t.id),
                  (select max(gs.updated_at) from public.game_scores gs where gs.team_id = t.id),
                  (select max(a.created_at) from public.announcements a where a.team_id = t.id),
                  (select max(e.created_at) from public.events e where e.team_id = t.id)
                ) as last_tool_use_at
         from t
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
    ),
    'share_actions', jsonb_build_object(
      'since', '2026-09-29T19:31:00Z',
      'invite_copied', (select coalesce(max(views), 0) from ctr where id = 'invite_copied'),
      'team_site_viewed', (select coalesce(max(views), 0) from ctr where id = 'team_site_viewed'),
      'parent_site_views', (select coalesce(max(views), 0) from ctr where id = 'team'),
      'homepage_views', (select coalesce(max(views), 0) from ctr where id = 'homepage'),
      'note', 'global cumulative tallies, not per-coach; snapshot daily to get deltas'
    ),
    'coach_tools', jsonb_build_object(
      'note', 'real teams only (monitor_real_teams()); all-time unless suffixed _30d',
      'teams', (select count(*) from tools),
      'teams_with_any_tool_use', (select count(*) from tools where plays + games_scored + stat_lines + announcements + events > 0),
      'teams_with_any_tool_use_30d', (select count(*) from tools where plays_30d + games_scored_30d + announcements_30d + events_30d > 0),
      'plays_created', (select coalesce(sum(plays), 0) from tools),
      'games_scored', (select coalesce(sum(games_scored), 0) from tools),
      'stat_lines', (select coalesce(sum(stat_lines), 0) from tools),
      'announcements', (select coalesce(sum(announcements), 0) from tools),
      'events_created', (select coalesce(sum(events), 0) from tools),
      'by_team', (
        select coalesce(jsonb_agg(jsonb_build_object(
                 'team_id', team_id,
                 'name', name,
                 'coach_email', coach_email,
                 'plays', plays,
                 'games_scored', games_scored,
                 'stat_lines', stat_lines,
                 'announcements', announcements,
                 'events', events,
                 'last_tool_use_at', last_tool_use_at
               ) order by last_tool_use_at desc nulls last, name), '[]'::jsonb)
        from tools
        where plays + games_scored + stat_lines + announcements + events > 0
      )
    )
  );
$$;
revoke execute on function public.monitor_growth() from public, anon, authenticated;
