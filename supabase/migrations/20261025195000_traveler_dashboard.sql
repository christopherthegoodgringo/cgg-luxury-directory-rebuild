-- CGG Traveler Dashboard: additive tables only.
-- Apply only after a verified Supabase backup and staging validation.
create table if not exists public.traveler_trip_collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 100),
  description text not null default '' check (char_length(description) <= 500),
  start_date date,
  end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (start_date is null or end_date is null or end_date >= start_date)
);
create index if not exists traveler_trip_collections_user_updated_idx
  on public.traveler_trip_collections(user_id, updated_at desc);

create table if not exists public.traveler_trip_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  collection_id uuid not null references public.traveler_trip_collections(id) on delete cascade,
  listing_id text not null,
  listing_name text not null,
  city text,
  country text not null default 'Colombia',
  photo_url text,
  listing_url text,
  notes text not null default '' check (char_length(notes) <= 1000),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (collection_id, listing_id)
);
create index if not exists traveler_trip_items_user_collection_idx
  on public.traveler_trip_items(user_id, collection_id, sort_order);

create table if not exists public.traveler_shared_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  collection_id uuid not null references public.traveler_trip_collections(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  check (expires_at is null or expires_at > created_at)
);
create index if not exists traveler_shared_lists_user_collection_idx
  on public.traveler_shared_lists(user_id, collection_id);

create table if not exists public.traveler_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_type text not null check (activity_type in ('view','share')),
  listing_id text not null,
  listing_name text not null,
  listing_url text,
  city text,
  country text not null default 'Colombia',
  photo_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists traveler_activity_user_created_idx
  on public.traveler_activity(user_id, created_at desc);
create index if not exists traveler_activity_user_type_created_idx
  on public.traveler_activity(user_id, activity_type, created_at desc);

create table if not exists public.traveler_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null default 'general' check (category in ('general','saved_property','shared_trip','account')),
  title text not null check (char_length(title) between 1 and 160),
  body text not null default '' check (char_length(body) <= 1000),
  target_url text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists traveler_notifications_user_created_idx
  on public.traveler_notifications(user_id, created_at desc);
create index if not exists traveler_notifications_unread_idx
  on public.traveler_notifications(user_id, created_at desc) where read_at is null;

create table if not exists public.traveler_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  preferred_countries text[] not null default '{}'::text[],
  preferred_cities text[] not null default '{}'::text[],
  accommodation_types text[] not null default '{}'::text[],
  booking_platforms text[] not null default '{}'::text[],
  email_notifications boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.traveler_trip_collections enable row level security;
alter table public.traveler_trip_items enable row level security;
alter table public.traveler_shared_lists enable row level security;
alter table public.traveler_activity enable row level security;
alter table public.traveler_notifications enable row level security;
alter table public.traveler_preferences enable row level security;

drop policy if exists traveler_trip_collections_select_own on public.traveler_trip_collections;
create policy traveler_trip_collections_select_own on public.traveler_trip_collections for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists traveler_trip_collections_insert_own on public.traveler_trip_collections;
create policy traveler_trip_collections_insert_own on public.traveler_trip_collections for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists traveler_trip_collections_update_own on public.traveler_trip_collections;
create policy traveler_trip_collections_update_own on public.traveler_trip_collections for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists traveler_trip_collections_delete_own on public.traveler_trip_collections;
create policy traveler_trip_collections_delete_own on public.traveler_trip_collections for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists traveler_trip_items_select_own on public.traveler_trip_items;
create policy traveler_trip_items_select_own on public.traveler_trip_items for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists traveler_trip_items_insert_own on public.traveler_trip_items;
create policy traveler_trip_items_insert_own on public.traveler_trip_items for insert to authenticated with check ((select auth.uid()) = user_id and exists (select 1 from public.traveler_trip_collections c where c.id = collection_id and c.user_id = (select auth.uid())));
drop policy if exists traveler_trip_items_update_own on public.traveler_trip_items;
create policy traveler_trip_items_update_own on public.traveler_trip_items for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id and exists (select 1 from public.traveler_trip_collections c where c.id = collection_id and c.user_id = (select auth.uid())));
drop policy if exists traveler_trip_items_delete_own on public.traveler_trip_items;
create policy traveler_trip_items_delete_own on public.traveler_trip_items for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists traveler_shared_lists_select_own on public.traveler_shared_lists;
create policy traveler_shared_lists_select_own on public.traveler_shared_lists for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists traveler_shared_lists_insert_own on public.traveler_shared_lists;
create policy traveler_shared_lists_insert_own on public.traveler_shared_lists for insert to authenticated with check ((select auth.uid()) = user_id and exists (select 1 from public.traveler_trip_collections c where c.id = collection_id and c.user_id = (select auth.uid())));
drop policy if exists traveler_shared_lists_update_own on public.traveler_shared_lists;
create policy traveler_shared_lists_update_own on public.traveler_shared_lists for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id and exists (select 1 from public.traveler_trip_collections c where c.id = collection_id and c.user_id = (select auth.uid())));
drop policy if exists traveler_shared_lists_delete_own on public.traveler_shared_lists;
create policy traveler_shared_lists_delete_own on public.traveler_shared_lists for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists traveler_activity_select_own on public.traveler_activity;
create policy traveler_activity_select_own on public.traveler_activity for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists traveler_activity_insert_own on public.traveler_activity;
create policy traveler_activity_insert_own on public.traveler_activity for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists traveler_activity_delete_own on public.traveler_activity;
create policy traveler_activity_delete_own on public.traveler_activity for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists traveler_notifications_select_own on public.traveler_notifications;
create policy traveler_notifications_select_own on public.traveler_notifications for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists traveler_notifications_update_own on public.traveler_notifications;
create policy traveler_notifications_update_own on public.traveler_notifications for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists traveler_notifications_delete_own on public.traveler_notifications;
create policy traveler_notifications_delete_own on public.traveler_notifications for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists traveler_preferences_select_own on public.traveler_preferences;
create policy traveler_preferences_select_own on public.traveler_preferences for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists traveler_preferences_insert_own on public.traveler_preferences;
create policy traveler_preferences_insert_own on public.traveler_preferences for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists traveler_preferences_update_own on public.traveler_preferences;
create policy traveler_preferences_update_own on public.traveler_preferences for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Public access to shared lists is deliberately not granted by this migration.
-- A token-validation RPC or Edge Function must be added and tested before public links are enabled.
