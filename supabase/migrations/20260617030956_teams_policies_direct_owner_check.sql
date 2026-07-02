-- Add a direct row-column owner check so INSERT...RETURNING (.select() after insert) works.
-- The function-based is_team_coach subqueries teams, which a brand-new row isn't reliably
-- visible to during RETURNING; comparing coach_id = auth.uid() reads the new row directly.

drop policy if exists "Members view teams" on public.teams;
create policy "Members view teams" on public.teams for select
  using (coach_id = auth.uid() or public.is_team_coach(id));

drop policy if exists "Members update team" on public.teams;
create policy "Members update team" on public.teams for update
  using (coach_id = auth.uid() or public.is_team_coach(id))
  with check (coach_id = auth.uid() or public.is_team_coach(id));

drop policy if exists "Owner deletes team" on public.teams;
create policy "Owner deletes team" on public.teams for delete
  using (coach_id = auth.uid() or public.is_team_owner(id));