-- T4: pre-order flow. Pre-orders reuse the existing orders pipeline as a new
-- order_type value ('preorder') rather than a separate table. See TASK_PLAN.md.

-- Widen the order_type check to allow 'preorder'. The original constraint was
-- created unnamed in 20260819120000_partners.sql, so Postgres named it
-- orders_order_type_check.
alter table public.orders drop constraint if exists orders_order_type_check;
alter table public.orders
  add constraint orders_order_type_check
  check (order_type in ('standard', 'business', 'preorder'));

-- When Admin knows roughly when a pre-ordered item will be back in stock.
alter table public.orders add column if not exists expected_availability_date date;
