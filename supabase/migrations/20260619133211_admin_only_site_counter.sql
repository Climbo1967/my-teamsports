-- Private hit counter: anon can increment, only admins can read (via admin_overview).
create table if not exists public.site_counter (
  id text primary key,
  views bigint not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.site_counter enable row level security;
-- Intentionally NO RLS policies: the table is reachable only through
-- SECURITY DEFINER functions below. Anon/auth direct select/insert/update are blocked.

insert into public.site_counter (id, views) values ('homepage', 0), ('team', 0)
  on conflict (id) do nothing;

-- Increment a counter. Validates the key so anon can't create junk rows.
create or replace function public.bump_counter(p_key text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_key not in ('homepage','team') then
    return;
  end if;
  insert into public.site_counter (id, views, updated_at)
    values (p_key, 1, now())
  on conflict (id) do update
    set views = public.site_counter.views + 1, updated_at = now();
end;
$$;

revoke all on function public.bump_counter(text) from public;
grant execute on function public.bump_counter(text) to anon, authenticated;

-- Extend admin_overview to surface the (admin-only) counts.
create or replace function public.admin_overview()
 returns jsonb
 language plpgsql
 stable security definer
 set search_path to ''
as $function$
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
      'subscribers', (select count(*) from public.subscribers),
      'homepage_views', (select coalesce(views,0) from public.site_counter where id = 'homepage'),
      'team_views', (select coalesce(views,0) from public.site_counter where id = 'team')
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
$function$;