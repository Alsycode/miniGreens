import { createSupabaseServerClient } from "@/lib/supabase/server";
import CategoriesClient from "@/components/CategoriesClient";

export default async function CategoriesPage() {
  const supabase = await createSupabaseServerClient();
  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order").order("name"),
    supabase.from("products").select("category_id"),
  ]);

  const counts: Record<string, number> = {};
  for (const p of products ?? []) {
    if (p.category_id) counts[p.category_id] = (counts[p.category_id] ?? 0) + 1;
  }

  return (
    <div className="px-6 py-8 md:px-10 max-w-[1400px]">
      <div className="mb-8 animate-fade-up" style={{ "--i": 0 } as React.CSSProperties}>
        <p className="text-xs font-semibold tracking-widest uppercase text-[#3D7A52] mb-1">
          Management
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-[#0A2416]">Categories</h1>
        <p className="mt-1 text-sm text-slate-500">
          Product ranges such as teas, juices or salad bowls. Add one here, then assign products to it
          on the Products page. It appears on the website and app automatically.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/50 shadow-sm overflow-hidden">
        <CategoriesClient categories={categories ?? []} counts={counts} />
      </div>
    </div>
  );
}
