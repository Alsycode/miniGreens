import { ProductCard } from "@/components/ProductCard";
import { ShopFilterChips } from "@/components/ShopFilterChips";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { resolveProductImage } from "@/lib/productImages";
import { catRank, SHOP_COPY, SHOP_COPY_DEFAULT } from "@/lib/categories";

type ProductRow = {
  slug: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  images: string[] | null;
  category_id: string | null;
  rating: number | null;
  review_count: number | null;
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const supabase = await createSupabaseServerClient();

  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase.from("categories").select("id, slug, name"),
    supabase
      .from("products")
      .select(
        "slug, name, description, price, original_price, images, category_id, rating, review_count",
      )
      .eq("is_available", true)
      .order("is_featured", { ascending: false })
      .order("name"),
  ]);

  const cats = categories ?? [];
  const rows = (products ?? []) as ProductRow[];
  const catById = new Map(cats.map((c) => [c.id, c]));
  const catBySlug = new Map(cats.map((c) => [c.slug, c]));

  const chipCats = cats
    .filter((c) => rows.some((p) => p.category_id === c.id))
    .sort((a, b) => catRank(a.slug) - catRank(b.slug));

  const activeSlug = category && catBySlug.has(category) ? category : null;
  const visible = activeSlug
    ? rows.filter((p) => catById.get(p.category_id ?? "")?.slug === activeSlug)
    : rows;

  const copy = (activeSlug && SHOP_COPY[activeSlug]) || SHOP_COPY_DEFAULT;

  return (
    <div>
      <div className="border-b border-(--color-border) bg-(--color-bg-muted)">
        <div className="mx-auto max-w-7xl px-6 py-8 md:px-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-(--color-navy)/60">
            {copy.eyebrow}
          </p>
          <h1 className="font-display mt-1 text-3xl font-bold text-(--color-navy) sm:text-4xl">
            {copy.title} {copy.accent}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-(--color-muted)">
            {copy.blurb}
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-8 md:px-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <ShopFilterChips categories={chipCats} active={activeSlug} />
          <p className="text-sm text-(--color-muted)">
            {visible.length} {visible.length === 1 ? "product" : "products"}
          </p>
        </div>

        {visible.length === 0 ? (
          <p className="mt-10 text-sm text-(--color-muted)">No products in this category yet.</p>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {visible.map((product) => (
              <ProductCard
                key={product.slug}
                product={{
                  slug: product.slug,
                  name: product.name,
                  description: product.description,
                  price: Number(product.price),
                  originalPrice:
                    product.original_price != null ? Number(product.original_price) : null,
                  image: resolveProductImage(product.slug, product.images),
                  rating: product.rating,
                  reviewCount: product.review_count,
                }}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
