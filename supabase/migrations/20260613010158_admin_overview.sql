-- ============ ADMINS ============
create table public.admins (
  email text primary key check (email = lower(email))
);
alter table public.admins enable row level security;
-- No policies: only SECURITY DEFINER functions read this table.

insert into public.admins (email) values
  ('ron@2bcreations.com'),
  ('support@2bcreations.com');

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.admins a
    join auth.users u on lower(u.email) = a.email
    where u.id = auth.uid()
  );
$$;
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- ============ ADMIN OVERVIEW (cross-team, admin-only) ============
create or replace function public.admin_overview()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  select jsonb_build_object(
    'totals', jsonb_build_object(
      'coaches', (select count(distinct coalesce(lower(u.email), tc.email))
                  from auth.users u full outer join public.team_coaches tc on lower(u.email) = tc.email),
      'signed_up', (select count(*) from auth.users),
      'invited_pending', (select count(*) from public.team_coaches where user_id is null),
      'teams', (select count(*) from public.teams),
      'players', (select count(*) from public.players),
      'events', (select count(*) from public.events),
      'photos', (select count(*) from public.photos),
      'subscribers', (select count(*) from public.subscribers)
    ),
    'teams', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', t.id, 'name', t.name, 'sport', t.sport, 'season', t.season,
        'slug', t.slug, 'created_at', t.created_at,
        'players', (select count(*) from public.players p where p.team_id = t.id),
        'coach_emails', (select coalesce(jsonb_agg(tc.email), '[]'::jsonb)
                         from public.team_coaches tc where tc.team_id = t.id)
      ) order by t.created_at desc)
      from public.teams t
    ), '[]'::jsonb),
    'coaches', coalesce((
      select jsonb_agg(c order by c->>'joined_at' desc)
      from (
        select jsonb_build_object(
          'email', coalesce(lower(u.email), tc.email),
          'full_name', max(p.full_name),
          'signed_up', bool_or(u.id is not null),
          'last_sign_in_at', max(u.last_sign_in_at),
          'joined_at', min(coalesce(u.created_at, tc.created_at)),
          'roles', coalesce(jsonb_agg(distinct tc.role) filter (where tc.role is not null), '[]'::jsonb),
          'sports', coalesce(jsonb_agg(distinct t.sport) filter (where t.sport is not null), '[]'::jsonb),
          'teams', coalesce(jsonb_agg(distinct t.name) filter (where t.name is not null), '[]'::jsonb)
        ) as c
        from auth.users u
        full outer join public.team_coaches tc on lower(u.email) = tc.email
        left join public.profiles p on p.id = u.id
        left join public.teams t on t.id = tc.team_id
        group by coalesce(lower(u.email), tc.email)
      ) sub
    ), '[]'::jsonb)
  ) into result;

  return result;
end;
$$;
revoke execute on function public.admin_overview() from public, anon;
grant execute on function public.admin_overview() to authenticated;