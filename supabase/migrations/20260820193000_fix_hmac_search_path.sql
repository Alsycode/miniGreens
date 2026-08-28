-- pgcrypto's functions (hmac, etc.) live in the `extensions` schema on
-- Supabase, not `public` — the previous fix cast to bytea but that still
-- failed since `extensions` wasn't in the function's search_path at all.
-- Both a (bytea, bytea, text) and a (text, text, text) overload of hmac()
-- exist there, so plain text args work once the schema is reachable.

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
    return true;
  else
    update public.orders set payment_status = 'failed' where id = p_order_id;
    return false;
  end if;
end;
$$;
