revoke all on public.traveler_chat_reports from anon, authenticated;
grant select, insert on public.traveler_chat_reports to authenticated;
alter table public.traveler_chat_reports enable row level security;