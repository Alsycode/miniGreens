import Link from "next/link";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import { ArrowRight, ArrowsClockwise, CheckCircle, Leaf, MapPin, Plant, Scissors } from "@phosphor-icons/react/dist/ssr";

// Replaces the hardcoded testimonials. Every point here is a commitment the site
// already makes elsewhere, not a customer claim. Swap real reviews in once they exist.

const PROMISES: { Icon: PhosphorIcon; title: string; body: string }[] = [
  { Icon: Scissors, title: "Cut to order", body: "Microgreens are harvested for your order, never stored in a warehouse." },
  { Icon: Plant, title: "One growing standard", body: "Grown by MGC and our partner growers, following MGC's growing practices." },
  { Icon: Leaf, title: "Clean ingredients", body: "Plant-based with no artificial additives. Our teas are naturally caffeine-free." },
  { Icon: CheckCircle, title: "Confirmed before harvest", body: "We confirm every order before we cut, so your greens are fresh when they arrive." },
  { Icon: ArrowsClockwise, title: "No lock-in", body: "Skip a week, pause or cancel your subscription anytime." },
  { Icon: MapPin, title: "Local to Bengaluru", body: "Fresh greens delivered across Bengaluru, from growers close to you." },
];

export function TrustPromise() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--color-leaf)">Why people choose us</p>
            <h2 className="font-serif-display mt-2 text-3xl text-(--color-forest) sm:text-4xl">The MGC Promise</h2>
          </div>
          <Link
            href="/contact"
            className="flex items-center gap-1.5 rounded-full border border-black/10 px-5 py-2 text-[13px] font-semibold text-(--color-forest) transition-colors hover:border-(--color-forest)"
          >
            Tried us? Tell us what you think <ArrowRight size={12} weight="bold" />
          </Link>
        </div>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PROMISES.map(({ Icon, title, body }) => (
            <li
              key={title}
              className="flex gap-4 rounded-xl border border-black/[0.07] p-5 shadow-[0_2px_12px_rgba(31,58,36,0.05)]"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-(--color-cream) text-(--color-forest)">
                <Icon size={21} weight="light" />
              </span>
              <span>
                <span className="block text-[15px] font-semibold text-(--color-forest)">{title}</span>
                <span className="mt-1 block text-sm leading-relaxed text-(--color-forest)/70">{body}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
