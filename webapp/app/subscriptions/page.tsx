"use client";

import { useRouter } from "next/navigation";
import { Check, Repeat } from "@phosphor-icons/react";
import { subscriptionPlans } from "@/lib/subscriptions";
import { usePreorder } from "@/context/PreorderContext";

export default function SubscriptionsPage() {
  const router = useRouter();
  const { setSubscription } = usePreorder();

  const startSubscription = (planId: string) => {
    setSubscription({ planId });
    router.push("/subscribe");
  };

  return (
    <div>
      <div className="border-b border-(--color-border) bg-(--color-bg-muted)">
        <div className="mx-auto max-w-7xl px-6 py-8 md:px-10">
          <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-(--color-navy)/60">
            <Repeat size={16} weight="fill" />
            Subscriptions
          </p>
          <h1 className="font-display mt-1 text-3xl font-bold text-(--color-navy) sm:text-4xl">
            Fresh Greens, Every Single Week
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-(--color-muted)">
            Choose a plan that fits your kitchen. Skip a week whenever you like,
            and cancel any time — no lock-in, no hidden fees.
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-10 md:px-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subscriptionPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl border bg-white p-6 transition-colors hover:border-(--color-navy) ${
                plan.isPopular ? "border-(--color-navy)" : "border-(--color-border)"
              }`}
            >
              {plan.isPopular && (
                <span className="absolute -top-2.5 right-6 rounded-full bg-(--color-accent) px-3 py-1 text-[10px] font-bold tracking-wide text-(--color-navy) uppercase">
                  Most popular
                </span>
              )}

              <p className="text-xs font-semibold uppercase tracking-wide text-(--color-navy)/60">
                {plan.deliveryFrequency}
              </p>

              <h2 className="font-display mt-3 text-xl font-semibold text-(--color-navy)">{plan.name}</h2>
              <p className="mt-2 text-sm leading-relaxed text-(--color-muted)">{plan.description}</p>

              <p className="mt-5 text-3xl font-bold text-(--color-ink)">
                ₹{plan.price}
                <span className="text-sm font-normal text-(--color-muted)"> / {plan.unit}</span>
              </p>

              <ul className="mt-5 space-y-2 border-t border-(--color-border) pt-5 text-sm text-(--color-muted)">
                {plan.items.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check size={14} weight="bold" className="mt-1 shrink-0 text-(--color-success)" />
                    {item}
                  </li>
                ))}
              </ul>

              <ul className="mt-4 flex flex-wrap gap-2">
                {plan.benefits.map((benefit) => (
                  <li
                    key={benefit}
                    className="rounded-full bg-(--color-bg-muted) px-3 py-1 text-xs text-(--color-muted)"
                  >
                    {benefit}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => startSubscription(plan.id)}
                className="mt-6 w-full rounded-full bg-(--color-accent) px-6 py-3.5 text-sm font-semibold text-(--color-navy) transition-colors hover:bg-(--color-accent-dark)"
              >
                Subscribe
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
