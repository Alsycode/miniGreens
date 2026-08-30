import { createSupabaseServerClient } from "@/lib/supabase/server";
import CustomersClient, { type Customer } from "@/components/CustomersClient";

export default async function CustomersPage() {
  const supabase = await createSupabaseServerClient();

  const [{ data: profiles }, { data: orders }, { data: subs }, { data: addresses }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("*")
        .eq("role", "customer")
        .order("created_at", { ascending: false }),
      supabase
        .from("orders")
        .select("id, profile_id, order_number, total, status, order_type, created_at"),
      supabase
        .from("subscriptions")
        .select("id, profile_id, status, started_at, subscription_plans(name, price)"),
      supabase.from("addresses").select("*"),
    ]);

  const customers: Customer[] = (profiles ?? []).map((p) => {
    const pOrders = (orders ?? [])
      .filter((o) => o.profile_id === p.id)
      .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    const pSubs = (subs ?? []).filter((s) => s.profile_id === p.id);
    const pAddrs = (addresses ?? []).filter((a) => a.profile_id === p.id);
    return {
      id: p.id,
      full_name: p.full_name,
      email: p.email,
      phone: p.phone,
      date_of_birth: p.date_of_birth,
      created_at: p.created_at,
      orderCount: pOrders.length,
      totalSpent: pOrders.reduce((sum, o) => sum + Number(o.total ?? 0), 0),
      hasActiveSubscription: pSubs.some((s) => s.status === "active"),
      orders: pOrders.map((o) => ({
        id: o.id,
        order_number: o.order_number,
        total: Number(o.total ?? 0),
        status: o.status,
        order_type: o.order_type,
        created_at: o.created_at,
      })),
      subscriptions: pSubs.map((s) => ({
        id: s.id,
        status: s.status,
        started_at: s.started_at,
        planName: s.subscription_plans?.name ?? null,
        planPrice: Number(s.subscription_plans?.price ?? 0),
      })),
      addresses: pAddrs.map((a) => ({
        id: a.id,
        label: a.label,
        full_name: a.full_name,
        phone: a.phone,
        street: a.street,
        city: a.city,
        state: a.state,
        zip_code: a.zip_code,
        is_default: a.is_default,
      })),
    };
  });

  return (
    <div className="px-6 py-8 md:px-10 max-w-[1400px]">
      <div className="mb-8 animate-fade-up" style={{ "--i": 0 } as React.CSSProperties}>
        <p className="text-xs font-semibold tracking-widest uppercase text-[#3D7A52] mb-1">
          Management
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-[#0A2416]">Customers</h1>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/50 shadow-sm overflow-hidden">
        <CustomersClient customers={customers} />
      </div>
    </div>
  );
}
