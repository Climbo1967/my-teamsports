CREATE OR REPLACE FUNCTION public.get_team_site(p_slug text, p_passcode text)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select jsonb_build_object(
    'team', jsonb_build_object(
      'id', t.id, 'name', t.name, 'sport', t.sport, 'season', t.season,
      'slug', t.slug, 'logo_url', t.logo_url, 'primary_color', t.primary_color
    ),
    'players', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', p.id, 'name', p.name, 'jersey_number', p.jersey_number,
        'position', p.position, 'photo_url', p.photo_url, 'bio', p.bio
      ) order by p.sort_order, p.name)
      from public.players p where p.team_id = t.id
    ), '[]'::jsonb),
    'events', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', e.id, 'event_type', e.event_type, 'title', e.title, 'opponent', e.opponent,
        'location', e.location, 'starts_at', e.starts_at, 'notes', e.notes, 'result', e.result
      ) order by e.starts_at)
      from public.events e where e.team_id = t.id
    ), '[]'::jsonb),
    'announcements', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', a.id, 'title', a.title, 'body', a.body, 'pinned', a.pinned, 'created_at', a.created_at
      ) order by a.pinned desc, a.created_at desc)
      from public.announcements a where a.team_id = t.id
    ), '[]'::jsonb),
    'notes', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', n.id, 'title', n.title, 'body', n.body, 'created_at', n.created_at
      ) order by n.created_at desc)
      from public.notes n where n.team_id = t.id
    ), '[]'::jsonb),
    'photos', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', ph.id, 'url', ph.url, 'caption', ph.caption, 'player_id', ph.player_id, 'created_at', ph.created_at
      ) order by ph.created_at desc)
      from public.photos ph where ph.team_id = t.id
    ), '[]'::jsonb),
    'videos', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', v.id, 'title', v.title, 'url', v.url, 'game_date', v.game_date, 'created_at', v.created_at
      ) order by coalesce(v.game_date, v.created_at::date) desc, v.created_at desc)
      from public.videos v where v.team_id = t.id
    ), '[]'::jsonb),
    'plays', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', pl.id, 'name', pl.name, 'category', pl.category, 'formation', pl.formation,
        'diagram', pl.diagram, 'notes', pl.notes
      ) order by pl.sort_order, pl.created_at)
      from public.plays pl where pl.team_id = t.id
    ), '[]'::jsonb),
    'stats', coalesce((
      select jsonb_agg(jsonb_build_object(
        'player_id', s.player_id, 'stat_key', s.stat_key, 'total', s.total, 'games', s.games
      ))
      from (
        select player_id, stat_key, sum(value) as total, count(distinct event_id) as games
        from public.stats where team_id = t.id group by player_id, stat_key
      ) s
    ), '[]'::jsonb),
    'rsvps', coalesce((
      select jsonb_agg(jsonb_build_object(
        'event_id', r.event_id, 'player_id', r.player_id, 'status', r.status
      ))
      from public.rsvps r where r.team_id = t.id
    ), '[]'::jsonb)
  )
  from public.teams t
  where t.slug = lower(trim(p_slug)) and t.passcode = upper(trim(p_passcode));
$function$