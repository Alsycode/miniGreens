-- The business-order forms (web + mobile) collect the partner's phone and
-- address, requiring phone, but never persisted them — orders.business_name
-- and .contact_person capture the "who", but Admin had no way to actually
-- reach the business for a given order. Snapshot both on the order itself
-- (not just joined from partners, which can change after the order is
-- placed) alongside the existing business_name/contact_person columns.
alter table public.orders
  add column business_phone text,
  add column business_address text;
