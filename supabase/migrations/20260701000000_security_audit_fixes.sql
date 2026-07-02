-- ============================================================
-- Security audit fixes (2026-07-01) - SITE-AUDIT-2026-07-01.md
-- Applied to prod on 2026-07-01 outside migration history;
-- committed here 2026-07-02 so the repo matches the live DB.
-- Function bodies below are the exact live definitions
-- (pg_get_functiondef) from prod mejkeaoytgblyvqpoyjl.
-- ============================================================

-- H3: new teams get AI Coach in free-preview mode by default
alter table public.teams alter column ai_enabled set default true;

-- H1: replace the unauthenticated push-subscribe RPC with a
-- passcode-gated one (https-only endpoint, 1000-sub cap per team).
drop function if exists public.add_push_subscription(uuid, text, text, text, text);

CREATE OR REPLACE FUNCTION public.add_push_subscription(p_slug text, p_passcode text, p_endpoint text, p_p256dh text, p_auth text, p_user_agent text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_team_id uuid; v_count int;
begin
  select t.id into v_team_id from public.teams t
  where t.slug = lower(trim(p_slug)) and t.passcode = upper(trim(p_passcode));
  if v_team_id is null then raise exception 'invalid team or passcode'; end if;
  if p_endpoint is null or p_endpoint !~ '^https://' then raise exception 'invalid endpoint'; end if;
  select count(*) into v_count from public.push_subscriptions where team_id = v_team_id;
  if v_count >= 1000 then raise exception 'subscription limit reached'; end if;
  insert into public.push_subscriptions (team_id, endpoint, p256dh, auth, user_agent)
  values (v_team_id, p_endpoint, p_p256dh, p_auth, p_user_agent)
  on conflict (team_id, endpoint) do update
    set p256dh = excluded.p256dh, auth = excluded.auth, user_agent = excluded.user_agent;
end; $function$
;

-- M2: passcode-gated push opt-out
CREATE OR REPLACE FUNCTION public.remove_push_subscription(p_slug text, p_passcode text, p_endpoint text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_team_id uuid;
begin
  select t.id into v_team_id from public.teams t
  where t.slug = lower(trim(p_slug)) and t.passcode = upper(trim(p_passcode));
  if v_team_id is null then raise exception 'invalid team or passcode'; end if;
  delete from public.push_subscriptions where team_id = v_team_id and endpoint = p_endpoint;
end; $function$
;

grant execute on function public.add_push_subscription(text, text, text, text, text, text) to anon, authenticated;
grant execute on function public.remove_push_subscription(text, text, text) to anon, authenticated;

-- M3: delete_team_photo now returns the storage url so the API route
-- can remove the underlying object with the service-role client.
CREATE OR REPLACE FUNCTION public.delete_team_photo(p_slug text, p_passcode text, p_photo_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_team_id uuid; v_url text; v_deleted int := 0;
begin
  select t.id into v_team_id from public.teams t
  where t.slug = lower(trim(p_slug)) and t.passcode = upper(trim(p_passcode));
  if v_team_id is null then raise exception 'invalid team or passcode'; end if;
  delete from public.photos p
  where p.id = p_photo_id and p.team_id = v_team_id and p.uploaded_by = 'parent'
  returning p.url into v_url;
  get diagnostics v_deleted = row_count;
  return jsonb_build_object('ok', true, 'removed', v_deleted, 'url', v_url);
end; $function$
;

-- H2: anon can no longer INSERT into storage directly; parent uploads
-- go through the passcode-verified API route using the service-role key.
drop policy if exists "Parent uploads to parent folder" on storage.objects;
