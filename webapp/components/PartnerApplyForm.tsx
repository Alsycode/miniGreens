"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PaperPlaneTilt, UploadSimple, X } from "@phosphor-icons/react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { KycDocument, PartnerBusinessType } from "@mobile/database";

const inputClass =
  "w-full rounded-xl border border-black/[0.07] bg-white px-4 py-3 text-sm text-(--color-forest) outline-none transition-colors placeholder:text-(--color-forest)/70 focus:border-(--color-forest)";

const labelClass = "mb-2 block text-xs font-semibold tracking-wide text-(--color-forest)/70 uppercase";

const BUSINESS_TYPES: { value: PartnerBusinessType; label: string; note?: string }[] = [
  { value: "individual", label: "Individual grower" },
  { value: "women", label: "Women partner", note: "0% platform fee" },
  { value: "cafe", label: "Café" },
  { value: "restaurant", label: "Restaurant" },
  { value: "shop", label: "Shop" },
  { value: "fitness_wellness", label: "Fitness / wellness" },
  { value: "community", label: "Community group" },
];

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

interface Props {
  userId: string;
  /** Preselected business type from the URL; ignored unless it's a known type. */
  initialType?: string;
}

export function PartnerApplyForm({ userId, initialType }: Props) {
  const router = useRouter();
  const [businessType, setBusinessType] = useState<PartnerBusinessType>(
    BUSINESS_TYPES.find((t) => t.value === initialType)?.value ?? "individual",
  );
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addFiles(list: FileList | null) {
    if (!list) return;
    setFiles((prev) => [...prev, ...Array.from(list)]);
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
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

        const docs: KycDocument[] = [];
        for (const file of files) {
          const path = `${userId}/${Date.now()}_${sanitizeFileName(file.name)}`;
          const { error: uploadError } = await supabase.storage
            .from("partner-kyc")
            .upload(path, file, { contentType: file.type, upsert: false });

          if (uploadError) {
            setSubmitting(false);
            setError(`Couldn't upload ${file.name}: ${uploadError.message}`);
            return;
          }
          docs.push({ name: file.name, path, uploaded_at: new Date().toISOString() });
        }

        const { error: insertError } = await supabase.from("partners").insert({
          profile_id: userId,
          business_type: businessType,
          business_name: String(data.get("business_name") ?? "").trim(),
          contact_person: String(data.get("contact_person") ?? "").trim(),
          phone: String(data.get("phone") ?? "").trim(),
          address: String(data.get("address") ?? "").trim() || null,
          kyc_documents: docs,
        });

        setSubmitting(false);
        if (insertError) {
          setError(insertError.message);
          return;
        }
        router.push("/partner/submitted");
      }}
      className="rounded-2xl border border-black/[0.07] bg-white p-6 shadow-[0_2px_14px_rgba(31,58,36,0.06)] md:p-8"
    >
      <div>
        <label className={labelClass}>Business type</label>
        <div className="grid gap-2 sm:grid-cols-2">
          {BUSINESS_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setBusinessType(type.value)}
              className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
                businessType === type.value
                  ? "border-(--color-forest) bg-(--color-forest)/5 text-(--color-forest)"
                  : "border-black/[0.07] text-(--color-forest) hover:border-(--color-forest)/40"
              }`}
            >
              {type.label}
              {type.note && (
                <span className="rounded-full bg-(--color-sun) px-2 py-0.5 text-[10px] font-semibold text-(--color-forest)">
                  {type.note}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="business_name">Business / grower name</label>
          <input
            id="business_name"
            name="business_name"
            required
            className={inputClass}
            placeholder="e.g. Riya's Microgreens"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="contact_person">Contact person</label>
          <input id="contact_person" name="contact_person" required className={inputClass} placeholder="Riya Kapoor" />
        </div>
        <div>
          <label className={labelClass} htmlFor="phone">Phone</label>
          <input id="phone" name="phone" required type="tel" className={inputClass} placeholder="+91 98765 43210" />
        </div>
        <div>
          <label className={labelClass} htmlFor="address">Address (optional)</label>
          <input id="address" name="address" className={inputClass} placeholder="Growing space / delivery address" />
        </div>
      </div>

      <div className="mt-5">
        <label className={labelClass}>KYC documents (optional)</label>
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-black/[0.07] bg-(--color-cream) px-4 py-6 text-sm text-(--color-forest)/70 transition-colors hover:border-(--color-forest)/40">
          <UploadSimple size={18} />
          Upload ID proof, FSSAI certificate, etc.
          <input
            type="file"
            multiple
            accept="image/*,application/pdf"
            className="hidden"
            onChange={(e) => addFiles(e.target.files)}
          />
        </label>
        {files.length > 0 && (
          <ul className="mt-3 space-y-2">
            {files.map((file, i) => (
              <li
                key={`${file.name}-${i}`}
                className="flex items-center justify-between rounded-lg bg-(--color-cream) px-3 py-2 text-sm text-(--color-forest)"
              >
                <span className="truncate">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  aria-label={`Remove ${file.name}`}
                  className="text-(--color-forest)/70 hover:text-(--color-sale)"
                >
                  <X size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && <p className="mt-4 text-sm text-(--color-sale)">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-6 flex items-center gap-2 rounded-full bg-(--color-sun) px-7 py-3.5 font-semibold text-(--color-forest) transition-colors hover:bg-(--color-sun-dark) disabled:opacity-60"
      >
        {submitting ? "Submitting..." : "Submit Application"}
        <PaperPlaneTilt size={16} weight="bold" />
      </button>
    </form>
  );
}
