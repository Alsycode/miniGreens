-- Phase 4: Razorpay payments.
-- See BUILD_PLAN.md for the phased rollout this belongs to.
--
-- Razorpay's Key Secret must never reach the mobile client or PostgREST. It's
-- stored in a private schema table that PostgREST never exposes (only `public`
-- is exposed to the API), readable only by SECURITY DEFINER functions owned by
-- the migration role. The actual key values are inserted separately, outside
-- this versioned file, so they never land in git history.

create extension if not exists http;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table private.secrets (
  key text primary key,
  value text not null
);
alter table private.secrets enable row level security;
revoke all on private.secrets from public, anon, authenticated;

-- ── Orders: payment fields ──────────────────────────────────────────────────

alter table public.orders add column razorpay_order_id text;
alter table public.orders add column razorpay_payment_id text;
alter table public.orders add column razorpay_signature text;
alter table public.orders add column payment_status text not null default 'pending'
  check (payment_status in ('pending', 'paid', 'failed'));

-- ── Create a Razorpay order for an existing MiniGreens order ───────────────
-- Returns {razorpay_order_id, amount, currency, key_id} so the client can open
-- Razorpay Checkout. Synchronous (uses the `http` extension, not `pg_net`)
-- because the client needs the razorpay_order_id back immediately.

create or replace function public.create_razorpay_order(p_order_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order record;
  v_key_id text;
  v_key_secret text;
  v_auth text;
  v_response http_response;
  v_body jsonb;
  v_razorpay_order_id text;
begin
  select * into v_order from public.orders where id = p_order_id;
  if v_order is null then
    raise exception 'order not found';
  end if;
  if v_order.profile_id != auth.uid() and not public.is_admin() then
    raise exception 'not authorized';
  end if;

  select value into v_key_id from private.secrets where key = 'razorpay_key_id';
  select value into v_key_secret from private.secrets where key = 'razorpay_key_secret';
  if v_key_id is null or v_key_secret is null then
    raise exception 'razorpay credentials not configured';
  end if;

  v_auth := 'Basic ' || encode(convert_to(v_key_id || ':' || v_key_secret, 'utf-8'), 'base64');

  select * into v_response from http((
    'POST',
    'https://api.razorpay.com/v1/orders',
    array[
      http_header('Authorization', v_auth),
      http_header('Content-Type', 'application/json')
    ],
    'application/json',
    jsonb_build_object(
      'amount', round(v_order.total * 100)::int,
      'currency', 'INR',
      'receipt', v_order.order_number
    )::text
  )::http_request);

  if v_response.status != 200 then
    raise exception 'razorpay order creation failed: %', v_response.content;
  end if;

  v_body := v_response.content::jsonb;
  v_razorpay_order_id := v_body ->> 'id';

  update public.orders set razorpay_order_id = v_razorpay_order_id where id = p_order_id;

  return jsonb_build_object(
    'razorpay_order_id', v_razorpay_order_id,
    'amount', v_body -> 'amount',
    'currency', v_body ->> 'currency',
    'key_id', v_key_id
  );
end;
$$;

grant execute on function public.create_razorpay_order(uuid) to authenticated;

-- ── Verify a completed payment and mark the order paid ─────────────────────
-- Signature scheme per Razorpay docs: HMAC-SHA256 of
-- "{razorpay_order_id}|{razorpay_payment_id}" using the Key Secret.

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

grant execute on function public.verify_razorpay_payment(uuid, text, text) to authenticated;
