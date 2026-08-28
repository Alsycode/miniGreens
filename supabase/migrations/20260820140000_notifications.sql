-- Phase 3: order-event push notifications + birthday-offer automation.
-- See BUILD_PLAN.md for the phased rollout this belongs to.
--
-- WhatsApp-to-admin notifications are intentionally NOT built here — they need a
-- WhatsApp Business Solution Provider account/credentials that don't exist yet.
-- Push notifications need no external credentials: Expo's push API is called
-- directly with the device's push token, no API key required.

create extension if not exists pg_net;

alter table public.profiles add column push_token text;

-- ── Generic Expo push sender ────────────────────────────────────────────────
-- Fire-and-forget: pg_net queues the HTTP call asynchronously and does not block
-- the calling transaction. Errors (bad/stale token, offline, etc.) are swallowed
-- by design — a failed push must never block an order status update.

create or replace function public.send_expo_push_notification(
  p_token text,
  p_title text,
  p_body text,
  p_data jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_token is null or p_token = '' then
    return;
  end if;

  perform net.http_post(
    url := 'https://exp.host/--/api/v2/push/send',
    headers := jsonb_build_object('Content-Type', 'application/json', 'Accept', 'application/json'),
    body := jsonb_build_object(
      'to', p_token,
      'title', p_title,
      'body', p_body,
      'data', p_data,
      'sound', 'default'
    )
  );
exception when others then
  -- Never let a push failure break the order/profile write that triggered it.
  null;
end;
$$;

-- ── Order-event notification pipeline ───────────────────────────────────────

create or replace function public.notify_order_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_token text;
  v_title text;
  v_body text;
begin
  select push_token into v_token from public.profiles where id = new.profile_id;
  if v_token is null then
    return new;
  end if;

  if tg_op = 'INSERT' then
    v_title := 'Order placed';
    v_body := 'We received your order ' || new.order_number || '. We''ll notify you as it''s confirmed.';
  elsif tg_op = 'UPDATE' and new.status is distinct from old.status then
    v_title := case new.status
      when 'confirmed' then 'Order confirmed'
      when 'processing' then 'Order is being prepared'
      when 'shipped' then 'Order shipped'
      when 'delivered' then 'Order delivered'
      when 'cancelled' then 'Order cancelled'
      else 'Order update'
    end;
    v_body := case new.status
      when 'confirmed' then 'Your order ' || new.order_number || ' has been confirmed.'
      when 'processing' then 'Your order ' || new.order_number || ' is being prepared.'
      when 'shipped' then 'Your order ' || new.order_number || ' is on its way!'
      when 'delivered' then 'Your order ' || new.order_number || ' has been delivered. Enjoy!'
      when 'cancelled' then 'Your order ' || new.order_number || ' was cancelled.'
      else 'Your order ' || new.order_number || ' status changed to ' || new.status || '.'
    end;
  else
    return new;
  end if;

  perform public.send_expo_push_notification(
    v_token, v_title, v_body,
    jsonb_build_object('type', 'order_status', 'order_id', new.id, 'status', new.status)
  );

  return new;
end;
$$;

create trigger orders_notify_status_change
  after insert or update of status on public.orders
  for each row execute function public.notify_order_status_change();

-- ── Birthday-offer automation ───────────────────────────────────────────────
-- Finds profiles whose birthday is today and have a push token, then notifies
-- them about whichever active birthday discount(s) currently exist. Admins
-- create/manage those discounts through the existing Discounts admin page
-- (the is_birthday_offer flag built in Phase 2).

create or replace function public.send_birthday_offers()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text;
  r record;
begin
  select code into v_code
  from public.discounts
  where is_birthday_offer = true
    and is_active = true
    and (expires_at is null or expires_at > now())
  order by created_at desc
  limit 1;

  if v_code is null then
    return;
  end if;

  for r in
    select id, push_token, full_name
    from public.profiles
    where push_token is not null
      and date_of_birth is not null
      and to_char(date_of_birth, 'MM-DD') = to_char(current_date, 'MM-DD')
  loop
    perform public.send_expo_push_notification(
      r.push_token,
      'Happy Birthday, ' || nullif(r.full_name, '') || '!' ,
      'Here''s a birthday treat on us — use code ' || v_code || ' at checkout.',
      jsonb_build_object('type', 'birthday_offer', 'code', v_code)
    );
  end loop;
end;
$$;

-- Schedule the daily birthday check via pg_cron where available. Supabase
-- projects have pg_cron pre-installed on the postgres database; if a given
-- project doesn't, this block is skipped rather than failing the migration —
-- call public.send_birthday_offers() from an external scheduler instead.
do $$
begin
  create extension if not exists pg_cron;
  perform cron.schedule('birthday-offers-daily', '0 9 * * *', $cron$select public.send_birthday_offers();$cron$);
exception when others then
  raise notice 'pg_cron unavailable — schedule public.send_birthday_offers() externally (e.g. a daily Edge Function cron).';
end $$;
