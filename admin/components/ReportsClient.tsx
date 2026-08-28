"use client";

import { useMemo, useState } from "react";
import { DownloadSimple, CurrencyInr, ShoppingBag, Users, Handshake, Repeat, Tag } from "@phosphor-icons/react";

export interface SalesRow {
  orderNumber: string;
  customer: string;
  total: number;
  status: string;
  date: string;
}
export interface ProductRow {
  name: string;
  units: number;
  revenue: number;
}
export interface PartnerRow {
  businessName: string;
  orderCount: number;
  gross: number;
  feePercent: number;
  net: number;
}
export interface SubscriptionRow {
  plan: string;
  activeCount: number;
  revenue: number;
}
export interface DiscountRow {
  code: string;
  type: string;
  value: number;
  usedCount: number;
  isActive: boolean;
}

interface Summary {
  totalRevenue: number;
  totalOrders: number;
  activeCustomers: number;
  activePartners: number;
  activeSubscriptions: number;
  discountRedemptions: number;
}

type Section = "sales" | "products" | "partners" | "subscriptions" | "discounts";

const SECTIONS: { key: Section; label: string }[] = [
  { key: "sales", label: "Sales" },
  { key: "products", label: "Products" },
  { key: "partners", label: "Partner Payouts" },
  { key: "subscriptions", label: "Subscriptions" },
  { key: "discounts", label: "Discounts" },
];

function toCsv(headers: string[], rows: (string | number)[][]): string {
  const escape = (v: string | number) => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers, ...rows].map((row) => row.map(escape).join(",")).join("\n");
}

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function ExportButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all active:scale-[0.97]"
    >
      <DownloadSimple size={14} />
      Export CSV
    </button>
  );
}

export default function ReportsClient({
  summary,
  salesRows,
  productRows,
  partnerRows,
  subscriptionRows,
  discountRows,
}: {
  summary: Summary;
  salesRows: SalesRow[];
  productRows: ProductRow[];
  partnerRows: PartnerRow[];
  subscriptionRows: SubscriptionRow[];
  discountRows: DiscountRow[];
}) {
  const [section, setSection] = useState<Section>("sales");

  const cards = useMemo(
    () => [
      { icon: CurrencyInr, label: "Total Revenue", value: `₹${summary.totalRevenue.toLocaleString("en-IN")}`, bg: "#E8F3EC", color: "#3D7A52" },
      { icon: ShoppingBag, label: "Orders", value: String(summary.totalOrders), bg: "#EFF6FF", color: "#2563EB" },
      { icon: Users, label: "Customers", value: String(summary.activeCustomers), bg: "#FEF3C7", color: "#D97706" },
      { icon: Handshake, label: "Active Partners", value: String(summary.activePartners), bg: "#F0FDF4", color: "#16A34A" },
      { icon: Repeat, label: "Active Subscriptions", value: String(summary.activeSubscriptions), bg: "#EEF2FF", color: "#4F46E5" },
      { icon: Tag, label: "Discount Redemptions", value: String(summary.discountRedemptions), bg: "#FDF2F8", color: "#DB2777" },
    ],
    [summary],
  );

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {cards.map(({ icon: Icon, label, value, bg, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-200/50 p-5 shadow-sm animate-fade-up">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: bg }}>
              <Icon size={18} weight="fill" style={{ color }} />
            </div>
            <p className="text-xl font-bold tracking-tight text-[#0A2416]">{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/50 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200">
          <div className="flex gap-0 overflow-x-auto">
            {SECTIONS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSection(key)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-150
                  ${section === key
                    ? "border-[#3D7A52] text-[#0A2416]"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="mr-4">
            {section === "sales" && (
              <ExportButton
                onClick={() =>
                  downloadCsv(
                    "sales-report.csv",
                    toCsv(
                      ["Order #", "Customer", "Total", "Status", "Date"],
                      salesRows.map((r) => [r.orderNumber, r.customer, r.total, r.status, r.date]),
                    ),
                  )
                }
              />
            )}
            {section === "products" && (
              <ExportButton
                onClick={() =>
                  downloadCsv(
                    "products-report.csv",
                    toCsv(
                      ["Product", "Units Sold", "Revenue"],
                      productRows.map((r) => [r.name, r.units, r.revenue]),
                    ),
                  )
                }
              />
            )}
            {section === "partners" && (
              <ExportButton
                onClick={() =>
                  downloadCsv(
                    "partner-payouts.csv",
                    toCsv(
                      ["Business", "Orders", "Gross", "Fee %", "Net Payout"],
                      partnerRows.map((r) => [r.businessName, r.orderCount, r.gross, r.feePercent, r.net.toFixed(2)]),
                    ),
                  )
                }
              />
            )}
            {section === "subscriptions" && (
              <ExportButton
                onClick={() =>
                  downloadCsv(
                    "subscriptions-report.csv",
                    toCsv(
                      ["Plan", "Active Count", "Revenue / Cycle"],
                      subscriptionRows.map((r) => [r.plan, r.activeCount, r.revenue]),
                    ),
                  )
                }
              />
            )}
            {section === "discounts" && (
              <ExportButton
                onClick={() =>
                  downloadCsv(
                    "discounts-report.csv",
                    toCsv(
                      ["Code", "Type", "Value", "Used Count", "Active"],
                      discountRows.map((r) => [r.code, r.type, r.value, r.usedCount, r.isActive ? "Yes" : "No"]),
                    ),
                  )
                }
              />
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          {section === "sales" && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Order #", "Customer", "Total", "Status", "Date"].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold tracking-wide text-slate-400 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {salesRows.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-16 text-center text-slate-400 text-sm">No orders yet.</td></tr>
                )}
                {salesRows.map((r) => (
                  <tr key={r.orderNumber} className="hover:bg-emerald-50/40 transition-colors duration-150">
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{r.orderNumber}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{r.customer}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800">₹{r.total.toFixed(0)}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs capitalize">{r.status}</td>
                    <td className="px-6 py-4 text-slate-400 text-xs">
                      {new Date(r.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {section === "products" && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Product", "Units Sold", "Revenue"].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold tracking-wide text-slate-400 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {productRows.length === 0 && (
                  <tr><td colSpan={3} className="px-6 py-16 text-center text-slate-400 text-sm">No sales data yet.</td></tr>
                )}
                {productRows.map((r) => (
                  <tr key={r.name} className="hover:bg-emerald-50/40 transition-colors duration-150">
                    <td className="px-6 py-4 font-medium text-slate-800">{r.name}</td>
                    <td className="px-6 py-4 text-slate-600">{r.units}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800">₹{r.revenue.toFixed(0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {section === "partners" && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Business", "Orders", "Gross", "Fee %", "Net Payout"].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold tracking-wide text-slate-400 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {partnerRows.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-16 text-center text-slate-400 text-sm">No approved partners yet.</td></tr>
                )}
                {partnerRows.map((r) => (
                  <tr key={r.businessName} className="hover:bg-emerald-50/40 transition-colors duration-150">
                    <td className="px-6 py-4 font-medium text-slate-800">{r.businessName}</td>
                    <td className="px-6 py-4 text-slate-600">{r.orderCount}</td>
                    <td className="px-6 py-4 text-slate-600">₹{r.gross.toFixed(0)}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{r.feePercent}%</td>
                    <td className="px-6 py-4 font-semibold text-slate-800">₹{r.net.toFixed(0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {section === "subscriptions" && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Plan", "Active Count", "Revenue / Cycle"].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold tracking-wide text-slate-400 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {subscriptionRows.length === 0 && (
                  <tr><td colSpan={3} className="px-6 py-16 text-center text-slate-400 text-sm">No active subscriptions yet.</td></tr>
                )}
                {subscriptionRows.map((r) => (
                  <tr key={r.plan} className="hover:bg-emerald-50/40 transition-colors duration-150">
                    <td className="px-6 py-4 font-medium text-slate-800">{r.plan}</td>
                    <td className="px-6 py-4 text-slate-600">{r.activeCount}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800">₹{r.revenue.toFixed(0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {section === "discounts" && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Code", "Type", "Value", "Used", "Active"].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold tracking-wide text-slate-400 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {discountRows.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-16 text-center text-slate-400 text-sm">No discounts yet.</td></tr>
                )}
                {discountRows.map((r) => (
                  <tr key={r.code} className="hover:bg-emerald-50/40 transition-colors duration-150">
                    <td className="px-6 py-4 font-medium text-slate-800">{r.code}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs capitalize">{r.type}</td>
                    <td className="px-6 py-4 text-slate-600">{r.type === "percentage" ? `${r.value}%` : `₹${r.value}`}</td>
                    <td className="px-6 py-4 text-slate-600">{r.usedCount}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${r.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                        {r.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
