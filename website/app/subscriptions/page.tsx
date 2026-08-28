"use client";

import { useRouter } from "next/navigation";
import { Check, Leaf, Repeat } from "@phosphor-icons/react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LeafDecor } from "@/components/LeafDecor";
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
    <div className="relative overflow-hidden">
      <LeafDecor />
      <Navbar />

      <main className="relative z-10 mx-auto max-w-7xl px-6 py-10 md:px-10">
        <div className="mb-5 flex items-center gap-2 text-sm font-medium text-(--color-sage)">
          <Repeat size={16} weight="fill" />
          Subscriptions
        </div>
        <h1 className="font-display text-4xl leading-[1.1] sm:text-5xl">
          Fresh Greens,
          <br />
          <span className="text-(--color-sage)">Every Single Week</span>
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-(--color-muted)">
          Choose a plan that fits your kitchen. Skip a week whenever you like,
          and cancel any time — no lock-in, no hidden fees.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subscriptionPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl border bg-(--color-surface) p-6 transition-colors hover:border-(--color-sage) ${
                plan.isPopular ? "border-(--color-sage)" : "border-(--color-border)"
              }`}
            >
              {plan.isPopular && (
                <span className="absolute -top-2.5 right-6 rounded-full bg-(--color-sage) px-3 py-1 text-[10px] font-semibold tracking-wide text-(--color-ink) uppercase">
                  Most popular
                </span>
              )}

              <div className="flex items-center gap-2 text-sm text-(--color-sage)">
                <Leaf size={14} weight="fill" />
                {plan.deliveryFrequency}
              </div>

              <h2 className="font-display mt-3 text-2xl">{plan.name}</h2>
              <p className="mt-2 text-sm leading-relaxed text-(--color-muted)">
                {plan.description}
              </p>

              <p className="mt-5 font-display text-3xl">
                ₹{plan.price}
                <span className="font-sans text-sm font-normal text-(--color-muted)">
                  {" "}/ {plan.unit}
                </span>
              </p>

              <ul className="mt-5 space-y-2 border-t border-(--color-border) pt-5 text-sm text-(--color-muted)">
                {plan.items.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check size={14} weight="bold" className="mt-1 shrink-0 text-(--color-sage)" />
                    {item}
                  </li>
                ))}
              </ul>

              <ul className="mt-4 flex flex-wrap gap-2">
                {plan.benefits.map((benefit) => (
                  <li
                    key={benefit}
                    className="rounded-full border border-(--color-border) px-3 py-1 text-xs text-(--color-muted)"
                  >
                    {benefit}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => startSubscription(plan.id)}
                className="mt-6 w-full rounded-full bg-(--color-olive) px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-(--color-olive-dark)"
              >
                Subscribe
              </button>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
