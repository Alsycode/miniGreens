import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PartnerDashboardClient } from "@/components/PartnerDashboardClient";

export const metadata: Metadata = {
  title: "Partner Dashboard | Mini Greens Company",
  robots: { index: false, follow: false },
};

const STATUS_COPY: Record<string, { title: string; body: string }> = {
  pending: {
    title: "Your application is under review",
    body: "We've received your details and our team is reviewing them. You'll hear from us shortly.",
  },
  rejected: {
    title: "Application not approved",
    body: "Your application wasn't approved this time. Reach out to us if you'd like to know more or reapply.",
  },
};

export default async function PartnerDashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/partner/dashboard");
  }

  const { data: partner } = await supabase
    .from("partners")
    .select("*")
    .eq("profile_id", user.id)
    .maybeSingle();

  return (
    <div>
      <div className="border-b border-black/5 bg-(--color-cream)">
        <div className="mx-auto max-w-5xl px-6 py-14 md:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--color-leaf)">Grow With Us</p>
          <h1 className="font-serif-display mt-3 text-4xl leading-[1.08] text-(--color-forest) sm:text-5xl">
            Partner Dashboard
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-(--color-forest)/70">
            Place business orders, track your sales, and manage your earnings — all in one place.
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-6 py-10 md:px-10">
        {!partner ? (
          <div className="rounded-2xl border border-black/[0.07] bg-white p-10 text-center shadow-[0_2px_14px_rgba(31,58,36,0.06)]">
            <p className="text-(--color-forest)/70">You&apos;re not a partner yet.</p>
            <p className="mt-1 text-sm text-(--color-forest)/70">
              Apply to become an MGC Partner to sell products and take business orders.
            </p>
            <Link
              href="/partner/apply"
              className="mt-6 inline-flex rounded-full bg-(--color-sun) px-7 py-3.5 text-sm font-semibold text-(--color-forest) transition-colors hover:bg-(--color-sun-dark)"
            >
              Apply Now
            </Link>
          </div>
        ) : partner.status !== "approved" ? (
          <div className="rounded-2xl border border-black/[0.07] bg-white p-10 text-center shadow-[0_2px_14px_rgba(31,58,36,0.06)]">
            <h2 className="font-serif-display text-2xl text-(--color-forest)">
              {STATUS_COPY[partner.status]?.title ?? "Application received"}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-(--color-forest)/70">
              {STATUS_COPY[partner.status]?.body}
            </p>
            <Link
              href="/contact"
              className="mt-6 inline-flex rounded-full bg-(--color-sun) px-7 py-3.5 text-sm font-semibold text-(--color-forest) transition-colors hover:bg-(--color-sun-dark)"
            >
              Contact us
            </Link>
          </div>
        ) : (
          <PartnerDashboardClient partner={partner} />
        )}
      </main>
    </div>
  );
}
