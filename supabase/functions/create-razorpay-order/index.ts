// Creates a Razorpay order for an existing MiniGreens order and returns the
// details the mobile client needs to open Razorpay Checkout.
//
// Runs as a Deno Edge Function rather than a Postgres function because the
// `http` (pgsql-http) Postgres extension has a real bug calling Razorpay's
// POST /v1/orders endpoint (SSL_read errors — confirmed via direct testing;
// plain GET requests work fine, POST does not, with or without custom
// headers). Deno's native `fetch` has no such issue.
//
// The order ownership check relies on Postgres RLS: the request is made with
// the caller's own JWT, so `orders_select_own_or_admin` naturally restricts
// the select to the caller's own order (or any order, if they're admin).
// Razorpay credentials live in the `private.secrets` table (never exposed via
// PostgREST) and are read here with the service-role key, which bypasses RLS.

import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { order_id } = await req.json();
    if (!order_id) {
      return new Response(JSON.stringify({ error: "order_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Caller-scoped client: RLS enforces the caller can only read their own order.
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: req.headers.get("Authorization")! } },
    });
    const { data: order, error: orderError } = await callerClient
      .from("orders")
      .select("id, order_number, total")
      .eq("id", order_id)
      .single();
    if (orderError || !order) {
      return new Response(JSON.stringify({ error: "order not found or not accessible" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Service-role client: reads the private secrets table (RLS-invisible to
    // anon/authenticated) and performs the follow-up update.
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: creds, error: credsError } = await adminClient
      .rpc("get_razorpay_credentials")
      .single();
    if (credsError || !creds?.key_id || !creds?.key_secret) {
      return new Response(JSON.stringify({ error: "razorpay credentials not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const keyId = creds.key_id;
    const keySecret = creds.key_secret;

    const razorpayRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + btoa(`${keyId}:${keySecret}`),
      },
      body: JSON.stringify({
        amount: Math.round(Number(order.total) * 100),
        currency: "INR",
        receipt: order.order_number,
      }),
    });
    const razorpayOrder = await razorpayRes.json();
    if (!razorpayRes.ok) {
      return new Response(JSON.stringify({ error: "razorpay order creation failed", details: razorpayOrder }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await adminClient.from("orders").update({ razorpay_order_id: razorpayOrder.id }).eq("id", order_id);

    return new Response(
      JSON.stringify({
        razorpay_order_id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key_id: keyId,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
