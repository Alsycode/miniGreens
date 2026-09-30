-- BUG FIX: approving a partner application unconditionally overwrote
-- profiles.role to 'partner', including for profiles that were already
-- 'admin'. Any admin who applied to become a partner on their own account
-- (or had an application approved on it) was silently demoted and then
-- locked out by the admin app's middleware, which signs out anyone whose
-- profiles.role isn't 'admin'.
--
-- Only promote a profile that's still a plain 'customer' — never touch an
-- existing 'admin' (or already-'partner') role.
create or replace function public.handle_partner_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'approved' and old.status is distinct from 'approved' then
    update public.profiles set role = 'partner' where id = new.profile_id and role = 'customer';
    new.reviewed_at := now();
  elsif new.status = 'rejected' and old.status is distinct from 'rejected' then
    new.reviewed_at := now();
  end if;
  return new;
end;
$$;
