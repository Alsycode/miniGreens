-- Subscription signup form (per MGC 2.0 spec) needs to capture consent, not just
-- delivery details. Add the two consent flags the mockup asks for; DOB (profiles.date_of_birth)
-- and State (addresses.state) already exist as columns, they just weren't being written to
-- from the webapp subscribe form.
alter table public.subscriptions
  add column terms_accepted boolean not null default false,
  add column sms_whatsapp_consent boolean not null default false;
