-- T6: partner payouts. Tracks earnings -> payout requests -> settlement.
-- See TASK_PLAN.md.

create table public.payouts (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  amount numeric(10, 2) not null check (amount > 0),
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'paid', 'rejected')),
  period_start date,
  period_end date,
  note text,
  requested_at timestamptz not null default now(),
  paid_at timestamptz
);

create index payouts_partner_idx on public.payouts (partner_id, requested_at desc);
create index payouts_status_idx on public.payouts (status);

alter table public.payouts enable row level security;

-- Partner reads + requests own; admin does everything. Inserts also go through
-- request_payout() (SECURITY DEFINER) which enforces the available-balance cap.
create policy "payouts_select_own_or_admin" on public.payouts
  for select using (
    public.is_admin()
    or partner_id in (select id from public.partners where profile_id = auth.uid())
  );
create policy "payouts_insert_own" on public.payouts
  for insert with check (
    partner_id in (select id from public.partners where profile_id = auth.uid())
  );
create policy "payouts_update_admin" on public.payouts
  for update using (public.is_admin());

-- ── Earnings summary ──────────────────────────────────────────────────────
-- gross  = non-cancelled business orders placed by the partner's profile
-- fee    = gross * platform_fee_percent (women partners already sit at 0%)
-- net    = gross - fee
-- available = net - already-paid - pending/processing requests
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
    'available', greatest((v_gross - v_fee) - v_paid - v_pending, 0)
  );
end;
$$;

grant execute on function public.partner_earnings_summary(uuid) to authenticated;

-- ── Request a payout for the current available balance ─────────────────────
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

grant execute on function public.request_payout(uuid) to authenticated;
