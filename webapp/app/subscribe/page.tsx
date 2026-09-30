"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, Repeat, Trash } from "@phosphor-icons/react";
import { CheckoutForm, type DeliveryDetails } from "@/components/CheckoutForm";
import { subscriptionPlans, parsePlanItem } from "@/lib/subscriptions";
import { usePreorder } from "@/context/PreorderContext";
import { useAuth } from "@/context/AuthContext";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface ProductOption {
  id: string;
  slug: string;
  name: string;
  category_id: string | null;
}

export default function SubscribePage() {
  const { subscription, setSubscription, hydrated } = usePreorder();
  const { user } = useAuth();
  const plan = subscriptionPlans.find((p) => p.id === subscription?.planId);

  const parsedItems = useMemo(() => (plan ? plan.items.map(parsePlanItem) : []), [plan]);
  const categorySlugs = useMemo(
    () =>
      Array.from(
        new Set(parsedItems.map((item) => item.categorySlug).filter((slug): slug is string => Boolean(slug))),
      ),
    [parsedItems],
  );

  const [products, setProducts] = useState<ProductOption[]>([]);
  const [categoryIdBySlug, setCategoryIdBySlug] = useState<Record<string, string>>({});
  const [selections, setSelections] = useState<Record<number, string[]>>({});
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Fetch real product names for each pickable slot (e.g. "2 smoothies" -> which two
  // smoothies), so people can see and choose exactly what fills their plan instead of
  // just a generic count.
  useEffect(() => {
    if (categorySlugs.length === 0) {
      setLoadingProducts(false);
      return;
    }
    let cancelled = false;
    setLoadingProducts(true);
    const supabase = createSupabaseBrowserClient();

    supabase
      .from("categories")
      .select("id, slug")
      .in("slug", categorySlugs)
      .then(async ({ data: cats }) => {
        const catRows = cats ?? [];
        const idBySlug: Record<string, string> = {};
        catRows.forEach((c) => {
          idBySlug[c.slug] = c.id;
        });

        const { data: prods } = await supabase
          .from("products")
          .select("id, slug, name, category_id")
          .eq("is_available", true)
          .in("category_id", catRows.map((c) => c.id))
          .order("name");

        if (cancelled) return;
        setCategoryIdBySlug(idBySlug);
        setProducts((prods ?? []) as ProductOption[]);
        setLoadingProducts(false);
      });

    return () => {
      cancelled = true;
    };
  }, [categorySlugs]);

  // Default each slot to the first available flavor as soon as products load, so
  // checkout is never blocked on an empty selection.
  useEffect(() => {
    if (products.length === 0) return;
    setSelections((prev) => {
      const next = { ...prev };
      parsedItems.forEach((item, idx) => {
        if (!item.categorySlug || !item.qty) return;
        const catId = categoryIdBySlug[item.categorySlug];
        const options = products.filter((p) => p.category_id === catId);
        if (options.length === 0) return;
        const existing = next[idx] ?? [];
        next[idx] = Array.from({ length: item.qty }, (_, i) => existing[i] ?? options[0].id);
      });
      return next;
    });
  }, [products, categoryIdBySlug, parsedItems]);

  function updateSelection(itemIdx: number, slot: number, productId: string) {
    setSelections((prev) => {
      const arr = [...(prev[itemIdx] ?? [])];
      arr[slot] = productId;
      return { ...prev, [itemIdx]: arr };
    });
  }

  function collectSubscriptionItems() {
    const counts = new Map<string, number>();
    parsedItems.forEach((item, idx) => {
      if (!item.categorySlug || !item.qty) return;
      (selections[idx] ?? []).forEach((productId) => {
        counts.set(productId, (counts.get(productId) ?? 0) + 1);
      });
    });
    return Array.from(counts.entries()).map(([product_id, quantity]) => ({ product_id, quantity }));
  }

  async function handleConfirm(details: DeliveryDetails) {
    if (!user || !plan) return;

    const supabase = createSupabaseBrowserClient();

    const { data: dbPlan, error: planError } = await supabase
      .from("subscription_plans")
      .select("id")
      .eq("name", plan.name)
      .single();

    if (planError || !dbPlan) {
      throw new Error(planError?.message ?? "Could not find this plan.");
    }

    if (details.dateOfBirth) {
      await supabase
        .from("profiles")
        .update({ date_of_birth: details.dateOfBirth })
        .eq("id", user.id);
    }

    const { data: subRow, error: subError } = await supabase
      .from("subscriptions")
      .insert({
        profile_id: user.id,
        plan_id: dbPlan.id,
        status: "active",
        address_id: details.addressId,
        next_delivery_date: details.deliveryDate || null,
        terms_accepted: details.termsAccepted,
        sms_whatsapp_consent: details.smsWhatsappConsent,
      })
      .select()
      .single();

    if (subError || !subRow) {
      throw new Error(subError?.message ?? "Could not start your subscription.");
    }

    const items = collectSubscriptionItems();
    if (items.length > 0) {
      const { error: itemsError } = await supabase
        .from("subscription_items")
        .insert(items.map((item) => ({ subscription_id: subRow.id, ...item })));

      if (itemsError) {
        throw new Error(itemsError.message);
      }
    }

    setSubscription(null);
  }

  return (
    <div className="bg-(--color-cream)">
      <div className="border-b border-(--color-forest)/10">
        <div className="mx-auto max-w-7xl px-6 py-10 md:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--color-leaf)">Subscriptions</p>
          <h1 className="font-serif-display mt-2 text-3xl text-(--color-forest) sm:text-4xl">
            Start Your Subscription
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-(--color-forest)/70">
            Tell us where to deliver and when to start. You can skip or cancel any
            week, and we&apos;ll always confirm before we harvest.
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-10 md:px-10">
        {!hydrated ? null : !plan ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-[0_4px_20px_rgba(31,58,36,0.08)]">
            <p className="text-(--color-forest)/70">You haven&apos;t picked a plan yet.</p>
            <Link
              href="/subscriptions"
              className="mt-6 inline-flex rounded-full bg-(--color-sun) px-7 py-3.5 text-sm font-semibold text-(--color-forest) transition-colors hover:bg-(--color-sun-dark)"
            >
              View plans
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_1.3fr]">
            <aside className="h-fit rounded-2xl bg-white p-6 shadow-[0_4px_20px_rgba(31,58,36,0.08)] ring-1 ring-(--color-forest)/10">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-(--color-leaf)">
                    <Repeat size={14} weight="fill" />
                    {plan.deliveryFrequency}
                  </div>
                  <h2 className="font-serif-display mt-2 text-2xl text-(--color-forest)">{plan.name}</h2>
                </div>
                <button
                  onClick={() => setSubscription(null)}
                  aria-label="Remove selected plan"
                  className="flex size-9 shrink-0 items-center justify-center rounded-full border border-(--color-forest)/15 text-(--color-forest)/60 transition-colors hover:border-(--color-sale) hover:text-(--color-sale)"
                >
                  <Trash size={16} />
                </button>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-(--color-forest)/70">{plan.description}</p>

              <ul className="mt-5 space-y-3 border-t border-(--color-forest)/10 pt-5 text-sm">
                {parsedItems.map((item, idx) => {
                  if (!item.categorySlug || !item.qty) {
                    return (
                      <li key={idx} className="flex items-start gap-2 text-(--color-forest)/70">
                        <Check size={14} weight="bold" className="mt-1 shrink-0 text-(--color-leaf)" />
                        {item.raw}
                      </li>
                    );
                  }

                  const catId = categoryIdBySlug[item.categorySlug];
                  const options = products.filter((p) => p.category_id === catId);
                  const picks = selections[idx] ?? [];

                  return (
                    <li key={idx}>
                      <p className="flex items-center gap-2 font-medium text-(--color-forest)">
                        <Check size={14} weight="bold" className="text-(--color-leaf)" />
                        {item.raw}
                      </p>
                      {loadingProducts ? (
                        <p className="mt-1 pl-6 text-xs text-(--color-forest)/50">Loading flavors…</p>
                      ) : options.length === 0 ? (
                        <p className="mt-1 pl-6 text-xs text-(--color-forest)/50">No flavors available right now.</p>
                      ) : (
                        <div className="mt-2 space-y-1.5 pl-6">
                          {Array.from({ length: item.qty }).map((_, slot) => (
                            <select
                              key={slot}
                              value={picks[slot] ?? options[0].id}
                              onChange={(e) => updateSelection(idx, slot, e.target.value)}
                              aria-label={`Choose ${item.categorySlug} ${slot + 1}`}
                              className="w-full rounded-lg border border-(--color-forest)/15 bg-white px-3 py-1.5 text-xs text-(--color-forest) outline-none transition-colors focus:border-(--color-forest)"
                            >
                              {options.map((o) => (
                                <option key={o.id} value={o.id}>
                                  {o.name}
                                </option>
                              ))}
                            </select>
                          ))}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>

              <div className="mt-6 flex items-baseline justify-between border-t border-(--color-forest)/10 pt-5">
                <span className="text-sm text-(--color-forest)/70">Billed</span>
                <span className="font-serif-display text-2xl text-(--color-forest)">
                  ₹{plan.price}
                  <span className="text-sm font-normal text-(--color-forest)/70"> / {plan.unit}</span>
                </span>
              </div>

              <Link
                href="/subscriptions"
                className="mt-4 inline-block text-sm font-medium text-(--color-forest) underline underline-offset-4 hover:text-(--color-leaf)"
              >
                Change plan
              </Link>
            </aside>

            <CheckoutForm
              submitLabel="Start subscription"
              dateLabel="First delivery date"
              confirmationTitle="Subscription started"
              confirmationBody={`Your ${plan.name} plan is set up. Nothing has been charged. We confirm each delivery before harvest.`}
              onConfirm={handleConfirm}
            />
          </div>
        )}
      </main>
    </div>
  );
}
