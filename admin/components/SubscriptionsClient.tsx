"use client";

import { useState, useMemo } from "react";
import type { Database } from "@mobile/database";

type SubscriptionRow = Database["public"]["Tables"]["subscriptions"]["Row"] & {
  profiles: { full_name: string; email: string | null } | null;
  subscription_plans: { name: string; price: number } | null;
};
type Status = SubscriptionRow["status"];

type Tab = "all" | Status;

const TABS: { key: Tab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "paused", label: "Paused" },
  { key: "cancelled", label: "Cancelled" },
];

const STATUS_BADGE: Record<Status, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  paused: "bg-amber-50 text-amber-700 border-amber-200",
  cancelled: "bg-slate-100 text-slate-500 border-slate-200",
};

export default function SubscriptionsClient({ subscriptions }: { subscriptions: SubscriptionRow[] }) {
  const [tab, setTab] = useState<Tab>("all");

  const filtered = useMemo(
    () => (tab === "all" ? subscriptions : subscriptions.filter((s) => s.status === tab)),
    [subscriptions, tab],
  );

  const activeRevenue = useMemo(
    () =>
      subscriptions
        .filter((s) => s.status === "active")
        .reduce((sum, s) => sum + Number(s.subscription_plans?.price ?? 0), 0),
    [subscriptions],
  );

  return (
    <>
      <div className="flex items-center justify-between border-b border-slate-200 animate-fade-up" style={{ "--i": 1 } as React.CSSProperties}>
        <div className="flex gap-0 overflow-x-auto">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-150
                ${tab === key
                  ? "border-[#3D7A52] text-[#0A2416]"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
            >
              {label}
              <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full
                ${tab === key ? "bg-emerald-100 text-[#3D7A52]" : "bg-slate-100 text-slate-400"}`}>
                {key === "all" ? subscriptions.length : subscriptions.filter((s) => s.status === key).length}
              </span>
            </button>
          ))}
        </div>
        <div className="mr-6 text-right">
          <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-400">Active Revenue</p>
          <p className="text-sm font-bold text-[#0A2416]">₹{activeRevenue.toLocaleString("en-IN")}/cycle</p>
        </div>
      </div>

      <div className="overflow-x-auto animate-fade-up" style={{ "--i": 2 } as React.CSSProperties}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              {["Customer", "Plan", "Price", "Status", "Next Delivery", "Started"].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-xs font-semibold tracking-wide text-slate-400 uppercase">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-slate-400 text-sm">
                  No subscriptions match your filters.
                </td>
              </tr>
            )}
            {filtered.map((s) => (
              <tr key={s.id} className="hover:bg-emerald-50/50 transition-colors duration-150">
                <td className="px-6 py-4">
                  <p className="font-medium text-slate-800">{s.profiles?.full_name ?? "—"}</p>
                  <p className="text-xs text-slate-400">{s.profiles?.email ?? ""}</p>
                </td>
                <td className="px-6 py-4 text-slate-600">{s.subscription_plans?.name ?? "—"}</td>
                <td className="px-6 py-4 font-semibold text-slate-800">₹{Number(s.subscription_plans?.price ?? 0)}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_BADGE[s.status]}`}>
                    {s.status[0].toUpperCase() + s.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500 text-xs">
                  {s.next_delivery_date ? new Date(s.next_delivery_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}
                </td>
                <td className="px-6 py-4 text-slate-400 text-xs">
                  {new Date(s.started_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
