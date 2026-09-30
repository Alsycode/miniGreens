-- T12: Recurring subscription order engine.
--
-- Turns due `subscriptions` rows into real `orders` rows. Design notes (see TASK_PLAN.md T12):
-- - `subscription_plans.items` is curated marketing copy ("2 smoothies", "Free delivery"), not a
--   product-linked list — there is no reliable way to map it to specific `products` rows. So each
--   generated order gets ONE `order_items` line representing the whole box (product_id null,
--   product_name = "<plan name> — <frequency> Box"), and the human-readable contents go into
--   `orders.notes` for the packing/delivery team.
-- - `delivery_frequency` is free text ("Weekly") rather than an enum; the engine matches it
--   case-insensitively rather than forcing a schema/data migration on existing rows.
-- - No payment is collected — matches how every other order in this app is created
--   (`payment_status = 'pending'`, reconciled by phone/WhatsApp).

-- Allow subscription-generated orders alongside standard/business/preorder.
alter table public.orders drop constraint if exists orders_order_type_check;
alter table public.orders
  add constraint orders_order_type_check
  check (order_type in ('standard', 'business', 'preorder', 'subscription'));

-- Collision-safe order numbers for orders generated outside the client (the app's own
-- `ORD<timestamp>` scheme is fine for one-at-a-time checkout but not for a batch job).
create sequence if not exists public.subscription_order_seq;

-- Track the last time each subscription actually produced an order, for admin visibility /
-- debugging (distinct from `next_delivery_date`, which is the *next* due date).
alter table public.subscriptions
  add column if not exists last_order_generated_at timestamptz;

-- The worker. SECURITY DEFINER so it can write orders/order_items and advance subscriptions
-- regardless of who/what invokes it, but EXECUTE is restricted below to service_role only
-- (the daily cron) plus the admin-gated wrapper further down.
create or replace function public.generate_subscription_orders()
returns table (subscription_id uuid, order_id uuid, order_number text, outcome text)
language plpgsql
security definer
set search_path = public
as $$
declare
  sub record;
  new_order_id uuid;
  new_order_number text;
  interval_days int;
  items_text text;
begin
  for sub in
    select s.id, s.plan_id, s.profile_id, s.address_id, s.next_delivery_date,
           p.name as plan_name, p.price as plan_price, p.delivery_frequency, p.items
    from public.subscriptions s
    join public.subscription_plans p on p.id = s.plan_id
    where s.status = 'active'
      and s.next_delivery_date is not null
      and s.next_delivery_date <= current_date
  loop
    if sub.address_id is null then
      subscription_id := sub.id;
      order_id := null;
      order_number := null;
      outcome := 'skipped: no delivery address on file';
      return next;
      continue;
    end if;

    interval_days := case when lower(coalesce(sub.delivery_frequency, 'weekly')) = 'monthly' then 30 else 7 end;
    new_order_number := 'SUB' || to_char(now(), 'YYMMDD') || lpad(nextval('public.subscription_order_seq')::text, 5, '0');
    items_text := array_to_string(coalesce(sub.items, '{}'), ', ');

    insert into public.orders (
      order_number, profile_id, status, subtotal, delivery_fee, total,
      delivery_address_id, delivery_date, notes, order_type, payment_status
    ) values (
      new_order_number, sub.profile_id, 'pending', sub.plan_price, 0, sub.plan_price,
      sub.address_id, sub.next_delivery_date,
      case when items_text <> '' then 'Subscription box contents: ' || items_text else null end,
      'subscription', 'pending'
    )
    returning id into new_order_id;

    insert into public.order_items (order_id, product_id, product_name, quantity, price)
    values (new_order_id, null, sub.plan_name || ' — ' || coalesce(sub.delivery_frequency, 'Weekly') || ' Box', 1, sub.plan_price);

    update public.subscriptions
    set next_delivery_date = sub.next_delivery_date + (interval_days || ' days')::interval,
        last_order_generated_at = now()
    where id = sub.id;

    subscription_id := sub.id;
    order_id := new_order_id;
    order_number := new_order_number;
    outcome := 'order created';
    return next;
  end loop;
end;
$$;

revoke execute on function public.generate_subscription_orders() from public, authenticated, anon;
grant execute on function public.generate_subscription_orders() to service_role;

-- Admin-gated wrapper so the dashboard can trigger a run on demand (e.g. a "Generate now" button)
-- without granting the raw worker function to authenticated users.
create or replace function public.admin_generate_subscription_orders()
returns table (subscription_id uuid, order_id uuid, order_number text, outcome text)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;
  return query select * from public.generate_subscription_orders();
end;
$$;

grant execute on function public.admin_generate_subscription_orders() to authenticated;

-- Schedule the daily run via pg_cron, same pattern as the existing birthday-offers job
-- (20260820140000_notifications.sql) — skipped rather than failing the migration if pg_cron
-- isn't available on this project.
do $$
begin
  create extension if not exists pg_cron;
  perform cron.schedule('generate-subscription-orders-daily', '0 6 * * *', $cron$select public.generate_subscription_orders();$cron$);
exception when others then
  raise notice 'pg_cron unavailable — schedule public.generate_subscription_orders() externally (e.g. a daily Edge Function cron), or run public.admin_generate_subscription_orders() manually from the admin dashboard.';
end $$;
