-- ============================================================
-- 0004_error_monitoring — first-party error capture
-- Errors can be submitted by anyone (like feedback/events — capture must
-- never fail); reading requires a signed-in account.
-- ============================================================

create table if not exists public.app_errors (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  user_id uuid references auth.users(id) on delete set null,
  kind text not null default 'client' check (kind in ('client','server','boundary')),
  message text not null,
  stack text,
  url text,
  component text,
  extra jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists app_errors_created_idx on public.app_errors(created_at desc);
create index if not exists app_errors_message_idx on public.app_errors(message, created_at desc);

drop policy if exists "anyone can submit errors" on public.app_errors;
create policy "anyone can submit errors"
  on public.app_errors for insert with check (true);

drop policy if exists "signed-in users can read errors" on public.app_errors;
create policy "signed-in users can read errors"
  on public.app_errors for select using (auth.role() = 'authenticated');
