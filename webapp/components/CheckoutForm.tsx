"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, MapPin, Plus, Trash } from "@phosphor-icons/react";
import type { Database } from "@mobile/database";
import { useAuth } from "@/context/AuthContext";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Address = Database["public"]["Tables"]["addresses"]["Row"];

export interface DeliveryDetails {
  addressId: string;
  fullName: string;
  phone: string;
  dateOfBirth: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  deliveryDate: string;
  notes: string;
  termsAccepted: boolean;
  smsWhatsappConsent: boolean;
}

const NEW_ADDRESS = "new";

const EMPTY: DeliveryDetails = {
  addressId: "",
  fullName: "",
  phone: "",
  dateOfBirth: "",
  street: "",
  city: "",
  state: "",
  zipCode: "",
  deliveryDate: "",
  notes: "",
  termsAccepted: false,
  smsWhatsappConsent: false,
};

const inputClass =
  "w-full rounded-xl border border-(--color-forest)/15 bg-white px-4 py-3 text-sm text-(--color-forest) outline-none transition-colors placeholder:text-(--color-forest)/40 focus:border-(--color-forest)";

const labelClass = "mb-2 block text-xs font-semibold tracking-wide text-(--color-forest)/60 uppercase";

interface Props {
  submitLabel: string;
  dateLabel: string;
  confirmationTitle: string;
  confirmationBody: string;
  onConfirm: (details: DeliveryDetails) => void | Promise<void>;
}

export function CheckoutForm({ submitLabel, dateLabel, confirmationTitle, confirmationBody, onConfirm }: Props) {
  const { user } = useAuth();
  const [details, setDetails] = useState<DeliveryDetails>(EMPTY);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressChoice, setAddressChoice] = useState<string>(NEW_ADDRESS);
  const [setAsDefault, setSetAsDefault] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Offer previously-saved addresses so returning users don't have to retype delivery
  // details every time. New users (or ones without a saved address yet) go straight to
  // the form, same as before.
  useEffect(() => {
    if (!user) return;
    const supabase = createSupabaseBrowserClient();
    supabase
      .from("addresses")
      .select("*")
      .eq("profile_id", user.id)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        const rows = data ?? [];
        setAddresses(rows);
        if (rows.length > 0) setAddressChoice(rows[0].id);
      });
  }, [user]);

  // Keep `details` in sync with whichever address is selected, so the confirmation
  // message and the parent's onConfirm still see a name/phone/street to work with.
  useEffect(() => {
    if (addressChoice === NEW_ADDRESS) return;
    const address = addresses.find((a) => a.id === addressChoice);
    if (!address) return;
    setDetails((prev) => ({
      ...prev,
      fullName: address.full_name,
      phone: address.phone,
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zip_code,
    }));
  }, [addressChoice, addresses]);

  const update =
    (key: keyof DeliveryDetails) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setDetails((prev) => ({ ...prev, [key]: e.target.value }));

  const updateChecked =
    (key: keyof DeliveryDetails) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setDetails((prev) => ({ ...prev, [key]: e.target.checked }));

  if (confirmed) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-[0_4px_20px_rgba(31,58,36,0.08)] ring-1 ring-(--color-forest)/10">
        <CheckCircle size={44} weight="fill" className="mx-auto text-(--color-leaf)" />
        <h2 className="font-serif-display mt-5 text-2xl text-(--color-forest)">{confirmationTitle}</h2>
        <p className="mt-3 text-sm leading-relaxed text-(--color-forest)/70">{confirmationBody}</p>
        <p className="mt-6 text-sm text-(--color-forest)/70">
          We&apos;ll reach {details.fullName} on {details.phone} to confirm the delivery on{" "}
          {details.deliveryDate}.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-full bg-(--color-sun) px-7 py-3.5 text-sm font-semibold text-(--color-forest) transition-colors hover:bg-(--color-sun-dark)"
        >
          Back to home
        </Link>
      </div>
    );
  }

  const usingSavedAddress = addressChoice !== NEW_ADDRESS;

  async function handleDeleteAddress(id: string) {
    if (!window.confirm("Remove this saved address?")) return;
    const supabase = createSupabaseBrowserClient();
    const { error: deleteError } = await supabase.from("addresses").delete().eq("id", id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setAddresses((prev) => {
      const next = prev.filter((a) => a.id !== id);
      if (addressChoice === id) setAddressChoice(next[0]?.id ?? NEW_ADDRESS);
      return next;
    });
  }

  async function resolveAddressId(): Promise<string> {
    if (usingSavedAddress) return addressChoice;
    if (!user) throw new Error("Please sign in to continue.");

    const supabase = createSupabaseBrowserClient();
    const makeDefault = addresses.length === 0 || setAsDefault;

    if (setAsDefault && addresses.length > 0) {
      await supabase.from("addresses").update({ is_default: false }).eq("profile_id", user.id);
    }

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
        state: details.state,
        zip_code: details.zipCode,
        is_default: makeDefault,
      })
      .select()
      .single();

    if (addressError || !address) {
      throw new Error(addressError?.message ?? "Could not save delivery address.");
    }
    return address.id;
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
          const addressId = await resolveAddressId();
          await onConfirm({ ...details, addressId });
          setConfirmed(true);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
        } finally {
          setSubmitting(false);
        }
      }}
      className="rounded-2xl bg-white p-6 shadow-[0_4px_20px_rgba(31,58,36,0.08)] ring-1 ring-(--color-forest)/10 md:p-8"
    >
      <h2 className="font-serif-display text-2xl text-(--color-forest)">Delivery details</h2>

      {addresses.length > 0 && (
        <div className="mt-5 space-y-2">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-sm transition-colors ${
                addressChoice === address.id
                  ? "border-(--color-forest) bg-(--color-cream)"
                  : "border-(--color-forest)/15 hover:border-(--color-forest)/40"
              }`}
            >
              <label className="flex flex-1 cursor-pointer items-start gap-3">
                <input
                  type="radio"
                  name="addressChoice"
                  className="mt-1 accent-(--color-forest)"
                  checked={addressChoice === address.id}
                  onChange={() => setAddressChoice(address.id)}
                />
                <MapPin size={16} className="mt-0.5 shrink-0 text-(--color-leaf)" />
                <span className="text-(--color-forest)">
                  <span className="flex items-center gap-2 font-medium">
                    {address.label}
                    {address.is_default && (
                      <span className="rounded-full bg-(--color-leaf)/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-(--color-leaf)">
                        Default
                      </span>
                    )}
                  </span>
                  <span className="block text-(--color-forest)/70">
                    {address.street}, {address.city}, {address.state} {address.zip_code}
                  </span>
                </span>
              </label>
              <button
                type="button"
                onClick={() => handleDeleteAddress(address.id)}
                aria-label="Remove this address"
                className="shrink-0 rounded-full p-1.5 text-(--color-forest)/40 transition-colors hover:bg-(--color-sale)/10 hover:text-(--color-sale)"
              >
                <Trash size={16} />
              </button>
            </div>
          ))}
          <label
            className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors ${
              addressChoice === NEW_ADDRESS
                ? "border-(--color-forest) bg-(--color-cream)"
                : "border-(--color-forest)/15 hover:border-(--color-forest)/40"
            }`}
          >
            <input
              type="radio"
              name="addressChoice"
              className="accent-(--color-forest)"
              checked={addressChoice === NEW_ADDRESS}
              onChange={() => setAddressChoice(NEW_ADDRESS)}
            />
            <Plus size={16} className="shrink-0 text-(--color-leaf)" />
            <span className="font-medium text-(--color-forest)">Add a new address</span>
          </label>
        </div>
      )}

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {!usingSavedAddress && (
          <>
            <div>
              <label className={labelClass} htmlFor="fullName">Full name</label>
              <input id="fullName" required className={inputClass} value={details.fullName} onChange={update("fullName")} placeholder="Riya Kapoor" />
            </div>
            <div>
              <label className={labelClass} htmlFor="phone">Phone</label>
              <input id="phone" required type="tel" className={inputClass} value={details.phone} onChange={update("phone")} placeholder="+91 98765 43210" />
            </div>
          </>
        )}
        <div className={usingSavedAddress ? "sm:col-span-2" : ""}>
          <label className={labelClass} htmlFor="dateOfBirth">Date of birth (optional)</label>
          <input id="dateOfBirth" type="date" className={inputClass} value={details.dateOfBirth} onChange={update("dateOfBirth")} />
        </div>
        {!usingSavedAddress && (
          <>
            <div className="sm:col-span-2">
              <label className={labelClass} htmlFor="street">Street address</label>
              <input id="street" required className={inputClass} value={details.street} onChange={update("street")} placeholder="42 Green Park" />
            </div>
            <div>
              <label className={labelClass} htmlFor="city">City</label>
              <input id="city" required className={inputClass} value={details.city} onChange={update("city")} placeholder="Mumbai" />
            </div>
            <div>
              <label className={labelClass} htmlFor="state">State</label>
              <input id="state" required className={inputClass} value={details.state} onChange={update("state")} placeholder="Maharashtra" />
            </div>
            <div>
              <label className={labelClass} htmlFor="zipCode">PIN code</label>
              <input id="zipCode" required inputMode="numeric" className={inputClass} value={details.zipCode} onChange={update("zipCode")} placeholder="400001" />
            </div>
          </>
        )}
        <div>
          <label className={labelClass} htmlFor="deliveryDate">{dateLabel}</label>
          <input id="deliveryDate" required type="date" className={inputClass} value={details.deliveryDate} onChange={update("deliveryDate")} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="notes">Delivery notes (optional)</label>
          <textarea id="notes" rows={3} className={inputClass} value={details.notes} onChange={update("notes")} placeholder="Ring the bell twice" />
        </div>
      </div>

      {!usingSavedAddress && addresses.length > 0 && (
        <label htmlFor="setAsDefault" className="mt-4 flex items-center gap-3 text-sm text-(--color-forest)">
          <input
            id="setAsDefault"
            type="checkbox"
            checked={setAsDefault}
            onChange={(e) => setSetAsDefault(e.target.checked)}
            className="size-4 shrink-0 accent-(--color-forest)"
          />
          Set as my default address
        </label>
      )}

      <div className="mt-6 space-y-3 border-t border-(--color-forest)/10 pt-5">
        <label htmlFor="termsAccepted" className="flex items-start gap-3 text-sm text-(--color-forest)">
          <input
            id="termsAccepted"
            type="checkbox"
            required
            checked={details.termsAccepted}
            onChange={updateChecked("termsAccepted")}
            className="mt-0.5 size-4 shrink-0 accent-(--color-forest)"
          />
          <span>
            I agree to MGC&apos;s{" "}
            <Link href="/terms" className="underline">Terms &amp; Conditions</Link> and{" "}
            <Link href="/privacy" className="underline">Privacy Policy</Link>.
          </span>
        </label>
        <label htmlFor="smsWhatsappConsent" className="flex items-start gap-3 text-sm text-(--color-forest)">
          <input
            id="smsWhatsappConsent"
            type="checkbox"
            checked={details.smsWhatsappConsent}
            onChange={updateChecked("smsWhatsappConsent")}
            className="mt-0.5 size-4 shrink-0 accent-(--color-forest)"
          />
          <span>I agree to receive important updates about my subscription through SMS/WhatsApp.</span>
        </label>
      </div>

      {error && <p className="mt-4 text-sm text-(--color-sale)">{error}</p>}

      <button
        type="submit"
        disabled={submitting || !details.termsAccepted}
        className="mt-7 w-full rounded-full bg-(--color-sun) px-7 py-4 font-semibold text-(--color-forest) transition-colors hover:bg-(--color-sun-dark) disabled:opacity-60"
      >
        {submitting ? "Please wait..." : submitLabel}
      </button>
      <p className="mt-3 text-center text-xs text-(--color-forest)/60">
        No payment needed now. We confirm every order over the phone.
      </p>
    </form>
  );
}
