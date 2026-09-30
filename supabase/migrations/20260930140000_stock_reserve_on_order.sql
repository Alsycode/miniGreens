-- Stock is held from the moment an order is placed, and subscription orders are created a week ahead.
--
-- Every order is pay-on-delivery, so there is no payment step that could mark an order "committed".
-- Waiting for an admin to press Confirm left stock untouched (and orders double-sellable) in between,
-- and subscription orders only appeared on the delivery day itself. Now:
--   * every order except 'cancelled' holds its stock (pending, confirmed, processing, shipped, delivered)
--   * cancelling returns it; re-opening a cancelled order takes it again
--   * subscription orders are generated 7 days before delivery, so stock is held (and any shortage
--     shows as an "Oversold" flag) a week ahead instead of on the day.

create or replace function public.reconcile_order_stock(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status public.order_status;
  v_committed boolean;
  v_item record;
  v_already integer;
  v_diff integer;
  v_stock_after integer;
begin
  select status into v_status from public.orders where id = p_order_id for update;
  if v_status is null then
    return;
  end if;

  v_committed := v_status <> 'cancelled';

  for v_item in
    select id, product_id, quantity
    from public.order_items
    where order_id = p_order_id and product_id is not null
    order by product_id, id
  loop
    select coalesce(-sum(delta), 0) into v_already
    from public.stock_movements
    where order_item_id = v_item.id;

    v_diff := (case when v_committed then v_item.quantity else 0 end) - v_already;
    if v_diff = 0 then
      continue;
    end if;

    update public.products
    set stock = stock - v_diff, updated_at = now()
    where id = v_item.product_id
    returning stock into v_stock_after;

    insert into public.stock_movements (product_id, order_id, order_item_id, delta, reason, stock_after)
    values (
      v_item.product_id, p_order_id, v_item.id, -v_diff,
      case when v_diff > 0 then 'order_committed' else 'order_released' end,
      v_stock_after
    );

    if v_diff > 0 and v_stock_after < 0 then
      update public.orders set oversold = true where id = p_order_id;
    end if;
  end loop;
end;
$$;

-- Subscription orders: same function as before, but generated `lead_days` ahead of delivery.
create or replace function public.generate_subscription_orders()
returns table (subscription_id uuid, order_id uuid, order_number text, outcome text)
language plpgsql
security definer
set search_path = public
as $$
declare
  sub record;
  item record;
  new_order_id uuid;
  new_order_number text;
  interval_days int;
  items_text text;
  new_next_date date;
  custom_subtotal numeric(10, 2);
  has_items boolean;
  lead_days constant int := 7;  -- generate each order this many days before its delivery date
begin
  for sub in
    select s.id, s.plan_id, s.profile_id, s.address_id, s.next_delivery_date,
           s.is_custom, s.custom_frequency,
           p.name as plan_name, p.price as plan_price, p.delivery_frequency, p.items
    from public.subscriptions s
    left join public.subscription_plans p on p.id = s.plan_id
    where s.status = 'active'
      and s.next_delivery_date is not null
      and s.next_delivery_date <= current_date + lead_days
  loop
    if sub.address_id is null then
      subscription_id := sub.id;
      order_id := null;
      order_number := null;
      outcome := 'skipped: no delivery address on file';
      return next;
      continue;
    end if;

    interval_days := case
      when lower(coalesce(sub.custom_frequency, sub.delivery_frequency, 'weekly')) = 'monthly' then 30
      else 7
    end;
    new_order_number := 'SUB' || to_char(now(), 'YYMMDD') || lpad(nextval('public.subscription_order_seq')::text, 5, '0');

    if sub.is_custom then
      select count(*) > 0 into has_items
      from public.subscription_items si where si.subscription_id = sub.id;

      if not has_items then
        subscription_id := sub.id;
        order_id := null;
        order_number := null;
        outcome := 'skipped: no products configured on this custom subscription';
        return next;
        continue;
      end if;

      select coalesce(sum(pr.price * si.quantity), 0) into custom_subtotal
      from public.subscription_items si
      join public.products pr on pr.id = si.product_id
      where si.subscription_id = sub.id;

      insert into public.orders (
        order_number, profile_id, status, subtotal, delivery_fee, total,
        delivery_address_id, delivery_date, notes, order_type, payment_status
      ) values (
        new_order_number, sub.profile_id, 'pending', custom_subtotal, 0, custom_subtotal,
        sub.address_id, sub.next_delivery_date, 'Custom build-your-own subscription',
        'subscription', 'pending'
      )
      returning id into new_order_id;

      for item in
        select pr.id as product_id, pr.name as product_name, pr.price as price, si.quantity as quantity
        from public.subscription_items si
        join public.products pr on pr.id = si.product_id
        where si.subscription_id = sub.id
      loop
        insert into public.order_items (order_id, product_id, product_name, quantity, price)
        values (new_order_id, item.product_id, item.product_name, item.quantity, item.price);
      end loop;
    else
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
    end if;

    new_next_date := sub.next_delivery_date;
    while new_next_date <= current_date + lead_days loop
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


-- Apply the new rule to orders that already exist (pending ones now hold stock too).
select public.reconcile_order_stock(id) from public.orders;
