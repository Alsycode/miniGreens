import Link from "next/link";

interface Cat {
  slug: string;
  name: string;
}

export function ShopFilterChips({
  categories,
  active,
}: {
  categories: Cat[];
  active: string | null;
}) {
  const base = "rounded-full border px-5 py-2 text-sm font-medium transition-colors";
  const on = "border-(--color-navy) bg-(--color-navy) text-white";
  const off = "border-(--color-border) text-(--color-ink) hover:border-(--color-navy)";

  return (
    <div className="flex flex-wrap gap-2">
      <Link href="/shop" className={`${base} ${active === null ? on : off}`}>
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
