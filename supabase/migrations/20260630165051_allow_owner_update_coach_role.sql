-- Lets a team owner change a staff member's role (promote/demote). team_coaches
-- previously had INSERT/DELETE/SELECT policies but no UPDATE, so role changes were blocked.
create policy "Owner updates coach role" on public.team_coaches
  for update to authenticated
  using (public.is_team_owner(team_id))
  with check (public.is_team_owner(team_id));