-- Phase 0 foundation schema: roles, profiles, catalog, orders, subscriptions.
-- See BUILD_PLAN.md for the phased rollout this belongs to.

create extension if not exists pgcrypto;

create type public.user_role as enum ('customer', 'partner', 'admin');
create type public.order_status as enum ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled');
create type public.subscription_status as enum ('active', 'paused', 'cancelled');

-- ── Profiles (one row per auth.users, role drives dashboard/access) ────────────

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'customer',
  full_name text not null default '',
  email text,
  phone text,
  avatar text,
  date_of_birth date,
  preferences text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Helper used by RLS policies below — SECURITY DEFINER so it can read profiles
-- without recursing into the policies it's used inside of.
create or replace function public.current_user_role()
returns public.user_role
language sql
security definer
set search_path = public
stable
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(public.current_user_role() = 'admin', false);
$$;

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''), new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ── Addresses ───────────────────────────────────────────────────────────────

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  label text not null default 'Home',
  full_name text not null,
  phone text not null,
  street text not null,
  apartment text,
  city text not null,
  state text not null,
  zip_code text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create index addresses_profile_id_idx on public.addresses (profile_id);

-- ── Catalog: categories, products, subscription plans ──────────────────────

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  image text,
  icon text,
  color text,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  price numeric(10, 2) not null,
  original_price numeric(10, 2),
  category_id uuid references public.categories (id) on delete set null,
  images text[] not null default '{}',
  unit text,
  weight text,
  nutrition jsonb,
  benefits text[] not null default '{}',
  ingredients text[],
  storage text,
  consumption_tips text[] not null default '{}',
  is_featured boolean not null default false,
  is_seasonal boolean not null default false,
  is_best_seller boolean not null default false,
  rating numeric(2, 1) not null default 0,
  review_count integer not null default 0,
  stock integer not null default 0,
  is_available boolean not null default true,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_category_id_idx on public.products (category_id);

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

create table public.subscription_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(10, 2) not null,
  unit text,
  delivery_frequency text,
  items text[] not null default '{}',
  benefits text[] not null default '{}',
  is_popular boolean not null default false,
  color text,
  created_at timestamptz not null default now()
);

-- ── Subscriptions (customer's active plan) ──────────────────────────────────

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  plan_id uuid not null references public.subscription_plans (id),
  status public.subscription_status not null default 'active',
  address_id uuid references public.addresses (id) on delete set null,
  next_delivery_date date,
  started_at timestamptz not null default now(),
  paused_at timestamptz,
  cancelled_at timestamptz
);

create index subscriptions_profile_id_idx on public.subscriptions (profile_id);

-- ── Orders ───────────────────────────────────────────────────────────────────

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  status public.order_status not null default 'pending',
  subtotal numeric(10, 2) not null,
  delivery_fee numeric(10, 2) not null default 0,
  total numeric(10, 2) not null,
  delivery_address_id uuid references public.addresses (id),
  delivery_date date,
  delivery_time text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_profile_id_idx on public.orders (profile_id);

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  price numeric(10, 2) not null,
  image text
);

create index order_items_order_id_idx on public.order_items (order_id);

-- ── Row Level Security ───────────────────────────────────────────────────────

alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.subscription_plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Profiles: users manage their own row; admins manage all.
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy "profiles_update_own_or_admin" on public.profiles
  for update using (id = auth.uid() or public.is_admin());

-- Addresses: owner-only, admins can read all.
create policy "addresses_all_own" on public.addresses
  for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy "addresses_select_admin" on public.addresses
  for select using (public.is_admin());

-- Catalog: public read, admin write.
create policy "categories_select_all" on public.categories
  for select using (true);
create policy "categories_write_admin" on public.categories
  for insert with check (public.is_admin());
create policy "categories_update_admin" on public.categories
  for update using (public.is_admin());
create policy "categories_delete_admin" on public.categories
  for delete using (public.is_admin());

create policy "products_select_all" on public.products
  for select using (true);
create policy "products_write_admin" on public.products
  for insert with check (public.is_admin());
create policy "products_update_admin" on public.products
  for update using (public.is_admin());
create policy "products_delete_admin" on public.products
  for delete using (public.is_admin());

create policy "subscription_plans_select_all" on public.subscription_plans
  for select using (true);
create policy "subscription_plans_write_admin" on public.subscription_plans
  for insert with check (public.is_admin());
create policy "subscription_plans_update_admin" on public.subscription_plans
  for update using (public.is_admin());
create policy "subscription_plans_delete_admin" on public.subscription_plans
  for delete using (public.is_admin());

-- Subscriptions: owner-only, admins can read/update all.
create policy "subscriptions_all_own" on public.subscriptions
  for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy "subscriptions_select_admin" on public.subscriptions
  for select using (public.is_admin());
create policy "subscriptions_update_admin" on public.subscriptions
  for update using (public.is_admin());

-- Orders: owner can read/insert own; only admin can update status.
create policy "orders_select_own_or_admin" on public.orders
  for select using (profile_id = auth.uid() or public.is_admin());
create policy "orders_insert_own" on public.orders
  for insert with check (profile_id = auth.uid());
create policy "orders_update_admin" on public.orders
  for update using (public.is_admin());

-- Order items: readable/insertable via parent order ownership.
create policy "order_items_select_own_or_admin" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and (o.profile_id = auth.uid() or public.is_admin())
    )
  );
create policy "order_items_insert_own" on public.order_items
  for insert with check (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.profile_id = auth.uid()
    )
  );
