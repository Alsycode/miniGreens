-- "Build Your Own Subscription" (MGC 2.0 spec, item 2 of the 2026-09-20 gap report):
-- customer picks arbitrary products + quantities + a Weekly/Monthly frequency, instead of only
-- choosing among the curated `subscription_plans` rows.
--
-- Design: a subscription is either a curated plan (existing behaviour, `plan_id` set,
-- `is_custom = false`) or a custom build (`plan_id` null, `is_custom = true`,
-- `custom_frequency` set, real product selections in the new `subscription_items` table).
-- `generate_subscription_orders()` is extended to build real per-product `order_items` rows for
-- custom subscriptions (unlike curated plans, which still get one whole-box line — see
-- 20260920120000's header comment for why curated plans can't do that).

alter table public.subscriptions
  alter column plan_id drop not null;

alter table public.subscriptions
  add column is_custom boolean not null default false,
  add column custom_frequency text check (custom_frequency in ('weekly', 'monthly'));

alter table public.subscriptions
  add constraint subscriptions_custom_shape check (
    (is_custom = false and plan_id is not null and custom_frequency is null)
    or
    (is_custom = true and plan_id is null and custom_frequency is not null)
  );

create table public.subscription_items (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.subscriptions (id) on delete cascade,
  product_id uuid not null references public.products (id),
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now()
);

create index subscription_items_subscription_id_idx on public.subscription_items (subscription_id);

alter table public.subscription_items enable row level security;

create policy "subscription_items_all_own" on public.subscription_items
  for all using (
    exists (
      select 1 from public.subscriptions s
      where s.id = subscription_items.subscription_id
        and s.profile_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.subscriptions s
      where s.id = subscription_items.subscription_id
        and s.profile_id = auth.uid()
    )
  );

create policy "subscription_items_select_admin" on public.subscription_items
  for select using (public.is_admin());

-- Rebuild the worker to branch on `is_custom`. Curated-plan branch is byte-identical to the
-- idempotency-fix version in 20260920130000; only the loop's source query (left join instead of
-- inner join, since custom subscriptions have no plan) and a new custom-items branch are added.
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
begin
  for sub in
    select s.id, s.plan_id, s.profile_id, s.address_id, s.next_delivery_date,
           s.is_custom, s.custom_frequency,
           p.name as plan_name, p.price as plan_price, p.delivery_frequency, p.items
    from public.subscriptions s
    left join public.subscription_plans p on p.id = s.plan_id
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
