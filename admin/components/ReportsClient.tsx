"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { DownloadSimple, CurrencyInr, ShoppingBag, Users, Handshake, Repeat, Tag, CaretDown } from "@phosphor-icons/react";

type Cell = string | number;

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
  paidOut: number;
  pendingPayout: number;
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

interface ReportTable {
  /** filename stem, no extension */
  slug: string;
  /** human title, used as the PDF heading + Excel sheet name */
  title: string;
  headers: string[];
  rows: Cell[][];
}

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function exportCsv({ slug, headers, rows }: ReportTable) {
  const escape = (v: Cell) => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers, ...rows].map((row) => row.map(escape).join(",")).join("\n");
  downloadBlob(`${slug}.csv`, new Blob([csv], { type: "text/csv;charset=utf-8;" }));
}

async function exportExcel({ slug, title, headers, rows }: ReportTable) {
  const { default: writeXlsxFile } = await import("write-excel-file/browser");
  const data = [
    headers.map((h) => ({ value: h, fontWeight: "bold" as const })),
    ...rows.map((row) =>
      row.map((c) =>
        typeof c === "number"
          ? { value: c, type: Number }
          : { value: String(c), type: String },
      ),
    ),
  ];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await writeXlsxFile(data as any, { sheet: title.slice(0, 31) }).toFile(`${slug}.xlsx`);
}

async function exportPdf({ slug, title, headers, rows }: ReportTable) {
  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");
  const doc = new jsPDF();
  doc.setFontSize?.(14);
  doc.text(title, 14, 16);
  doc.setFontSize?.(10);
  doc.text(new Date().toLocaleString("en-IN"), 14, 22);
  autoTable(doc, {
    head: [headers],
    body: rows.map((r) => r.map((c) => String(c))),
    startY: 28,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [10, 36, 22] },
  });
  doc.save(`${slug}.pdf`);
}

function ExportMenu({ table }: { table: ReportTable }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const run = (fn: (t: ReportTable) => void | Promise<void>) => {
    setOpen(false);
    Promise.resolve(fn(table)).catch((err) => {
      console.error("Report export failed", err);
      alert("Export failed — see console for details.");
    });
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all active:scale-[0.97]"
      >
        <DownloadSimple size={14} />
        Export
        <CaretDown size={12} />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-32 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-20">
          {[
            { label: "CSV", fn: exportCsv },
            { label: "Excel", fn: exportExcel },
            { label: "PDF", fn: exportPdf },
          ].map(({ label, fn }) => (
            <button
              key={label}
              onClick={() => run(fn)}
              className="w-full text-left px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
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

  const tables = useMemo<Record<Section, ReportTable>>(
    () => ({
      sales: {
        slug: "sales-report",
        title: "Sales Report",
        headers: ["Order #", "Customer", "Total", "Status", "Date"],
        rows: salesRows.map((r) => [r.orderNumber, r.customer, r.total, r.status, r.date]),
      },
      products: {
        slug: "products-report",
        title: "Products Report",
        headers: ["Product", "Units Sold", "Revenue"],
        rows: productRows.map((r) => [r.name, r.units, r.revenue]),
      },
      partners: {
        slug: "partner-payouts",
        title: "Partner Payouts",
        headers: ["Business", "Orders", "Gross", "Fee %", "Net Payout", "Paid Out", "Pending"],
        rows: partnerRows.map((r) => [
          r.businessName,
          r.orderCount,
          Number(r.gross.toFixed(2)),
          r.feePercent,
          Number(r.net.toFixed(2)),
          Number(r.paidOut.toFixed(2)),
          Number(r.pendingPayout.toFixed(2)),
        ]),
      },
      subscriptions: {
        slug: "subscriptions-report",
        title: "Subscriptions Report",
        headers: ["Plan", "Active Count", "Revenue / Cycle"],
        rows: subscriptionRows.map((r) => [r.plan, r.activeCount, r.revenue]),
      },
      discounts: {
        slug: "discounts-report",
        title: "Discounts Report",
        headers: ["Code", "Type", "Value", "Used Count", "Active"],
        rows: discountRows.map((r) => [r.code, r.type, r.value, r.usedCount, r.isActive ? "Yes" : "No"]),
      },
    }),
    [salesRows, productRows, partnerRows, subscriptionRows, discountRows],
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
            <ExportMenu table={tables[section]} />
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
                  {["Business", "Orders", "Gross", "Fee %", "Net Payout", "Paid Out", "Pending"].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold tracking-wide text-slate-400 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {partnerRows.length === 0 && (
                  <tr><td colSpan={7} className="px-6 py-16 text-center text-slate-400 text-sm">No approved partners yet.</td></tr>
                )}
                {partnerRows.map((r) => (
                  <tr key={r.businessName} className="hover:bg-emerald-50/40 transition-colors duration-150">
                    <td className="px-6 py-4 font-medium text-slate-800">{r.businessName}</td>
                    <td className="px-6 py-4 text-slate-600">{r.orderCount}</td>
                    <td className="px-6 py-4 text-slate-600">₹{r.gross.toFixed(0)}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{r.feePercent}%</td>
                    <td className="px-6 py-4 font-semibold text-slate-800">₹{r.net.toFixed(0)}</td>
                    <td className="px-6 py-4 text-slate-600">₹{r.paidOut.toFixed(0)}</td>
                    <td className="px-6 py-4 text-slate-600">₹{r.pendingPayout.toFixed(0)}</td>
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
