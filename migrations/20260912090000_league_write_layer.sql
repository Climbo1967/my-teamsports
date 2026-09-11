-- League layer, steps 4+5: the write side.
--   * league_games ⇄ events mirroring (one league game = one event per team)
--   * coaches cannot move/delete a mirrored event (league admin reschedules)
--   * scorekeeper final → league_games roll-up (home team authoritative,
--     away team's final only fills an unreported game; admin override + lock)
--   * SECURITY DEFINER RPCs for the league admin console (every one checks
--     is_league_admin(...) inside — security-review standing rule)
-- All additive. With zero league rows every trigger below is a no-op for the
-- live coaches.

-- ---------------------------------------------------------------------------
-- 0. Sync flag: set inside our own sync so the events guard lets it through.
-- ---------------------------------------------------------------------------
create or replace function public.league_sync_active()
returns boolean language sql stable as $$
  select coalesce(current_setting('mts.league_sync', true), '') = '1';
$$;

-- Display label for a league team as its opponents see it: "St. Mark's Varsity
-- Boys" unless the team name already carries the school.
create or replace function public.league_team_label(p_team_id uuid)
returns text language sql stable security definer set search_path = public as $$
  select case
    when sc.id is not null
         and position(lower(coalesce(sc.short_name, sc.name)) in lower(t.name)) = 0
      then coalesce(sc.short_name, sc.name) || ' ' || t.name
    else t.name end
  from public.teams t
  left join public.schools sc on sc.id = t.school_id
  where t.id = p_team_id;
$$;

-- ---------------------------------------------------------------------------
-- 1. Guard mirrored events: coaches may edit notes/result only.
-- ---------------------------------------------------------------------------
create or replace function public.guard_league_event()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if public.league_sync_active() or coalesce(auth.role(), '') = 'service_role' then
    return case when tg_op = 'DELETE' then old else new end;
  end if;
  if tg_op = 'DELETE' then
    if old.league_game_id is not null then
      raise exception 'This is a league game — only the league admin can remove it.';
    end if;
    return old;
  end if;
  if old.league_game_id is not null then
    if new.starts_at        is distinct from old.starts_at
    or new.opponent         is distinct from old.opponent
    or new.location         is distinct from old.location
    or new.event_type       is distinct from old.event_type
    or new.title            is distinct from old.title
    or new.team_id          is distinct from old.team_id
    or new.league_game_id   is distinct from old.league_game_id
    or new.opponent_team_id is distinct from old.opponent_team_id
    or new.is_home          is distinct from old.is_home then
      raise exception 'This is a league game — the league admin controls its date, opponent and location.';
    end if;
  elsif new.league_game_id is not null then
    raise exception 'Only the league can link an event to a league game.';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_guard_league_event on public.events;
create trigger trg_guard_league_event
  before update or delete on public.events
  for each row execute function public.guard_league_event();

-- Coaches also must not INSERT an event pre-linked to a league game.
create or replace function public.guard_league_event_insert()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.league_game_id is not null
     and not public.league_sync_active()
     and coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Only the league can link an event to a league game.';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_guard_league_event_insert on public.events;
create trigger trg_guard_league_event_insert
  before insert on public.events
  for each row execute function public.guard_league_event_insert();

-- ---------------------------------------------------------------------------
-- 2. Mirror one league game into its two team events (idempotent).
-- ---------------------------------------------------------------------------
create or replace function public.league_sync_events(p_game_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  g          public.league_games%rowtype;
  v_home_lbl text;
  v_away_lbl text;
  v_home_res text;
  v_away_res text;
  v_title    text;
begin
  select * into g from public.league_games where id = p_game_id;
  if not found then return; end if;

  perform set_config('mts.league_sync', '1', true);

  -- Drop mirrors for teams no longer on this game (team swapped or unset).
  delete from public.events e
  where e.league_game_id = g.id
    and (e.team_id is distinct from g.home_team_id and e.team_id is distinct from g.away_team_id);

  v_home_lbl := public.league_team_label(g.home_team_id);
  v_away_lbl := public.league_team_label(g.away_team_id);

  if g.status in ('final', 'forfeit') and g.home_score is not null and g.away_score is not null then
    v_home_res := case when g.home_score > g.away_score then 'W'
                       when g.home_score < g.away_score then 'L' else 'T' end
                  || ' ' || g.home_score || '-' || g.away_score;
    v_away_res := case when g.away_score > g.home_score then 'W'
                       when g.away_score < g.home_score then 'L' else 'T' end
                  || ' ' || g.away_score || '-' || g.home_score;
  else
    v_home_res := null; v_away_res := null;
  end if;

  v_title := case g.status when 'postponed' then 'POSTPONED'
                           when 'cancelled' then 'CANCELLED' else null end;

  if g.home_team_id is not null then
    insert into public.events (team_id, event_type, title, opponent, location, starts_at,
                               result, league_game_id, opponent_team_id, is_home)
    values (g.home_team_id, 'game', v_title, coalesce(v_away_lbl, 'TBD'), g.location, g.starts_at,
            v_home_res, g.id, g.away_team_id, true)
    on conflict (league_game_id, team_id) where league_game_id is not null do update
      set title = excluded.title, opponent = excluded.opponent, location = excluded.location,
          starts_at = excluded.starts_at, result = excluded.result,
          opponent_team_id = excluded.opponent_team_id, is_home = true;
  end if;

  if g.away_team_id is not null then
    insert into public.events (team_id, event_type, title, opponent, location, starts_at,
                               result, league_game_id, opponent_team_id, is_home)
    values (g.away_team_id, 'game', v_title, coalesce(v_home_lbl, 'TBD'), g.location, g.starts_at,
            v_away_res, g.id, g.home_team_id, false)
    on conflict (league_game_id, team_id) where league_game_id is not null do update
      set title = excluded.title, opponent = excluded.opponent, location = excluded.location,
          starts_at = excluded.starts_at, result = excluded.result,
          opponent_team_id = excluded.opponent_team_id, is_home = false;
  end if;

  perform set_config('mts.league_sync', '0', true);
end;
$$;

create or replace function public.trg_league_game_sync()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'DELETE' then
    perform set_config('mts.league_sync', '1', true);
    delete from public.events where league_game_id = old.id;
    perform set_config('mts.league_sync', '0', true);
    return old;
  end if;
  perform public.league_sync_events(new.id);
  return new;
end;
$$;

drop trigger if exists trg_league_game_sync on public.league_games;
create trigger trg_league_game_sync
  after insert or update of home_team_id, away_team_id, starts_at, location, status,
                           home_score, away_score
  on public.league_games
  for each row execute function public.trg_league_game_sync();

drop trigger if exists trg_league_game_unmirror on public.league_games;
create trigger trg_league_game_unmirror
  before delete on public.league_games
  for each row execute function public.trg_league_game_sync();

-- ---------------------------------------------------------------------------
-- 3. Scorekeeper roll-up: game_scores → league_games on final.
--    Home team authoritative. Away team's final only lands on a game nobody
--    has reported yet. Admin results are locked and never overwritten.
-- ---------------------------------------------------------------------------
create or replace function public.trg_game_score_rollup()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  e public.events%rowtype;
  g public.league_games%rowtype;
begin
  if new.status <> 'final' or (tg_op = 'UPDATE' and old.status = 'final') then
    return new;
  end if;
  select * into e from public.events where id = new.event_id;
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

drop trigger if exists trg_game_score_rollup on public.game_scores;
create trigger trg_game_score_rollup
  after insert or update of status on public.game_scores
  for each row execute function public.trg_game_score_rollup();

-- ---------------------------------------------------------------------------
-- 4. Admin console RPCs. Roles: commissioner ≥ scheduler ≥ scorer.
-- ---------------------------------------------------------------------------
create or replace function public.league_require(p_league_id uuid, p_role text)
returns void language plpgsql stable security definer set search_path = public as $$
begin
  if not (public.is_league_admin(p_league_id, p_role) or public.is_admin()) then
    raise exception 'Not authorized for this league (% needed).', p_role using errcode = '42501';
  end if;
end;
$$;

create or replace function public.slugify(p text)
returns text language sql immutable as $$
  select trim(both '-' from regexp_replace(regexp_replace(lower(p), '[^a-z0-9\s-]', '', 'g'), '[\s-]+', '-', 'g'));
$$;

-- Leagues the caller administers (dashboard nav + /dashboard/leagues).
create or replace function public.my_leagues()
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', l.id, 'slug', l.slug, 'name', l.name, 'short_name', l.short_name,
    'is_public', l.is_public, 'paid_through', l.paid_through, 'role', la.role)
    order by l.name), '[]'::jsonb)
  from public.leagues l
  join public.league_admins la on la.league_id = l.id
  where la.user_id = auth.uid()
     or la.email = lower(coalesce(auth.jwt() ->> 'email', ''));
$$;

-- Everything the console needs for one league, in one call.
create or replace function public.get_league_admin(p_league_id uuid)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare v_out jsonb;
begin
  perform public.league_require(p_league_id, 'scorer');
  select jsonb_build_object(
    'league', (select to_jsonb(l) from public.leagues l where l.id = p_league_id),
    'role', (select la.role from public.league_admins la
              where la.league_id = p_league_id
                and (la.user_id = auth.uid() or la.email = lower(coalesce(auth.jwt() ->> 'email', '')))
              order by case la.role when 'commissioner' then 3 when 'scheduler' then 2 else 1 end desc
              limit 1),
    'seasons', coalesce((select jsonb_agg(to_jsonb(s) order by s.starts_on desc nulls last, s.name)
                         from public.seasons s where s.league_id = p_league_id), '[]'::jsonb),
    'divisions', coalesce((select jsonb_agg(to_jsonb(d) order by d.sort_order, d.name)
                           from public.divisions d join public.seasons s on s.id = d.season_id
                           where s.league_id = p_league_id), '[]'::jsonb),
    'schools', coalesce((select jsonb_agg(to_jsonb(sc) order by sc.name)
                         from public.schools sc where sc.league_id = p_league_id), '[]'::jsonb),
    'teams', coalesce((select jsonb_agg(jsonb_build_object(
                'id', t.id, 'name', t.name, 'slug', t.slug, 'sport', t.sport,
                'school_id', t.school_id, 'division_id', t.division_id,
                'paid_through', t.paid_through, 'trial_ends_at', t.trial_ends_at,
                'passcode', t.passcode,
                'coaches', (select coalesce(jsonb_agg(jsonb_build_object('email', tc.email, 'role', tc.role, 'claimed', tc.user_id is not null)), '[]'::jsonb)
                            from public.team_coaches tc where tc.team_id = t.id),
                'players', (select count(*) from public.players p where p.team_id = t.id)
              ) order by t.name)
              from public.teams t where t.league_id = p_league_id), '[]'::jsonb),
    'games', coalesce((select jsonb_agg(to_jsonb(g) order by g.starts_at)
                       from public.league_games g where g.league_id = p_league_id), '[]'::jsonb),
    'admins', coalesce((select jsonb_agg(jsonb_build_object('id', la.id, 'email', la.email, 'role', la.role, 'claimed', la.user_id is not null) order by la.email)
                        from public.league_admins la where la.league_id = p_league_id), '[]'::jsonb)
  ) into v_out;
  return v_out;
end;
$$;

create or replace function public.league_create_season(p_league_id uuid, p_name text, p_sport text,
  p_starts_on date, p_ends_on date, p_is_current boolean)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  perform public.league_require(p_league_id, 'commissioner');
  if p_is_current then
    update public.seasons set is_current = false where league_id = p_league_id and sport = p_sport;
  end if;
  insert into public.seasons (league_id, name, sport, starts_on, ends_on, is_current)
  values (p_league_id, trim(p_name), p_sport, p_starts_on, p_ends_on, coalesce(p_is_current, false))
  returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.league_create_division(p_season_id uuid, p_name text, p_sort_order int)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_league uuid; v_id uuid;
begin
  select league_id into v_league from public.seasons where id = p_season_id;
  if v_league is null then raise exception 'Season not found'; end if;
  perform public.league_require(v_league, 'commissioner');
  insert into public.divisions (season_id, name, sort_order)
  values (p_season_id, trim(p_name), coalesce(p_sort_order, 0))
  returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.league_create_school(p_league_id uuid, p_name text, p_short_name text, p_city text)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid; v_slug text; v_base text; v_n int := 0;
begin
  perform public.league_require(p_league_id, 'commissioner');
  v_base := public.slugify(p_name);
  if v_base = '' then raise exception 'School name required'; end if;
  loop
    v_slug := case when v_n = 0 then v_base else v_base || '-' || v_n end;
    exit when not exists (select 1 from public.schools where league_id = p_league_id and slug = v_slug);
    v_n := v_n + 1;
  end loop;
  insert into public.schools (league_id, slug, name, short_name, city)
  values (p_league_id, v_slug, trim(p_name), nullif(trim(p_short_name), ''), nullif(trim(p_city), ''))
  returning id into v_id;
  return v_id;
end;
$$;

-- Creates a team inside the league, owned by the calling admin as placeholder.
-- If p_coach_email is given, a coach invite row is added so the coach's own
-- signup/login (claim_team_invites) attaches them; the admin stays owner for v1.
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

  if nullif(trim(p_coach_email), '') is not null then
    insert into public.team_coaches (team_id, email, role)
    values (v_id, lower(trim(p_coach_email)), 'coach')
    on conflict do nothing;
  end if;
  return v_id;
end;
$$;

-- Attach an existing (self-signed-up) team by slug. Scheduler+.
create or replace function public.league_attach_team(p_league_id uuid, p_team_slug text, p_school_id uuid, p_division_id uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  perform public.league_require(p_league_id, 'scheduler');
  select id into v_id from public.teams where slug = lower(trim(p_team_slug));
  if v_id is null then raise exception 'No team with that link'; end if;
  update public.teams set league_id = p_league_id, school_id = p_school_id, division_id = p_division_id
  where id = v_id;
  return v_id;
end;
$$;

create or replace function public.league_add_admin(p_league_id uuid, p_email text, p_role text)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public.league_require(p_league_id, 'commissioner');
  if p_role not in ('commissioner', 'scheduler', 'scorer') then raise exception 'Bad role'; end if;
  insert into public.league_admins (league_id, email, role, user_id)
  values (p_league_id, lower(trim(p_email)), p_role,
          (select id from auth.users where lower(email) = lower(trim(p_email)) limit 1));
end;
$$;

create or replace function public.league_match_team(p_league_id uuid, p_division_id uuid, p_text text)
returns uuid language plpgsql stable security definer set search_path = public as $$
declare v_id uuid; v_t text := lower(trim(coalesce(p_text, '')));
begin
  if v_t = '' then return null; end if;
  -- 1. exact team name in the division
  select t.id into v_id from public.teams t
  where t.league_id = p_league_id and t.division_id = p_division_id and lower(t.name) = v_t limit 1;
  if v_id is not null then return v_id; end if;
  -- 2. "School Team" label
  select t.id into v_id from public.teams t
  where t.league_id = p_league_id and t.division_id = p_division_id
    and lower(public.league_team_label(t.id)) = v_t limit 1;
  if v_id is not null then return v_id; end if;
  -- 3. school name / short name, if that school has exactly one team in the division
  select t.id into v_id from public.teams t join public.schools sc on sc.id = t.school_id
  where t.league_id = p_league_id and t.division_id = p_division_id
    and (lower(sc.name) = v_t or lower(coalesce(sc.short_name, '')) = v_t or sc.slug = public.slugify(v_t))
    and (select count(*) from public.teams t2
          where t2.division_id = p_division_id and t2.school_id = sc.id) = 1
  limit 1;
  return v_id;
end;
$$;

-- Schedule import. p_rows: [{import_key, division, home, away, starts_local
-- ('YYYY-MM-DD HH24:MI', league-local time), location}]. Dry run unless
-- p_commit. Returns per-row outcome so the UI can show a diff first.
-- Team matching, in order: exact team name within the division; "School Team"
-- label; school name alone when that school has exactly one team in the division.
create or replace function public.league_import_games(p_league_id uuid, p_season_id uuid, p_rows jsonb, p_commit boolean)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  r jsonb; v_out jsonb := '[]'::jsonb; v_i int := 0;
  v_div uuid; v_home uuid; v_away uuid; v_ts timestamptz; v_key text; v_loc text;
  v_existing public.league_games%rowtype; v_action text; v_err text;
  n_create int := 0; n_update int := 0; n_same int := 0; n_err int := 0;
begin
  perform public.league_require(p_league_id, 'scheduler');
  if not exists (select 1 from public.seasons where id = p_season_id and league_id = p_league_id) then
    raise exception 'Season is not in this league';
  end if;

  for r in select * from jsonb_array_elements(coalesce(p_rows, '[]'::jsonb)) loop
    v_i := v_i + 1; v_err := null; v_action := null;
    v_div := null; v_home := null; v_away := null; v_ts := null; v_key := null; v_loc := null;

    select d.id into v_div from public.divisions d
    where d.season_id = p_season_id and lower(d.name) = lower(trim(r->>'division')) limit 1;
    if v_div is null then v_err := 'Unknown division "' || coalesce(r->>'division', '') || '"'; end if;

    if v_err is null then
      v_home := public.league_match_team(p_league_id, v_div, r->>'home');
      if v_home is null then v_err := 'Unknown home team "' || coalesce(r->>'home', '') || '"'; end if;
    end if;
    if v_err is null then
      v_away := public.league_match_team(p_league_id, v_div, r->>'away');
      if v_away is null then v_err := 'Unknown away team "' || coalesce(r->>'away', '') || '"'; end if;
    end if;
    if v_err is null and v_home = v_away then v_err := 'Home and away are the same team'; end if;

    if v_err is null then
      begin
        v_ts := (r->>'starts_local')::timestamp at time zone 'America/Chicago';
      exception when others then
        v_err := 'Bad date/time "' || coalesce(r->>'starts_local', '') || '"';
      end;
    end if;

    if v_err is null then
      v_loc := nullif(trim(coalesce(r->>'location', '')), '');
      v_key := nullif(trim(coalesce(r->>'import_key', '')), '');
      if v_key is null then
        v_key := lower(r->>'division') || '|' || v_home || '|' || v_away || '|' || to_char(v_ts at time zone 'America/Chicago', 'YYYY-MM-DD');
      end if;
      select * into v_existing from public.league_games where league_id = p_league_id and import_key = v_key;
      if not found then
        v_action := 'create';
        if p_commit then
          insert into public.league_games (league_id, season_id, division_id, home_team_id, away_team_id, starts_at, location, import_key, score_source)
          values (p_league_id, p_season_id, v_div, v_home, v_away, v_ts, v_loc, v_key, null);
        end if;
      elsif v_existing.division_id is distinct from v_div or v_existing.home_team_id is distinct from v_home
         or v_existing.away_team_id is distinct from v_away or v_existing.starts_at is distinct from v_ts
         or v_existing.location is distinct from v_loc then
        if v_existing.locked or v_existing.status in ('final', 'forfeit') then
          v_action := 'skip'; v_err := 'Already final — edit it in Results instead';
        else
          v_action := 'update';
          if p_commit then
            update public.league_games
               set division_id = v_div, home_team_id = v_home, away_team_id = v_away,
                   starts_at = v_ts, location = v_loc, season_id = p_season_id
             where id = v_existing.id;
          end if;
        end if;
      else
        v_action := 'unchanged';
      end if;
    end if;

    if v_err is not null and v_action is null then v_action := 'error'; end if;
    case v_action when 'create' then n_create := n_create + 1;
                  when 'update' then n_update := n_update + 1;
                  when 'unchanged' then n_same := n_same + 1;
                  else n_err := n_err + 1; end case;

    v_out := v_out || jsonb_build_object('row', v_i, 'action', v_action, 'error', v_err,
                                         'import_key', v_key, 'starts_at', v_ts,
                                         'home_team_id', v_home, 'away_team_id', v_away, 'division_id', v_div);
  end loop;

  return jsonb_build_object('committed', p_commit, 'create', n_create, 'update', n_update,
                            'unchanged', n_same, 'errors', n_err, 'rows', v_out);
end;
$$;

-- Single-game edits (reschedule / postpone / cancel). Scheduler+.
create or replace function public.league_update_game(p_game_id uuid, p_starts_local text, p_location text, p_status text)
returns void language plpgsql security definer set search_path = public as $$
declare g public.league_games%rowtype; v_ts timestamptz;
begin
  select * into g from public.league_games where id = p_game_id;
  if not found then raise exception 'Game not found'; end if;
  perform public.league_require(g.league_id, 'scheduler');
  if p_status is not null and p_status not in ('scheduled', 'postponed', 'cancelled') then
    raise exception 'Use league_set_result for finals';
  end if;
  v_ts := case when nullif(trim(coalesce(p_starts_local, '')), '') is null then g.starts_at
               else (p_starts_local::timestamp at time zone 'America/Chicago') end;
  update public.league_games
     set starts_at = v_ts,
         location = coalesce(nullif(trim(p_location), ''), location),
         status = coalesce(p_status, status),
         home_score = case when coalesce(p_status, status) in ('scheduled','postponed','cancelled') then null else home_score end,
         away_score = case when coalesce(p_status, status) in ('scheduled','postponed','cancelled') then null else away_score end,
         score_source = case when coalesce(p_status, status) in ('scheduled','postponed','cancelled') then null else score_source end,
         locked = case when coalesce(p_status, status) in ('scheduled','postponed','cancelled') then false else locked end
   where id = g.id;
end;
$$;

-- Admin result entry / override. Scorer+. Locks by default.
create or replace function public.league_set_result(p_game_id uuid, p_home_score int, p_away_score int, p_status text, p_lock boolean)
returns void language plpgsql security definer set search_path = public as $$
declare g public.league_games%rowtype;
begin
  select * into g from public.league_games where id = p_game_id;
  if not found then raise exception 'Game not found'; end if;
  perform public.league_require(g.league_id, 'scorer');
  if p_status not in ('final', 'forfeit') then raise exception 'Status must be final or forfeit'; end if;
  update public.league_games
     set home_score = p_home_score, away_score = p_away_score, status = p_status,
         score_source = 'admin', finalized_at = now(), finalized_by = auth.uid(),
         locked = coalesce(p_lock, true)
   where id = g.id;
end;
$$;

create or replace function public.league_delete_game(p_game_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare g public.league_games%rowtype;
begin
  select * into g from public.league_games where id = p_game_id;
  if not found then return; end if;
  perform public.league_require(g.league_id, 'scheduler');
  delete from public.league_games where id = g.id;
end;
$$;

create or replace function public.league_update_settings(p_league_id uuid, p_name text, p_short_name text,
  p_primary_color text, p_website text, p_contact_email text, p_is_public boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public.league_require(p_league_id, 'commissioner');
  update public.leagues
     set name = coalesce(nullif(trim(p_name), ''), name),
         short_name = coalesce(nullif(trim(p_short_name), ''), short_name),
         primary_color = coalesce(nullif(trim(p_primary_color), ''), primary_color),
         website = nullif(trim(coalesce(p_website, '')), ''),
         contact_email = nullif(trim(coalesce(p_contact_email, '')), ''),
         is_public = coalesce(p_is_public, is_public)
   where id = p_league_id;
end;
$$;

-- Grants: authenticated only. Anon gets nothing here.
revoke all on function public.league_sync_active() from public, anon;
revoke all on function public.league_team_label(uuid) from public, anon;
revoke all on function public.league_sync_events(uuid) from public, anon, authenticated;
revoke all on function public.league_require(uuid, text) from public, anon;
revoke all on function public.slugify(text) from public, anon;
do $$
declare f text;
begin
  foreach f in array array[
    'my_leagues()', 'get_league_admin(uuid)',
    'league_create_season(uuid,text,text,date,date,boolean)',
    'league_create_division(uuid,text,int)',
    'league_create_school(uuid,text,text,text)',
    'league_create_team(uuid,uuid,uuid,text,text,text)',
    'league_attach_team(uuid,text,uuid,uuid)',
    'league_add_admin(uuid,text,text)',
    'league_import_games(uuid,uuid,jsonb,boolean)',
    'league_match_team(uuid,uuid,text)',
    'league_update_game(uuid,text,text,text)',
    'league_set_result(uuid,int,int,text,boolean)',
    'league_delete_game(uuid)',
    'league_update_settings(uuid,text,text,text,text,text,boolean)'
  ] loop
    execute format('revoke all on function public.%s from public, anon', f);
    execute format('grant execute on function public.%s to authenticated, service_role', f);
  end loop;
end $$;

-- Advisor tidy (applied 2026-09-11): trigger functions are never RPC targets;
-- pin search_path on the two helpers.
revoke all on function public.guard_league_event() from public, anon, authenticated;
revoke all on function public.guard_league_event_insert() from public, anon, authenticated;
revoke all on function public.trg_game_score_rollup() from public, anon, authenticated;
revoke all on function public.trg_league_game_sync() from public, anon, authenticated;
revoke all on function public.league_team_label(uuid) from authenticated;
revoke all on function public.league_require(uuid, text) from authenticated;
alter function public.league_sync_active() set search_path = public;
alter function public.slugify(text) set search_path = public;
