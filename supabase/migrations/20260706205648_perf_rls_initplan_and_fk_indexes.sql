-- Performance advisor fixes 2026-07-06.
-- 1) Wrap auth.uid() in (select ...) so RLS evaluates it once per query, not per row.
--    Logic is unchanged — identical policies, cheaper plan.

alter policy "Users manage own profile" on public.profiles
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

alter policy "Coach creates own team" on public.teams
  with check ((select auth.uid()) = coach_id);

alter policy "Members view teams" on public.teams
  using ((coach_id = (select auth.uid())) or is_team_coach(id));

alter policy "Members update team" on public.teams
  using ((coach_id = (select auth.uid())) or is_team_coach(id))
  with check ((coach_id = (select auth.uid())) or is_team_coach(id));

alter policy "Owner deletes team" on public.teams
  using ((coach_id = (select auth.uid())) or is_team_owner(id));

alter policy "support_insert_own" on public.support_requests
  with check (coach_id = (select auth.uid()));

alter policy "support_select_own_or_admin" on public.support_requests
  using ((coach_id = (select auth.uid())) or is_admin());

-- 2) Covering indexes for all flagged foreign keys (joins + cascade deletes).

create index if not exists at_bats_team_idx on public.at_bats (team_id);
create index if not exists game_lineups_player_idx on public.game_lineups (player_id);
create index if not exists game_lineups_team_idx on public.game_lineups (team_id);
create index if not exists game_scores_pitcher_idx on public.game_scores (pitcher_id);
create index if not exists game_scores_team_idx on public.game_scores (team_id);
create index if not exists photos_player_idx on public.photos (player_id);
create index if not exists pitching_lines_team_idx on public.pitching_lines (team_id);
create index if not exists rsvps_player_idx on public.rsvps (player_id);
create index if not exists rsvps_team_idx on public.rsvps (team_id);
create index if not exists scoring_plays_player_idx on public.scoring_plays (player_id);
create index if not exists scoring_plays_team_idx on public.scoring_plays (team_id);
create index if not exists stats_player_idx on public.stats (player_id);
create index if not exists support_requests_coach_idx on public.support_requests (coach_id);
create index if not exists support_requests_team_idx on public.support_requests (team_id);
