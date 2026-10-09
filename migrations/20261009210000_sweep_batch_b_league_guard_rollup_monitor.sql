-- Sweep 10/9 batch B — database side.
--
-- 7.  The league-column guard on teams fired on UPDATE only. The INSERT policy
--     checks just coach_id = auth.uid(), and the demo league's id is public
--     (get_league_site('demo')), so a coach could create a team already
--     attached to the paid demo league and get the dashboard free. The guard
--     now fires on INSERT too: league_id / school_id / division_id may be set
--     on a new row only by the server, a site admin, or a scheduler+ of that
--     league (league_create_team runs as a commissioner, so it still works).
-- 9.  trg_game_score_rollup looked the event up by id alone, so a coach
--     inserting game_scores(team_id = own, event_id = another team's league
--     game, status = 'final') wrote that league game's result. The lookup now
--     requires the event to belong to the scoring team.
-- 16. monitor_real_teams called a team 'paid' forever once it had one paid
--     season payment; from Jan 1 a 2026 buyer would read as paid while locked
--     out. 'paid' now also requires paid_through >= today; a lapsed buyer
--     falls through to the other statuses like everyone else.
-- 22. league_match_team (name → team uuid inside a league) was executable by
--     any signed-in user with no league check. It is only called from
--     league_import_games (SECURITY DEFINER), so the grant to authenticated is
--     revoked. league_attach_team now checks that the school and division
--     belong to the league and refuses to pull a team out of a different
--     league.
-- 24. claim_team_invites runs on every /dashboard load; index for its lookup
--     of unclaimed staff rows by email.
--
-- Written without DROP/DELETE statements so the connector can apply it;
-- `create or replace trigger` needs PG 14+ (prod is 17).

-- 7. league columns guard: INSERT + UPDATE -----------------------------------
create or replace function public.guard_team_league_columns()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if tg_op = 'INSERT' then
    if new.league_id is null and new.school_id is null and new.division_id is null then
      return new;
    end if;
    if coalesce(auth.role(), '') = 'service_role' or is_admin() then
      return new;
    end if;
    if new.league_id is not null and is_league_admin(new.league_id, 'scheduler') then
      return new;
    end if;
    raise exception 'Only a league admin can create a team inside a league' using errcode = '42501';
  end if;

  if new.league_id   is distinct from old.league_id
  or new.school_id   is distinct from old.school_id
  or new.division_id is distinct from old.division_id then

    if coalesce(auth.role(), '') = 'service_role' or is_admin() then
      return new;
    end if;

    if old.league_id is not null and not is_league_admin(old.league_id, 'scheduler') then
      raise exception 'Only a league admin can change league assignment';
    end if;
    if new.league_id is not null and not is_league_admin(new.league_id, 'scheduler') then
      raise exception 'Only a league admin can change league assignment';
    end if;
    if old.league_id is null and new.league_id is null then
      raise exception 'Only a league admin can change league assignment';
    end if;
  end if;
  return new;
end;
$$;

create or replace trigger trg_guard_team_league_columns
before insert or update on public.teams
for each row execute function public.guard_team_league_columns();

-- 9. score rollup: the event must belong to the scoring team -----------------
create or replace function public.trg_game_score_rollup()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  e public.events%rowtype;
  g public.league_games%rowtype;
begin
  if new.status <> 'final' or (tg_op = 'UPDATE' and old.status = 'final') then
    return new;
  end if;
  -- team_id check: a coach may only roll up results for their own events.
  select * into e from public.events where id = new.event_id and team_id = new.team_id;
  if not found or e.league_game_id is null then return new; end if;
  select * into g from public.league_games where id = e.league_game_id;
  if not found or g.locked then return new; end if;

  if e.is_home then
    update public.league_games
       set home_score = new.our_score, away_score = new.opp_score,
           status = 'final', score_source = 'home_scorer', finalized_at = now()
     where id = g.id;
  elsif g.score_source is null or g.score_source = 'away_scorer' then
    update public.league_games
       set home_score = new.opp_score, away_score = new.our_score,
           status = 'final', score_source = 'away_scorer', finalized_at = now()
     where id = g.id;
  end if;
  return new;
end;
$$;

-- 16. monitor: 'paid' lapses with paid_through --------------------------------
create or replace function public.monitor_real_teams()
returns table(id uuid, name text, sport text, coach_id uuid, coach_email text, coach_name text,
              coach_last_sign_in timestamptz, created_at timestamptz, trial_ends_at timestamptz,
              paid_through date, ai_paid_through date, ai_trial_ends_at timestamptz, ai_enabled boolean,
              league_slug text, league_paid_through date, school_paid_through date,
              players bigint, events bigint, season_paid bigint, ai_paid bigint,
              last_ai_chat_at timestamptz, status text)
language sql
stable
security definer
set search_path to ''
as $$
  with t as (
    select t.id, t.name, t.sport, t.coach_id, u.email as coach_email, u.full_name as coach_name,
           u.last_sign_in_at as coach_last_sign_in, t.created_at, t.trial_ends_at,
           t.paid_through, t.ai_paid_through, t.ai_trial_ends_at, coalesce(t.ai_enabled, false) as ai_enabled,
           l.slug as league_slug, l.paid_through as league_paid_through, s.paid_through as school_paid_through,
           (select count(*) from public.players p where p.team_id = t.id) as players,
           (select count(*) from public.events e where e.team_id = t.id) as events,
           (select count(*) from public.payments pay where pay.team_id = t.id and pay.status = 'paid' and pay.product = 'season' and pay.amount_cents > 0) as season_paid,
           (select count(*) from public.payments pay where pay.team_id = t.id and pay.status = 'paid' and pay.product = 'ai' and pay.amount_cents > 0) as ai_paid,
           (select max(m.created_at) from public.ai_chat_messages m where m.team_id = t.id) as last_ai_chat_at
    from public.teams t
    join public.monitor_real_users() u on u.id = t.coach_id
    left join public.leagues l on l.id = t.league_id
    left join public.schools s on s.id = t.school_id
    where l.slug is distinct from 'demo'
  )
  select t.*,
    case
      -- 'paid' only while the pass is current; a 2026 buyer is not 'paid' in 2027.
      when season_paid > 0 and paid_through >= current_date then 'paid'
      when league_paid_through >= current_date or school_paid_through >= current_date then 'league'
      when trial_ends_at > now() then 'trial_open'
      when paid_through >= current_date then 'comped'
      else 'expired_unpaid'
    end as status
  from t
$$;

-- 22. league RPCs ---------------------------------------------------------------
revoke execute on function public.league_match_team(uuid, uuid, text) from authenticated;
revoke execute on function public.league_match_team(uuid, uuid, text) from public;

create or replace function public.league_attach_team(p_league_id uuid, p_team_slug text, p_school_id uuid, p_division_id uuid)
returns uuid
language plpgsql
security definer
set search_path to 'public'
as $$
declare v_id uuid; v_current uuid;
begin
  perform public.league_require(p_league_id, 'scheduler');
  if p_school_id is not null and not exists (
      select 1 from public.schools where id = p_school_id and league_id = p_league_id) then
    raise exception 'School is not in this league';
  end if;
  if p_division_id is not null and not exists (
      select 1 from public.divisions d join public.seasons s on s.id = d.season_id
      where d.id = p_division_id and s.league_id = p_league_id) then
    raise exception 'Division is not in this league';
  end if;
  select id, league_id into v_id, v_current from public.teams where slug = lower(trim(p_team_slug));
  if v_id is null then raise exception 'No team with that link'; end if;
  if v_current is not null and v_current <> p_league_id then
    raise exception 'That team already belongs to another league';
  end if;
  update public.teams set league_id = p_league_id, school_id = p_school_id, division_id = p_division_id
  where id = v_id;
  return v_id;
end;
$$;

-- 24. index for claim_team_invites ----------------------------------------------
create index if not exists team_coaches_unclaimed_email_idx
  on public.team_coaches (email) where user_id is null;
