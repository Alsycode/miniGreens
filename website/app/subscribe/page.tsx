"use client";

import Link from "next/link";
import { Check, Repeat, Trash } from "@phosphor-icons/react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LeafDecor } from "@/components/LeafDecor";
import { CheckoutForm } from "@/components/CheckoutForm";
import { subscriptionPlans } from "@/lib/subscriptions";
import { usePreorder } from "@/context/PreorderContext";

export default function SubscribePage() {
  const { subscription, setSubscription, hydrated } = usePreorder();
  const plan = subscriptionPlans.find((p) => p.id === subscription?.planId);

  return (
    <div className="relative overflow-hidden">
      <LeafDecor />
      <Navbar />

      <main className="relative z-10 mx-auto max-w-7xl px-6 py-10 md:px-10">
        <h1 className="font-display text-4xl leading-[1.1] sm:text-5xl">
          Start Your Subscription
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-(--color-muted)">
          Tell us where to deliver and when to start. You can skip or cancel any
          week — we&apos;ll always confirm before we harvest.
        </p>

        {!hydrated ? null : !plan ? (
          <div className="mt-10 rounded-2xl border border-(--color-border) bg-(--color-surface) p-10 text-center">
            <p className="text-(--color-muted)">You haven&apos;t picked a plan yet.</p>
            <Link
              href="/subscriptions"
              className="mt-6 inline-flex rounded-full bg-(--color-olive) px-7 py-3.5 text-sm font-medium text-white transition-colors hover:bg-(--color-olive-dark)"
            >
              View plans
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_1.3fr]">
            <aside className="h-fit rounded-2xl border border-(--color-sage) bg-(--color-surface) p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-sm text-(--color-sage)">
                    <Repeat size={14} weight="fill" />
                    {plan.deliveryFrequency}
                  </div>
                  <h2 className="font-display mt-2 text-2xl">{plan.name}</h2>
                </div>
                <button
                  onClick={() => setSubscription(null)}
                  aria-label="Remove selected plan"
                  className="flex size-9 shrink-0 items-center justify-center rounded-full border border-(--color-border) text-(--color-muted) transition-colors hover:border-(--color-sage) hover:text-(--color-cream)"
                >
                  <Trash size={16} />
                </button>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-(--color-muted)">
                {plan.description}
              </p>

              <ul className="mt-5 space-y-2 border-t border-(--color-border) pt-5 text-sm text-(--color-muted)">
                {plan.items.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check size={14} weight="bold" className="mt-1 shrink-0 text-(--color-sage)" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex items-baseline justify-between border-t border-(--color-border) pt-5">
                <span className="text-sm text-(--color-muted)">Billed</span>
                <span className="font-display text-2xl">
                  ₹{plan.price}
                  <span className="font-sans text-sm font-normal text-(--color-muted)">
                    {" "}/ {plan.unit}
                  </span>
                </span>
              </div>

              <Link
                href="/subscriptions"
                className="mt-4 inline-block text-sm text-(--color-sage) transition-colors hover:text-(--color-sage-light)"
              >
                Change plan
              </Link>
            </aside>

            <CheckoutForm
              submitLabel="Start subscription"
              dateLabel="First delivery date"
              confirmationTitle="Subscription started"
              confirmationBody={`Your ${plan.name} plan is set up. Nothing has been charged — we confirm each delivery before harvest.`}
              onConfirm={() => {}}
            />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
