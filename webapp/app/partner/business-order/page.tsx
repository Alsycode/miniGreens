"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, Minus, Plus, Trash } from "@phosphor-icons/react";
import type { Database } from "@mobile/database";
import { useAuth } from "@/context/AuthContext";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Skeleton } from "@/components/skeletons/Skeleton";

type PartnerRow = Database["public"]["Tables"]["partners"]["Row"];
type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type CartLine = { productId: string; quantity: number };

// Bulk/business ordering disabled for now — flip to true to re-enable.
const BUSINESS_ORDER_ENABLED = false;

const inputClass =
  "w-full rounded-xl border border-black/[0.07] bg-white px-4 py-3 text-sm text-(--color-forest) outline-none transition-colors placeholder:text-(--color-forest)/50 focus:border-(--color-forest)";
const labelClass = "mb-2 block text-xs font-semibold tracking-wide text-(--color-forest)/70 uppercase";

export default function BusinessOrderPage() {
  const { user, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [partner, setPartner] = useState<PartnerRow | null>(null);
  const [products, setProducts] = useState<ProductRow[]>([]);

  const [businessName, setBusinessName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<{ orderNumber: string; total: number } | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    (async () => {
      const supabase = createSupabaseBrowserClient();
      const [{ data: partnerData }, { data: productData }] = await Promise.all([
        supabase.from("partners").select("*").eq("profile_id", user.id).maybeSingle(),
        supabase.from("products").select("*").eq("is_available", true).order("name"),
      ]);
      if (partnerData) {
        setPartner(partnerData);
        setBusinessName(partnerData.business_name);
        setContactPerson(partnerData.contact_person);
        setPhone(partnerData.phone);
        setAddress(partnerData.address ?? "");
      }
      setProducts(productData ?? []);
      setLoading(false);
    })();
  }, [user, authLoading]);

  function toggleProduct(productId: string) {
    setCart((prev) =>
      prev.some((line) => line.productId === productId)
        ? prev.filter((line) => line.productId !== productId)
        : [...prev, { productId, quantity: 1 }],
    );
  }

  function setLineQuantity(productId: string, quantity: number) {
    const clamped = Math.max(1, Math.floor(quantity) || 1);
    setCart((prev) => prev.map((line) => (line.productId === productId ? { ...line, quantity: clamped } : line)));
  }

  function removeLine(productId: string) {
    setCart((prev) => prev.filter((line) => line.productId !== productId));
  }

  const cartLines = cart
    .map((line) => ({ line, product: products.find((p) => p.id === line.productId) }))
    .filter((entry): entry is { line: CartLine; product: ProductRow } => !!entry.product);
  const total = cartLines.reduce((sum, { line, product }) => sum + Number(product.price) * line.quantity, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !partner) return;
    if (!businessName.trim() || !contactPerson.trim() || !phone.trim() || cartLines.length === 0 || !deliveryDate.trim()) {
      setError("Fill in all required fields and add at least one product.");
      return;
    }
    setError(null);
    setSubmitting(true);

    const supabase = createSupabaseBrowserClient();
    const orderNumber = `BIZ-${Date.now()}`;
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        profile_id: user.id,
        status: "pending",
        subtotal: total,
        delivery_fee: 0,
        total,
        delivery_address_id: null,
        delivery_date: deliveryDate.trim(),
        delivery_time: null,
        notes: notes.trim() || null,
        order_type: "business",
        business_name: businessName.trim(),
        contact_person: contactPerson.trim(),
        business_phone: phone.trim(),
        business_address: address.trim() || null,
      })
      .select()
      .single();

    if (orderError || !order) {
      setSubmitting(false);
      setError(orderError?.message ?? "Could not place order.");
      return;
    }

    const { error: itemError } = await supabase.from("order_items").insert(
      cartLines.map(({ line, product }) => ({
        order_id: order.id,
        product_id: product.id,
        product_name: product.name,
        quantity: line.quantity,
        price: Number(product.price),
        image: null,
      })),
    );

    if (itemError) {
      // Roll back the orphaned order row (exists with zero items).
      await supabase.from("orders").delete().eq("id", order.id);
      setSubmitting(false);
      setError(itemError.message);
      return;
    }

    setSubmitting(false);
    setPlacedOrder({ orderNumber: order.order_number, total: Number(order.total) });
  }

  return (
    <div>
      <div className="border-b border-black/5 bg-(--color-cream)">
        <div className="mx-auto max-w-2xl px-6 py-14 md:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--color-leaf)">Partner Dashboard</p>
          <h1 className="font-serif-display mt-3 text-4xl leading-[1.08] text-(--color-forest) sm:text-5xl">
            Place Business Order
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-(--color-forest)/70">
            Bulk order for your business. This goes straight to MGC Admin.
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-2xl px-6 py-10 md:px-10">
        {!BUSINESS_ORDER_ENABLED ? (
          <div className="rounded-2xl border border-black/[0.07] bg-white p-10 text-center shadow-[0_2px_14px_rgba(31,58,36,0.06)]">
            <p className="text-(--color-forest)/70">
              Business ordering is temporarily unavailable. Please contact us directly for bulk orders.
            </p>
            <Link
              href="/partner/dashboard"
              className="mt-6 inline-flex rounded-full bg-(--color-sun) px-7 py-3.5 text-sm font-semibold text-(--color-forest) transition-colors hover:bg-(--color-sun-dark)"
            >
              Back to dashboard
            </Link>
          </div>
        ) : placedOrder ? (
          <div className="rounded-2xl border border-black/[0.07] bg-white p-8 text-center shadow-[0_2px_14px_rgba(31,58,36,0.06)]">
            <CheckCircle size={44} weight="fill" className="mx-auto text-(--color-leaf)" />
            <h2 className="font-serif-display mt-5 text-2xl text-(--color-forest)">Order placed</h2>
            <p className="mt-3 text-sm leading-relaxed text-(--color-forest)/70">
              Order {placedOrder.orderNumber} has been sent to MGC Admin for confirmation.
            </p>
            <p className="mt-4 text-sm text-(--color-forest)">
              Total: <span className="font-semibold">₹{placedOrder.total.toFixed(2)}</span>
            </p>
            <Link
              href="/partner/dashboard"
              className="mt-6 inline-flex rounded-full bg-(--color-sun) px-7 py-3.5 text-sm font-semibold text-(--color-forest) transition-colors hover:bg-(--color-sun-dark)"
            >
              Back to dashboard
            </Link>
          </div>
        ) : authLoading || loading ? (
          <div className="rounded-2xl border border-black/[0.07] bg-white p-6 shadow-[0_2px_14px_rgba(31,58,36,0.06)] md:p-8">
            <Skeleton className="h-6 w-40" />
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-11 w-full rounded-xl" />
              ))}
            </div>
            <Skeleton className="mt-7 h-12 w-full rounded-full" />
          </div>
        ) : !user ? (
          <div className="rounded-2xl border border-black/[0.07] bg-white p-10 text-center shadow-[0_2px_14px_rgba(31,58,36,0.06)]">
            <p className="text-(--color-forest)/70">Sign in to place a business order.</p>
            <Link
              href="/login?redirect=/partner/business-order"
              className="mt-6 inline-flex rounded-full bg-(--color-sun) px-7 py-3.5 text-sm font-semibold text-(--color-forest) transition-colors hover:bg-(--color-sun-dark)"
            >
              Sign in
            </Link>
          </div>
        ) : !partner || partner.status !== "approved" ? (
          <div className="rounded-2xl border border-black/[0.07] bg-white p-10 text-center shadow-[0_2px_14px_rgba(31,58,36,0.06)]">
            <p className="text-(--color-forest)/70">
              {partner ? "Your partner application isn't approved yet." : "You're not a partner yet."}
            </p>
            <Link
              href={partner ? "/partner/dashboard" : "/partner/apply"}
              className="mt-6 inline-flex rounded-full bg-(--color-sun) px-7 py-3.5 text-sm font-semibold text-(--color-forest) transition-colors hover:bg-(--color-sun-dark)"
            >
              {partner ? "Back to dashboard" : "Apply Now"}
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-black/[0.07] bg-white p-6 shadow-[0_2px_14px_rgba(31,58,36,0.06)] md:p-8"
          >
            <h2 className="font-serif-display text-2xl text-(--color-forest)">Business details</h2>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="businessName">Café/Shop name</label>
                <input
                  id="businessName"
                  required
                  className={inputClass}
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="contactPerson">Contact person</label>
                <input
                  id="contactPerson"
                  required
                  className={inputClass}
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="phone">Phone</label>
                <input
                  id="phone"
                  required
                  type="tel"
                  className={inputClass}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="address">Address</label>
                <input
                  id="address"
                  className={inputClass}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-6">
              <label className={labelClass}>Products</label>
              <p className="-mt-1 mb-3 text-xs text-(--color-forest)/60">
                Tap to add a product, then set its quantity below.
              </p>
              <div className="flex flex-wrap gap-2">
                {products.map((product) => {
                  const inCart = cart.some((line) => line.productId === product.id);
                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => toggleProduct(product.id)}
                      className={`rounded-full border px-4 py-2 text-[13px] font-semibold transition-colors ${
                        inCart
                          ? "border-(--color-forest) bg-(--color-forest) text-white"
                          : "border-black/[0.07] bg-(--color-cream) text-(--color-forest) hover:border-(--color-forest)"
                      }`}
                    >
                      {product.name} · ₹{Number(product.price).toFixed(0)}
                    </button>
                  );
                })}
              </div>
            </div>

            {cartLines.length > 0 && (
              <div className="mt-5 space-y-2">
                {cartLines.map(({ line, product }) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 rounded-xl bg-(--color-cream) p-3 pr-4"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-(--color-forest)">{product.name}</p>
                      <p className="text-xs text-(--color-forest)/60">₹{Number(product.price).toFixed(0)} each</p>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full border border-black/[0.07] bg-white p-1">
                      <button
                        type="button"
                        onClick={() => setLineQuantity(product.id, line.quantity - 1)}
                        aria-label={`Decrease ${product.name} quantity`}
                        className="flex size-7 items-center justify-center rounded-full text-(--color-forest) transition-colors hover:bg-(--color-cream)"
                      >
                        <Minus size={12} weight="bold" />
                      </button>
                      <input
                        type="number"
                        min={1}
                        value={line.quantity}
                        onChange={(e) => setLineQuantity(product.id, parseInt(e.target.value, 10))}
                        aria-label={`${product.name} quantity`}
                        className="w-12 border-0 bg-transparent text-center text-sm font-semibold text-(--color-forest) outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                      <button
                        type="button"
                        onClick={() => setLineQuantity(product.id, line.quantity + 1)}
                        aria-label={`Increase ${product.name} quantity`}
                        className="flex size-7 items-center justify-center rounded-full text-(--color-forest) transition-colors hover:bg-(--color-cream)"
                      >
                        <Plus size={12} weight="bold" />
                      </button>
                    </div>
                    <p className="w-16 shrink-0 text-right text-sm font-semibold text-(--color-forest)">
                      ₹{(Number(product.price) * line.quantity).toFixed(0)}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeLine(product.id)}
                      aria-label={`Remove ${product.name}`}
                      className="flex size-7 shrink-0 items-center justify-center rounded-full text-(--color-forest)/50 transition-colors hover:text-(--color-sale)"
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="deliveryDate">Required delivery date</label>
                <input
                  id="deliveryDate"
                  required
                  type="date"
                  className={inputClass}
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="notes">Additional instructions (optional)</label>
                <textarea
                  id="notes"
                  rows={3}
                  className={inputClass}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            {cartLines.length > 0 && (
              <p className="font-display mt-6 text-lg font-semibold text-(--color-forest)">
                Total: ₹{total.toFixed(2)}
              </p>
            )}

            {error && <p className="mt-4 text-sm text-(--color-sale)">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="mt-7 w-full rounded-full bg-(--color-sun) px-7 py-4 font-semibold text-(--color-forest) transition-colors hover:bg-(--color-sun-dark) disabled:opacity-60"
            >
              {submitting ? "Submitting order..." : "Submit Order"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
