import { Leaf } from "@phosphor-icons/react/dist/ssr";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LeafDecor } from "@/components/LeafDecor";
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
        "slug, name, description, price, images, category_id, rating, review_count",
      )
      .eq("is_available", true)
      .order("is_featured", { ascending: false })
      .order("name"),
  ]);

  const cats = categories ?? [];
  const rows = (products ?? []) as ProductRow[];
  const catById = new Map(cats.map((c) => [c.id, c]));
  const catBySlug = new Map(cats.map((c) => [c.slug, c]));

  // Chips: only categories that actually have products, tea-first order.
  const chipCats = cats
    .filter((c) => rows.some((p) => p.category_id === c.id))
    .sort((a, b) => catRank(a.slug) - catRank(b.slug));

  const activeSlug = category && catBySlug.has(category) ? category : null;
  const visible = activeSlug
    ? rows.filter((p) => catById.get(p.category_id ?? "")?.slug === activeSlug)
    : rows;

  // Group by category, tea-first — same shape the mobile Explore screen renders.
  const byCat = new Map<string, ProductRow[]>();
  for (const p of visible) {
    const slug = catById.get(p.category_id ?? "")?.slug ?? "other";
    if (!byCat.has(slug)) byCat.set(slug, []);
    byCat.get(slug)!.push(p);
  }
  const groups = [...byCat.entries()]
    .map(([slug, items]) => ({
      slug,
      name: catBySlug.get(slug)?.name ?? "More",
      items,
    }))
    .sort((a, b) => catRank(a.slug) - catRank(b.slug));

  const copy = (activeSlug && SHOP_COPY[activeSlug]) || SHOP_COPY_DEFAULT;

  return (
    <div className="relative overflow-hidden">
      <LeafDecor />
      <Navbar />

      <main className="relative z-10 mx-auto max-w-7xl px-6 py-10 md:px-10">
        <div className="mb-5 flex items-center gap-2 text-sm font-medium text-(--color-sage)">
          <Leaf size={16} weight="fill" />
          {copy.eyebrow}
        </div>
        <h1 className="font-display text-4xl leading-[1.1] sm:text-5xl">
          {copy.title}
          <br />
          <span className="text-(--color-sage)">{copy.accent}</span>
        </h1>
        <p className="mt-6 max-w-xl text-sm leading-relaxed text-(--color-muted)">
          {copy.blurb}
        </p>

        <div className="mt-8">
          <ShopFilterChips categories={chipCats} active={activeSlug} />
        </div>

        {visible.length === 0 ? (
          <p className="mt-10 text-sm text-(--color-muted)">
            No products in this category yet.
          </p>
        ) : (
          <div className="mt-10 space-y-14">
            {groups.map((g) => (
              <section key={g.slug}>
                <div className="mb-5 flex items-baseline justify-between border-b border-(--color-border) pb-3">
                  <h2 className="font-display text-2xl">{g.name}</h2>
                  <span className="text-sm text-(--color-muted)">
                    {g.items.length}{" "}
                    {g.slug === "tea-blends"
                      ? g.items.length === 1
                        ? "blend"
                        : "blends"
                      : g.items.length === 1
                        ? "product"
                        : "products"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                  {g.items.map((product) => (
                    <ProductCard
                      key={product.slug}
                      product={{
                        slug: product.slug,
                        name: product.name,
                        description: product.description,
                        price: Number(product.price),
                        image: resolveProductImage(product.slug, product.images),
                        rating: product.rating,
                        reviewCount: product.review_count,
                      }}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
