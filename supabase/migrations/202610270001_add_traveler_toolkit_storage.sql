-- Private, per-traveler persistence for StayLatin's new toolkit.
-- Apply this migration to the StayLatin Supabase project before enabling cloud sync.
create table if not exists public.staylatin_traveler_tools (
  user_id uuid not null references public.staylatin_profiles(id) on delete cascade,
  tool_key text not null check (tool_key in ('trip_planner','budget_tracker','documents_checklist','packing_checklist','currency_preferences','phrasebook_favorites','emergency_card')),
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, tool_key)
);
alter table public.staylatin_traveler_tools enable row level security;
create policy "Travelers read own toolkit" on public.staylatin_traveler_tools
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Travelers insert own toolkit" on public.staylatin_traveler_tools
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Travelers update own toolkit" on public.staylatin_traveler_tools
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "Travelers delete own toolkit" on public.staylatin_traveler_tools
  for delete to authenticated using ((select auth.uid()) = user_id);
grant select, insert, update, delete on public.staylatin_traveler_tools to authenticated;
