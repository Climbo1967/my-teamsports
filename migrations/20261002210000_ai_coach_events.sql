-- AI Coach use log.
--
-- Before this, only chat left a trace (and "clear chat" deletes it). The
-- briefing, practice planner and lineup advisor stored nothing, so there was no
-- way to tell whether any coach had ever used them, or had even opened the tab.
--
-- One row per event:
--   briefing / practice / lineup / chat   a tool returned a result to a coach
--   hub_view                              a coach opened the AI Coach tab (tools available)
--   locked_view                           a coach opened it and saw the locked card
-- The two view kinds are kept to one row per coach, per team, per day.
--
-- Rows are written only by the server (service-role key) and read only by the
-- admin page through the same key. Coaches and visitors have no access at all.
--
-- Safe to run more than once.

begin;

create table if not exists public.ai_coach_events (
  id          bigint generated always as identity primary key,
  team_id     uuid not null references public.teams(id) on delete cascade,
  user_id     uuid references auth.users(id) on delete set null,
  kind        text not null check (kind in ('briefing', 'practice', 'lineup', 'chat', 'hub_view', 'locked_view')),
  day         date not null default ((now() at time zone 'utc')::date),
  created_at  timestamptz not null default now()
);

create unique index if not exists ai_coach_events_view_once
  on public.ai_coach_events (team_id, user_id, kind, day)
  where kind in ('hub_view', 'locked_view');

create index if not exists ai_coach_events_team_created
  on public.ai_coach_events (team_id, created_at desc);

alter table public.ai_coach_events enable row level security;
revoke all on public.ai_coach_events from anon, authenticated;

commit;
