import Image from "next/image";
import { ArrowRight, Leaf, Package, Plant, Sparkle, Truck } from "@phosphor-icons/react/dist/ssr";

const POINTS = [
  { icon: Plant, label: "Sustainably Grown" },
  { icon: Sparkle, label: "Rich in Nutrients" },
  { icon: Package, label: "Carefully Packed" },
  { icon: Truck, label: "Delivered Fresh" },
];

export function WhyChooseUs() {
  return (
    <section id="story" className="relative z-10 mx-auto grid max-w-7xl gap-10 px-6 py-16 md:px-10 lg:grid-cols-2 lg:items-center lg:gap-6">
      <div className="relative mx-auto aspect-square w-full max-w-lg lg:max-w-none">
        <Image
          src="/images/dome-peashoot.png"
          alt="Fresh pea shoot microgreens under a glass dome"
          fill
          unoptimized
          className="object-contain"
          sizes="(min-width: 1024px) 45vw, 90vw"
        />
      </div>

      <div>
        <div className="mb-5 flex items-center gap-2 text-sm font-medium text-(--color-sage)">
          <Leaf size={16} weight="fill" />
          Why Choose Us
        </div>

        <h2 className="font-display text-4xl leading-[1.1] sm:text-5xl">
          From Our Farm
          <br />
          <span className="text-(--color-sage)">To Your Table</span>
        </h2>

        <p className="mt-6 max-w-md text-(--color-muted)">
          We ensure the highest quality &amp; freshness in every microgreen we
          deliver.
        </p>

        <ul className="mt-6 space-y-3">
          {POINTS.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-3 text-sm text-(--color-muted)">
              <span className="flex size-7 items-center justify-center rounded-full border border-(--color-border) text-(--color-sage)">
                <Icon size={14} weight="bold" />
              </span>
              {label}
            </li>
          ))}
        </ul>

        <button className="mt-8 flex items-center gap-2 rounded-full bg-(--color-olive) px-7 py-3.5 font-medium text-white transition-colors hover:bg-(--color-olive-dark)">
          Learn More
          <ArrowRight size={16} weight="bold" />
        </button>
      </div>
    </section>
  );
}
