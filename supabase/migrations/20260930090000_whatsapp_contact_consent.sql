-- Customer contact capture for WhatsApp notifications (India-only for now).
--
-- `whatsapp_number` is the canonical number we message. It is stored in E.164 (+91XXXXXXXXXX)
-- and enforced by a CHECK so bad data can't arrive from any client. It's a NEW column rather
-- than a constraint on the legacy free-text `profiles.phone`, so existing rows and the mobile
-- app keep working untouched. `whatsapp_verified_at` stays null until the provider's first
-- "reply YES" confirmation flow exists.
--
-- Consent is an append-only log (DPDP Act 2023: record what was agreed, when, and allow
-- withdrawal). `profiles.whatsapp_opt_in` is a cache of the latest log row, kept in sync by
-- trigger; the log is the source of truth for anything that sends messages.

alter table public.profiles
  add column whatsapp_number text,
  add column whatsapp_verified_at timestamptz,
  add column whatsapp_opt_in boolean not null default false,
  add constraint profiles_whatsapp_number_e164
    check (whatsapp_number is null or whatsapp_number ~ '^\+91[6-9][0-9]{9}$');

create table public.consent_log (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  channel text not null check (channel in ('whatsapp')),
  granted boolean not null,
  source text not null,
  terms_version text not null,
  created_at timestamptz not null default now()
);

create index consent_log_profile_channel_idx
  on public.consent_log (profile_id, channel, created_at desc);

alter table public.consent_log enable row level security;

create policy "consent_log_select_own_or_admin" on public.consent_log
  for select using (profile_id = auth.uid() or public.is_admin());

create policy "consent_log_insert_own" on public.consent_log
  for insert with check (profile_id = auth.uid());

-- No update/delete policies: the log is append-only.

create or replace function public.sync_whatsapp_opt_in()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.channel = 'whatsapp' then
    update public.profiles set whatsapp_opt_in = new.granted where id = new.profile_id;
  end if;
  return new;
end;
$$;

create trigger consent_log_sync_opt_in
  after insert on public.consent_log
  for each row execute function public.sync_whatsapp_opt_in();
