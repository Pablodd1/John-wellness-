-- ============================================================
-- 0006_daily_context — calendar + medication schedule
-- Powers the voice receptionist's morning briefing and the
-- "Today" panel. Demo-seeded for the shared demo account.
-- ============================================================

-- ---------- calendar events (fake/demo or later synced from a real calendar) ----------
create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  starts_at timestamptz not null,
  location text,
  kind text not null default 'meeting' check (kind in ('meeting','training','appointment','personal')),
  created_at timestamptz not null default now()
);
create index if not exists calendar_events_user_idx on public.calendar_events(user_id, starts_at);

drop policy if exists "select own calendar" on public.calendar_events;
create policy "select own calendar" on public.calendar_events
  for select using (auth.uid() = user_id);
drop policy if exists "insert own calendar" on public.calendar_events;
create policy "insert own calendar" on public.calendar_events
  for insert with check (auth.uid() = user_id);
drop policy if exists "delete own calendar" on public.calendar_events;
create policy "delete own calendar" on public.calendar_events
  for delete using (auth.uid() = user_id);

-- ---------- medication / supplement schedule (the "what to take now" reminder) ----------
create table if not exists public.user_medications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  dose text not null default '',
  time_of_day time not null default '08:00',
  days_left int not null default 30 check (days_left >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists user_medications_user_idx on public.user_medications(user_id, time_of_day);

drop policy if exists "select own meds" on public.user_medications;
create policy "select own meds" on public.user_medications
  for select using (auth.uid() = user_id);
drop policy if exists "insert own meds" on public.user_medications;
create policy "insert own meds" on public.user_medications
  for insert with check (auth.uid() = user_id);
drop policy if exists "update own meds" on public.user_medications;
create policy "update own meds" on public.user_medications
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "delete own meds" on public.user_medications;
create policy "delete own meds" on public.user_medications
  for delete using (auth.uid() = user_id);
