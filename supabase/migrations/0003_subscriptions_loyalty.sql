-- ============================================================
-- 0003_subscriptions_loyalty — retention commerce
-- ============================================================

-- ---------- subscriptions (created from checkout, managed by the user) ----------
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  product_id text references public.products(id) on delete set null,
  product_name text not null,
  dosage text,
  cadence_days int not null default 30 check (cadence_days between 7 and 365),
  status text not null default 'active' check (status in ('active','paused','cancelled')),
  next_delivery date not null default (current_date + 30),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists subscriptions_user_idx on public.subscriptions(user_id, status);

drop trigger if exists subscriptions_touch_updated_at on public.subscriptions;
create trigger subscriptions_touch_updated_at
  before update on public.subscriptions
  for each row execute function public.touch_updated_at();

drop policy if exists "select own subscriptions" on public.subscriptions;
create policy "select own subscriptions" on public.subscriptions
  for select using (auth.uid() = user_id);
drop policy if exists "insert own subscriptions" on public.subscriptions;
create policy "insert own subscriptions" on public.subscriptions
  for insert with check (auth.uid() = user_id);
drop policy if exists "update own subscriptions" on public.subscriptions;
create policy "update own subscriptions" on public.subscriptions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "delete own subscriptions" on public.subscriptions;
create policy "delete own subscriptions" on public.subscriptions
  for delete using (auth.uid() = user_id);

-- ---------- loyalty points on the profile ----------
alter table public.profiles add column if not exists loyalty_points int not null default 0;

-- ---------- track redemptions on orders ----------
alter table public.orders add column if not exists points_redeemed int not null default 0;
alter table public.orders add column if not exists points_earned int not null default 0;

-- ---------- product lab reports (COA). Seeded null; UI shows the link only when set ----------
alter table public.products add column if not exists coa_url text;

-- ---------- atomic loyalty adjustment (PostgREST can't do col = col + x) ----------
create or replace function public.add_loyalty_points(p_user uuid, p_delta int)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.profiles
     set loyalty_points = greatest(0, loyalty_points + p_delta)
   where user_id = p_user;
end $$;
