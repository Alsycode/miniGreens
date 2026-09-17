import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CaretRight,
  CheckCircle,
  Drop,
  Leaf,
  Plant,
  Recycle,
  Star,
  StarHalf,
} from "@phosphor-icons/react/dist/ssr";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LeafDecor } from "@/components/LeafDecor";
import { ProductCard } from "@/components/ProductCard";
import { Gallery } from "@/components/pdp/Gallery";
import { AddToCartPanel } from "@/components/pdp/AddToCartPanel";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { resolveProductGallery, resolveProductImage } from "@/lib/productImages";
import { displayName } from "@/lib/productCopy";

type NutritionShape = {
  calories?: number;
  protein?: string;
  carbs?: string;
  fat?: string;
  fiber?: string;
  vitamins?: string[];
};

const SELECT =
  "slug, name, description, price, original_price, images, unit, weight, nutrition, benefits, storage, consumption_tips, rating, review_count, tags, category_id";

async function getProduct(slug: string) {
  const supabase = await createSupabaseServerClient();
  const { data: product } = await supabase
    .from("products")
    .select(SELECT)
    .eq("slug", slug)
    .eq("is_available", true)
    .maybeSingle();
  if (!product) return null;

  const [{ data: category }, { data: related }] = await Promise.all([
    product.category_id
      ? supabase
          .from("categories")
          .select("slug, name")
          .eq("id", product.category_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from("products")
      .select("slug, name, description, price, images, rating, review_count")
      .eq("is_available", true)
      .eq("category_id", product.category_id ?? "")
      .neq("slug", slug)
      .limit(4),
  ]);

  return { product, category, related: related ?? [] };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProduct(slug);
  if (!data) return { title: "Product not found | Mini Greens Company" };
  const { product } = data;
  return {
    title: `${displayName(product.name)} | Mini Greens Company`,
    description: product.description ?? undefined,
  };
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex text-(--color-sage)">
      {Array.from({ length: 5 }).map((_, i) => {
        if (rating >= i + 1)
          return <Star key={i} size={16} weight="fill" />;
        if (rating >= i + 0.5)
          return <StarHalf key={i} size={16} weight="fill" />;
        return <Star key={i} size={16} />;
      })}
    </span>
  );
}

function trustRow(categorySlug: string | undefined) {
  return [
    categorySlug === "tea-blends"
      ? { icon: Drop, label: "Caffeine-free" }
      : { icon: Plant, label: "Pesticide-free" },
    { icon: Leaf, label: "Harvested to order" },
    { icon: Recycle, label: "Plastic-free packaging" },
  ];
}

function brewSteps(categorySlug: string | undefined, tips: string[]): string[] {
  if (tips && tips.length > 0) return tips;
  if (categorySlug === "tea-blends")
    return [
      "Steep one sachet in freshly boiled water for 3–4 minutes.",
      "Add a squeeze of lemon or a little honey to taste.",
      "Enjoy up to 3 cups a day, any time — it's naturally caffeine-free.",
    ];
  return [
    "Rinse gently in cold water and pat dry before use.",
    "Add raw to salads, sandwiches, bowls, juices or smoothies.",
    "Keep refrigerated and use within 5–7 days for peak freshness.",
  ];
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getProduct(slug);
  if (!data) notFound();
  const { product, category, related } = data;

  const gallery = resolveProductGallery(product.slug, product.images);
  const nutrition = (product.nutrition ?? {}) as NutritionShape;
  const hasNutrition =
    (nutrition.calories ?? 0) > 5 ||
    [nutrition.protein, nutrition.carbs, nutrition.fat, nutrition.fiber].some(
      (v) => v && v !== "0g" && v !== "—",
    );
  const discountPct = product.original_price
    ? Math.round((1 - Number(product.price) / Number(product.original_price)) * 100)
    : null;
  const steps = brewSteps(category?.slug, product.consumption_tips ?? []);
  const trust = trustRow(category?.slug);
  const name = displayName(product.name);

  return (
    <div className="relative overflow-hidden">
      <LeafDecor />
      <Navbar />

      <main className="relative z-10 mx-auto max-w-7xl px-6 py-10 md:px-10">
        <nav className="mb-8 flex flex-wrap items-center gap-1.5 text-xs text-(--color-muted)">
          <Link href="/" className="hover:text-(--color-cream)">
            Home
          </Link>
          <CaretRight size={11} />
          <Link href="/shop" className="hover:text-(--color-cream)">
            Shop
          </Link>
          {category && (
            <>
              <CaretRight size={11} />
              <Link
                href={`/shop?category=${category.slug}`}
                className="hover:text-(--color-cream)"
              >
                {category.name}
              </Link>
            </>
          )}
          <CaretRight size={11} />
          <span className="text-(--color-cream)">{name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <Gallery images={gallery} name={name} />

          <div>
            {category && (
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-(--color-sage)">
                <Leaf size={16} weight="fill" />
                {category.name}
              </div>
            )}
            <h1 className="font-display text-4xl leading-[1.1] sm:text-5xl">
              {name}
            </h1>

            <div className="mt-4 flex items-center gap-2 text-sm text-(--color-muted)">
              <Stars rating={Number(product.rating) || 0} />
              <span>
                {Number(product.rating).toFixed(1)} · {product.review_count} reviews
              </span>
            </div>

            <div className="mt-6 flex items-baseline gap-3">
              <span className="font-display text-3xl text-(--color-cream)">
                ₹{Number(product.price)}
              </span>
              {product.original_price && (
                <span className="text-lg text-(--color-muted) line-through">
                  ₹{Number(product.original_price)}
                </span>
              )}
              {discountPct && discountPct > 0 && (
                <span className="rounded-full bg-(--color-olive)/20 px-2.5 py-1 text-xs font-semibold text-(--color-sage)">
                  {discountPct}% off
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-(--color-muted)">
              Inclusive of all taxes
              {product.weight ? ` · ${product.weight}` : ""}
              {product.unit ? ` · per ${product.unit}` : ""}
            </p>

            {product.description && (
              <p className="mt-6 text-sm leading-relaxed text-(--color-muted)">
                {product.description}
              </p>
            )}

            {product.benefits && product.benefits.length > 0 && (
              <ul className="mt-6 space-y-2">
                {product.benefits.map((b: string) => (
                  <li key={b} className="flex items-center gap-2 text-sm">
                    <CheckCircle
                      size={18}
                      weight="fill"
                      className="shrink-0 text-(--color-sage)"
                    />
                    {b}
                  </li>
                ))}
              </ul>
            )}

            <AddToCartPanel slug={product.slug} price={Number(product.price)} />

            <div className="mt-6 grid grid-cols-3 gap-3">
              {trust.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-1.5 rounded-2xl border border-(--color-border) px-2 py-3 text-center"
                >
                  <Icon size={18} className="text-(--color-sage)" />
                  <span className="text-[11px] leading-tight text-(--color-muted)">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* How to enjoy */}
        <section className="mt-16 max-w-2xl">
          <h2 className="font-display text-2xl">How to enjoy</h2>
          <ol className="mt-5 space-y-4">
            {steps.map((step, i) => (
              <li key={step} className="flex gap-4">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-(--color-border) text-xs font-semibold text-(--color-sage)">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-sm leading-relaxed text-(--color-muted)">
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </section>

        {/* Nutrition */}
        {(hasNutrition ||
          (nutrition.vitamins && nutrition.vitamins.length > 0)) && (
          <section className="mt-14 max-w-2xl">
            <h2 className="font-display text-2xl">Nutrition</h2>
            {hasNutrition && (
              <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-5">
                {[
                  { label: "Calories", value: String(nutrition.calories ?? "—") },
                  { label: "Protein", value: nutrition.protein ?? "—" },
                  { label: "Carbs", value: nutrition.carbs ?? "—" },
                  { label: "Fat", value: nutrition.fat ?? "—" },
                  { label: "Fiber", value: nutrition.fiber ?? "—" },
                ].map((n) => (
                  <div
                    key={n.label}
                    className="rounded-2xl border border-(--color-border) p-3 text-center"
                  >
                    <p className="font-display text-lg text-(--color-cream)">
                      {n.value}
                    </p>
                    <p className="text-xs text-(--color-muted)">{n.label}</p>
                  </div>
                ))}
              </div>
            )}
            {nutrition.vitamins && nutrition.vitamins.length > 0 && (
              <p className="mt-4 text-sm text-(--color-muted)">
                <span className="font-medium text-(--color-cream)">
                  Rich in:{" "}
                </span>
                {nutrition.vitamins.join(", ")}
              </p>
            )}
            {product.storage && (
              <p className="mt-3 text-sm text-(--color-muted)">
                <span className="font-medium text-(--color-cream)">Storage: </span>
                {product.storage}
              </p>
            )}
          </section>
        )}

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-16">
            <div className="mb-6 flex items-center gap-2 text-sm font-medium text-(--color-sage)">
              <Leaf size={16} weight="fill" />
              You may also like
            </div>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard
                  key={p.slug}
                  product={{
                    slug: p.slug,
                    name: p.name,
                    description: p.description,
                    price: Number(p.price),
                    image: resolveProductImage(p.slug, p.images),
                    rating: p.rating,
                    reviewCount: p.review_count,
                  }}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
