// Emails new contact-form submissions to the MiniGreens inbox via Resend.
//
// Triggered by a Supabase Database Webhook (INSERT on public.contact_messages).
// The webhook must send the header `x-webhook-secret: <WEBHOOK_SECRET>`.
//
// Secrets (supabase secrets set ...):
//   RESEND_API_KEY   Resend API key
//   WEBHOOK_SECRET   shared secret, same value as the webhook header
//   INQUIRY_TO       recipient inbox (default theminigreenscompany@gmail.com)
//   INQUIRY_FROM     verified sender (default "MiniGreens Website <onboarding@resend.dev>"
//                    until the domain is verified in Resend; then use e.g.
//                    "MiniGreens Website <no-reply@mail.minigreenscompany.com>")

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

Deno.serve(async (req) => {
  if (req.headers.get("x-webhook-secret") !== Deno.env.get("WEBHOOK_SECRET")) {
    return new Response("Unauthorized", { status: 401 });
  }

  const payload = await req.json();
  const r = payload?.record;
  if (payload?.type !== "INSERT" || !r) return new Response("ignored", { status: 200 });

  const html = `
    <h2>New inquiry: ${esc(r.reason)}</h2>
    <p><b>Name:</b> ${esc(r.full_name)}<br>
       <b>Email:</b> ${esc(r.email)}<br>
       <b>Phone:</b> ${esc(r.phone ?? "—")}</p>
    <p style="white-space:pre-wrap">${esc(r.message)}</p>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `inquiry-${r.id}`,
    },
    body: JSON.stringify({
      from: Deno.env.get("INQUIRY_FROM") ?? "MiniGreens Website <onboarding@resend.dev>",
      to: [Deno.env.get("INQUIRY_TO") ?? "theminigreenscompany@gmail.com"],
      reply_to: r.email,
      subject: `[Inquiry] ${r.reason} — ${r.full_name}`,
      html,
    }),
  });

  if (!res.ok) {
    console.error("Resend error", res.status, await res.text());
    return new Response("send failed", { status: 502 }); // webhook will surface the failure
  }
  return new Response("ok", { status: 200 });
});
