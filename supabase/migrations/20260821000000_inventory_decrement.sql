-- Decrement product stock when a payment is verified as paid.
-- Inlined into verify_razorpay_payment (rather than a trigger on
-- payment_status) so it fires exactly once, only on a genuine verified
-- payment, not on any future admin override of payment_status.

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

    return true;
  else
    update public.orders set payment_status = 'failed' where id = p_order_id;
    return false;
  end if;
end;
$$;
