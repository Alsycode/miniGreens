-- T10: partner KYC document upload.
-- Private Storage bucket for identity / business documents + partners.kyc_* columns.
-- See TASK_PLAN.md.

-- ── Private bucket ────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('partner-kyc', 'partner-kyc', false)
on conflict (id) do nothing;

-- ── partners: uploaded-doc manifest + a KYC review status ─────────────────
-- kyc_documents: jsonb array of { name, path, uploaded_at }
-- kyc_status: separate from application `status` so KYC can be reviewed on its own
alter table public.partners
  add column if not exists kyc_documents jsonb not null default '[]'::jsonb,
  add column if not exists kyc_status text not null default 'pending'
    check (kyc_status in ('pending', 'verified', 'rejected'));

-- ── Storage RLS on storage.objects ───────────────────────────────────────
-- An authenticated user may manage objects only under a folder named after
-- their own uid  (object path = '<uid>/<filename>').  Admins may read all.
create policy "partner_kyc_insert_own"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'partner-kyc'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "partner_kyc_select_own_or_admin"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'partner-kyc'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

create policy "partner_kyc_update_own"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'partner-kyc'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "partner_kyc_delete_own"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'partner-kyc'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
