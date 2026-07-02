-- Per-device notification preferences (push slice 3).
-- Parents pick which alert types this device receives; all default ON.
alter table public.push_subscriptions
  add column if not exists want_announcements boolean not null default true,
  add column if not exists want_games boolean not null default true,
  add column if not exists want_schedule boolean not null default true;

-- Passcode-gated prefs update for anonymous parents (mirrors add_push_subscription).
create or replace function public.set_push_prefs(p_slug text, p_passcode text, p_endpoint text, p_announcements boolean, p_games boolean, p_schedule boolean)
returns void
language plpgsql
security definer
set search_path to ''
as $$
declare v_team_id uuid;
begin
  select t.id into v_team_id from public.teams t
  where t.slug = lower(trim(p_slug)) and t.passcode = upper(trim(p_passcode));
  if v_team_id is null then raise exception 'invalid team or passcode'; end if;
  update public.push_subscriptions
     set want_announcements = coalesce(p_announcements, want_announcements),
         want_games         = coalesce(p_games, want_games),
         want_schedule      = coalesce(p_schedule, want_schedule)
   where team_id = v_team_id and endpoint = p_endpoint;
end;
$$;

create or replace function public.get_push_prefs(p_slug text, p_passcode text, p_endpoint text)
returns jsonb
language sql
stable
security definer
set search_path to ''
as $$
  select jsonb_build_object(
    'announcements', ps.want_announcements,
    'games', ps.want_games,
    'schedule', ps.want_schedule
  )
  from public.push_subscriptions ps
  join public.teams t on t.id = ps.team_id
  where t.slug = lower(trim(p_slug)) and t.passcode = upper(trim(p_passcode))
    and ps.endpoint = p_endpoint;
$$;

grant execute on function public.set_push_prefs(text, text, text, boolean, boolean, boolean) to anon, authenticated;
grant execute on function public.get_push_prefs(text, text, text) to anon, authenticated;
