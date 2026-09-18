"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle } from "@phosphor-icons/react";
import { deliveryTimeSlots } from "@/lib/products";

export interface DeliveryDetails {
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

interface Props {
  submitLabel: string;
  dateLabel: string;
  confirmationTitle: string;
  confirmationBody: string;
  onConfirm: (details: DeliveryDetails) => void;
}

export function CheckoutForm({ submitLabel, dateLabel, confirmationTitle, confirmationBody, onConfirm }: Props) {
  const [details, setDetails] = useState<DeliveryDetails>(EMPTY);
  const [confirmed, setConfirmed] = useState(false);

  const update =
    (key: keyof DeliveryDetails) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setDetails((prev) => ({ ...prev, [key]: e.target.value }));

  if (confirmed) {
    return (
      <div className="rounded-2xl border border-(--color-border) bg-white p-8 text-center">
        <CheckCircle size={44} weight="fill" className="mx-auto text-(--color-success)" />
        <h2 className="font-display mt-5 text-2xl font-semibold text-(--color-navy)">{confirmationTitle}</h2>
        <p className="mt-3 text-sm leading-relaxed text-(--color-muted)">{confirmationBody}</p>
        <p className="mt-6 text-sm text-(--color-muted)">
          We&apos;ll reach {details.fullName} on {details.phone} to confirm the delivery on{" "}
          {details.deliveryDate} between {details.deliveryTime}.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-full bg-(--color-accent) px-7 py-3.5 text-sm font-semibold text-(--color-navy) transition-colors hover:bg-(--color-accent-dark)"
        >
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onConfirm(details);
        setConfirmed(true);
      }}
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
          <label className={labelClass} htmlFor="deliveryDate">{dateLabel}</label>
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

      <button
        type="submit"
        className="mt-7 w-full rounded-full bg-(--color-accent) px-7 py-4 font-semibold text-(--color-navy) transition-colors hover:bg-(--color-accent-dark)"
      >
        {submitLabel}
      </button>
      <p className="mt-3 text-center text-xs text-(--color-muted)">
        No payment needed now — we confirm every order over the phone.
      </p>
    </form>
  );
}
