"use client";

import { useRef, useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Eye, EyeSlash, PencilSimple, Plus, Trash, X } from "@phosphor-icons/react";
import type { Database } from "@mobile/database";
import {
  createCategory,
  deleteCategory,
  swapCategoryOrder,
  updateCategory,
  type ActionResult,
} from "@/app/dashboard/(protected)/categories/actions";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Category = Database["public"]["Tables"]["categories"]["Row"];

const emptyForm = { name: "", slug: "", description: "", color: "#2E7D32", image: "" };

const inputCls =
  "w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-[#3D7A52]";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/'/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function CategoriesClient({
  categories,
  counts,
}: {
  categories: Category[];
  counts: Record<string, number>;
}) {
  const [editing, setEditing] = useState<Category | "new" | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [slugTouched, setSlugTouched] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  function openNew() {
    setForm(emptyForm);
    setSlugTouched(false);
    setImageFile(null);
    setError(null);
    setEditing("new");
  }

  function openEdit(c: Category) {
    setForm({
      name: c.name,
      slug: c.slug,
      description: c.description ?? "",
      color: c.color ?? "#2E7D32",
      image: c.image ?? "",
    });
    setSlugTouched(true);
    setImageFile(null);
    setError(null);
    setEditing(c);
  }

  function run(action: () => Promise<ActionResult>) {
    setError(null);
    startTransition(async () => {
      const res = await action();
      if (!res.ok) setError(res.error);
    });
  }

  async function uploadImage(): Promise<string | null> {
    if (!imageFile) return form.image || null;
    const supabase = createSupabaseBrowserClient();
    const ext = imageFile.name.split(".").pop() || "jpg";
    const path = `categories/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("product-images").upload(path, imageFile);
    if (upErr) throw upErr;
    return supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
  }

  function handleSave() {
    const name = form.name.trim();
    const slug = form.slug.trim();
    if (!name || !slug || !editing) return;
    setError(null);
    setIsUploading(true);
    startTransition(async () => {
      try {
        const image = await uploadImage();
        const fields = {
          name,
          slug,
          description: form.description.trim() || null,
          color: form.color || null,
          image,
        };
        const res =
          editing === "new"
            ? await createCategory({
                ...fields,
                icon: null,
                // New ranges go to the end of the list.
                sort_order: Math.max(0, ...categories.map((c) => c.sort_order)) + 10,
                is_active: true,
              })
            : await updateCategory(editing.id, fields);
        if (!res.ok) setError(res.error);
        else setEditing(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not save the category.");
      } finally {
        setIsUploading(false);
      }
    });
  }

  function move(index: number, dir: -1 | 1) {
    const a = categories[index];
    const b = categories[index + dir];
    if (!a || !b) return;
    run(() => swapCategoryOrder(a, b));
  }

  function handleDelete(c: Category) {
    if (!window.confirm(`Delete the "${c.name}" category? This cannot be undone.`)) return;
    run(() => deleteCategory(c.id));
  }

  const preview = imageFile ? URL.createObjectURL(imageFile) : form.image;

  return (
    <>
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-3">
        <p className="text-sm text-slate-500">
          {categories.length} categor{categories.length === 1 ? "y" : "ies"} · use the arrows to set the order
          customers see
        </p>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-xl transition-all active:scale-[0.97]"
          style={{ backgroundColor: "#CAEF61", color: "#0A2416" }}
        >
          <Plus size={16} weight="bold" />
          Add Category
        </button>
      </div>

      {error && !editing && (
        <div className="mx-6 mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              {["Order", "Category", "Slug", "Products", "Visible", ""].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.map((c, i) => (
              <tr key={c.id} className={`border-b border-slate-50 ${c.is_active ? "" : "opacity-60"}`}>
                <td className="px-6 py-3">
                  <div className="flex gap-1">
                    <button
                      disabled={isPending || i === 0}
                      onClick={() => move(i, -1)}
                      aria-label={`Move ${c.name} up`}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-30"
                    >
                      <ArrowUp size={14} weight="bold" />
                    </button>
                    <button
                      disabled={isPending || i === categories.length - 1}
                      onClick={() => move(i, 1)}
                      aria-label={`Move ${c.name} down`}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-30"
                    >
                      <ArrowDown size={14} weight="bold" />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: c.color ?? "#cbd5e1" }}
                    />
                    <div>
                      <p className="font-semibold text-[#0A2416]">{c.name}</p>
                      {c.description && <p className="text-xs text-slate-400 line-clamp-1">{c.description}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-3 text-xs text-slate-500">{c.slug}</td>
                <td className="px-6 py-3 text-slate-600">{counts[c.id] ?? 0}</td>
                <td className="px-6 py-3">
                  <button
                    disabled={isPending}
                    onClick={() => run(() => updateCategory(c.id, { is_active: !c.is_active }))}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${
                      c.is_active
                        ? "bg-emerald-50 text-[#3D7A52] border-emerald-200"
                        : "bg-slate-100 text-slate-500 border-slate-200"
                    }`}
                  >
                    {c.is_active ? <Eye size={13} /> : <EyeSlash size={13} />}
                    {c.is_active ? "Shown" : "Hidden"}
                  </button>
                </td>
                <td className="px-6 py-3">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => openEdit(c)}
                      aria-label={`Edit ${c.name}`}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                      <PencilSimple size={16} />
                    </button>
                    <button
                      disabled={isPending}
                      onClick={() => handleDelete(c)}
                      aria-label={`Delete ${c.name}`}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-400">
                  No categories yet. Add one to start grouping products.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setEditing(null)} />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-[#0A2416]">
                {editing === "new" ? "Add Category" : `Edit ${editing.name}`}
              </h2>
              <button onClick={() => setEditing(null)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
              )}
              <input
                placeholder="Name (e.g. Salad Bowls)"
                value={form.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setForm((f) => ({ ...f, name, slug: slugTouched ? f.slug : slugify(name) }));
                }}
                className={inputCls}
              />
              <div>
                <input
                  placeholder="Slug"
                  value={form.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setForm((f) => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") }));
                  }}
                  onBlur={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
                  className={inputCls}
                />
                {editing !== "new" && (
                  <p className="mt-1 text-xs text-slate-400">
                    Used in shop links (/shop?category=slug). Changing it breaks old links.
                  </p>
                )}
              </div>
              <textarea
                placeholder="Short description"
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className={inputCls}
              />
              <div className="flex items-center gap-3">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Colour</label>
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                  className="h-9 w-14 rounded-lg border border-slate-200 bg-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Cover image (optional)
                </label>
                <div className="flex items-center gap-3">
                  {preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={preview} alt="" className="h-16 w-16 rounded-lg border border-slate-200 object-cover" />
                  ) : (
                    <div className="h-16 w-16 rounded-lg border-2 border-dashed border-slate-300" />
                  )}
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="px-3 py-1.5 text-sm font-medium rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    {preview ? "Replace" : "Upload"}
                  </button>
                  {preview && (
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setForm((f) => ({ ...f, image: "" }));
                      }}
                      className="text-sm text-slate-400 hover:text-red-600"
                    >
                      Remove
                    </button>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      setImageFile(e.target.files?.[0] ?? null);
                      e.target.value = "";
                    }}
                  />
                </div>
              </div>
              <button
                disabled={isPending || isUploading || !form.name.trim() || !form.slug.trim()}
                onClick={handleSave}
                className="w-full py-2.5 text-sm font-semibold rounded-xl transition-all active:scale-[0.97] disabled:opacity-40"
                style={{ backgroundColor: "#CAEF61", color: "#0A2416" }}
              >
                {isUploading ? "Saving…" : editing === "new" ? "Create Category" : "Save Changes"}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
