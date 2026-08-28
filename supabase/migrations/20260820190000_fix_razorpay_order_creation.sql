-- The `http` (pgsql-http) extension turned out to have a real bug calling
-- Razorpay's POST /v1/orders endpoint (confirmed via direct testing: plain
-- GET requests succeed, POST fails with an SSL_read error regardless of
-- headers). Order creation now happens in the `create-razorpay-order` Edge
-- Function instead (Deno's native fetch has no such issue). Drop the broken
-- Postgres function so it isn't mistakenly relied on.

drop function if exists public.create_razorpay_order(uuid);
