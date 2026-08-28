-- Phase 2: discounts/coupons engine + product pre-order flag. See BUILD_PLAN.md.

create type public.discount_type as enum ('percentage', 'flat');
create type public.discount_target as enum (
  'all', 'category', 'product', 'subscription_plan', 'partner', 'wholesale'
);

create table public.discounts (
  id uuid primary key default gen_random_uuid(),
  code text unique,
  description text,
  discount_type public.discount_type not null,
  value numeric(10, 2) not null,
  target public.discount_target not null default 'all',
  target_id uuid,
  min_order_value numeric(10, 2),
  max_discount_amount numeric(10, 2),
  is_birthday_offer boolean not null default false,
  is_active boolean not null default true,
  starts_at timestamptz,
  expires_at timestamptz,
  usage_limit integer,
  used_count integer not null default 0,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles (id)
);

create index discounts_target_idx on public.discounts (target, target_id);
create index discounts_active_idx on public.discounts (is_active);

alter table public.discounts enable row level security;

-- Anyone can see active discounts (so the app can show "available offers"); admins see all.
create policy "discounts_select_active_or_admin" on public.discounts
  for select using (is_active = true or public.is_admin());
create policy "discounts_write_admin" on public.discounts
  for insert with check (public.is_admin());
create policy "discounts_update_admin" on public.discounts
  for update using (public.is_admin());
create policy "discounts_delete_admin" on public.discounts
  for delete using (public.is_admin());

-- Lets Admin flag out-of-stock products as reservable ahead of restock.
alter table public.products add column is_preorder boolean not null default false;
