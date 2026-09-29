-- 2026-09-29 — instrument the two "share" actions and let admins read all counters.
--
-- Why: the onboarding wizard's only value action is a coach sharing their team
-- site (copy the invite, open the site). There was zero telemetry on either.
-- bump_counter() had a hardcoded allowlist of ('homepage','team'); this widens it
-- and adds an admin-only reader so the counts show on /dashboard/admin.
-- Idempotent. No data changes.

create or replace function public.bump_counter(p_key text)
 returns void
 language plpgsql
 security definer
 set search_path to ''
as $function$
begin
  if p_key not in ('homepage', 'team', 'invite_copied', 'team_site_viewed') then
    return;
  end if;
  insert into public.site_counter (id, views, updated_at)
    values (p_key, 1, now())
  on conflict (id) do update
    set views = public.site_counter.views + 1, updated_at = now();
end;
$function$;

-- All counters as {key: views}. Admin only; everyone else gets null.
create or replace function public.admin_counters()
 returns json
 language sql
 stable
 security definer
 set search_path to ''
as $function$
  select case
    when public.is_admin()
      then (select coalesce(json_object_agg(id, views), '{}'::json) from public.site_counter)
    else null
  end;
$function$;

revoke all on function public.admin_counters() from public;
revoke all on function public.admin_counters() from anon;
grant execute on function public.admin_counters() to authenticated;
