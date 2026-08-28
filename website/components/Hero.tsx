import Image from "next/image";
import { ArrowRight, CaretRight, Leaf, ShieldCheck, SunHorizon } from "@phosphor-icons/react/dist/ssr";

const BADGES = [
  { icon: ShieldCheck, label: "100% Organic" },
  { icon: Leaf, label: "Pesticide Free" },
  { icon: SunHorizon, label: "Farm Fresh" },
];

export function Hero() {
  return (
    <section className="relative z-10 mx-auto grid max-w-7xl gap-10 px-6 pb-20 pt-8 md:px-10 lg:grid-cols-2 lg:items-center lg:gap-6">
      <div>
        <div className="mb-5 flex items-center gap-2 text-sm font-medium text-(--color-sage)">
          <Leaf size={16} weight="fill" />
          Farm Fresh Microgreens
        </div>

        <h1 className="font-display text-5xl leading-[1.05] sm:text-6xl">
          Premium
          <br />
          Microgreens
          <br />
          <span className="text-(--color-sage)">Direct From Farm</span>
        </h1>

        <p className="mt-6 max-w-md text-(--color-muted)">
          Handpicked microgreens grown with care, delivered fresh to your
          doorstep.
        </p>

        <div className="mt-6 flex flex-wrap gap-5">
          {BADGES.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-sm text-(--color-muted)">
              <span className="flex size-7 items-center justify-center rounded-full border border-(--color-border) text-(--color-sage)">
                <Icon size={14} weight="bold" />
              </span>
              {label}
            </div>
          ))}
        </div>

        <div className="mt-9 flex gap-4">
          <button className="flex items-center gap-2 rounded-full bg-(--color-olive) px-7 py-3.5 font-medium text-white transition-colors hover:bg-(--color-olive-dark)">
            Shop Now
            <ArrowRight size={16} weight="bold" />
          </button>
          <button className="flex items-center gap-2 rounded-full border border-(--color-border) px-7 py-3.5 font-medium text-(--color-cream) transition-colors hover:border-(--color-sage)">
            Explore
            <CaretRight size={16} weight="bold" />
          </button>
        </div>
      </div>

      <div className="relative mx-auto aspect-square w-full max-w-lg lg:max-w-none">
        <Image
          src="/images/hero-dome-radish.png"
          alt="Fresh red radish microgreens under a glass dome"
          fill
          priority
          unoptimized
          className="object-contain"
          sizes="(min-width: 1024px) 45vw, 90vw"
        />
      </div>
    </section>
  );
}
