-- Owners must count as coaches/owners even before a team_coaches row exists.
create or replace function public.is_team_coach(p_team_id uuid)
returns boolean language sql stable security definer set search_path to '' as $$
  select exists (
    select 1 from public.team_coaches tc
    where tc.team_id = p_team_id and tc.user_id = auth.uid()
  ) or exists (
    select 1 from public.teams t
    where t.id = p_team_id and t.coach_id = auth.uid()
  );
$$;

create or replace function public.is_team_owner(p_team_id uuid)
returns boolean language sql stable security definer set search_path to '' as $$
  select exists (
    select 1 from public.teams t
    where t.id = p_team_id and t.coach_id = auth.uid()
  ) or exists (
    select 1 from public.team_coaches tc
    where tc.team_id = p_team_id and tc.user_id = auth.uid() and tc.role = 'owner'
  );
$$;

-- Auto-add the creator to team_coaches as owner so the membership model stays consistent.
create or replace function public.add_owner_membership()
returns trigger language plpgsql security definer set search_path to '' as $$
begin
  insert into public.team_coaches (team_id, user_id, email, role)
  select new.id, new.coach_id, u.email, 'owner'
  from auth.users u where u.id = new.coach_id
  on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists trg_add_owner_membership on public.teams;
create trigger trg_add_owner_membership
  after insert on public.teams
  for each row execute function public.add_owner_membership();

-- Backfill: ensure every existing team's owner has a membership row.
insert into public.team_coaches (team_id, user_id, email, role)
select t.id, t.coach_id, u.email, 'owner'
from public.teams t join auth.users u on u.id = t.coach_id
where not exists (
  select 1 from public.team_coaches tc where tc.team_id = t.id and tc.user_id = t.coach_id
)
on conflict do nothing;