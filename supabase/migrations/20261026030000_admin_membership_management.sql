create table if not exists public.membership_plans (
 id uuid primary key default gen_random_uuid(), code text not null unique, name text not null,
 audience text not null default 'traveler' check(audience in ('traveler','business_owner','both')),
 description text not null default '', price numeric(12,2) not null default 0 check(price>=0),
 currency text not null default 'USD' check(currency ~ '^[A-Z]{3}$'),
 billing_interval text not null default 'month' check(billing_interval in ('free','month','year','one_time')),
 status text not null default 'draft' check(status in ('draft','active','retired')),
 features jsonb not null default '[]'::jsonb, sort_order integer not null default 100,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), updated_by text
);
create table if not exists public.traveler_memberships (
 id uuid primary key default gen_random_uuid(), user_id uuid not null,
 plan_id uuid references public.membership_plans(id) on delete set null, plan_name_snapshot text not null default '',
 status text not null default 'pending' check(status in ('pending','trialing','active','past_due','paused','cancelled','expired','comped')),
 starts_at timestamptz not null default now(), ends_at timestamptz, cancel_at_period_end boolean not null default false,
 external_customer_id text, external_subscription_id text, admin_notes text not null default '',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), updated_by text
);
create index if not exists traveler_memberships_user_id_idx on public.traveler_memberships(user_id);
create index if not exists traveler_memberships_status_idx on public.traveler_memberships(status);
create table if not exists public.membership_transactions (
 id uuid primary key default gen_random_uuid(), membership_id uuid references public.traveler_memberships(id) on delete set null,
 user_id uuid not null, plan_name_snapshot text not null default '', amount numeric(12,2) not null default 0 check(amount>=0),
 currency text not null default 'USD' check(currency ~ '^[A-Z]{3}$'),
 status text not null default 'recorded' check(status in ('recorded','pending','paid','failed','refunded','void')),
 transaction_type text not null default 'manual' check(transaction_type in ('manual','charge','refund','adjustment')),
 provider text not null default 'manual', provider_reference text, occurred_at timestamptz not null default now(),
 notes text not null default '', created_at timestamptz not null default now(), created_by text
);
create index if not exists membership_transactions_user_id_idx on public.membership_transactions(user_id);
create index if not exists membership_transactions_occurred_at_idx on public.membership_transactions(occurred_at desc);
alter table public.membership_plans enable row level security;
alter table public.traveler_memberships enable row level security;
alter table public.membership_transactions enable row level security;
revoke all on public.membership_plans,public.traveler_memberships,public.membership_transactions from anon,authenticated;
grant all on public.membership_plans,public.traveler_memberships,public.membership_transactions to service_role;