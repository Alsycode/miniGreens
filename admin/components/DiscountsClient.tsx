"use client";

import { useState, useMemo, useTransition } from "react";
import { X, Plus, Trash } from "@phosphor-icons/react";
import type { Database } from "@mobile/database";
import { createDiscount, updateDiscount, deleteDiscount } from "@/app/dashboard/(protected)/discounts/actions";

type Discount = Database["public"]["Tables"]["discounts"]["Row"];
type DiscountType = Discount["discount_type"];
type DiscountTarget = Discount["target"];

type Tab = "all" | "active" | "inactive" | "birthday";

const TABS: { key: Tab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "inactive", label: "Inactive" },
  { key: "birthday", label: "Birthday" },
];

function matchesTab(d: Discount, tab: Tab) {
  if (tab === "all") return true;
  if (tab === "active") return d.is_active;
  if (tab === "inactive") return !d.is_active;
  if (tab === "birthday") return d.is_birthday_offer;
  return true;
}

const TARGET_OPTIONS: DiscountTarget[] = ["all", "category", "product", "subscription_plan", "partner", "wholesale"];

const emptyForm = {
  code: "",
  description: "",
  discount_type: "percentage" as DiscountType,
  value: "",
  target: "all" as DiscountTarget,
  min_order_value: "",
  max_discount_amount: "",
  is_birthday_offer: false,
  expires_at: "",
};

export default function DiscountsClient({ discounts }: { discounts: Discount[] }) {
  const [tab, setTab] = useState<Tab>("all");
  const [selected, setSelected] = useState<Discount | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(
    () => discounts.filter((d) => matchesTab(d, tab)),
    [discounts, tab],
  );

  function toggleActive(d: Discount) {
    startTransition(async () => {
      await updateDiscount(d.id, { is_active: !d.is_active });
      if (selected?.id === d.id) setSelected({ ...selected, is_active: !d.is_active });
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteDiscount(id);
      setSelected(null);
    });
  }

  function handleCreate() {
    const value = Number(form.value);
    if (Number.isNaN(value) || value <= 0) return;
    startTransition(async () => {
      await createDiscount({
        code: form.code.trim() || null,
        description: form.description.trim() || null,
        discount_type: form.discount_type,
        value,
        target: form.target,
        target_id: null,
        min_order_value: form.min_order_value ? Number(form.min_order_value) : null,
        max_discount_amount: form.max_discount_amount ? Number(form.max_discount_amount) : null,
        is_birthday_offer: form.is_birthday_offer,
        starts_at: null,
        expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
        usage_limit: null,
        created_by: null,
      });
      setForm(emptyForm);
      setShowAdd(false);
    });
  }

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
                {discounts.filter((d) => matchesTab(d, key)).length}
              </span>
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="mr-4 flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-xl transition-all active:scale-[0.97]"
          style={{ backgroundColor: "#CAEF61", color: "#0A2416" }}
        >
          <Plus size={16} weight="bold" />
          Add Discount
        </button>
      </div>

      <div className="overflow-x-auto animate-fade-up" style={{ "--i": 2 } as React.CSSProperties}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              {["Code / Description", "Type", "Value", "Target", "Used", "Status"].map((h) => (
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
                  No discounts match your filters.
                </td>
              </tr>
            )}
            {filtered.map((d) => (
              <tr
                key={d.id}
                onClick={() => setSelected(d)}
                className="hover:bg-emerald-50/50 transition-colors duration-150 cursor-pointer group"
              >
                <td className="px-6 py-4 font-medium text-slate-800">
                  {d.code || <span className="text-slate-400 italic">no code</span>}
                  {d.is_birthday_offer && <span className="ml-2 text-xs text-pink-500">🎂</span>}
                  {d.description && <p className="text-xs text-slate-400 font-normal mt-0.5">{d.description}</p>}
                </td>
                <td className="px-6 py-4 text-slate-500 text-xs capitalize">{d.discount_type}</td>
                <td className="px-6 py-4 font-semibold text-slate-800">
                  {d.discount_type === "percentage" ? `${Number(d.value)}%` : `₹${Number(d.value)}`}
                </td>
                <td className="px-6 py-4 text-slate-500 text-xs capitalize">{d.target.replace("_", " ")}</td>
                <td className="px-6 py-4 text-slate-600">{d.used_count}{d.usage_limit ? ` / ${d.usage_limit}` : ""}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${d.is_active ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                    {d.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={() => setSelected(null)} />
          <aside
            className="fixed right-0 top-0 h-full bg-white z-50 shadow-2xl border-l border-slate-200 animate-slide-in-right overflow-y-auto"
            style={{ width: 400 }}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 sticky top-0 bg-white z-10">
              <div>
                <p className="text-xs text-slate-400 capitalize">{selected.target.replace("_", " ")}</p>
                <h2 className="text-base font-semibold text-[#0A2416] mt-0.5">{selected.code || "No code"}</h2>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors active:scale-[0.97]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-6">
              <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700 space-y-1">
                <p><span className="text-slate-400">Value:</span> {selected.discount_type === "percentage" ? `${Number(selected.value)}%` : `₹${Number(selected.value)}`}</p>
                {selected.min_order_value && <p><span className="text-slate-400">Min order:</span> ₹{Number(selected.min_order_value)}</p>}
                {selected.max_discount_amount && <p><span className="text-slate-400">Max discount:</span> ₹{Number(selected.max_discount_amount)}</p>}
                {selected.expires_at && <p><span className="text-slate-400">Expires:</span> {new Date(selected.expires_at).toLocaleDateString("en-IN")}</p>}
                <p><span className="text-slate-400">Used:</span> {selected.used_count}{selected.usage_limit ? ` / ${selected.usage_limit}` : ""}</p>
              </div>

              <button
                disabled={isPending}
                onClick={() => toggleActive(selected)}
                className="w-full py-2 text-sm font-semibold rounded-xl transition-all active:scale-[0.97] disabled:opacity-50"
                style={selected.is_active ? { border: "1px solid #fecaca", color: "#dc2626" } : { backgroundColor: "#CAEF61", color: "#0A2416" }}
              >
                {selected.is_active ? "Deactivate" : "Activate"}
              </button>

              <button
                disabled={isPending}
                onClick={() => handleDelete(selected.id)}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-sm font-semibold rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-all active:scale-[0.97] disabled:opacity-50"
              >
                <Trash size={15} />
                Delete Discount
              </button>
            </div>
          </aside>
        </>
      )}

      {showAdd && (
        <>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={() => setShowAdd(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 sticky top-0 bg-white">
                <h2 className="text-base font-semibold text-[#0A2416]">Add Discount</h2>
                <button
                  onClick={() => setShowAdd(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors active:scale-[0.97]"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="px-6 py-5 space-y-3">
                <input
                  placeholder="Code (optional)"
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-[#3D7A52]"
                />
                <input
                  placeholder="Description"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-[#3D7A52]"
                />
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={form.discount_type}
                    onChange={(e) => setForm((f) => ({ ...f, discount_type: e.target.value as DiscountType }))}
                    className="px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-[#3D7A52]"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="flat">Flat (₹)</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Value"
                    value={form.value}
                    onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                    className="px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-[#3D7A52]"
                  />
                </div>
                <select
                  value={form.target}
                  onChange={(e) => setForm((f) => ({ ...f, target: e.target.value as DiscountTarget }))}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-[#3D7A52]"
                >
                  {TARGET_OPTIONS.map((t) => (
                    <option key={t} value={t}>{t.replace("_", " ")}</option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Min order value"
                    value={form.min_order_value}
                    onChange={(e) => setForm((f) => ({ ...f, min_order_value: e.target.value }))}
                    className="px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-[#3D7A52]"
                  />
                  <input
                    type="number"
                    placeholder="Max discount amount"
                    value={form.max_discount_amount}
                    onChange={(e) => setForm((f) => ({ ...f, max_discount_amount: e.target.value }))}
                    className="px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-[#3D7A52]"
                  />
                </div>
                <input
                  type="date"
                  value={form.expires_at}
                  onChange={(e) => setForm((f) => ({ ...f, expires_at: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-[#3D7A52]"
                />
                <label className="flex items-center gap-2 px-1 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.is_birthday_offer}
                    onChange={(e) => setForm((f) => ({ ...f, is_birthday_offer: e.target.checked }))}
                    className="w-4 h-4 accent-[#3D7A52]"
                  />
                  Birthday offer
                </label>
                <button
                  disabled={isPending || !form.value}
                  onClick={handleCreate}
                  className="w-full py-2.5 text-sm font-semibold rounded-xl transition-all active:scale-[0.97] disabled:opacity-40"
                  style={{ backgroundColor: "#CAEF61", color: "#0A2416" }}
                >
                  Create Discount
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
