-- Admin-managed product categories + removal of the Smoothies line.
--
-- Categories were already a table, but the storefront/mobile app hardcoded their order and
-- admins could not add or hide one. `sort_order` + `is_active` let the admin panel own the
-- range (smoothies, salad bowls, anything new) with no code change.

alter table public.categories
  add column if not exists sort_order integer not null default 100,
  add column if not exists is_active boolean not null default true;

update public.categories set sort_order = 10 where slug = 'tea-blends';
update public.categories set sort_order = 20 where slug = 'microgreens';
update public.categories set sort_order = 40 where slug = 'juices';
update public.categories set sort_order = 50 where slug = 'bowls';

-- ── Remove Smoothies ──────────────────────────────────────────────────────
-- Fixed plans promised "N smoothies"; point them at juices so plan boxes stay pickable.
update public.subscription_plans
set items = array(
  select regexp_replace(
           regexp_replace(i, 'smoothies', 'fresh juices', 'i'),
           'smoothie', 'fresh juice', 'i')
  from unnest(items) as i
)
where exists (select 1 from unnest(items) as i where i ilike '%smoothie%');

do $$
declare
  cat_id uuid;
begin
  select id into cat_id from public.categories where slug = 'smoothies';
  if cat_id is null then
    return;
  end if;

  -- Products customers still hold in an active custom subscription can't be dropped
  -- (subscription_items.product_id has no cascade); retire those instead of deleting.
  update public.products
  set is_available = false, stock = 0
  where category_id = cat_id
    and id in (select product_id from public.subscription_items);

  -- Past orders keep their line items (order_items.product_id is set null on delete).
  delete from public.products
  where category_id = cat_id
    and id not in (select product_id from public.subscription_items);

  if exists (select 1 from public.products where category_id = cat_id) then
    update public.categories set is_active = false where id = cat_id;
  else
    delete from public.categories where id = cat_id;
  end if;
end $$;
