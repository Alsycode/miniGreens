import Link from "next/link";
import { ArrowRight, Barbell, Coffee, ForkKnife, Storefront, UsersThree } from "@phosphor-icons/react/dist/ssr";

// Cafés and shops order through the Partner role (Mobile APP brief: "Place Business Order"
// in the Partner Dashboard), so the CTA registers them as a partner of that type.

const BUSINESSES = [
  { Icon: Coffee, label: "Cafés", type: "cafe" },
  { Icon: ForkKnife, label: "Restaurants", type: "restaurant" },
  { Icon: Storefront, label: "Shops", type: "shop" },
  { Icon: Barbell, label: "Gyms & wellness", type: "fitness_wellness" },
  { Icon: UsersThree, label: "Communities", type: "community" },
];

export function BusinessStrip() {
  return (
    <section className="border-y border-black/5 bg-(--color-cream)">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 md:px-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="lg:max-w-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-(--color-leaf)">For business</p>
          <h2 className="font-serif-display mt-1.5 text-2xl text-(--color-forest) sm:text-3xl">Order Fresh Greens in Bulk</h2>
          <p className="mt-1.5 text-sm text-(--color-forest)/70">
            Regular supply for your menu, shelves or members, with wholesale pricing.
          </p>
        </div>

        <ul className="flex flex-wrap gap-2">
          {BUSINESSES.map(({ Icon, label, type }) => (
            <li key={type}>
              <Link
                href={`/partner/apply?type=${type}`}
                className="flex items-center gap-2 rounded-full border border-(--color-forest)/15 bg-white px-4 py-2.5 text-[13px] font-medium text-(--color-forest) transition-colors hover:border-(--color-forest)"
              >
                <Icon size={17} weight="light" />
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center lg:flex-col lg:items-end">
          <Link
            href="/partner/apply?type=cafe"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-(--color-forest) px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-(--color-leaf)"
          >
            Register Your Business
            <ArrowRight size={15} weight="bold" />
          </Link>
          <Link href="/contact" className="text-center text-[13px] font-semibold text-(--color-forest) underline-offset-4 hover:underline">
            Or talk to us first
          </Link>
        </div>
      </div>
    </section>
  );
}
