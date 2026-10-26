-- StayLatin traveler private messaging and member-directory photo consent.
-- Applied to the dedicated StayLatin Supabase project only.
alter table public.staylatin_traveler_chat_profiles
  add column if not exists share_photo_in_directory boolean not null default false;

create table if not exists public.staylatin_traveler_private_messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.staylatin_profiles(id) on delete cascade,
  recipient_id uuid not null references public.staylatin_profiles(id) on delete cascade,
  body text not null check (length(trim(body)) between 1 and 2000),
  read_at timestamptz,
  created_at timestamptz not null default now(),
  constraint staylatin_private_messages_distinct_users check (sender_id <> recipient_id)
);
create index if not exists staylatin_private_messages_sender_created
  on public.staylatin_traveler_private_messages(sender_id, created_at desc);
create index if not exists staylatin_private_messages_recipient_created
  on public.staylatin_traveler_private_messages(recipient_id, created_at desc);
alter table public.staylatin_traveler_private_messages enable row level security;

drop policy if exists "Travelers read only their own private messages" on public.staylatin_traveler_private_messages;
create policy "Travelers read only their own private messages"
on public.staylatin_traveler_private_messages for select to authenticated
using (
  (sender_id = (select auth.uid()) or recipient_id = (select auth.uid()))
  and exists (select 1 from public.staylatin_profiles p where p.id = (select auth.uid()) and p.account_type = 'traveler')
);
drop policy if exists "Travelers send private messages as themselves" on public.staylatin_traveler_private_messages;
create policy "Travelers send private messages as themselves"
on public.staylatin_traveler_private_messages for insert to authenticated
with check (
  sender_id = (select auth.uid()) and sender_id <> recipient_id
  and exists (select 1 from public.staylatin_profiles me where me.id = (select auth.uid()) and me.account_type = 'traveler')
  and exists (select 1 from public.staylatin_profiles recipient where recipient.id = recipient_id and recipient.account_type = 'traveler')
);
drop policy if exists "Recipients mark private messages read" on public.staylatin_traveler_private_messages;
create policy "Recipients mark private messages read"
on public.staylatin_traveler_private_messages for update to authenticated
using (
  recipient_id = (select auth.uid())
  and exists (select 1 from public.staylatin_profiles p where p.id = (select auth.uid()) and p.account_type = 'traveler')
)
with check (
  recipient_id = (select auth.uid())
  and exists (select 1 from public.staylatin_profiles p where p.id = (select auth.uid()) and p.account_type = 'traveler')
);
grant select, insert, update on public.staylatin_traveler_private_messages to authenticated;
comment on table public.staylatin_traveler_private_messages is
  'Private traveler-to-traveler messages. RLS restricts every message to its sender and recipient.';
