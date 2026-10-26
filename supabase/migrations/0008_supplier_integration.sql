-- ============================================================
-- 0008_supplier_integration — Supliful white-label fulfillment
-- supplier_products: catalog synced from the Supliful API
-- supplier_orders: links our orders to Supliful fulfillment orders
-- ============================================================

create table if not exists public.supplier_products (
  id uuid primary key default gen_random_uuid(),
  supliful_id text not null unique,
  name text not null,
  sku text,
  category text,
  cost numeric(10,2),
  retail_price numeric(10,2),
  image_url text,
  in_stock boolean not null default true,
  offered boolean not null default false,
  synced_at timestamptz not null default now()
);

drop policy if exists "read supplier catalog" on public.supplier_products;
create policy "read supplier catalog" on public.supplier_products
  for select using (auth.role() = 'authenticated');

-- writes happen only through server functions using the service key

create table if not exists public.supplier_orders (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  supliful_order_id text,
  status text not null default 'placed' check (status in ('placed','shipped','delivered','cancelled','failed')),
  lines jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

drop policy if exists "read own supplier orders" on public.supplier_orders;
create policy "read own supplier orders" on public.supplier_orders
  for select using (auth.uid() = (select user_id from public.orders o where o.id = order_id));

-- writes happen only through server functions using the service key
