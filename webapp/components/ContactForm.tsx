"use client";

import { useState } from "react";
import { CheckCircle, PaperPlaneTilt } from "@phosphor-icons/react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const inputClass =
  "w-full rounded-xl border border-(--color-forest)/10 bg-(--color-cream) px-4 py-3 text-sm text-(--color-forest) outline-none transition-colors placeholder:text-(--color-forest)/40 focus:border-(--color-forest)/50 focus:bg-white";

const labelClass = "mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-(--color-forest)/60";

const cardClass = "rounded-3xl bg-white p-6 shadow-[0_4px_24px_rgba(31,58,36,0.08)] md:p-10";

const REASONS = ["General question", "Order issue", "Wholesale / café supply", "Farm visit", "Something else"];

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (sent) {
    return (
      <div className={`${cardClass} flex flex-col items-center justify-center text-center`}>
        <CheckCircle size={44} weight="fill" className="text-(--color-leaf)" />
        <h3 className="font-serif-display mt-4 text-3xl text-(--color-forest)">
          Message sent
        </h3>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-(--color-forest)/70">
          Thanks for reaching out. Someone from the team will get back to you
          within one working day.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-6 text-sm font-semibold text-(--color-forest) underline underline-offset-4"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        const form = e.currentTarget;
        const data = new FormData(form);
        const supabase = createSupabaseBrowserClient();

        const { error: insertError } = await supabase.from("contact_messages").insert({
          full_name: String(data.get("name") ?? ""),
          email: String(data.get("email") ?? ""),
          phone: String(data.get("phone") ?? "") || null,
          reason,
          message: String(data.get("message") ?? ""),
        });

        setSubmitting(false);
        if (insertError) {
          setError(insertError.message);
          return;
        }
        setSent(true);
      }}
      className={cardClass}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-(--color-leaf)">Send a message</p>
      <h2 className="font-serif-display mt-2 text-3xl text-(--color-forest)">We&apos;d Love to Hear From You</h2>
      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="name">Full name</label>
          <input id="name" name="name" required className={inputClass} placeholder="Riya Kapoor" />
        </div>
        <div>
          <label className={labelClass} htmlFor="email">Email</label>
          <input id="email" name="email" required type="email" className={inputClass} placeholder="riya@email.com" />
        </div>
        <div>
          <label className={labelClass} htmlFor="phone">Phone (optional)</label>
          <input id="phone" name="phone" type="tel" className={inputClass} placeholder="+91 98765 43210" />
        </div>
        <div>
          <label className={labelClass} htmlFor="reason">What&apos;s this about?</label>
          <select
            id="reason"
            className={inputClass}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          >
            {REASONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="message">Message</label>
          <textarea
            id="message"
            name="message"
            required
            rows={5}
            className={inputClass}
            placeholder="Tell us what's on your mind..."
          />
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-(--color-sale)">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-7 flex items-center gap-2 rounded-full bg-(--color-sun) px-7 py-3.5 text-sm font-semibold text-(--color-forest) shadow-sm transition-colors hover:bg-(--color-sun-dark) disabled:opacity-60"
      >
        {submitting ? "Sending..." : "Send Message"}
        <PaperPlaneTilt size={16} weight="bold" />
      </button>
    </form>
  );
}
