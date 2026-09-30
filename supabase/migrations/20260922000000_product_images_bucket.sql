-- Public Storage bucket for product photos uploaded from the admin dashboard.

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Anyone can view (bucket is public, but RLS still gates the storage.objects table).
create policy "product_images_public_read"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- Only admins may upload/update/delete product photos.
create policy "product_images_admin_insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "product_images_admin_update"
  on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and public.is_admin());

create policy "product_images_admin_delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and public.is_admin());
