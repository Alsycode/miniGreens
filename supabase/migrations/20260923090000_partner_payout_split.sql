-- T12: split partner payouts (growers who earn) from wholesale buyers
-- (café/restaurant/shop/fitness_wellness, who purchase stock and should not
-- accrue cash payouts for their own orders). See chat 2026-09-23.

alter table public.partners
  add column payout_eligible boolean not null default true;

-- Growers (individual/women/community) supply product and earn payouts.
-- Café/Restaurant/Shop/Fitness-Wellness place wholesale purchase orders and
-- should never accrue a payout for their own spend.
create or replace function public.set_partner_default_fee()
returns trigger
language plpgsql
as $$
begin
  if new.business_type = 'women' then
    new.platform_fee_percent := 0;
  end if;
  if new.business_type in ('cafe', 'restaurant', 'shop', 'fitness_wellness') then
    new.payout_eligible := false;
  end if;
  return new;
end;
$$;

-- Gate earnings/payouts on payout_eligible.
create or replace function public.partner_earnings_summary(p_partner_id uuid)
returns json
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_partner public.partners%rowtype;
  v_gross numeric := 0;
  v_fee numeric := 0;
  v_paid numeric := 0;
  v_pending numeric := 0;
begin
  select * into v_partner from public.partners where id = p_partner_id;
  if not found then
    return json_build_object('error', 'partner not found');
  end if;
  if not public.is_admin() and v_partner.profile_id <> auth.uid() then
    return json_build_object('error', 'forbidden');
  end if;

  if not v_partner.payout_eligible then
    return json_build_object(
      'gross', 0, 'fee_percent', v_partner.platform_fee_percent, 'fee', 0,
      'net', 0, 'paid_out', 0, 'pending', 0, 'available', 0,
      'payout_eligible', false
    );
  end if;

  select coalesce(sum(total), 0) into v_gross
  from public.orders
  where profile_id = v_partner.profile_id
    and order_type = 'business'
    and status <> 'cancelled';

  v_fee := round(v_gross * v_partner.platform_fee_percent / 100.0, 2);

  select coalesce(sum(amount), 0) into v_paid
  from public.payouts where partner_id = p_partner_id and status = 'paid';

  select coalesce(sum(amount), 0) into v_pending
  from public.payouts where partner_id = p_partner_id and status in ('pending', 'processing');

  return json_build_object(
    'gross', v_gross,
    'fee_percent', v_partner.platform_fee_percent,
    'fee', v_fee,
    'net', v_gross - v_fee,
    'paid_out', v_paid,
    'pending', v_pending,
    'available', greatest((v_gross - v_fee) - v_paid - v_pending, 0),
    'payout_eligible', true
  );
end;
$$;

create or replace function public.request_payout(p_partner_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_partner public.partners%rowtype;
  v_available numeric;
  v_id uuid;
begin
  select * into v_partner from public.partners where id = p_partner_id;
  if not found then
    return json_build_object('error', 'partner not found');
  end if;
  if v_partner.profile_id <> auth.uid() then
    return json_build_object('error', 'forbidden');
  end if;
  if not v_partner.payout_eligible then
    return json_build_object('error', 'This partner type purchases stock wholesale and does not accrue payouts.');
  end if;

  v_available := (public.partner_earnings_summary(p_partner_id) ->> 'available')::numeric;
  if v_available is null or v_available < 1 then
    return json_build_object('error', 'Nothing available to withdraw right now.');
  end if;

  insert into public.payouts (partner_id, amount, status)
  values (p_partner_id, v_available, 'pending')
  returning id into v_id;

  return json_build_object('ok', true, 'payout_id', v_id, 'amount', v_available);
end;
$$;

-- ── Wholesale discount auto-apply (no coupon code needed) ─────────────────
-- Used by the "Place Business Order" flow for non-payout-eligible (buyer)
-- partners: finds the best active discount targeting 'wholesale' generally
-- or this partner specifically, and returns the amount off — same validity
-- rules as validate_discount(), minus the code lookup.
create or replace function public.wholesale_discount_for_partner(p_partner_id uuid, p_subtotal numeric)
returns json
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  d public.discounts%rowtype;
  v_amount numeric := 0;
begin
  select * into d
  from public.discounts
  where is_active = true
    and (starts_at is null or starts_at <= now())
    and (expires_at is null or expires_at >= now())
    and (usage_limit is null or used_count < usage_limit)
    and (min_order_value is null or p_subtotal >= min_order_value)
    and (
      (target = 'partner' and target_id = p_partner_id)
      or target = 'wholesale'
    )
  order by (target = 'partner') desc, value desc
  limit 1;

  if not found then
    return json_build_object('applied', false, 'discount_amount', 0);
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
    'applied', true,
    'discount_id', d.id,
    'code', d.code,
    'discount_amount', v_amount
  );
end;
$$;

grant execute on function public.wholesale_discount_for_partner(uuid, numeric) to authenticated;
