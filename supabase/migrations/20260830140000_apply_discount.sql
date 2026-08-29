-- T2: coupon validation RPC + order-level discount columns. See TASK_PLAN.md.

-- Persist the applied coupon on the order.
alter table public.orders add column if not exists discount_code text;
alter table public.orders add column if not exists discount_amount numeric(10, 2) not null default 0;

-- ── Coupon validation ──────────────────────────────────────────────────────
-- Called from the mobile checkout Review step. Returns a json blob the client
-- reads to show the applied state / an error and to recompute the order total.
-- SECURITY DEFINER so it can (a) read the caller's date_of_birth for birthday
-- offers and (b) see inactive/expired rows to give a precise reason — RLS only
-- exposes active discounts to non-admins.
create or replace function public.validate_discount(p_code text, p_subtotal numeric)
returns json
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  d public.discounts%rowtype;
  v_amount numeric := 0;
  v_birth_month int;
begin
  if p_code is null or btrim(p_code) = '' then
    return json_build_object('valid', false, 'reason', 'Enter a coupon code.');
  end if;

  select * into d
  from public.discounts
  where code is not null and lower(code) = lower(btrim(p_code))
  order by created_at desc
  limit 1;

  if not found then
    return json_build_object('valid', false, 'reason', 'That code doesn''t exist.');
  end if;
  if not d.is_active then
    return json_build_object('valid', false, 'reason', 'This coupon is no longer active.');
  end if;
  if d.starts_at is not null and d.starts_at > now() then
    return json_build_object('valid', false, 'reason', 'This coupon isn''t available yet.');
  end if;
  if d.expires_at is not null and d.expires_at < now() then
    return json_build_object('valid', false, 'reason', 'This coupon has expired.');
  end if;
  if d.usage_limit is not null and d.used_count >= d.usage_limit then
    return json_build_object('valid', false, 'reason', 'This coupon has reached its usage limit.');
  end if;
  if d.min_order_value is not null and p_subtotal < d.min_order_value then
    return json_build_object(
      'valid', false,
      'reason', 'Spend at least ₹' || trim(to_char(d.min_order_value, 'FM999999990.00')) || ' to use this coupon.'
    );
  end if;

  -- Birthday rewards only apply during the caller's birth month.
  if d.is_birthday_offer then
    select extract(month from date_of_birth)::int into v_birth_month
    from public.profiles where id = auth.uid();
    if v_birth_month is null then
      return json_build_object(
        'valid', false,
        'reason', 'Add your date of birth to your profile to use birthday rewards.'
      );
    end if;
    if v_birth_month <> extract(month from current_date)::int then
      return json_build_object(
        'valid', false,
        'reason', 'This birthday reward is only valid during your birthday month.'
      );
    end if;
  end if;

  if d.discount_type = 'percentage' then
    v_amount := round(p_subtotal * d.value / 100.0, 2);
  else
    v_amount := d.value;
  end if;
  if d.max_discount_amount is not null then
    v_amount := least(v_amount, d.max_discount_amount);
  end if;
  v_amount := least(greatest(v_amount, 0), p_subtotal);

  return json_build_object(
    'valid', true,
    'reason', null,
    'code', upper(d.code),
    'discount_type', d.discount_type,
    'discount_value', d.value,
    'discount_amount', v_amount
  );
end;
$$;

grant execute on function public.validate_discount(text, numeric) to authenticated, anon;
