-- Monitor growth: add ai_coach_use + coach_emails (2026-10-02).
--
-- Spec: claude-memory inbox note e9d9dcc1, MTS Claude -> Sydney-side Claude, 2026-10-02
-- (Ron approved the spec in the MTS chat, 10/2 3:34 PM CT).
-- Built by Cloud Claude (sydney project) from the LIVE monitor_growth() body:
-- pg_proc.prosrc md5 7e4a83599eae2047def1b29c037413b2, 11400 chars, read 2026-10-02 ~3:50 PM CT,
-- byte-identical to the body in migrations/20260929150000_monitor_growth_share_and_tools.sql.
-- Every existing key is unchanged, top-level notes included. Three CTEs (aiu,
-- aiu_team, cem) and two keys are ADDITIVE and MTS-only.
--
--   ai_coach_use  {since, note, teams, tools{briefing,practice,lineup,chat ->
--                  uses_7d, uses_all, teams_7d, teams_all}, reach_7d, reach_all
--                  {opened, used, opened_no_use, locked}, by_team[]}.
--                 Source public.ai_coach_events. A row counts when its team is in
--                 monitor_real_teams() and its user_id is null or in
--                 monitor_real_users(). 7d = created_at >= now() - 7 days.
--                 reach counts distinct teams in the window: opened = any counted
--                 row; used = >= 1 tool row; locked = >= 1 locked_view;
--                 opened_no_use = opened and in neither. by_team lists only teams
--                 with >= 1 counted row; its four tool counts are all-time;
--                 ordered by the team's latest row of any kind, newest first,
--                 then name.
--   coach_emails  {since, note, by_kind{welcome,trial_ending,trial_ended,admin ->
--                  sent_7d, sent_all, failed_7d, last_sent_at}, failed_7d,
--                  stuck_sending, coaches_emailed_7d, opted_out,
--                  confirmed_no_welcome, latest[]}.
--                 Source public.coach_emails, rows whose address is a real
--                 user's (lower() on both sides). status 'seeded' is excluded
--                 from every count and from latest; it only stops a coach
--                 being counted in confirmed_no_welcome.
--
-- Deliberately NOT done: the spec suggested a sentence in the top-level notes
-- steering Syd from teams.ai_chat_active_7d to ai_coach_use.tools.chat. That
-- sentence is in ai_coach_use.note instead, so that the pre/post diff of
-- existing keys stays empty.
--
-- Read-only; no new write path. Both source tables have RLS with no policies
-- and are reachable here only because the function is SECURITY DEFINER.
-- Idempotent (create or replace); nothing is removed.
-- Apply: MTS Claude, on Ron's go at apply time; MTS Claude verifies after apply.

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
       ),
       -- ai_coach_use (2026-10-02): the ai_coach_events rows that count. A row
       -- counts when its team is a real team and its user is null or a real
       -- user (same rule as the MTS admin page, src/lib/aiUseSummary.js).
       aiu as (
         select e.team_id, e.kind, e.created_at,
                e.kind in ('briefing', 'practice', 'lineup', 'chat') as is_tool,
                e.created_at >= now() - interval '7 days' as in_7d
         from public.ai_coach_events e
         join t on t.id = e.team_id
         where e.user_id is null or e.user_id in (select u.id from u)
       ),
       -- one row per real team with at least one counted row
       aiu_team as (
         select x.team_id,
                count(*) filter (where x.kind = 'briefing') as briefing,
                count(*) filter (where x.kind = 'practice') as practice,
                count(*) filter (where x.kind = 'lineup') as lineup,
                count(*) filter (where x.kind = 'chat') as chat,
                max(x.created_at) filter (where x.kind = 'hub_view') as last_opened_at,
                max(x.created_at) filter (where x.kind = 'locked_view') as last_locked_at,
                max(x.created_at) filter (where x.is_tool) as last_use_at,
                max(x.created_at) as last_any_at,
                bool_or(x.in_7d) as opened_7d,
                bool_or(x.in_7d and x.is_tool) as used_7d,
                bool_or(x.in_7d and x.kind = 'locked_view') as locked_7d,
                bool_or(x.is_tool) as used_all,
                bool_or(x.kind = 'locked_view') as locked_all
         from aiu x
         group by x.team_id
       ),
       -- coach_emails (2026-10-02): rows addressed to a real user, matched on
       -- the address because coach_id goes null when a profile is removed.
       -- status 'seeded' marks coaches who predate app-sent welcomes and were
       -- never emailed: kept here only for confirmed_no_welcome, and left out
       -- of every count below.
       cem as (
         select c.email, c.kind, c.status, c.subject, c.created_at,
                c.created_at >= now() - interval '7 days' as in_7d
         from public.coach_emails c
         where lower(c.email) in (select lower(u.email) from u)
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
    ),
    'ai_coach_use', jsonb_build_object(
      'since', '2026-10-02T20:27:00Z',
      'note', 'real teams only (monitor_real_teams()), and rows by real users or with no user; counting started at since, nothing earlier exists. A tool row (briefing, practice, lineup, chat) means a result was delivered to a coach. View rows (hub_view = opened with tools available, locked_view = saw the locked card) are at most one per coach per team per day. Prefer tools.chat here over teams.ai_chat_active_7d: that one reads chat messages, which "clear chat" deletes, so it undercounts',
      'teams', (select count(*) from t),
      'tools', jsonb_build_object(
        'briefing', (select jsonb_build_object(
                       'uses_7d', count(*) filter (where in_7d),
                       'uses_all', count(*),
                       'teams_7d', count(distinct team_id) filter (where in_7d),
                       'teams_all', count(distinct team_id))
                     from aiu where kind = 'briefing'),
        'practice', (select jsonb_build_object(
                       'uses_7d', count(*) filter (where in_7d),
                       'uses_all', count(*),
                       'teams_7d', count(distinct team_id) filter (where in_7d),
                       'teams_all', count(distinct team_id))
                     from aiu where kind = 'practice'),
        'lineup', (select jsonb_build_object(
                     'uses_7d', count(*) filter (where in_7d),
                     'uses_all', count(*),
                     'teams_7d', count(distinct team_id) filter (where in_7d),
                     'teams_all', count(distinct team_id))
                   from aiu where kind = 'lineup'),
        'chat', (select jsonb_build_object(
                   'uses_7d', count(*) filter (where in_7d),
                   'uses_all', count(*),
                   'teams_7d', count(distinct team_id) filter (where in_7d),
                   'teams_all', count(distinct team_id))
                 from aiu where kind = 'chat')
      ),
      'reach_7d', (select jsonb_build_object(
                     'opened', count(*) filter (where opened_7d),
                     'used', count(*) filter (where used_7d),
                     'opened_no_use', count(*) filter (where opened_7d and not used_7d and not locked_7d),
                     'locked', count(*) filter (where locked_7d))
                   from aiu_team),
      'reach_all', (select jsonb_build_object(
                      'opened', count(*),
                      'used', count(*) filter (where used_all),
                      'opened_no_use', count(*) filter (where not used_all and not locked_all),
                      'locked', count(*) filter (where locked_all))
                    from aiu_team),
      'by_team', (
        select coalesce(jsonb_agg(jsonb_build_object(
                 'team_id', x.team_id,
                 'name', t.name,
                 'coach_email', t.coach_email,
                 'briefing', x.briefing,
                 'practice', x.practice,
                 'lineup', x.lineup,
                 'chat', x.chat,
                 'last_opened_at', x.last_opened_at,
                 'last_locked_at', x.last_locked_at,
                 'last_use_at', x.last_use_at
               ) order by x.last_any_at desc, t.name), '[]'::jsonb)
        from aiu_team x
        join t on t.id = x.team_id
      )
    ),
    'coach_emails', jsonb_build_object(
      'since', '2026-10-02T19:12:00Z',
      'note', 'emails the app sent to real users, from its own ledger (not Gmail Sent); sending started at since. Automatic kinds: welcome (at email confirm), trial_ending, trial_ended. admin = sent by Ron from the admin panel. Rows with status seeded are coaches who predate app-sent welcomes and were never emailed: excluded from every count and from latest. confirmed_no_welcome is the alarm: a real user who signed up after since, confirmed more than 24 hours ago, has not opted out, and has no welcome',
      'by_kind', jsonb_build_object(
        'welcome', (select jsonb_build_object(
                      'sent_7d', count(*) filter (where status = 'sent' and in_7d),
                      'sent_all', count(*) filter (where status = 'sent'),
                      'failed_7d', count(*) filter (where status = 'failed' and in_7d),
                      'last_sent_at', max(created_at) filter (where status = 'sent'))
                    from cem where kind = 'welcome'),
        'trial_ending', (select jsonb_build_object(
                           'sent_7d', count(*) filter (where status = 'sent' and in_7d),
                           'sent_all', count(*) filter (where status = 'sent'),
                           'failed_7d', count(*) filter (where status = 'failed' and in_7d),
                           'last_sent_at', max(created_at) filter (where status = 'sent'))
                         from cem where kind = 'trial_ending'),
        'trial_ended', (select jsonb_build_object(
                          'sent_7d', count(*) filter (where status = 'sent' and in_7d),
                          'sent_all', count(*) filter (where status = 'sent'),
                          'failed_7d', count(*) filter (where status = 'failed' and in_7d),
                          'last_sent_at', max(created_at) filter (where status = 'sent'))
                        from cem where kind = 'trial_ended'),
        'admin', (select jsonb_build_object(
                    'sent_7d', count(*) filter (where status = 'sent' and in_7d),
                    'sent_all', count(*) filter (where status = 'sent'),
                    'failed_7d', count(*) filter (where status = 'failed' and in_7d),
                    'last_sent_at', max(created_at) filter (where status = 'sent'))
                  from cem where kind = 'admin')
      ),
      'failed_7d', (select count(*) from cem where status = 'failed' and in_7d),
      'stuck_sending', (select count(*) from cem where status = 'sending' and created_at < now() - interval '10 minutes'),
      'coaches_emailed_7d', (select count(distinct lower(email)) from cem where status = 'sent' and in_7d),
      'opted_out', (select count(*) from u join public.profiles p on p.id = u.id where p.email_opt_out),
      'confirmed_no_welcome', (
        select count(*)
        from u
        left join public.profiles p on p.id = u.id
        where u.created_at >= timestamptz '2026-10-02T19:12:00Z'
          and u.email_confirmed_at < now() - interval '24 hours'
          and not coalesce(p.email_opt_out, false)
          and not exists (
                select 1 from cem w
                where w.kind = 'welcome'
                  and w.status in ('sent', 'seeded')
                  and lower(w.email) = lower(u.email))
      ),
      'latest', (
        select coalesce(jsonb_agg(jsonb_build_object(
                 'at', l.created_at,
                 'kind', l.kind,
                 'status', l.status,
                 'email', l.email,
                 'subject', l.subject
               ) order by l.created_at desc), '[]'::jsonb)
        from (select created_at, kind, status, email, subject
              from cem where status <> 'seeded'
              order by created_at desc limit 20) l
      )
    )
  );
$$;
revoke execute on function public.monitor_growth() from public, anon, authenticated;
