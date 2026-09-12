-- League layer: coach invites that actually hand the team over.
--   * league_invite_coach(team, email) — commissioner-only. Upserts a
--     team_coaches row with role 'owner' (pending head coach) and returns what
--     the invite email needs. Idempotent: re-inviting the same email is a no-op
--     row-wise, so "Resend invite" is safe.
--   * promote_league_head_coach — when that pending 'owner' row is claimed
--     (claim_team_invites sets user_id on login/signup), teams.coach_id moves to
--     the coach. The commissioner keeps their own 'owner' membership row, so
--     they can still help; the coach is now the real owner for billing/AI/etc.
--   * league_create_team no longer inserts the invite itself — the console
--     calls league_invite_coach right after, so one path sends the email.

create or replace function public.league_invite_coach(p_team_id uuid, p_email text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  t public.teams%rowtype; l public.leagues%rowtype; v_email text; v_user uuid; v_row public.team_coaches%rowtype;
begin
  select * into t from public.teams where id = p_team_id;
  if not found or t.league_id is null then raise exception 'Not a league team'; end if;
  perform public.league_require(t.league_id, 'commissioner');
  select * into l from public.leagues where id = t.league_id;

  v_email := lower(trim(coalesce(p_email, '')));
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'Enter a valid email'; end if;
  select id into v_user from auth.users where lower(email) = v_email limit 1;

  insert into public.team_coaches (team_id, email, role, user_id)
  values (p_team_id, v_email, 'owner', v_user)
  on conflict (team_id, email) do update
    set role = 'owner',
        user_id = coalesce(public.team_coaches.user_id, excluded.user_id)
  returning * into v_row;

  -- Already has an account? Hand the team over right now.
  if v_row.user_id is not null and t.coach_id <> v_row.user_id then
    update public.teams set coach_id = v_row.user_id where id = p_team_id;
  end if;

  return jsonb_build_object(
    'team_name', t.name, 'slug', t.slug, 'passcode', t.passcode, 'sport', t.sport,
    'league_name', l.name, 'league_slug', l.slug, 'is_public', l.is_public,
    'already_signed_up', v_row.user_id is not null, 'email', v_email);
end;
$$;

create or replace function public.promote_league_head_coach()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.user_id is not null and old.user_id is null and new.role = 'owner' then
    update public.teams
       set coach_id = new.user_id
     where id = new.team_id and league_id is not null and coach_id <> new.user_id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_promote_league_head_coach on public.team_coaches;
create trigger trg_promote_league_head_coach
  after update of user_id on public.team_coaches
  for each row execute function public.promote_league_head_coach();

-- league_create_team: drop the inline invite insert (console now calls league_invite_coach).
create or replace function public.league_create_team(p_league_id uuid, p_school_id uuid, p_division_id uuid,
  p_name text, p_sport text, p_coach_email text)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_id uuid; v_slug text; v_base text; v_n int := 0; v_pass text := '';
  v_school text; v_season text; v_chars text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; i int;
begin
  perform public.league_require(p_league_id, 'commissioner');
  if auth.uid() is null then raise exception 'Sign in required'; end if;
  if p_school_id is not null and not exists (select 1 from public.schools where id = p_school_id and league_id = p_league_id) then
    raise exception 'School is not in this league';
  end if;
  if p_division_id is not null and not exists (
      select 1 from public.divisions d join public.seasons s on s.id = d.season_id
      where d.id = p_division_id and s.league_id = p_league_id) then
    raise exception 'Division is not in this league';
  end if;

  select coalesce(sc.short_name, sc.name) into v_school from public.schools sc where sc.id = p_school_id;
  select s.name into v_season from public.divisions d join public.seasons s on s.id = d.season_id where d.id = p_division_id;

  v_base := public.slugify(coalesce(v_school || ' ', '') || p_name);
  if v_base = '' then raise exception 'Team name required'; end if;
  loop
    v_slug := case when v_n = 0 then v_base else v_base || '-' || v_n end;
    exit when not exists (select 1 from public.teams where slug = v_slug);
    v_n := v_n + 1;
  end loop;
  for i in 1..6 loop
    v_pass := v_pass || substr(v_chars, 1 + floor(random() * length(v_chars))::int, 1);
  end loop;

  insert into public.teams (coach_id, slug, name, sport, season, passcode, league_id, school_id, division_id)
  values (auth.uid(), v_slug, trim(p_name), p_sport, v_season, v_pass, p_league_id, p_school_id, p_division_id)
  returning id into v_id;

  -- p_coach_email kept for signature compatibility; the console invites separately.
  return v_id;
end;
$$;

revoke all on function public.league_invite_coach(uuid, text) from public, anon;
grant execute on function public.league_invite_coach(uuid, text) to authenticated, service_role;
revoke all on function public.promote_league_head_coach() from public, anon, authenticated;
