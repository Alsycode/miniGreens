import { createSupabaseServerClient } from "@/lib/supabase/server";
import ReportsClient, {
  type SalesRow,
  type ProductRow,
  type PartnerRow,
  type SubscriptionRow,
  type DiscountRow,
} from "@/components/ReportsClient";

export default async function ReportsPage() {
  const supabase = await createSupabaseServerClient();

  const [
    { data: orders },
    { data: orderItems },
    { data: profiles },
    { data: partners },
    { data: subscriptions },
    { data: subscriptionPlans },
    { data: discounts },
    { data: payouts },
  ] = await Promise.all([
    supabase.from("orders").select("*").order("created_at", { ascending: false }),
    supabase.from("order_items").select("*"),
    supabase.from("profiles").select("id, full_name, email, role"),
    supabase.from("partners").select("*"),
    supabase.from("subscriptions").select("*"),
    supabase.from("subscription_plans").select("*"),
    supabase.from("discounts").select("*").order("used_count", { ascending: false }),
    supabase.from("payouts").select("*"),
  ]);

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));
  const validOrders = (orders ?? []).filter((o) => o.status !== "cancelled");

  // ── Sales ──
  const salesRows: SalesRow[] = (orders ?? []).map((o) => ({
    orderNumber: o.order_number,
    customer: o.order_type === "business" ? (o.business_name ?? "Business") : (profileById.get(o.profile_id)?.full_name ?? "—"),
    total: Number(o.total),
    status: o.status,
    date: o.created_at,
  }));
  const totalRevenue = validOrders.reduce((sum, o) => sum + Number(o.total), 0);

  // ── Products ──
  const productAgg = new Map<string, { units: number; revenue: number }>();
  for (const item of orderItems ?? []) {
    const cur = productAgg.get(item.product_name) ?? { units: 0, revenue: 0 };
    cur.units += item.quantity;
    cur.revenue += item.quantity * Number(item.price);
    productAgg.set(item.product_name, cur);
  }
  const productRows: ProductRow[] = Array.from(productAgg.entries())
    .map(([name, v]) => ({ name, units: v.units, revenue: v.revenue }))
    .sort((a, b) => b.revenue - a.revenue);

  // ── Partners (payouts) ──
  const paidByPartner = new Map<string, number>();
  const pendingByPartner = new Map<string, number>();
  for (const po of payouts ?? []) {
    if (po.status === "paid") {
      paidByPartner.set(po.partner_id, (paidByPartner.get(po.partner_id) ?? 0) + Number(po.amount));
    } else if (po.status === "pending" || po.status === "processing") {
      pendingByPartner.set(po.partner_id, (pendingByPartner.get(po.partner_id) ?? 0) + Number(po.amount));
    }
  }
  const partnerRows: PartnerRow[] = (partners ?? [])
    .filter((p) => p.status === "approved")
    .map((p) => {
      const gross = validOrders
        .filter((o) => o.order_type === "business" && o.profile_id === p.profile_id)
        .reduce((sum, o) => sum + Number(o.total), 0);
      const feePercent = Number(p.platform_fee_percent);
      return {
        businessName: p.business_name,
        orderCount: validOrders.filter((o) => o.order_type === "business" && o.profile_id === p.profile_id).length,
        gross,
        feePercent,
        net: gross * (1 - feePercent / 100),
        paidOut: paidByPartner.get(p.id) ?? 0,
        pendingPayout: pendingByPartner.get(p.id) ?? 0,
      };
    })
    .sort((a, b) => b.gross - a.gross);

  // ── Subscriptions ──
  const planById = new Map((subscriptionPlans ?? []).map((p) => [p.id, p]));
  const planAgg = new Map<string, { count: number; revenue: number }>();
  for (const s of subscriptions ?? []) {
    if (s.status !== "active") continue;
    const plan = planById.get(s.plan_id);
    const name = plan?.name ?? "Unknown plan";
    const cur = planAgg.get(name) ?? { count: 0, revenue: 0 };
    cur.count += 1;
    cur.revenue += Number(plan?.price ?? 0);
    planAgg.set(name, cur);
  }
  const subscriptionRows: SubscriptionRow[] = Array.from(planAgg.entries())
    .map(([plan, v]) => ({ plan, activeCount: v.count, revenue: v.revenue }))
    .sort((a, b) => b.revenue - a.revenue);

  // ── Discounts ──
  const discountRows: DiscountRow[] = (discounts ?? []).map((d) => ({
    code: d.code ?? "(no code)",
    type: d.discount_type,
    value: Number(d.value),
    usedCount: d.used_count,
    isActive: d.is_active,
  }));

  const summary = {
    totalRevenue,
    totalOrders: validOrders.length,
    activeCustomers: (profiles ?? []).filter((p) => p.role === "customer").length,
    activePartners: (partners ?? []).filter((p) => p.status === "approved").length,
    activeSubscriptions: (subscriptions ?? []).filter((s) => s.status === "active").length,
    discountRedemptions: (discounts ?? []).reduce((sum, d) => sum + d.used_count, 0),
  };

  return (
    <div className="px-6 py-8 md:px-10 max-w-[1400px]">
      <div className="mb-8 animate-fade-up" style={{ "--i": 0 } as React.CSSProperties}>
        <p className="text-xs font-semibold tracking-widest uppercase text-[#3D7A52] mb-1">
          Management
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-[#0A2416]">Reports</h1>
      </div>

      <ReportsClient
        summary={summary}
        salesRows={salesRows}
        productRows={productRows}
        partnerRows={partnerRows}
        subscriptionRows={subscriptionRows}
        discountRows={discountRows}
      />
    </div>
  );
}
