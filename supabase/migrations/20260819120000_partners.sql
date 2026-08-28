-- Phase 1: Partner role. See BUILD_PLAN.md.

create type public.partner_business_type as enum (
  'individual', 'women', 'cafe', 'restaurant', 'shop', 'fitness_wellness', 'community'
);
create type public.partner_status as enum ('pending', 'approved', 'rejected');

create table public.partners (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles (id) on delete cascade,
  business_type public.partner_business_type not null,
  business_name text not null,
  contact_person text not null,
  phone text not null,
  address text,
  status public.partner_status not null default 'pending',
  platform_fee_percent numeric(5, 2) not null default 10,
  applied_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles (id)
);

create index partners_profile_id_idx on public.partners (profile_id);
create index partners_status_idx on public.partners (status);

-- Women Partner Rule: 0% platform fee by default at application time.
create or replace function public.set_partner_default_fee()
returns trigger
language plpgsql
as $$
begin
  if new.business_type = 'women' then
    new.platform_fee_percent := 0;
  end if;
  return new;
end;
$$;

create trigger partners_set_default_fee
  before insert on public.partners
  for each row execute function public.set_partner_default_fee();

-- Approving an application promotes the applicant's profile to the partner role.
create or replace function public.handle_partner_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'approved' and old.status is distinct from 'approved' then
    update public.profiles set role = 'partner' where id = new.profile_id;
    new.reviewed_at := now();
  elsif new.status = 'rejected' and old.status is distinct from 'rejected' then
    new.reviewed_at := now();
  end if;
  return new;
end;
$$;

create trigger partners_handle_status_change
  before update on public.partners
  for each row execute function public.handle_partner_status_change();

alter table public.partners enable row level security;

create policy "partners_select_own_or_admin" on public.partners
  for select using (profile_id = auth.uid() or public.is_admin());
create policy "partners_insert_own" on public.partners
  for insert with check (profile_id = auth.uid());
create policy "partners_update_admin" on public.partners
  for update using (public.is_admin());

-- Café/Shop bulk business orders reuse the orders table (same pipeline the PDF spec
-- calls for: "MGC doesn't need a separate café application") but need a few extra
-- fields and a way to tell them apart from normal customer orders in Admin.
alter table public.orders
  add column order_type text not null default 'standard'
    check (order_type in ('standard', 'business')),
  add column business_name text,
  add column contact_person text;

create index orders_order_type_idx on public.orders (order_type);
