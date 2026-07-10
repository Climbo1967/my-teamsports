-- Private team-media prep (photos-private-bucket-plan.md, Option A).
-- Coaches need to create signed URLs from the browser client once the bucket
-- goes private; signing requires SELECT on storage.objects. Mirror the
-- existing "Members upload/update/delete team media" policy shape:
--   <teamId>/...            coach-uploaded assets (logos, headshots, gallery)
--   parent-uploads/<teamId>/... parent photos (uploaded via service role),
--                               readable by that team's coaches in the dashboard.
create policy "Members read team media" on storage.objects
for select to authenticated
using (
  bucket_id = 'team-media'
  and (
    (
      (storage.foldername(name))[1] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      and public.is_team_coach(((storage.foldername(name))[1])::uuid)
    )
    or (
      (storage.foldername(name))[1] = 'parent-uploads'
      and (storage.foldername(name))[2] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      and public.is_team_coach(((storage.foldername(name))[2])::uuid)
    )
  )
);

-- The dashboard photos page lets a coach delete any team photo, including
-- parent uploads. The existing DELETE policy only covered <teamId>/... paths,
-- so removing a parent photo's storage object silently failed and left an
-- orphan. Extend it to cover parent-uploads/<teamId>/... for that team's coaches.
drop policy if exists "Members delete team media" on storage.objects;
create policy "Members delete team media" on storage.objects
for delete to authenticated
using (
  bucket_id = 'team-media'
  and (
    (
      (storage.foldername(name))[1] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      and public.is_team_coach(((storage.foldername(name))[1])::uuid)
    )
    or (
      (storage.foldername(name))[1] = 'parent-uploads'
      and (storage.foldername(name))[2] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      and public.is_team_coach(((storage.foldername(name))[2])::uuid)
    )
  )
);

-- NOTE: the bucket flip (update storage.buckets set public = false where
-- id = 'team-media') is deliberately NOT in this migration. Per the cutover
-- plan it runs manually AFTER the code deploys to production, and is
-- instantly reversible by setting public = true.
