"use client";

import Link from "next/link";
import { Check, Repeat, Trash } from "@phosphor-icons/react";
import { CheckoutForm } from "@/components/CheckoutForm";
import { subscriptionPlans } from "@/lib/subscriptions";
import { usePreorder } from "@/context/PreorderContext";

export default function SubscribePage() {
  const { subscription, setSubscription, hydrated } = usePreorder();
  const plan = subscriptionPlans.find((p) => p.id === subscription?.planId);

  return (
    <div>
      <div className="border-b border-(--color-border) bg-(--color-bg-muted)">
        <div className="mx-auto max-w-7xl px-6 py-8 md:px-10">
          <h1 className="font-display text-3xl font-bold text-(--color-navy) sm:text-4xl">
            Start Your Subscription
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-(--color-muted)">
            Tell us where to deliver and when to start. You can skip or cancel any
            week — we&apos;ll always confirm before we harvest.
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-10 md:px-10">
        {!hydrated ? null : !plan ? (
          <div className="rounded-2xl border border-(--color-border) bg-white p-10 text-center">
            <p className="text-(--color-muted)">You haven&apos;t picked a plan yet.</p>
            <Link
              href="/subscriptions"
              className="mt-6 inline-flex rounded-full bg-(--color-accent) px-7 py-3.5 text-sm font-semibold text-(--color-navy) transition-colors hover:bg-(--color-accent-dark)"
            >
              View plans
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_1.3fr]">
            <aside className="h-fit rounded-2xl border border-(--color-navy) bg-white p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-(--color-navy)">
                    <Repeat size={14} weight="fill" />
                    {plan.deliveryFrequency}
                  </div>
                  <h2 className="font-display mt-2 text-xl font-semibold text-(--color-navy)">{plan.name}</h2>
                </div>
                <button
                  onClick={() => setSubscription(null)}
                  aria-label="Remove selected plan"
                  className="flex size-9 shrink-0 items-center justify-center rounded-full border border-(--color-border) text-(--color-muted) transition-colors hover:border-(--color-sale) hover:text-(--color-sale)"
                >
                  <Trash size={16} />
                </button>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-(--color-muted)">{plan.description}</p>

              <ul className="mt-5 space-y-2 border-t border-(--color-border) pt-5 text-sm text-(--color-muted)">
                {plan.items.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check size={14} weight="bold" className="mt-1 shrink-0 text-(--color-success)" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex items-baseline justify-between border-t border-(--color-border) pt-5">
                <span className="text-sm text-(--color-muted)">Billed</span>
                <span className="text-2xl font-bold text-(--color-ink)">
                  ₹{plan.price}
                  <span className="text-sm font-normal text-(--color-muted)"> / {plan.unit}</span>
                </span>
              </div>

              <Link
                href="/subscriptions"
                className="mt-4 inline-block text-sm font-medium text-(--color-navy) underline"
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
    </div>
  );
}
