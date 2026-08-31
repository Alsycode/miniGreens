-- BUG-02: discounts.used_count was never incremented, so a coupon with a
-- usage_limit could be redeemed unlimited times (validate_discount only *reads*
-- used_count). Fix: bump used_count exactly once, on the genuine transition of
-- an order to payment_status = 'paid', inside verify_razorpay_payment.
--
-- Recreates verify_razorpay_payment (latest version from migration
-- 20260821000000_inventory_decrement.sql) with:
--   * an idempotency guard so a second call for an already-paid order is a
--     no-op (no double stock decrement, no double used_count bump);
--   * the discounts.used_count increment when the order carries a discount_code.
-- Old migration files are left untouched (forward-only convention).

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

  -- Already settled — don't re-run stock / coupon side effects.
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

    update public.products
    set stock = greatest(stock - oi.quantity, 0),
        updated_at = now()
    from public.order_items oi
    where oi.order_id = p_order_id
      and oi.product_id = public.products.id
      and oi.product_id is not null;

    -- BUG-02: count this redemption against the coupon's usage_limit.
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

grant execute on function public.verify_razorpay_payment(uuid, text, text) to authenticated;
