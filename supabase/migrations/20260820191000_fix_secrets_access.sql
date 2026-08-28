-- The `private` schema is invisible to PostgREST entirely (only `public` is
-- exposed by default — this applies regardless of role, service_role
-- included, since it's an API-gateway-level restriction, not RLS). The Edge
-- Function needs a public-schema entry point instead: a SECURITY DEFINER
-- function that reads private.secrets, callable only by service_role.

create or replace function public.get_razorpay_credentials()
returns table (key_id text, key_secret text)
language sql
security definer
set search_path = public
as $$
  select
    (select value from private.secrets where key = 'razorpay_key_id'),
    (select value from private.secrets where key = 'razorpay_key_secret');
$$;

revoke execute on function public.get_razorpay_credentials() from public, anon, authenticated;
grant execute on function public.get_razorpay_credentials() to service_role;
