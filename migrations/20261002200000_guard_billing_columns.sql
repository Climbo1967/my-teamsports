-- Guard the billing and trial columns.
--
-- Before this, the row-level policies let a signed-in coach change their own
-- team's trial end, paid-through dates and AI comp flag straight from the
-- browser (and a league admin could do the same to a league's or a school's
-- paid-through date). Nothing in the app does that, but nothing stopped it.
--
-- After this, those columns can only be changed by the server:
--   * the service-role key (Stripe fulfilment, the daily email job), and
--   * a direct database session (SQL editor, the Supabase connector, Auth).
-- Any request that arrives through the API as a signed-in or anonymous user
-- has its changes to these columns quietly dropped; the rest of the same
-- request (team name, colours, onboarding step, ...) goes through as before.
--
-- Guarded:
--   teams     trial_ends_at, paid_through, ai_paid_through, ai_trial_ends_at, ai_enabled
--   profiles  ai_trial_ends_at   (and a browser session cannot delete its own
--                                 profile row, which would reset the AI trial)
--   leagues   paid_through, plan
--   schools   paid_through
--
-- Safe to run more than once.

begin;

-- True when the caller is the server. API requests always come in on the
-- "authenticator" connection carrying a role claim; only the service-role key
-- is trusted there. Anything else on that connection is a browser session.
create or replace function public.billing_write_allowed()
returns boolean
language sql
stable
set search_path to ''
as $$
  select coalesce(auth.role(), '') = 'service_role'
      or (session_user <> 'authenticator'
          and coalesce(auth.role(), '') not in ('authenticated', 'anon'));
$$;

-- The column's own default, evaluated now. Keeps the trial length in one
-- place (the column default) instead of repeating "30 days" in the guard.
create or replace function public.billing_column_default(p_rel regclass, p_col name)
returns timestamptz
language plpgsql
stable
set search_path to ''
as $$
declare
  v_expr text;
  v_out  timestamptz;
begin
  select pg_catalog.pg_get_expr(d.adbin, d.adrelid) into v_expr
  from pg_catalog.pg_attribute a
  join pg_catalog.pg_attrdef d on d.adrelid = a.attrelid and d.adnum = a.attnum
  where a.attrelid = p_rel and a.attname = p_col and not a.attisdropped;
  if v_expr is null then
    return null;
  end if;
  execute 'select (' || v_expr || ')::timestamptz' into v_out;
  return v_out;
end;
$$;

-- teams -----------------------------------------------------------------
create or replace function public.guard_team_billing_columns()
returns trigger
language plpgsql
security definer
set search_path to ''
as $$
begin
  if public.billing_write_allowed() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    -- A new team always starts on the standard trial, unpaid, not comped.
    new.trial_ends_at    := public.billing_column_default(tg_relid::regclass, 'trial_ends_at');
    new.paid_through     := null;
    new.ai_paid_through  := null;
    new.ai_enabled       := false;
    -- Left empty on purpose: trg_set_team_ai_trial runs after this trigger
    -- (triggers fire in name order) and copies the coach's own AI trial date.
    new.ai_trial_ends_at := null;
  else
    new.trial_ends_at    := old.trial_ends_at;
    new.paid_through     := old.paid_through;
    new.ai_paid_through  := old.ai_paid_through;
    new.ai_trial_ends_at := old.ai_trial_ends_at;
    new.ai_enabled       := old.ai_enabled;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_guard_team_billing on public.teams;
create trigger trg_guard_team_billing
  before insert or update on public.teams
  for each row execute function public.guard_team_billing_columns();

-- profiles --------------------------------------------------------------
create or replace function public.guard_profile_billing_columns()
returns trigger
language plpgsql
security definer
set search_path to ''
as $$
begin
  if public.billing_write_allowed() then
    if tg_op = 'DELETE' then
      return old;
    end if;
    return new;
  end if;

  if tg_op = 'DELETE' then
    -- Deleting and re-creating the row would hand out a fresh AI trial.
    return null;
  elsif tg_op = 'INSERT' then
    new.ai_trial_ends_at := public.billing_column_default(tg_relid::regclass, 'ai_trial_ends_at');
  else
    new.ai_trial_ends_at := old.ai_trial_ends_at;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_guard_profile_billing on public.profiles;
create trigger trg_guard_profile_billing
  before insert or update or delete on public.profiles
  for each row execute function public.guard_profile_billing_columns();

-- leagues ---------------------------------------------------------------
create or replace function public.guard_league_billing_columns()
returns trigger
language plpgsql
security definer
set search_path to ''
as $$
begin
  if public.billing_write_allowed() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.paid_through := null;
  else
    new.paid_through := old.paid_through;
    new.plan         := old.plan;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_guard_league_billing on public.leagues;
create trigger trg_guard_league_billing
  before insert or update on public.leagues
  for each row execute function public.guard_league_billing_columns();

-- schools ---------------------------------------------------------------
create or replace function public.guard_school_billing_columns()
returns trigger
language plpgsql
security definer
set search_path to ''
as $$
begin
  if public.billing_write_allowed() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.paid_through := null;
  else
    new.paid_through := old.paid_through;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_guard_school_billing on public.schools;
create trigger trg_guard_school_billing
  before insert or update on public.schools
  for each row execute function public.guard_school_billing_columns();

-- None of these are meant to be called through the API.
revoke all on function public.billing_write_allowed()                    from public, anon, authenticated;
revoke all on function public.billing_column_default(regclass, name)     from public, anon, authenticated;
revoke all on function public.guard_team_billing_columns()               from public, anon, authenticated;
revoke all on function public.guard_profile_billing_columns()            from public, anon, authenticated;
revoke all on function public.guard_league_billing_columns()             from public, anon, authenticated;
revoke all on function public.guard_school_billing_columns()             from public, anon, authenticated;

commit;
