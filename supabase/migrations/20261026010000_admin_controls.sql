alter table public.traveler_subscribers
  add column if not exists member_status text not null default 'active';
alter table public.traveler_subscribers
  drop constraint if exists traveler_subscribers_member_status_check;
alter table public.traveler_subscribers
  add constraint traveler_subscribers_member_status_check
  check (member_status in ('pending', 'active', 'rejected'));
comment on column public.traveler_subscribers.member_status is
  'Administrative access status for a Travel Member; sign-in suspension is enforced through Supabase Auth by the restricted admin Edge Function.';
