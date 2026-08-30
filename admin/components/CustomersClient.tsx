"use client";

import { useMemo, useState } from "react";
import { MagnifyingGlass, X, Cake } from "@phosphor-icons/react";
import type { Database } from "@mobile/database";

type OrderStatus = Database["public"]["Tables"]["orders"]["Row"]["status"];
type SubStatus = Database["public"]["Tables"]["subscriptions"]["Row"]["status"];

export type Customer = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  date_of_birth: string | null;
  created_at: string;
  orderCount: number;
  totalSpent: number;
  hasActiveSubscription: boolean;
  orders: {
    id: string;
    order_number: string;
    total: number;
    status: OrderStatus;
    order_type: string;
    created_at: string;
  }[];
  subscriptions: {
    id: string;
    status: SubStatus;
    started_at: string;
    planName: string | null;
    planPrice: number;
  }[];
  addresses: {
    id: string;
    label: string;
    full_name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zip_code: string;
    is_default: boolean;
  }[];
};

type SortKey = "recent" | "spent" | "orders" | "name";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "recent", label: "Recently joined" },
  { key: "spent", label: "Top spenders" },
  { key: "orders", label: "Most orders" },
  { key: "name", label: "Name A–Z" },
];

const STATUS_BADGE: Record<OrderStatus, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  processing: "bg-indigo-50 text-indigo-700 border-indigo-200",
  shipped: "bg-teal-50 text-teal-700 border-teal-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

function parseMonthDay(dob: string): [number, number] {
  const parts = dob.split("-").map(Number);
  return [parts[1], parts[2]];
}

function birthdayLabel(dob: string | null): string | null {
  if (!dob) return null;
  const [m, d] = parseMonthDay(dob);
  return new Date(2000, m - 1, d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function daysUntilBirthday(dob: string | null): number | null {
  if (!dob) return null;
  const [m, d] = parseMonthDay(dob);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let next = new Date(now.getFullYear(), m - 1, d);
  if (next < today) next = new Date(now.getFullYear() + 1, m - 1, d);
  return Math.round((+next - +today) / 86400000);
}

function isBirthdayThisMonth(dob: string | null): boolean {
  if (!dob) return false;
  return parseMonthDay(dob)[0] === new Date().getMonth() + 1;
}

const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export default function CustomersClient({ customers }: { customers: Customer[] }) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("recent");
  const [selected, setSelected] = useState<Customer | null>(null);

  const stats = useMemo(
    () => ({
      total: customers.length,
      subscribers: customers.filter((c) => c.hasActiveSubscription).length,
      birthdays: customers.filter((c) => isBirthdayThisMonth(c.date_of_birth)).length,
    }),
    [customers],
  );

  const filtered = useMemo(() => {
    let result = customers;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.full_name.toLowerCase().includes(q) ||
          (c.email ?? "").toLowerCase().includes(q) ||
          (c.phone ?? "").toLowerCase().includes(q),
      );
    }
    const sorted = [...result];
    sorted.sort((a, b) => {
      switch (sort) {
        case "spent":
          return b.totalSpent - a.totalSpent;
        case "orders":
          return b.orderCount - a.orderCount;
        case "name":
          return a.full_name.localeCompare(b.full_name);
        default:
          return +new Date(b.created_at) - +new Date(a.created_at);
      }
    });
    return sorted;
  }, [customers, search, sort]);

  return (
    <>
      {/* Summary tiles */}
      <div
        className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-200 animate-fade-up"
        style={{ "--i": 1 } as React.CSSProperties}
      >
        {[
          { label: "Total Customers", value: stats.total.toLocaleString("en-IN") },
          { label: "Active Subscribers", value: stats.subscribers.toLocaleString("en-IN") },
          { label: "Birthdays This Month", value: stats.birthdays.toLocaleString("en-IN") },
        ].map((s) => (
          <div key={s.label} className="px-6 py-4">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-400">{s.label}</p>
            <p className="text-lg font-bold text-[#0A2416] mt-0.5">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div
        className="flex flex-wrap items-center gap-3 px-6 py-4 animate-fade-up"
        style={{ "--i": 2 } as React.CSSProperties}
      >
        <div className="relative max-w-sm flex-1 min-w-[200px]">
          <MagnifyingGlass
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email or phone…"
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none
              focus:ring-2 focus:ring-emerald-200 focus:border-[#3D7A52] transition-all placeholder:text-slate-400"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50
            focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-[#3D7A52]"
        >
          {SORTS.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto animate-fade-up" style={{ "--i": 3 } as React.CSSProperties}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              {["Customer", "Orders", "Total Spent", "Subscription", "Birthday", "Joined"].map((h) => (
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
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-slate-400 text-sm">
                  No customers match your filters.
                </td>
              </tr>
            )}
            {filtered.map((c) => {
              const days = daysUntilBirthday(c.date_of_birth);
              return (
                <tr
                  key={c.id}
                  onClick={() => setSelected(c)}
                  className="hover:bg-emerald-50/50 transition-colors duration-150 cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-800">{c.full_name || "—"}</p>
                    <p className="text-xs text-slate-400">{c.email ?? ""}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{c.orderCount}</td>
                  <td className="px-6 py-4 font-semibold text-slate-800">
                    ₹{c.totalSpent.toLocaleString("en-IN")}
                  </td>
                  <td className="px-6 py-4">
                    {c.hasActiveSubscription ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-emerald-50 text-emerald-700 border-emerald-200">
                        Active
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">
                    {c.date_of_birth ? (
                      <span className="inline-flex items-center gap-1">
                        {birthdayLabel(c.date_of_birth)}
                        {days !== null && days <= 30 && (
                          <span className="text-[#3D7A52] font-medium">· in {days}d</span>
                        )}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-xs">{fmtDate(c.created_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Drawer */}
      {selected && (
        <>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={() => setSelected(null)} />
          <aside
            className="fixed right-0 top-0 h-full bg-white z-50 shadow-2xl border-l border-slate-200 animate-slide-in-right overflow-y-auto"
            style={{ width: 420 }}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-base font-semibold text-[#0A2416]">{selected.full_name || "—"}</h2>
                <p className="text-xs text-slate-400">{selected.email ?? ""}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors active:scale-[0.97]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-6">
              {/* Profile */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Phone", value: selected.phone ?? "—" },
                  {
                    label: "Birthday",
                    value: selected.date_of_birth
                      ? `${birthdayLabel(selected.date_of_birth)}${
                          daysUntilBirthday(selected.date_of_birth) !== null &&
                          daysUntilBirthday(selected.date_of_birth)! <= 30
                            ? ` · in ${daysUntilBirthday(selected.date_of_birth)}d`
                            : ""
                        }`
                      : "Not set",
                  },
                  { label: "Total Spent", value: `₹${selected.totalSpent.toLocaleString("en-IN")}` },
                  { label: "Orders", value: String(selected.orderCount) },
                  { label: "Joined", value: fmtDate(selected.created_at) },
                ].map((f) => (
                  <div key={f.label} className="rounded-xl bg-slate-50 px-3 py-2">
                    <p className="text-[10px] font-semibold tracking-wider uppercase text-slate-400">{f.label}</p>
                    <p className="text-sm text-slate-700 mt-0.5 flex items-center gap-1">
                      {f.label === "Birthday" && selected.date_of_birth && (
                        <Cake size={13} className="text-[#3D7A52]" />
                      )}
                      {f.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Addresses */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Addresses ({selected.addresses.length})
                </p>
                {selected.addresses.length === 0 ? (
                  <p className="text-sm text-slate-400">No saved addresses.</p>
                ) : (
                  <div className="space-y-2">
                    {selected.addresses.map((a) => (
                      <div key={a.id} className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                        <p className="font-medium flex items-center gap-2">
                          {a.label}
                          {a.is_default && (
                            <span className="text-[10px] font-semibold text-[#3D7A52] border border-[#3D7A52]/30 rounded px-1">
                              DEFAULT
                            </span>
                          )}
                        </p>
                        <p className="text-slate-500">{a.full_name} · {a.phone}</p>
                        <p className="text-slate-500">
                          {a.street}, {a.city}, {a.state} {a.zip_code}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Order history */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Order History ({selected.orders.length})
                </p>
                {selected.orders.length === 0 ? (
                  <p className="text-sm text-slate-400">No orders yet.</p>
                ) : (
                  <div className="space-y-2">
                    {selected.orders.map((o) => (
                      <div
                        key={o.id}
                        className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0"
                      >
                        <div>
                          <p className="font-mono text-xs text-slate-500">
                            {o.order_number}
                            {o.order_type === "preorder" && (
                              <span className="ml-2 text-[10px] font-semibold text-[#3D7A52]">PRE-ORDER</span>
                            )}
                          </p>
                          <p className="text-xs text-slate-400">{fmtDate(o.created_at)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${STATUS_BADGE[o.status]}`}
                          >
                            {o.status}
                          </span>
                          <span className="text-sm font-semibold text-slate-700">
                            ₹{o.total.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Subscriptions */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Subscriptions ({selected.subscriptions.length})
                </p>
                {selected.subscriptions.length === 0 ? (
                  <p className="text-sm text-slate-400">No subscriptions.</p>
                ) : (
                  <div className="space-y-2">
                    {selected.subscriptions.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2.5 text-sm"
                      >
                        <div>
                          <p className="font-medium text-slate-700">{s.planName ?? "—"}</p>
                          <p className="text-xs text-slate-400">since {fmtDate(s.started_at)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs capitalize text-slate-500">{s.status}</p>
                          <p className="text-sm font-semibold text-slate-700">₹{s.planPrice}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
