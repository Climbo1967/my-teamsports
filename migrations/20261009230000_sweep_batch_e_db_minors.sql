-- Sweep 10/9 batch E — database minors. Contains DROP/DELETE text, so the
-- connector refuses it; applied through the Supabase SQL editor.
--
-- 1. unsubscribe_email was anonymous with no token: anyone could remove any
--    address from any team and learn whether it was subscribed. Announcement
--    emails are BCC'd in chunks, so a per-recipient token can't ride along;
--    instead the function stops reporting whether the address existed, and is
--    rate-limited per address (5 per 10 minutes) through check_rate_limit.
-- 2. add_team_photo accepted any p_url. The app only ever stores
--    parent-uploads/<team_id>/<file>; anything else is refused (null, the
--    wrong-passcode sentinel the route already handles).
-- 3. payments.team_id cascaded on team delete, so a coach deleting a team took
--    the Stripe history and the monitor's revenue with it. Now SET NULL: the
--    payment row stays, with the team name snapshotted at delete time.
-- 4. profiles: the FOR ALL policy let a coach edit their own email,
--    unsub_token and signup_* attribution. The existing billing guard trigger
--    now pins those too (the app only writes onboarding_* from the browser).
-- 5. videos.url and leagues.website: http(s) only (0 existing rows violate).

-- 1. unsubscribe -------------------------------------------------------------
create or replace function public.unsubscribe_email(p_slug text, p_email text)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $$
declare
  v_team_id uuid;
  v_team_name text;
  v_email text := lower(trim(p_email));
begin
  if v_email = '' then
    return jsonb_build_object('ok', false, 'error', 'missing_email');
  end if;
  if public.check_rate_limit('unsub:' || left(v_email, 120), 5, 600) then
    return jsonb_build_object('ok', false, 'error', 'rate_limited');
  end if;
  select t.id, t.name into v_team_id, v_team_name
  from public.teams t
  where t.slug = lower(trim(p_slug));
  if v_team_id is null then
    return jsonb_build_object('ok', false, 'error', 'team_not_found');
  end if;
  delete from public.subscribers s
  where s.team_id = v_team_id and lower(s.email) = v_email;
  -- No row count: "removed 0" told a stranger the address wasn't on the list.
  return jsonb_build_object('ok', true, 'team_name', v_team_name);
end;
$$;

-- 2. parent photo path ---------------------------------------------------------
create or replace function public.add_team_photo(p_slug text, p_passcode text, p_url text, p_caption text, p_player_id uuid)
returns uuid
language plpgsql
security definer
set search_path to ''
as $$
declare
  v_team_id uuid;
  v_photo_id uuid;
begin
  v_team_id := public.passcode_gate(p_slug, p_passcode);
  if v_team_id is null then return null; end if;
  -- Only the path the upload route writes for this team; a saved path from
  -- another team (or an outside URL) is refused.
  if p_url is null or p_url not like 'parent-uploads/' || v_team_id::text || '/%' or p_url like '%..%' then
    return null;
  end if;
  insert into public.photos (team_id, player_id, url, caption, uploaded_by)
  values (v_team_id, p_player_id, p_url, left(p_caption, 200), 'parent')
  returning id into v_photo_id;
  return v_photo_id;
end;
$$;

-- 3. payments survive team delete --------------------------------------------
alter table public.payments add column if not exists team_name text;
alter table public.payments alter column team_id drop not null;
alter table public.payments drop constraint payments_team_id_fkey;
alter table public.payments
  add constraint payments_team_id_fkey foreign key (team_id) references public.teams(id) on delete set null;

create or replace function public.snapshot_payments_team_name()
returns trigger
language plpgsql
security definer
set search_path to ''
as $$
begin
  update public.payments set team_name = old.name where team_id = old.id and team_name is null;
  return old;
end;
$$;
drop trigger if exists trg_snapshot_payments_team_name on public.teams;
create trigger trg_snapshot_payments_team_name
before delete on public.teams
for each row execute function public.snapshot_payments_team_name();

-- 4. profiles: pin identity and attribution columns ----------------------------
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
    -- Set by the server at sign-up; the browser session may only touch
    -- onboarding_*, full_name and email_opt_out.
    new.email               := old.email;
    new.unsub_token         := old.unsub_token;
    new.created_at          := old.created_at;
    new.signup_source       := old.signup_source;
    new.signup_medium       := old.signup_medium;
    new.signup_campaign     := old.signup_campaign;
    new.signup_content      := old.signup_content;
    new.signup_term         := old.signup_term;
    new.signup_referrer     := old.signup_referrer;
    new.signup_landing_path := old.signup_landing_path;
  end if;
  return new;
end;
$$;

-- 5. url schemes --------------------------------------------------------------------
alter table public.videos drop constraint if exists videos_url_scheme_check;
alter table public.videos add constraint videos_url_scheme_check check (url ~* '^https?://');
alter table public.leagues drop constraint if exists leagues_website_scheme_check;
alter table public.leagues add constraint leagues_website_scheme_check check (website is null or website ~* '^https?://');
