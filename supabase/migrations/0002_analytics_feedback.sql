-- ============================================================
-- 0002_analytics_feedback — first-party analytics + tester feedback
-- Events and feedback can be submitted by anyone (including anonymous
-- testers); reading them requires a signed-in account. No service_role
-- key is ever used by the client.
-- ============================================================

-- ---------- app events (first-party analytics) ----------
create table if not exists public.app_events (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  user_id uuid references auth.users(id) on delete set null,
  event_name text not null,
  page text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists app_events_session_idx on public.app_events(session_id, created_at);
create index if not exists app_events_name_idx on public.app_events(event_name, created_at desc);

drop policy if exists "anyone can submit events" on public.app_events;
create policy "anyone can submit events"
  on public.app_events for insert with check (true);

drop policy if exists "signed-in users can read events" on public.app_events;
create policy "signed-in users can read events"
  on public.app_events for select using (auth.role() = 'authenticated');

-- ---------- tester feedback / reviews ----------
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  rating int check (rating between 1 and 5),
  message text not null,
  page text,
  user_id uuid references auth.users(id) on delete set null,
  status text not null default 'new' check (status in ('new','reviewed','planned','done')),
  created_at timestamptz not null default now()
);
create index if not exists feedback_created_idx on public.feedback(created_at desc);

drop policy if exists "anyone can submit feedback" on public.feedback;
create policy "anyone can submit feedback"
  on public.feedback for insert with check (true);

drop policy if exists "signed-in users can read feedback" on public.feedback;
create policy "signed-in users can read feedback"
  on public.feedback for select using (auth.role() = 'authenticated');

-- ---------- profile goals (personalization input) ----------
alter table public.profiles add column if not exists goals jsonb default '[]'::jsonb;
