import Link from "next/link";
import { ArrowRight, Check, Repeat } from "@phosphor-icons/react/dist/ssr";
import { subscriptionPlans } from "@/lib/subscriptions";

const HIGHLIGHTS = ["Skip any week", "Free delivery", "Cancel anytime"];

export function SubscriptionTeaser() {
  const featured = subscriptionPlans.filter((p) => p.isPopular).slice(0, 2);

  return (
    <section id="subscriptions" className="relative z-10 mx-auto max-w-7xl px-6 py-16 md:px-10">
      <div className="grid gap-10 rounded-2xl border border-(--color-border) bg-(--color-surface) p-8 md:p-10 lg:grid-cols-2 lg:items-center">
        <div>
          <div className="mb-5 flex items-center gap-2 text-sm font-medium text-(--color-sage)">
            <Repeat size={16} weight="fill" />
            Subscriptions
          </div>
          <h2 className="font-display text-4xl leading-[1.1] sm:text-5xl">
            Never Run Out
            <br />
            <span className="text-(--color-sage)">Of Fresh Greens</span>
          </h2>
          <p className="mt-6 max-w-md text-(--color-muted)">
            A weekly box, harvested the morning it reaches you. Pause it, skip a
            week, or cancel whenever life changes.
          </p>

          <ul className="mt-6 flex flex-wrap gap-2">
            {HIGHLIGHTS.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 rounded-full border border-(--color-border) px-3 py-1.5 text-xs text-(--color-muted)"
              >
                <Check size={12} weight="bold" className="text-(--color-sage)" />
                {item}
              </li>
            ))}
          </ul>

          <Link
            href="/subscriptions"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-(--color-olive) px-7 py-3.5 font-medium text-white transition-colors hover:bg-(--color-olive-dark)"
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
              className="rounded-2xl border border-(--color-border) bg-(--color-surface-2) p-6 transition-colors hover:border-(--color-sage)"
            >
              <p className="text-xs tracking-wide text-(--color-sage) uppercase">
                {plan.deliveryFrequency}
              </p>
              <h3 className="font-display mt-2 text-xl">{plan.name}</h3>
              <p className="font-display mt-3 text-2xl">
                ₹{plan.price}
                <span className="font-sans text-sm font-normal text-(--color-muted)">
                  {" "}/ {plan.unit}
                </span>
              </p>
              <ul className="mt-4 space-y-1.5 text-sm text-(--color-muted)">
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
