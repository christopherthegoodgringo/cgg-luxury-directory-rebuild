-- Keep member-directory photo sharing independent from Traveler Lounge photo sharing.
drop policy if exists "Travelers can see lounge identities shared by consent" on public.staylatin_traveler_chat_profiles;
create policy "Travelers can see lounge identities shared by consent"
on public.staylatin_traveler_chat_profiles for select to authenticated
using (
  (user_id = (select auth.uid()) or share_name = true or share_photo = true or share_photo_in_directory = true)
  and exists (select 1 from public.staylatin_profiles me where me.id = (select auth.uid()) and me.account_type = 'traveler')
);
drop policy if exists "Travelers read lounge avatars only by consent" on storage.objects;
create policy "Travelers read lounge avatars only by consent"
on storage.objects for select to authenticated
using (
  bucket_id = 'staylatin-traveler-avatars'
  and (
    split_part(name, '/', 1) = (select auth.uid())::text
    or exists (
      select 1 from public.staylatin_traveler_chat_profiles cp
      where cp.user_id::text = split_part(objects.name, '/', 1)
        and (cp.share_photo = true or cp.share_photo_in_directory = true)
    )
  )
);
revoke update on public.staylatin_traveler_private_messages from authenticated;
grant update(read_at) on public.staylatin_traveler_private_messages to authenticated;
