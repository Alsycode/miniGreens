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
  const base = "rounded-full border px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors";
  const on = "border-[#1d3a1b] bg-[#1d3a1b] text-white";
  const off = "border-[#1d3a1b]/25 bg-[#faf8f0] text-[#1d3a1b] hover:border-[#1d3a1b]";

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
