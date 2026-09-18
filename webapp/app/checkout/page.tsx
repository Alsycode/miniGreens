"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle } from "@phosphor-icons/react";
import { useAuth } from "@/context/AuthContext";
import { useCartStore, cartSubtotal } from "@/store/useCartStore";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { deliveryTimeSlots } from "@/lib/products";

const DELIVERY_FEE = 35.49;

interface DeliveryDetails {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  zipCode: string;
  deliveryDate: string;
  deliveryTime: string;
  notes: string;
}

const EMPTY: DeliveryDetails = {
  fullName: "",
  phone: "",
  street: "",
  city: "",
  zipCode: "",
  deliveryDate: "",
  deliveryTime: deliveryTimeSlots[0],
  notes: "",
};

const inputClass =
  "w-full rounded-xl border border-(--color-border) bg-white px-4 py-3 text-sm text-(--color-ink) outline-none transition-colors placeholder:text-(--color-muted) focus:border-(--color-navy)";
const labelClass = "mb-2 block text-xs font-semibold tracking-wide text-(--color-muted) uppercase";

export default function CheckoutPage() {
  const { user, loading: authLoading } = useAuth();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);

  const [details, setDetails] = useState<DeliveryDetails>(EMPTY);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderTotal, setOrderTotal] = useState(0);

  const subtotal = cartSubtotal(items);
  const total = subtotal + DELIVERY_FEE;

  const update =
    (key: keyof DeliveryDetails) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setDetails((prev) => ({ ...prev, [key]: e.target.value }));

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!user || items.length === 0) return;
    setPlacing(true);
    setError(null);

    const supabase = createSupabaseBrowserClient();

    const { data: address, error: addressError } = await supabase
      .from("addresses")
      .insert({
        profile_id: user.id,
        label: "Delivery",
        full_name: details.fullName,
        phone: details.phone,
        street: details.street,
        apartment: null,
        city: details.city,
        state: "",
        zip_code: details.zipCode,
        is_default: false,
      })
      .select()
      .single();

    if (addressError || !address) {
      setPlacing(false);
      setError(addressError?.message ?? "Could not save delivery address.");
      return;
    }

    const orderNumber = `MG${Date.now().toString().slice(-8)}`;
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        profile_id: user.id,
        status: "pending",
        subtotal,
        delivery_fee: DELIVERY_FEE,
        total,
        delivery_address_id: address.id,
        delivery_date: details.deliveryDate || null,
        delivery_time: details.deliveryTime || null,
        notes: details.notes || null,
        order_type: "preorder",
        business_name: null,
        contact_person: null,
      })
      .select()
      .single();

    if (orderError || !order) {
      setPlacing(false);
      setError(orderError?.message ?? "Could not place order.");
      return;
    }

    const { error: itemsError } = await supabase.from("order_items").insert(
      items.map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        product_name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
      })),
    );

    setPlacing(false);
    if (itemsError) {
      setError(itemsError.message);
      return;
    }

    clearCart();
    setOrderId(order.id);
    setOrderTotal(Number(order.total));
  }

  return (
    <div>
      <div className="border-b border-(--color-border) bg-(--color-bg-muted)">
        <div className="mx-auto max-w-3xl px-6 py-8 md:px-10">
          <h1 className="font-display text-3xl font-bold text-(--color-navy) sm:text-4xl">Checkout</h1>
        </div>
      </div>

      <main className="mx-auto max-w-3xl px-6 py-10 md:px-10">
        {orderId ? (
          <div className="rounded-2xl border border-(--color-border) bg-white p-8 text-center">
            <CheckCircle size={44} weight="fill" className="mx-auto text-(--color-success)" />
            <h2 className="font-display mt-5 text-2xl font-semibold text-(--color-navy)">
              Pre-order placed
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-(--color-muted)">
              You won&apos;t be charged now. We&apos;ll notify you when it&apos;s confirmed for delivery.
            </p>
            <p className="mt-6 text-sm text-(--color-ink)">
              Total reserved: <span className="font-semibold">₹{orderTotal.toFixed(2)}</span>
            </p>
            <Link
              href="/orders"
              className="mt-6 inline-flex rounded-full bg-(--color-accent) px-7 py-3.5 text-sm font-semibold text-(--color-navy) transition-colors hover:bg-(--color-accent-dark)"
            >
              View my orders
            </Link>
          </div>
        ) : authLoading ? null : !user ? (
          <div className="rounded-2xl border border-(--color-border) bg-white p-10 text-center">
            <p className="text-(--color-muted)">Sign in to continue to checkout.</p>
            <Link
              href="/login?redirect=/checkout"
              className="mt-6 inline-flex rounded-full bg-(--color-accent) px-7 py-3.5 text-sm font-semibold text-(--color-navy) transition-colors hover:bg-(--color-accent-dark)"
            >
              Sign in
            </Link>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-(--color-border) bg-white p-10 text-center">
            <p className="text-(--color-muted)">Your cart is empty.</p>
            <Link
              href="/shop"
              className="mt-6 inline-flex rounded-full bg-(--color-accent) px-7 py-3.5 text-sm font-semibold text-(--color-navy) transition-colors hover:bg-(--color-accent-dark)"
            >
              Browse microgreens
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handlePlaceOrder}
            className="rounded-2xl border border-(--color-border) bg-white p-6 md:p-8"
          >
            <h2 className="font-display text-xl font-semibold text-(--color-navy)">Delivery details</h2>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="fullName">Full name</label>
                <input id="fullName" required className={inputClass} value={details.fullName} onChange={update("fullName")} placeholder="Riya Kapoor" />
              </div>
              <div>
                <label className={labelClass} htmlFor="phone">Phone</label>
                <input id="phone" required type="tel" className={inputClass} value={details.phone} onChange={update("phone")} placeholder="+91 98765 43210" />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="street">Street address</label>
                <input id="street" required className={inputClass} value={details.street} onChange={update("street")} placeholder="42 Green Park" />
              </div>
              <div>
                <label className={labelClass} htmlFor="city">City</label>
                <input id="city" required className={inputClass} value={details.city} onChange={update("city")} placeholder="Mumbai" />
              </div>
              <div>
                <label className={labelClass} htmlFor="zipCode">PIN code</label>
                <input id="zipCode" required inputMode="numeric" className={inputClass} value={details.zipCode} onChange={update("zipCode")} placeholder="400001" />
              </div>
              <div>
                <label className={labelClass} htmlFor="deliveryDate">Delivery date</label>
                <input id="deliveryDate" required type="date" className={inputClass} value={details.deliveryDate} onChange={update("deliveryDate")} />
              </div>
              <div>
                <label className={labelClass} htmlFor="deliveryTime">Time slot</label>
                <select id="deliveryTime" className={inputClass} value={details.deliveryTime} onChange={update("deliveryTime")}>
                  {deliveryTimeSlots.map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="notes">Delivery notes (optional)</label>
                <textarea id="notes" rows={3} className={inputClass} value={details.notes} onChange={update("notes")} placeholder="Ring the bell twice" />
              </div>
            </div>

            <dl className="mt-6 space-y-2 border-t border-(--color-border) pt-5 text-sm">
              <div className="flex justify-between text-(--color-muted)">
                <dt>Subtotal</dt>
                <dd>₹{subtotal.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between text-(--color-muted)">
                <dt>Delivery</dt>
                <dd>₹{DELIVERY_FEE.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between text-base font-semibold text-(--color-ink)">
                <dt>Total</dt>
                <dd>₹{total.toFixed(2)}</dd>
              </div>
            </dl>

            {error && <p className="mt-4 text-sm text-(--color-sale)">{error}</p>}

            <button
              type="submit"
              disabled={placing}
              className="mt-7 w-full rounded-full bg-(--color-accent) px-7 py-4 font-semibold text-(--color-navy) transition-colors hover:bg-(--color-accent-dark) disabled:opacity-60"
            >
              {placing ? "Placing pre-order..." : "Place pre-order"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
