import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { BRAND_CLAIM } from "@/lib/brand";

// "Become an MGC Partner" pitch from the MGC 2.0 brief. The 0% fee line mirrors the
// Women partner option already shown in PartnerApplyForm.

const STEPS = [
  { title: "You Grow", body: "Fresh microgreens from your home, farm or space, following MGC's growing practices." },
  { title: "We Connect", body: "Our platform brings your greens to customers, restaurants and businesses." },
  { title: "We Help You Sell", body: "We bring the orders, so you spend your time growing, not hunting for buyers." },
  { title: "You Earn", body: "You supply and earn from your sales. MGC earns a small platform fee." },
];

const WHO = ["Women", "Senior citizens", "Homemakers", "Home growers", "Small farmers", "New growers"];

export function PartnerSection() {
  return (
    <section className="relative overflow-hidden bg-(--color-forest) text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:px-10 lg:grid-cols-[1fr_1.15fr] lg:items-center lg:gap-14">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--color-sun)">MGC Partner Network</p>
          <h2 className="font-serif-display mt-3 text-4xl leading-[1.08] sm:text-5xl">
            Grow With Us.
            <br />
            We&apos;ll Help You Reach the Market.
          </h2>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/80">
            Join {BRAND_CLAIM}. You don&apos;t need a large farm to become a grower. With the right knowledge and a reliable
            marketplace, microgreens can be grown in homes and small spaces, and many small growers can
            serve a larger market together.
          </p>

          <ul className="mt-6 flex flex-wrap gap-2" aria-label="Who can become a partner">
            {WHO.map((w) => (
              <li key={w} className="rounded-full border border-white/25 px-3 py-1.5 text-xs font-medium text-white/90">
                {w}
              </li>
            ))}
          </ul>

          <p className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm">
            <span className="rounded-full bg-(--color-sun) px-2.5 py-0.5 text-xs font-bold text-(--color-forest)">0%</span>
            Platform fee for women partners
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/partner/apply"
              className="inline-flex items-center gap-2 rounded-full bg-(--color-sun) px-6 py-3 text-sm font-semibold text-(--color-forest) transition-colors hover:bg-(--color-sun-dark)"
            >
              Become a Partner
              <ArrowRight size={15} weight="bold" />
            </Link>
            <p className="font-script text-2xl text-white/85">You Grow. We Connect. Together, We Grow.</p>
          </div>
        </div>

        <div>
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl">
            <Image
              src="/images/journal/grow-room.png"
              alt="Shelves of microgreen trays growing under soft lights in a bright room"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <ol className="mt-4 grid gap-3 sm:grid-cols-2">
            {STEPS.map((s, i) => (
              <li key={s.title} className="rounded-xl bg-white/[0.07] p-4">
                <p className="flex items-center gap-2.5">
                  <span className="font-display flex size-7 items-center justify-center rounded-full bg-white text-xs font-bold text-(--color-forest)">
                    {i + 1}
                  </span>
                  <span className="text-sm font-semibold">{s.title}</span>
                </p>
                <p className="mt-2 text-[13px] leading-relaxed text-white/75">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
