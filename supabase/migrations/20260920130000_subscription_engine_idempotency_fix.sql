-- Fix: generate_subscription_orders() advanced next_delivery_date by exactly one interval,
-- which can still land on-or-before current_date (e.g. a subscription overdue by more than one
-- cycle, or one whose date lands exactly on today after a single +7d/+30d step). That let a
-- same-day re-run (a second admin click, or the cron firing twice) generate a duplicate order for
-- the same delivery. Fix: loop advancing the date until it's strictly in the future, and generate
-- at most one order per subscription per run either way (no backfilling missed cycles as separate
-- orders — a badly overdue subscription just catches its schedule up silently).

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
  new_next_date date;
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

    -- Advance strictly past today, even if the subscription was overdue by more than one cycle —
    -- this is the fix: a plain single `+ interval` could still land on-or-before current_date.
    new_next_date := sub.next_delivery_date;
    while new_next_date <= current_date loop
      new_next_date := new_next_date + (interval_days || ' days')::interval;
    end loop;

    update public.subscriptions
    set next_delivery_date = new_next_date,
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
