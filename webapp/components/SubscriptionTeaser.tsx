import Link from "next/link";
import { ArrowRight, Check } from "@phosphor-icons/react/dist/ssr";
import { subscriptionPlans } from "@/lib/subscriptions";

const HIGHLIGHTS = ["Skip any week", "Free delivery", "Cancel anytime"];

export function SubscriptionTeaser() {
  const featured = subscriptionPlans.filter((p) => p.isPopular).slice(0, 2);

  return (
    <section id="subscriptions" className="mx-auto max-w-7xl px-6 py-16 md:px-10">
      <div className="grid gap-10 rounded-3xl bg-(--color-navy) p-8 text-white md:p-10 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-(--color-accent)">
            Subscriptions
          </p>
          <h2 className="font-display mt-1 text-3xl font-bold sm:text-4xl">
            Never Run Out Of Fresh Greens
          </h2>
          <p className="mt-5 max-w-md text-white/70">
            A weekly box, harvested the morning it reaches you. Pause it, skip a
            week, or cancel whenever life changes.
          </p>

          <ul className="mt-6 flex flex-wrap gap-2">
            {HIGHLIGHTS.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 rounded-full border border-white/20 px-3 py-1.5 text-xs text-white/80"
              >
                <Check size={12} weight="bold" className="text-(--color-accent)" />
                {item}
              </li>
            ))}
          </ul>

          <Link
            href="/subscriptions"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-(--color-accent) px-7 py-3.5 font-semibold text-(--color-navy) transition-colors hover:bg-(--color-accent-dark)"
          >
            View All Plans
            <ArrowRight size={16} weight="bold" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {featured.map((plan) => (
            <Link
              key={plan.id}
              href="/subscriptions"
              className="rounded-2xl bg-white/10 p-6 transition-colors hover:bg-white/15"
            >
              <p className="text-xs uppercase tracking-wide text-(--color-accent)">
                {plan.deliveryFrequency}
              </p>
              <h3 className="font-display mt-2 text-xl font-semibold">{plan.name}</h3>
              <p className="font-display mt-3 text-2xl font-bold">
                ₹{plan.price}
                <span className="font-sans text-sm font-normal text-white/60"> / {plan.unit}</span>
              </p>
              <ul className="mt-4 space-y-1.5 text-sm text-white/70">
                {plan.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
