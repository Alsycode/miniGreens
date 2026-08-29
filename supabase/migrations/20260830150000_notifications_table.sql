-- T3: in-app notification inbox. See TASK_PLAN.md.
--
-- Adds a persisted `notifications` table and re-defines the Phase 3 notifiers
-- (`20260820140000_notifications.sql`) so every event that sent a transient Expo
-- push now also drops a durable inbox row. New: a partner approval/rejection
-- notifier. Forward-only — the old function bodies are replaced in place.

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,               -- 'order_status' | 'offer' | 'birthday' | 'partner' | 'system'
  title text not null,
  body text not null,
  data jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_profile_idx on public.notifications (profile_id, created_at desc);
create index notifications_unread_idx on public.notifications (profile_id) where read_at is null;

alter table public.notifications enable row level security;

-- Owners (and admins) read their own rows; owners may update them (the app only
-- ever sets read_at). Inserts happen exclusively through the SECURITY DEFINER
-- functions below, which bypass RLS — so there is deliberately no insert policy.
create policy "notifications_select_own" on public.notifications
  for select using (profile_id = auth.uid() or public.is_admin());
create policy "notifications_update_own" on public.notifications
  for update using (profile_id = auth.uid()) with check (profile_id = auth.uid());

-- ── Order-status notifier: persist an inbox row + best-effort push ──────────

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

  insert into public.notifications (profile_id, type, title, body, data)
  values (
    new.profile_id, 'order_status', v_title, v_body,
    jsonb_build_object('order_id', new.id, 'status', new.status, 'order_number', new.order_number)
  );

  select push_token into v_token from public.profiles where id = new.profile_id;
  if v_token is not null then
    perform public.send_expo_push_notification(
      v_token, v_title, v_body,
      jsonb_build_object('type', 'order_status', 'order_id', new.id, 'status', new.status)
    );
  end if;

  return new;
end;
$$;

-- ── Birthday-offer notifier: inbox row for every birthday user, push if able ─

create or replace function public.send_birthday_offers()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text;
  v_title text;
  v_body text;
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
    where date_of_birth is not null
      and to_char(date_of_birth, 'MM-DD') = to_char(current_date, 'MM-DD')
  loop
    v_title := 'Happy Birthday' || coalesce(', ' || nullif(r.full_name, ''), '') || '!';
    v_body := 'Here''s a birthday treat on us — use code ' || v_code || ' at checkout.';

    insert into public.notifications (profile_id, type, title, body, data)
    values (r.id, 'birthday', v_title, v_body, jsonb_build_object('code', v_code));

    if r.push_token is not null then
      perform public.send_expo_push_notification(
        r.push_token, v_title, v_body,
        jsonb_build_object('type', 'birthday_offer', 'code', v_code)
      );
    end if;
  end loop;
end;
$$;

-- ── Partner approval / rejection notifier (new) ────────────────────────────

create or replace function public.notify_partner_status_change()
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
  if new.status is not distinct from old.status then
    return new;
  end if;

  if new.status = 'approved' then
    v_title := 'Partner application approved';
    v_body := 'Welcome aboard! Your MGC partner account for ' || new.business_name || ' is now active.';
  elsif new.status = 'rejected' then
    v_title := 'Partner application update';
    v_body := 'We couldn''t approve your MGC partner application for ' || new.business_name || ' this time.';
  else
    return new;
  end if;

  insert into public.notifications (profile_id, type, title, body, data)
  values (
    new.profile_id, 'partner', v_title, v_body,
    jsonb_build_object('partner_id', new.id, 'status', new.status)
  );

  select push_token into v_token from public.profiles where id = new.profile_id;
  if v_token is not null then
    perform public.send_expo_push_notification(
      v_token, v_title, v_body,
      jsonb_build_object('type', 'partner', 'status', new.status)
    );
  end if;

  return new;
end;
$$;

create trigger partners_notify_status_change
  after update of status on public.partners
  for each row execute function public.notify_partner_status_change();
