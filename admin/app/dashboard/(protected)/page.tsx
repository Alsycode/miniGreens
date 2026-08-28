import {
  ShoppingBag,
  CurrencyInr,
  Repeat,
  Truck,
} from "@phosphor-icons/react/dist/ssr";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import RevenueChartWrapper from "@/components/RevenueChartWrapper";
import type { Database } from "@mobile/database";

type OrderStatus = Database["public"]["Tables"]["orders"]["Row"]["status"];

const STATUS_BADGE: Record<OrderStatus, { label: string; classes: string }> = {
  pending:    { label: "Pending",    classes: "bg-amber-50 text-amber-700 border-amber-200" },
  confirmed:  { label: "Confirmed",  classes: "bg-blue-50 text-blue-700 border-blue-200" },
  processing: { label: "Processing", classes: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  shipped:    { label: "Shipped",    classes: "bg-teal-50 text-teal-700 border-teal-200" },
  delivered:  { label: "Delivered",  classes: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  cancelled:  { label: "Cancelled",  classes: "bg-red-50 text-red-700 border-red-200" },
};

function startOfDayIso(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
}

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();

  const now = new Date();
  const todayStart = startOfDayIso(now);
  const tomorrowStart = startOfDayIso(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1));
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [
    { data: todaysOrders },
    { data: monthOrders },
    { count: activeSubscriptions },
    { count: pendingDeliveries },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from("orders").select("id, status, total").gte("created_at", todayStart).lt("created_at", tomorrowStart),
    supabase.from("orders").select("id, total, status, created_at").gte("created_at", monthStart).neq("status", "cancelled"),
    supabase.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("orders").select("*", { count: "exact", head: true }).in("status", ["pending", "confirmed", "processing", "shipped"]),
    supabase.from("orders").select("*, profiles(full_name, email), addresses(*)").order("created_at", { ascending: false }).limit(5),
  ]);

  const monthlyRevenue = (monthOrders ?? []).reduce((sum, o) => sum + Number(o.total), 0);

  // Revenue for the last 7 days, bucketed by weekday label
  const sevenDaysAgoStart = startOfDayIso(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6));
  const { data: weekOrders } = await supabase
    .from("orders")
    .select("total, created_at, status")
    .gte("created_at", sevenDaysAgoStart)
    .neq("status", "cancelled");

  const revenueByDay: { day: string; revenue: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const dayEnd = dayStart + 24 * 60 * 60 * 1000;
    const revenue = (weekOrders ?? [])
      .filter((o) => {
        const t = new Date(o.created_at).getTime();
        return t >= dayStart && t < dayEnd;
      })
      .reduce((sum, o) => sum + Number(o.total), 0);
    revenueByDay.push({ day: d.toLocaleDateString("en-IN", { weekday: "short" }), revenue });
  }

  // Top products this month, by units sold
  const monthOrderIds = (monthOrders ?? []).map((o) => o.id);
  const { data: items } = monthOrderIds.length
    ? await supabase.from("order_items").select("product_id, product_name, quantity, price").in("order_id", monthOrderIds)
    : { data: [] as { product_id: string | null; product_name: string; quantity: number; price: number }[] };

  const topProductsMap = new Map<string, { name: string; price: number; unitsSold: number }>();
  for (const item of items ?? []) {
    const key = item.product_id ?? item.product_name;
    const existing = topProductsMap.get(key);
    if (existing) {
      existing.unitsSold += item.quantity;
    } else {
      topProductsMap.set(key, { name: item.product_name, price: Number(item.price), unitsSold: item.quantity });
    }
  }
  const topProducts = [...topProductsMap.values()].sort((a, b) => b.unitsSold - a.unitsSold).slice(0, 3);

  const statusCounts = { pending: 0, processing: 0, shipped: 0 };
  for (const o of todaysOrders ?? []) {
    if (o.status in statusCounts) statusCounts[o.status as keyof typeof statusCounts]++;
  }

  return (
    <div className="px-6 py-8 md:px-10 max-w-[1400px]">
      {/* Page heading */}
      <div className="mb-8 animate-fade-up" style={{ "--i": 0 } as React.CSSProperties}>
        <p className="text-xs font-semibold tracking-widest uppercase text-[#3D7A52] mb-1">
          {now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short", year: "numeric" })}
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-[#0A2416]">Overview</h1>
      </div>

      {/* ── Stat cards (asymmetric grid) ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {/* Wide card: Today's Orders (2 cols) */}
        <div
          className="md:col-span-2 bg-white rounded-2xl border border-slate-200/50 p-6 shadow-sm animate-fade-up"
          style={{ "--i": 1 } as React.CSSProperties}
        >
          <div className="flex items-start justify-between mb-5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "#E8F3EC" }}
            >
              <ShoppingBag size={20} weight="fill" style={{ color: "#3D7A52" }} />
            </div>
          </div>
          <p className="text-3xl font-bold tracking-tight text-[#0A2416] mb-1">
            {todaysOrders?.length ?? 0}
          </p>
          <p className="text-sm text-slate-500">Today's Orders</p>
          <div className="mt-4 pt-4 border-t border-slate-100 flex gap-6">
            {(["pending", "processing", "shipped"] as const).map((s) => (
              <div key={s}>
                <p className="text-lg font-bold text-[#0A2416]">{statusCounts[s]}</p>
                <p className="text-xs text-slate-400 capitalize">{s}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Revenue */}
        <div
          className="bg-white rounded-2xl border border-slate-200/50 p-6 shadow-sm animate-fade-up"
          style={{ "--i": 2 } as React.CSSProperties}
        >
          <div className="flex items-start justify-between mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-lime-50">
              <CurrencyInr size={20} weight="fill" style={{ color: "#3D7A52" }} />
            </div>
          </div>
          <p className="text-3xl font-bold tracking-tight text-[#0A2416] mb-1">
            ₹{(monthlyRevenue / 1000).toFixed(1)}k
          </p>
          <p className="text-sm text-slate-500">Monthly Revenue</p>
        </div>

        {/* Active Subscriptions */}
        <div
          className="bg-white rounded-2xl border border-slate-200/50 p-6 shadow-sm animate-fade-up"
          style={{ "--i": 3 } as React.CSSProperties}
        >
          <div className="flex items-start justify-between mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-50">
              <Repeat size={20} weight="fill" className="text-indigo-600" />
            </div>
          </div>
          <p className="text-3xl font-bold tracking-tight text-[#0A2416] mb-1">
            {activeSubscriptions ?? 0}
          </p>
          <p className="text-sm text-slate-500">Active Plans</p>
        </div>

        {/* Pending Deliveries — spans across last col on narrow, col 4 on wide */}
        <div
          className="md:col-span-4 lg:col-span-1 bg-white rounded-2xl border border-slate-200/50 p-6 shadow-sm animate-fade-up"
          style={{ "--i": 3 } as React.CSSProperties}
        >
          <div className="flex items-start justify-between mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#FEF3C7" }}>
              <Truck size={20} weight="fill" style={{ color: "#D97706" }} />
            </div>
          </div>
          <p className="text-3xl font-bold tracking-tight text-[#0A2416] mb-1">
            {pendingDeliveries ?? 0}
          </p>
          <p className="text-sm text-slate-500">Pending Deliveries</p>
        </div>
      </div>

      {/* ── Revenue chart + Top products ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Chart: 2 cols */}
        <div
          className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/50 p-6 shadow-sm animate-fade-up"
          style={{ "--i": 4 } as React.CSSProperties}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold text-[#0A2416]">Revenue</h2>
              <p className="text-xs text-slate-400 mt-0.5">Last 7 days</p>
            </div>
            <span className="text-xs font-medium px-3 py-1 rounded-full" style={{ backgroundColor: "#E8F3EC", color: "#3D7A52" }}>
              This week
            </span>
          </div>
          <RevenueChartWrapper data={revenueByDay} />
        </div>

        {/* Top 3 products: 1 col */}
        <div
          className="bg-white rounded-2xl border border-slate-200/50 p-6 shadow-sm animate-fade-up"
          style={{ "--i": 5 } as React.CSSProperties}
        >
          <h2 className="text-base font-semibold text-[#0A2416] mb-4">Top Sellers</h2>
          {topProducts.length === 0 ? (
            <p className="text-sm text-slate-400">No sales yet this month.</p>
          ) : (
            <div className="space-y-4">
              {topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-300 w-4 flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="w-10 h-10 rounded-xl flex-shrink-0" style={{ backgroundColor: "#F0FDF4" }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate leading-tight">
                      {p.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      ₹{p.price} · {p.unitsSold} sold
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Recent orders table ── */}
      <div
        className="bg-white rounded-2xl border border-slate-200/50 shadow-sm animate-fade-up"
        style={{ "--i": 6 } as React.CSSProperties}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h2 className="text-base font-semibold text-[#0A2416]">Recent Orders</h2>
          <a
            href="/dashboard/orders"
            className="text-xs font-medium transition-colors hover:text-[#3D7A52]"
            style={{ color: "#3D7A52" }}
          >
            View all
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {["Order Number", "Customer", "Total", "Status", "Date"].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-xs font-semibold tracking-wide text-slate-400 uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {(recentOrders ?? []).length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-slate-400 text-sm">
                    No orders yet.
                  </td>
                </tr>
              )}
              {(recentOrders ?? []).map((o) => {
                const badge = STATUS_BADGE[o.status];
                return (
                  <tr key={o.id} className="hover:bg-emerald-50/40 transition-colors duration-150">
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{o.order_number}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {o.profiles?.full_name ?? o.addresses?.full_name ?? "—"}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      ₹{Number(o.total).toFixed(0)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badge.classes}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs">
                      {new Date(o.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
