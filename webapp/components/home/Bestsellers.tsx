import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { getHomeCatalog, type HomeProduct } from "@/lib/homeProducts";
import { HomeProductCard } from "@/components/home/HomeProductCard";
import { BestsellerTabs, type BestsellerTab } from "@/components/home/BestsellerTabs";

const PER_TAB = 4;

// Tabs follow the admin-managed categories, in their sort order. These only override the tab
// label where the category name reads awkwardly as a tab.
const TAB_LABEL: Record<string, string> = { "tea-blends": "Tea Bags" };

/** Round-robin the top of each group so "All" shows a spread, not four teas. */
function interleave(lists: HomeProduct[][], n: number) {
  const out: HomeProduct[] = [];
  for (let i = 0; out.length < n && lists.some((l) => l[i]); i++) {
    for (const l of lists) if (l[i] && out.length < n) out.push(l[i]);
  }
  return out;
}

export async function Bestsellers() {
  const { categories, products } = await getHomeCatalog();
  const grouped = categories
    .map((c) => ({
      id: c.slug,
      label: TAB_LABEL[c.slug] ?? c.name,
      href: `/shop?category=${c.slug}`,
      items: products.filter((p) => p.category === c.slug),
    }))
    .filter((g) => g.items.length > 0);

  if (grouped.length === 0) return null;

  const tabs: BestsellerTab[] = [
    {
      id: "all",
      label: "All",
      href: "/shop",
      cards: interleave(grouped.map((g) => g.items), PER_TAB).map((p) => <HomeProductCard key={p.slug} product={p} />),
    },
    ...grouped.map((g) => ({
      id: g.id,
      label: g.label,
      href: g.href,
      cards: g.items.slice(0, PER_TAB).map((p) => <HomeProductCard key={p.slug} product={p} />),
    })),
  ];

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-14 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--color-leaf)">
              Customer favourites
            </p>
            <h2 className="font-serif-display mt-2 text-3xl text-(--color-forest) sm:text-4xl">Bestsellers</h2>
          </div>
          <Link
            href="/shop"
            className="flex items-center gap-1.5 text-[13px] font-semibold text-(--color-forest) hover:text-(--color-leaf)"
          >
            Shop All <ArrowRight size={13} weight="bold" />
          </Link>
        </div>
        <BestsellerTabs tabs={tabs} />
      </div>
    </section>
  );
}

export function BestsellersSkeleton() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-14 md:px-10">
        <div className="h-10 w-56 rounded-lg bg-(--color-cream)" />
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[3/4.4] rounded-2xl bg-(--color-cream)" />
          ))}
        </div>
      </div>
    </section>
  );
}
