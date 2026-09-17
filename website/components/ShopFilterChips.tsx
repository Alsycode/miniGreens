import Link from "next/link";

interface Cat {
  slug: string;
  name: string;
}

/**
 * Category filter chips for the shop, mirroring the mobile Explore screen's
 * chip row: "All" plus one chip per category that has products, in tea-first
 * order. Navigates via `?category=<slug>` so it stays a server component.
 */
export function ShopFilterChips({
  categories,
  active,
}: {
  categories: Cat[];
  active: string | null;
}) {
  const base =
    "rounded-full border px-5 py-2 text-sm font-medium transition-colors";
  const on = "border-(--color-sage) bg-(--color-olive)/15 text-(--color-cream)";
  const off =
    "border-(--color-border) text-(--color-muted) hover:border-(--color-sage)";

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/shop"
        className={`${base} ${active === null ? on : off}`}
      >
        All
      </Link>
      {categories.map((c) => (
        <Link
          key={c.slug}
          href={`/shop?category=${c.slug}`}
          className={`${base} ${active === c.slug ? on : off}`}
        >
          {c.name}
        </Link>
      ))}
    </div>
  );
}
