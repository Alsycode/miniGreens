"use client";

import { useState, useMemo, useTransition } from "react";
import { X, Plus, Trash } from "@phosphor-icons/react";
import type { Database } from "@mobile/database";
import { createProduct, updateProduct, deleteProduct } from "@/app/dashboard/(protected)/products/actions";

type Product = Database["public"]["Tables"]["products"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];

type Tab = "all" | "featured" | "preorder" | "out_of_stock";

const TABS: { key: Tab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "featured", label: "Featured" },
  { key: "preorder", label: "Pre-order" },
  { key: "out_of_stock", label: "Out of Stock" },
];

function matchesTab(p: Product, tab: Tab) {
  if (tab === "all") return true;
  if (tab === "featured") return p.is_featured;
  if (tab === "preorder") return p.is_preorder;
  if (tab === "out_of_stock") return p.stock <= 0;
  return true;
}

const emptyForm = {
  name: "",
  slug: "",
  price: "",
  original_price: "",
  category_id: "",
  unit: "",
  stock: "0",
  images: "",
};

export default function ProductsClient({
  products,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  const [tab, setTab] = useState<Tab>("all");
  const [selected, setSelected] = useState<Product | null>(null);
  const [editFields, setEditFields] = useState({ price: "", stock: "" });
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [isPending, startTransition] = useTransition();

  const categoryById = useMemo(
    () => new Map(categories.map((c) => [c.id, c.name])),
    [categories],
  );

  const filtered = useMemo(
    () => products.filter((p) => matchesTab(p, tab)),
    [products, tab],
  );

  function openDrawer(p: Product) {
    setSelected(p);
    setEditFields({ price: String(p.price), stock: String(p.stock) });
  }

  function closeDrawer() {
    setSelected(null);
  }

  function toggleFlag(p: Product, key: "is_available" | "is_featured" | "is_preorder") {
    startTransition(async () => {
      await updateProduct(p.id, { [key]: !p[key] });
      if (selected?.id === p.id) setSelected({ ...selected, [key]: !p[key] });
    });
  }

  function handleSavePricing(p: Product) {
    const price = Number(editFields.price);
    const stock = Number(editFields.stock);
    if (Number.isNaN(price) || price < 0 || Number.isNaN(stock) || stock < 0) return;
    startTransition(async () => {
      await updateProduct(p.id, { price, stock });
      closeDrawer();
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteProduct(id);
      closeDrawer();
    });
  }

  function handleCreate() {
    const price = Number(form.price);
    if (!form.name.trim() || !form.slug.trim() || Number.isNaN(price)) return;
    startTransition(async () => {
      await createProduct({
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: null,
        price,
        original_price: form.original_price ? Number(form.original_price) : null,
        category_id: form.category_id || null,
        images: form.images ? form.images.split(",").map((s) => s.trim()).filter(Boolean) : [],
        unit: form.unit || null,
        weight: null,
        nutrition: null,
        benefits: [],
        ingredients: null,
        storage: null,
        consumption_tips: [],
        is_featured: false,
        is_seasonal: false,
        is_best_seller: false,
        rating: 0,
        review_count: 0,
        stock: Number(form.stock) || 0,
        is_available: true,
        is_preorder: false,
        tags: [],
      });
      setForm(emptyForm);
      setShowAdd(false);
    });
  }

  return (
    <>
      {/* Tabs + Add */}
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
                {products.filter((p) => matchesTab(p, key)).length}
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
          Add Product
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto animate-fade-up" style={{ "--i": 2 } as React.CSSProperties}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              {["Product", "Category", "Price", "Stock", "Available", "Featured", "Pre-order"].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-xs font-semibold tracking-wide text-slate-400 uppercase">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center text-slate-400 text-sm">
                  No products match your filters.
                </td>
              </tr>
            )}
            {filtered.map((p) => (
              <tr
                key={p.id}
                onClick={() => openDrawer(p)}
                className="hover:bg-emerald-50/50 transition-colors duration-150 cursor-pointer group"
              >
                <td className="px-6 py-4 font-medium text-slate-800">{p.name}</td>
                <td className="px-6 py-4 text-slate-500 text-xs">{p.category_id ? categoryById.get(p.category_id) ?? "—" : "—"}</td>
                <td className="px-6 py-4 font-semibold text-slate-800">₹{Number(p.price)}</td>
                <td className={`px-6 py-4 ${p.stock <= 0 ? "text-red-500 font-semibold" : "text-slate-600"}`}>{p.stock}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${p.is_available ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                    {p.is_available ? "Yes" : "No"}
                  </span>
                </td>
                <td className="px-6 py-4">{p.is_featured ? "★" : ""}</td>
                <td className="px-6 py-4">{p.is_preorder ? "Yes" : ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Slide-over drawer for editing an existing product */}
      {selected && (
        <>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={closeDrawer} />
          <aside
            className="fixed right-0 top-0 h-full bg-white z-50 shadow-2xl border-l border-slate-200 animate-slide-in-right overflow-y-auto"
            style={{ width: 400 }}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 sticky top-0 bg-white z-10">
              <div>
                <p className="text-xs text-slate-400">{selected.category_id ? categoryById.get(selected.category_id) ?? "" : ""}</p>
                <h2 className="text-base font-semibold text-[#0A2416] mt-0.5">{selected.name}</h2>
              </div>
              <button
                onClick={closeDrawer}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors active:scale-[0.97]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-6">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Price (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={editFields.price}
                    onChange={(e) => setEditFields((f) => ({ ...f, price: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-[#3D7A52] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Stock</label>
                  <input
                    type="number"
                    min={0}
                    value={editFields.stock}
                    onChange={(e) => setEditFields((f) => ({ ...f, stock: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-[#3D7A52] transition-all"
                  />
                </div>
              </div>
              <button
                disabled={isPending}
                onClick={() => handleSavePricing(selected)}
                className="w-full py-2 text-sm font-semibold rounded-xl bg-[#0A2416] text-white transition-all active:scale-[0.97] disabled:opacity-40"
              >
                Save Price & Stock
              </button>

              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Flags</p>
                <div className="space-y-2">
                  {([
                    ["is_available", "Available for sale"],
                    ["is_featured", "Featured"],
                    ["is_preorder", "Pre-order"],
                  ] as const).map(([key, label]) => (
                    <label key={key} className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-50 cursor-pointer">
                      <span className="text-sm text-slate-700">{label}</span>
                      <input
                        type="checkbox"
                        checked={selected[key]}
                        disabled={isPending}
                        onChange={() => toggleFlag(selected, key)}
                        className="w-4 h-4 accent-[#3D7A52]"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <button
                disabled={isPending}
                onClick={() => handleDelete(selected.id)}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-sm font-semibold rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-all active:scale-[0.97] disabled:opacity-50"
              >
                <Trash size={15} />
                Delete Product
              </button>
            </div>
          </aside>
        </>
      )}

      {/* Add product modal */}
      {showAdd && (
        <>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={() => setShowAdd(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 sticky top-0 bg-white">
                <h2 className="text-base font-semibold text-[#0A2416]">Add Product</h2>
                <button
                  onClick={() => setShowAdd(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors active:scale-[0.97]"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="px-6 py-5 space-y-3">
                <input
                  placeholder="Name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: f.slug || e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") }))}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-[#3D7A52]"
                />
                <input
                  placeholder="Slug"
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-[#3D7A52]"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Price (₹)"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    className="px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-[#3D7A52]"
                  />
                  <input
                    type="number"
                    placeholder="Original price"
                    value={form.original_price}
                    onChange={(e) => setForm((f) => ({ ...f, original_price: e.target.value }))}
                    className="px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-[#3D7A52]"
                  />
                </div>
                <select
                  value={form.category_id}
                  onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-[#3D7A52]"
                >
                  <option value="">No category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    placeholder="Unit (e.g. 250g)"
                    value={form.unit}
                    onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                    className="px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-[#3D7A52]"
                  />
                  <input
                    type="number"
                    placeholder="Stock"
                    value={form.stock}
                    onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                    className="px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-[#3D7A52]"
                  />
                </div>
                <input
                  placeholder="Image URL(s), comma-separated"
                  value={form.images}
                  onChange={(e) => setForm((f) => ({ ...f, images: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-[#3D7A52]"
                />
                <button
                  disabled={isPending || !form.name.trim() || !form.slug.trim() || !form.price}
                  onClick={handleCreate}
                  className="w-full py-2.5 text-sm font-semibold rounded-xl transition-all active:scale-[0.97] disabled:opacity-40"
                  style={{ backgroundColor: "#CAEF61", color: "#0A2416" }}
                >
                  Create Product
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
