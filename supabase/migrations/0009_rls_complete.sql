-- ============================================================
-- 0009_rls_complete — enable RLS on every table that was found
-- without it in production (security advisor: rls_disabled_in_public)
--
-- Applied live 2026-11-03; this file makes the repo match the DB.
-- Idempotent: safe to run more than once.
-- ============================================================

alter table public.app_events        enable row level security;
alter table public.app_errors        enable row level security;
alter table public.calendar_events   enable row level security;
alter table public.feedback          enable row level security;
alter table public.health_readings   enable row level security;
alter table public.subscriptions     enable row level security;
alter table public.supplier_orders   enable row level security;
alter table public.supplier_products enable row level security;
alter table public.user_medications  enable row level security;

-- User-owned tables: owner-only CRUD
drop policy if exists "own calendar all" on public.calendar_events;
create policy "own calendar all" on public.calendar_events
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own meds all" on public.user_medications;
create policy "own meds all" on public.user_medications
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own subs all" on public.subscriptions;
create policy "own subs all" on public.subscriptions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own readings all" on public.health_readings;
create policy "own readings all" on public.health_readings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Telemetry & tester feedback: inserts only (anon pre-login + signed-in);
-- reading/management stays server-side via the service role.
drop policy if exists "insert events" on public.app_events;
create policy "insert events" on public.app_events
  for insert to anon, authenticated with check (true);
drop policy if exists "insert errors" on public.app_errors;
create policy "insert errors" on public.app_errors
  for insert to anon, authenticated with check (true);
drop policy if exists "insert feedback" on public.feedback;
create policy "insert feedback" on public.feedback
  for insert to anon, authenticated with check (true);

-- supplier_products / supplier_orders: no client policies at all —
-- service role only (bypasses RLS).
