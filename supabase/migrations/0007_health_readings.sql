-- ============================================================
-- 0007_health_readings — longitudinal wearable/lab readings
-- The researchable data layer: HRV, sleep, blood pressure, steps,
-- weight, glucose etc. — one row per reading, fully user-owned.
-- ============================================================

create table if not exists public.health_readings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  metric text not null,
  value numeric(10,2) not null,
  unit text not null default '',
  source text not null default 'device',
  recorded_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists health_readings_user_metric_idx
  on public.health_readings(user_id, metric, recorded_at desc);

drop policy if exists "select own readings hw" on public.health_readings;
create policy "select own readings hw" on public.health_readings
  for select using (auth.uid() = user_id);
drop policy if exists "insert own readings hw" on public.health_readings;
create policy "insert own readings hw" on public.health_readings
  for insert with check (auth.uid() = user_id);
drop policy if exists "delete own readings hw" on public.health_readings;
create policy "delete own readings hw" on public.health_readings
  for delete using (auth.uid() = user_id);
