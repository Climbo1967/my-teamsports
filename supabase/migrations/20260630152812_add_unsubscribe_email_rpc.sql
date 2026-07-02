create or replace function public.unsubscribe_email(p_slug text, p_email text)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_team_id uuid;
  v_team_name text;
  v_email text := lower(trim(p_email));
  v_deleted int := 0;
begin
  if v_email = '' then
    return jsonb_build_object('ok', false, 'error', 'missing_email');
  end if;
  select t.id, t.name into v_team_id, v_team_name
  from public.teams t
  where t.slug = lower(trim(p_slug));
  if v_team_id is null then
    return jsonb_build_object('ok', false, 'error', 'team_not_found');
  end if;
  delete from public.subscribers s
  where s.team_id = v_team_id and lower(s.email) = v_email;
  get diagnostics v_deleted = row_count;
  return jsonb_build_object('ok', true, 'removed', v_deleted, 'team_name', v_team_name);
end;
$function$;

grant execute on function public.unsubscribe_email(text, text) to anon, authenticated;