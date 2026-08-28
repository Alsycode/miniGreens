-- pgcrypto's hmac() only has a (bytea, bytea, text) overload; the previous
-- version passed plain text and failed to resolve at call time. Cast both
-- the signed string and the key to bytea via convert_to().

create or replace function public.verify_razorpay_payment(
  p_order_id uuid,
  p_razorpay_payment_id text,
  p_razorpay_signature text
)
returns boolean
language plpgsql
security definer
set search_path = public
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
    hmac(
      convert_to(v_order.razorpay_order_id || '|' || p_razorpay_payment_id, 'utf-8'),
      convert_to(v_key_secret, 'utf-8'),
      'sha256'
    ),
    'hex'
  );

  if v_expected = p_razorpay_signature then
    update public.orders
    set payment_status = 'paid',
        razorpay_payment_id = p_razorpay_payment_id,
        razorpay_signature = p_razorpay_signature,
        status = case when status = 'pending' then 'confirmed' else status end
    where id = p_order_id;
    return true;
  else
    update public.orders set payment_status = 'failed' where id = p_order_id;
    return false;
  end if;
end;
$$;
