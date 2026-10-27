-- StayLatin database foundation — DESIGN FILE ONLY
-- Not executed against any Supabase project.
-- Deploy only to a dedicated StayLatin Supabase project, never the existing CGG project.
-- Apply through reviewed migrations after confirming the target project and environment.
-- Admin authorization uses trusted app_metadata.role='admin'; never user-editable user_metadata.
create extension if not exists pgcrypto;

create type public.staylatin_account_type as enum ('traveler','business_owner','associate');
create type public.staylatin_business_type as enum ('boutique_hotel','posada','hostel','long_stay','serviced_apartment','guesthouse_bnb');
create type public.staylatin_listing_status as enum ('draft','pending_review','published','rejected','suspended','archived');
create type public.staylatin_membership_tier as enum ('basic','verified','featured','premium');
create type public.staylatin_membership_status as enum ('free','pending','active','past_due','cancelled','expired');
create type public.staylatin_review_status as enum ('pending','published','hidden','rejected');

-- One profile per Auth user. Account type is descriptive; authorization is handled by RLS.
create table public.staylatin_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  account_type public.staylatin_account_type not null default 'traveler',
  display_name text not null default '',
  preferred_language text not null default 'en' check (preferred_language in ('en','es','pt')),
  country_code char(2),
  whatsapp_opt_in boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.staylatin_businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.staylatin_profiles(id) on delete restrict,
  name text not null check (length(trim(name)) between 2 and 160),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  business_type public.staylatin_business_type not null,
  description text not null default '' check (length(description) <= 3000),
  country text not null,
  city text not null,
  neighborhood text,
  address text,
  latitude double precision check (latitude is null or latitude between -90 and 90),
  longitude double precision check (longitude is null or longitude between -180 and 180),
  official_website text,
  business_email text,
  whatsapp_phone text,
  listing_status public.staylatin_listing_status not null default 'draft',
  verification_status text not null default 'unverified' check (verification_status in ('unverified','in_review','verified','failed')),
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references public.staylatin_profiles(id) on delete set null,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index staylatin_businesses_public_search on public.staylatin_businesses(country, city, business_type) where listing_status = 'published';
create index staylatin_businesses_owner on public.staylatin_businesses(owner_id);

create table public.staylatin_business_photos (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.staylatin_businesses(id) on delete cascade,
  storage_path text not null,
  alt_text text not null default '',
  sort_order integer not null default 0,
  moderation_status text not null default 'pending' check (moderation_status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  unique (business_id, storage_path)
);

create table public.staylatin_memberships (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null unique references public.staylatin_businesses(id) on delete cascade,
  tier public.staylatin_membership_tier not null default 'basic',
  status public.staylatin_membership_status not null default 'free',
  billing_provider text check (billing_provider is null or billing_provider in ('paypal','stripe','mercadopago')),
  provider_customer_id text,
  provider_subscription_id text unique,
  current_period_end timestamptz,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table public.staylatin_favorites (
  user_id uuid not null references public.staylatin_profiles(id) on delete cascade,
  business_id uuid not null references public.staylatin_businesses(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, business_id)
);

create table public.staylatin_reviews (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.staylatin_businesses(id) on delete cascade,
  author_id uuid not null references public.staylatin_profiles(id) on delete restrict,
  rating smallint not null check (rating between 1 and 5),
  title text not null default '' check (length(title) <= 120),
  body text not null check (length(trim(body)) between 10 and 3000),
  status public.staylatin_review_status not null default 'pending',
  visited_at date,
  moderation_note text,
  moderated_by uuid references public.staylatin_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (business_id, author_id)
);

create table public.staylatin_trip_boards (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.staylatin_profiles(id) on delete cascade,
  title text not null check (length(trim(title)) between 1 and 120),
  description text not null default '' check (length(description) <= 1000),
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.staylatin_trip_board_items (
  board_id uuid not null references public.staylatin_trip_boards(id) on delete cascade,
  business_id uuid not null references public.staylatin_businesses(id) on delete cascade,
  note text not null default '' check (length(note) <= 1000),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (board_id, business_id)
);

create table public.staylatin_inquiries (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.staylatin_businesses(id) on delete cascade,
  traveler_id uuid references public.staylatin_profiles(id) on delete set null,
  traveler_name text not null default '',
  reply_email text,
  whatsapp_phone text,
  message text not null check (length(trim(message)) between 5 and 4000),
  consent_to_contact boolean not null default false,
  status text not null default 'new' check (status in ('new','read','replied','closed','spam')),
  created_at timestamptz not null default now()
);

-- Append-only moderation trail. Writes should be restricted to trusted server/admin code.
create table public.staylatin_moderation_events (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.staylatin_businesses(id) on delete set null,
  review_id uuid references public.staylatin_reviews(id) on delete set null,
  actor_id uuid references public.staylatin_profiles(id) on delete set null,
  action text not null check (action in ('submitted','approved','rejected','suspended','reopened','edited','photo_approved','photo_rejected','review_hidden','review_published')),
  reason text not null default '' check (length(reason) <= 2000),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Every exposed public table has RLS enabled. Policies are deliberately restrictive.
alter table public.staylatin_profiles enable row level security;
alter table public.staylatin_businesses enable row level security;
alter table public.staylatin_business_photos enable row level security;
alter table public.staylatin_memberships enable row level security;
alter table public.staylatin_favorites enable row level security;
alter table public.staylatin_reviews enable row level security;
alter table public.staylatin_trip_boards enable row level security;
alter table public.staylatin_trip_board_items enable row level security;
alter table public.staylatin_inquiries enable row level security;
alter table public.staylatin_moderation_events enable row level security;

-- Trusted admin claim must be set by privileged server-side code, never by a client.
create policy "profile owner reads own profile" on public.staylatin_profiles
for select to authenticated using ((select auth.uid()) = id);
-- No client profile UPDATE policy yet: column-level grants or a validated server-side
-- endpoint must be added so users cannot change account_type. Provision profiles through
-- a trusted Auth trigger/server workflow; admin role comes only from trusted app_metadata.

create policy "published listings are public" on public.staylatin_businesses
for select to anon, authenticated using (listing_status = 'published');
create policy "owners read own business submissions" on public.staylatin_businesses
for select to authenticated using (owner_id = (select auth.uid()));
create policy "admins manage businesses" on public.staylatin_businesses
for all to authenticated using ((select auth.jwt())->'app_metadata'->>'role' = 'admin')
with check ((select auth.jwt())->'app_metadata'->>'role' = 'admin');
-- Deliberately no owner UPDATE policy: use a validated server-side owner-edit endpoint
-- so owners cannot self-publish, self-verify, or alter moderation fields.

create policy "photos for published listings are public" on public.staylatin_business_photos
for select to anon, authenticated using (
  moderation_status = 'approved' and exists (
    select 1 from public.staylatin_businesses b
    where b.id = business_id and b.listing_status = 'published'
  )
);
create policy "business owners read own photos" on public.staylatin_business_photos
for select to authenticated using (exists (
  select 1 from public.staylatin_businesses b
  where b.id = business_id and b.owner_id = (select auth.uid())
));
create policy "admins manage business photos" on public.staylatin_business_photos
for all to authenticated using ((select auth.jwt())->'app_metadata'->>'role' = 'admin')
with check ((select auth.jwt())->'app_metadata'->>'role' = 'admin');

create policy "published membership tier is public" on public.staylatin_memberships
for select to anon, authenticated using (exists (
  select 1 from public.staylatin_businesses b where b.id = business_id and b.listing_status = 'published'
));
create policy "admins manage memberships" on public.staylatin_memberships
for all to authenticated using ((select auth.jwt())->'app_metadata'->>'role' = 'admin')
with check ((select auth.jwt())->'app_metadata'->>'role' = 'admin');
-- Billing provider status must be written only by trusted webhook/server code.

create policy "users manage their own favorites" on public.staylatin_favorites
for all to authenticated using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "published reviews are public" on public.staylatin_reviews
for select to anon, authenticated using (status = 'published');
create policy "authors read their own reviews" on public.staylatin_reviews
for select to authenticated using (author_id = (select auth.uid()));
create policy "authenticated traveler submits own review" on public.staylatin_reviews
for insert to authenticated with check (
  author_id = (select auth.uid())
  and status = 'pending'
  and moderated_by is null
  and moderation_note = ''
);
create policy "admins moderate reviews" on public.staylatin_reviews
for all to authenticated using ((select auth.jwt())->'app_metadata'->>'role' = 'admin')
with check ((select auth.jwt())->'app_metadata'->>'role' = 'admin');

create policy "owners manage own trip boards" on public.staylatin_trip_boards
for all to authenticated using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);
create policy "public boards are viewable" on public.staylatin_trip_boards
for select to anon, authenticated using (is_public = true);
create policy "board items follow board access" on public.staylatin_trip_board_items
for select to anon, authenticated using (exists (
  select 1 from public.staylatin_trip_boards tb
  where tb.id = board_id and (tb.is_public = true or tb.owner_id = (select auth.uid()))
));
create policy "board owners manage board items" on public.staylatin_trip_board_items
for all to authenticated using (exists (
  select 1 from public.staylatin_trip_boards tb
  where tb.id = board_id and tb.owner_id = (select auth.uid())
)) with check (exists (
  select 1 from public.staylatin_trip_boards tb
  where tb.id = board_id and tb.owner_id = (select auth.uid())
));

-- Inquiries are private to the recipient business owner and admin.
create policy "traveler can submit inquiry" on public.staylatin_inquiries
for insert to authenticated with check (
  traveler_id = (select auth.uid()) and consent_to_contact = true
);
create policy "business owner reads received inquiries" on public.staylatin_inquiries
for select to authenticated using (exists (
  select 1 from public.staylatin_businesses b
  where b.id = business_id and b.owner_id = (select auth.uid())
));
create policy "admins manage inquiries" on public.staylatin_inquiries
for all to authenticated using ((select auth.jwt())->'app_metadata'->>'role' = 'admin')
with check ((select auth.jwt())->'app_metadata'->>'role' = 'admin');

create policy "admins read moderation events" on public.staylatin_moderation_events
for select to authenticated using ((select auth.jwt())->'app_metadata'->>'role' = 'admin');
-- Do not add public INSERT/UPDATE/DELETE policies to moderation events.
-- Add reviewed grants for anon/authenticated only after confirming the project's Data API settings.
-- Add server-side profile creation, updated_at triggers, secure owner-edit/moderation endpoints,
-- Storage bucket policies, and provider webhook verification in later migrations.

-- Additional traveler listing-card actions (homepage stays keyed by text listing_key):
-- see migrations/20261027090000_traveler_listing_actions.sql
-- Table: public.staylatin_traveler_listing_actions
