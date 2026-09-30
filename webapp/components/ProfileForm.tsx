"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatNationalNumber, normalizeIndianMobile } from "@/lib/phone";
import { useProfile } from "@/lib/useProfile";

// Bump when the WhatsApp consent wording below changes, so the log records what was agreed to.
const CONSENT_TERMS_VERSION = "2026-09-30";

const inputClass =
  "w-full rounded-xl border border-(--color-forest)/15 bg-white px-4 py-3 text-sm text-(--color-forest) outline-none transition-colors placeholder:text-(--color-forest)/40 focus:border-(--color-forest)";
const labelClass = "mb-2 block text-xs font-semibold tracking-wide text-(--color-forest)/60 uppercase";

export function ProfileForm({ redirectTo, submitLabel }: { redirectTo?: string; submitLabel: string }) {
  const { user } = useAuth();
  const { profile, loading, refresh } = useProfile();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [optIn, setOptIn] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time prefill from the loaded profile
    setFullName(profile.full_name);
    setPhone(formatNationalNumber(profile.whatsapp_number));
    setDob(profile.date_of_birth ?? "");
    setOptIn(profile.whatsapp_opt_in);
  }, [profile]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError(null);
    setSaved(false);

    const whatsapp = normalizeIndianMobile(phone);
    if (!fullName.trim()) return setError("Please enter your name.");
    if (!whatsapp) return setError("Enter a valid 10-digit Indian mobile number.");

    setSaving(true);
    const supabase = createSupabaseBrowserClient();
    const numberChanged = whatsapp !== profile?.whatsapp_number;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim(),
        whatsapp_number: whatsapp,
        phone: whatsapp,
        date_of_birth: dob || null,
        // A changed number is unverified until re-confirmed.
        ...(numberChanged ? { whatsapp_verified_at: null } : {}),
      })
      .eq("id", user.id);

    if (updateError) {
      setSaving(false);
      setError(updateError.message);
      return;
    }

    // Log consent only when it changed, so the log is a clean grant/withdraw history.
    if (optIn !== (profile?.whatsapp_opt_in ?? false)) {
      const { error: consentError } = await supabase.from("consent_log").insert({
        profile_id: user.id,
        channel: "whatsapp",
        granted: optIn,
        source: redirectTo ? "onboarding" : "account_settings",
        terms_version: CONSENT_TERMS_VERSION,
      });
      if (consentError) {
        setSaving(false);
        setError(consentError.message);
        return;
      }
    }

    await refresh();
    setSaving(false);
    if (redirectTo) {
      router.replace(redirectTo);
      router.refresh();
    } else {
      setSaved(true);
    }
  }

  if (loading) return null;

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-black/[0.07] bg-white p-6 shadow-[0_2px_14px_rgba(31,58,36,0.06)] md:p-8"
    >
      <div className="space-y-5">
        <div>
          <label className={labelClass} htmlFor="pf-name">Full name</label>
          <input id="pf-name" required autoComplete="name" className={inputClass} value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>

        <div>
          <label className={labelClass} htmlFor="pf-phone">WhatsApp number</label>
          <div className="flex gap-2">
            <span className="flex items-center rounded-xl border border-(--color-forest)/15 bg-(--color-forest)/5 px-4 text-sm text-(--color-forest)/70">
              +91
            </span>
            <input
              id="pf-phone"
              required
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              className={inputClass}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="98765 43210"
            />
          </div>
          <p className="mt-1.5 text-xs text-(--color-forest)/50">
            We use this to confirm your deliveries. We currently deliver only in India.
          </p>
        </div>

        <div>
          <label className={labelClass} htmlFor="pf-dob">Date of birth (optional)</label>
          <input id="pf-dob" type="date" className={inputClass} value={dob} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setDob(e.target.value)} />
          <p className="mt-1.5 text-xs text-(--color-forest)/50">Only used to send you a birthday offer.</p>
        </div>

        <label htmlFor="pf-optin" className="flex items-start gap-3 text-sm text-(--color-forest)">
          <input
            id="pf-optin"
            type="checkbox"
            checked={optIn}
            onChange={(e) => setOptIn(e.target.checked)}
            className="mt-0.5 size-4 shrink-0 accent-(--color-forest)"
          />
          <span>
            Send me order and delivery updates on WhatsApp. You can turn this off any time in your account.
          </span>
        </label>
      </div>

      {error && (
        <p role="alert" className="mt-5 rounded-xl bg-(--color-sale)/10 px-4 py-3 text-sm text-(--color-sale)">
          {error}
        </p>
      )}
      {saved && <p className="mt-5 text-sm text-(--color-leaf)">Saved.</p>}

      <button
        type="submit"
        disabled={saving}
        className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-(--color-sun) px-7 py-3.5 text-sm font-semibold text-(--color-forest) transition-colors hover:bg-(--color-sun-dark) disabled:opacity-60"
      >
        {saving ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
