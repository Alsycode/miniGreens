-- Coupons: one use per customer.
--
-- validate_discount() now rejects a code the signed-in customer has already used on a
-- non-cancelled order, and a trigger enforces the same rule when an order is saved, so it can't
-- be bypassed by skipping the check in the app.

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
  -- Each coupon can be used once per customer. Cancelled orders don't count, so a customer whose
  -- order was cancelled can use the code again.
  if auth.uid() is not null and exists (
    select 1 from public.orders o
    where o.profile_id = auth.uid()
      and o.status <> 'cancelled'
      and o.discount_code is not null
      and lower(btrim(o.discount_code)) = lower(btrim(d.code))
  ) then
    return json_build_object('valid', false, 'reason', 'You''ve already used this coupon.');
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


create or replace function public.trg_orders_coupon_once()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.discount_code is not null and btrim(new.discount_code) <> '' and new.status <> 'cancelled' then
    if exists (
      select 1 from public.orders o
      where o.profile_id = new.profile_id
        and o.id <> new.id
        and o.status <> 'cancelled'
        and o.discount_code is not null
        and lower(btrim(o.discount_code)) = lower(btrim(new.discount_code))
    ) then
      raise exception 'You''ve already used this coupon.' using errcode = 'P0001';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists orders_coupon_once on public.orders;
create trigger orders_coupon_once
  before insert or update of discount_code, status on public.orders
  for each row execute function public.trg_orders_coupon_once();
