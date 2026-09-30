-- Stock follows the order lifecycle, in one place, for every order source
-- (app checkout, webapp, subscription deliveries, partner orders, admin edits).
--
--   confirmed / processing / shipped / delivered  -> the order's items are committed (stock deducted)
--   pending / cancelled                           -> not committed (stock returned)
--
-- Rather than "decrement once", we reconcile: for each order item we compute how many units
-- SHOULD be deducted (qty if the order is in a committed status, else 0), compare with what the
-- stock_movements ledger says HAS been deducted, and post the difference. That makes every
-- transition idempotent: re-saving a status does nothing, cancel restores, re-confirming
-- deducts again, and items added after the order row are picked up.
--
-- Overselling is allowed but flagged: stock may go negative and the order gets oversold = true,
-- so the admin panel can warn instead of silently clamping at zero.

-- ── Ledger ───────────────────────────────────────────────────────────────────

create table public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  order_id uuid references public.orders (id) on delete set null,
  order_item_id uuid references public.order_items (id) on delete set null,
  delta integer not null,               -- negative = stock leaves, positive = stock returns
  reason text not null,                 -- 'order_committed' | 'order_released' | 'backfill'
  stock_after integer,
  created_at timestamptz not null default now()
);

create index stock_movements_order_item_idx on public.stock_movements (order_item_id);
create index stock_movements_product_idx on public.stock_movements (product_id, created_at desc);

alter table public.stock_movements enable row level security;

create policy "stock_movements_select_admin" on public.stock_movements
  for select using (public.is_admin());
-- No client write policies: only the SECURITY DEFINER function below writes to the ledger.

alter table public.orders add column oversold boolean not null default false;

-- ── Reconcile function ───────────────────────────────────────────────────────

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
  -- Serialise concurrent status changes on the same order.
  select status into v_status from public.orders where id = p_order_id for update;
  if v_status is null then
    return;
  end if;

  v_committed := v_status in ('confirmed', 'processing', 'shipped', 'delivered');

  for v_item in
    select id, product_id, quantity
    from public.order_items
    where order_id = p_order_id and product_id is not null
    order by product_id, id   -- consistent lock order across orders avoids deadlocks
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

create or replace function public.trg_orders_reconcile_stock()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.reconcile_order_stock(new.id);
  return null;
end;
$$;

create trigger orders_reconcile_stock
  after insert or update of status on public.orders
  for each row execute function public.trg_orders_reconcile_stock();

create or replace function public.trg_order_items_reconcile_stock()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.reconcile_order_stock(new.order_id);
  return null;
end;
$$;

create trigger order_items_reconcile_stock
  after insert or update of quantity, product_id on public.order_items
  for each row execute function public.trg_order_items_reconcile_stock();

-- Return everything an order item has deducted, per product, and post the reversal.
-- Used before an item is deleted or re-pointed at a different product, so stock is never left
-- deducted for something that no longer exists on the order.
create or replace function public.release_item_stock(p_item_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row record;
  v_stock_after integer;
begin
  for v_row in
    select product_id, order_id, -sum(delta) as held
    from public.stock_movements
    where order_item_id = p_item_id
    group by product_id, order_id
    having -sum(delta) <> 0
  loop
    update public.products
    set stock = stock + v_row.held, updated_at = now()
    where id = v_row.product_id
    returning stock into v_stock_after;

    insert into public.stock_movements (product_id, order_id, order_item_id, delta, reason, stock_after)
    values (v_row.product_id, v_row.order_id, p_item_id, v_row.held, 'order_released', v_stock_after);
  end loop;
end;
$$;

create or replace function public.trg_order_items_release_before_delete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.release_item_stock(old.id);
  return old;
end;
$$;

create trigger order_items_release_before_delete
  before delete on public.order_items
  for each row execute function public.trg_order_items_release_before_delete();

-- Deleting a whole order: release while the order row still exists (the ledger references it).
create or replace function public.trg_orders_release_before_delete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item_id uuid;
begin
  for v_item_id in select id from public.order_items where order_id = old.id loop
    perform public.release_item_stock(v_item_id);
  end loop;
  return old;
end;
$$;

create trigger orders_release_before_delete
  before delete on public.orders
  for each row execute function public.trg_orders_release_before_delete();

-- Re-pointing an item at another product: give the old product's stock back first; the
-- AFTER trigger above then deducts from the new product.
create or replace function public.trg_order_items_release_on_product_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.product_id is distinct from old.product_id then
    perform public.release_item_stock(old.id);
  end if;
  return new;
end;
$$;

create trigger order_items_release_on_product_change
  before update of product_id on public.order_items
  for each row execute function public.trg_order_items_release_on_product_change();

-- ── Backfill ─────────────────────────────────────────────────────────────────
-- Orders already past 'pending' were accounted for however they were before (paid Razorpay orders
-- decremented stock directly; others never did). We can't know true stock from history, so record
-- them as already-deducted WITHOUT touching products.stock. Do a physical stock count after
-- deploying and correct products.stock once.

insert into public.stock_movements (product_id, order_id, order_item_id, delta, reason)
select oi.product_id, oi.order_id, oi.id, -oi.quantity, 'backfill'
from public.order_items oi
join public.orders o on o.id = oi.order_id
where oi.product_id is not null
  and o.status in ('confirmed', 'processing', 'shipped', 'delivered');

-- ── Razorpay verification no longer touches stock itself ─────────────────────
-- Same as the 20260831120000 version, minus the inline (clamped) stock decrement. Marking the
-- order 'confirmed' fires the trigger above, which deducts exactly once.

create or replace function public.verify_razorpay_payment(
  p_order_id uuid,
  p_razorpay_payment_id text,
  p_razorpay_signature text
)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_order record;
  v_key_secret text;
  v_expected text;
begin
  select * into v_order from public.orders where id = p_order_id;
  if v_order is null then
    raise exception 'order not found';
  end if;
  if v_order.profile_id != auth.uid() and not public.is_admin() then
    raise exception 'not authorized';
  end if;
  if v_order.razorpay_order_id is null then
    raise exception 'no razorpay order associated with this order';
  end if;

  -- Already settled — don't re-run side effects.
  if v_order.payment_status = 'paid' then
    return true;
  end if;

  select value into v_key_secret from private.secrets where key = 'razorpay_key_secret';

  v_expected := encode(
    hmac(v_order.razorpay_order_id || '|' || p_razorpay_payment_id, v_key_secret, 'sha256'),
    'hex'
  );

  if v_expected = p_razorpay_signature then
    update public.orders
    set payment_status = 'paid',
        razorpay_payment_id = p_razorpay_payment_id,
        razorpay_signature = p_razorpay_signature,
        status = case when status = 'pending' then 'confirmed' else status end
    where id = p_order_id;

    if v_order.discount_code is not null and btrim(v_order.discount_code) <> '' then
      update public.discounts
      set used_count = coalesce(used_count, 0) + 1
      where lower(code) = lower(btrim(v_order.discount_code));
    end if;

    return true;
  else
    update public.orders set payment_status = 'failed' where id = p_order_id;
    return false;
  end if;
end;
$$;
