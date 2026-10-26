create extension if not exists pgcrypto;
create table if not exists public.independent_associates (
 id uuid primary key default gen_random_uuid(), full_name text not null check(char_length(trim(full_name)) between 2 and 160), email text not null,
 phone text, whatsapp text, country text, city text, territory text, referral_code text not null unique,
 commission_rate numeric(7,3) not null default 10 check(commission_rate between 0 and 100),
 commission_basis text not null default 'net_revenue' check(commission_basis in ('net_revenue','gross_revenue','fixed_per_conversion')),
 fixed_commission_amount numeric(12,2) check(fixed_commission_amount is null or fixed_commission_amount>=0), currency text not null default 'USD' check(currency ~ '^[A-Z]{3}$'),
 status text not null default 'pending' check(status in ('pending','active','rejected','suspended','terminated')), start_date date, end_date date,
 agreement_status text not null default 'not_signed' check(agreement_status in ('not_signed','sent','signed','expired')), agreement_signed_at timestamptz,
 payment_method text, payment_notes text, internal_notes text, created_by text, updated_by text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(end_date is null or start_date is null or end_date>=start_date), check(commission_basis<>'fixed_per_conversion' or fixed_commission_amount is not null)
);
create index if not exists independent_associates_status_idx on public.independent_associates(status);
create index if not exists independent_associates_name_idx on public.independent_associates using gin(to_tsvector('simple',coalesce(full_name,'')||' '||coalesce(email,'')||' '||coalesce(territory,'')));
create table if not exists public.associate_commissions (
 id uuid primary key default gen_random_uuid(), associate_id uuid not null references public.independent_associates(id) on delete restrict, referral_code text not null,
 transaction_reference text not null, client_or_business text, description text, commission_basis text not null check(commission_basis in ('net_revenue','gross_revenue','fixed_per_conversion')),
 basis_amount numeric(12,2) not null default 0 check(basis_amount>=0), commission_rate numeric(7,3) not null default 0 check(commission_rate between 0 and 100),
 commission_amount numeric(12,2) not null check(commission_amount>=0), currency text not null default 'USD' check(currency ~ '^[A-Z]{3}$'),
 status text not null default 'pending' check(status in ('pending','approved','paid','void')), earned_at date not null default current_date,
 approved_at timestamptz, paid_at timestamptz, payment_reference text, notes text, created_by text, updated_by text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(associate_id,transaction_reference)
);
create index if not exists associate_commissions_associate_idx on public.associate_commissions(associate_id,earned_at desc);
create index if not exists associate_commissions_status_idx on public.associate_commissions(status);
create table if not exists public.independent_associate_audit (id bigint generated always as identity primary key, associate_id uuid, commission_id uuid, action text not null, changed_by text not null, details jsonb not null default '{}'::jsonb, created_at timestamptz not null default now());
create index if not exists independent_associate_audit_created_idx on public.independent_associate_audit(created_at desc);
alter table public.independent_associates enable row level security; alter table public.associate_commissions enable row level security; alter table public.independent_associate_audit enable row level security;
revoke all on public.independent_associates from anon,authenticated; revoke all on public.associate_commissions from anon,authenticated; revoke all on public.independent_associate_audit from anon,authenticated;
grant all on public.independent_associates to service_role; grant all on public.associate_commissions to service_role; grant all on public.independent_associate_audit to service_role; grant usage,select on sequence public.independent_associate_audit_id_seq to service_role;