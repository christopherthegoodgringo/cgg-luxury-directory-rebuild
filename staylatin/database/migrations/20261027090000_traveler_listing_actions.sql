-- StayLatin traveler listing card actions (homepage numeric listing keys + flexible payloads).
-- Apply in Supabase SQL editor if not already migrated via MCP.

create table if not exists public.staylatin_traveler_listing_actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.staylatin_profiles(id) on delete cascade,
  listing_key text not null check (length(trim(listing_key)) between 1 and 120),
  action_type text not null check (action_type in ('favorite','trip','compare','been','map','alert','invite')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, listing_key, action_type)
);

create index if not exists staylatin_traveler_listing_actions_user_idx
  on public.staylatin_traveler_listing_actions (user_id, action_type, updated_at desc);

alter table public.staylatin_traveler_listing_actions enable row level security;

drop policy if exists "users manage own listing actions" on public.staylatin_traveler_listing_actions;
create policy "users manage own listing actions"
  on public.staylatin_traveler_listing_actions
  for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

comment on table public.staylatin_traveler_listing_actions is
  'Traveler profile actions from homepage listing cards: favorites, trip boards, compare pins, been-here, map pins, alerts, invite history. listing_key is the homepage stay id (text).';
