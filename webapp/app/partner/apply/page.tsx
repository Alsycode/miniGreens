import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { PartnerApplyForm } from "@/components/PartnerApplyForm";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { BRAND_CLAIM } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Become a Partner: Cafés, Restaurants & Retailers | Mini Greens Company",
  description:
    "Stock fresh, locally grown microgreens and tea blends at your café, restaurant or store. Apply to partner with Mini Greens Company.",
  alternates: { canonical: "/partner/apply" },
};

const STATUS_COPY: Record<string, { title: string; body: string }> = {
  pending: {
    title: "Your application is under review",
    body: "We've received your details and our team is reviewing them. You'll hear from us shortly.",
  },
  approved: {
    title: "You're an MGC Partner",
    body: "Your application has been approved. Head to your Partner Dashboard to place business orders and track your earnings.",
  },
  rejected: {
    title: "Application not approved",
    body: "Your application wasn't approved this time. Reach out to us if you'd like to know more or reapply.",
  },
};

export default async function PartnerApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  // `?type=cafe` etc. (from the homepage business strip) presets the business type.
  const { type } = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const back = type ? `/partner/apply?type=${encodeURIComponent(type)}` : "/partner/apply";
    redirect(`/login?redirect=${encodeURIComponent(back)}`);
  }

  const { data: existingPartner } = await supabase
    .from("partners")
    .select("status")
    .eq("profile_id", user.id)
    .maybeSingle();

  return (
    <PageShell
      eyebrow="Grow With Us"
      title="Become an MGC Partner"
      intro={`Join ${BRAND_CLAIM}. Grow fresh microgreens from home, a small space, or your existing business — MGC connects you to customers, restaurants, and cafés, and handles finding the orders so you can focus on growing.`}
    >
      <div className="mx-auto max-w-2xl">
        {existingPartner ? (
          <div className="rounded-2xl border border-black/[0.07] bg-white p-8 text-center">
            <h2 className="font-serif-display text-2xl text-(--color-forest)">
              {STATUS_COPY[existingPartner.status]?.title ?? "Application received"}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-(--color-forest)/70">
              {STATUS_COPY[existingPartner.status]?.body}
            </p>
            <Link
              href={existingPartner.status === "approved" ? "/partner/dashboard" : "/contact"}
              className="mt-6 inline-flex rounded-full bg-(--color-sun) px-7 py-3.5 text-sm font-semibold text-(--color-forest) transition-colors hover:bg-(--color-sun-dark)"
            >
              {existingPartner.status === "approved" ? "Go to Partner Dashboard" : "Contact us"}
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8 grid gap-4 sm:grid-cols-3">
              {[
                { step: "1. You grow", body: "Grow quality microgreens from home or your space." },
                { step: "2. We connect", body: "We bring customers, cafés, and orders to you." },
                { step: "3. You earn", body: "You supply and sell; MGC takes a small platform fee." },
              ].map((item) => (
                <div key={item.step} className="rounded-xl border border-black/[0.07] bg-white p-4">
                  <p className="text-sm font-semibold text-(--color-forest)">{item.step}</p>
                  <p className="mt-1 text-xs leading-relaxed text-(--color-forest)/70">{item.body}</p>
                </div>
              ))}
            </div>
            <PartnerApplyForm userId={user.id} initialType={type} />
          </>
        )}
      </div>
    </PageShell>
  );
}
