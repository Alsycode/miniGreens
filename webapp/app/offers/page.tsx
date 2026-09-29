import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { OfferCard } from "@/components/OfferCard";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "My Offers | Mini Greens Company", robots: { index: false, follow: false } };

export default async function OffersPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/offers");
  }

  const [{ data: profile }, { data: discounts }] = await Promise.all([
    supabase.from("profiles").select("date_of_birth").eq("id", user.id).maybeSingle(),
    supabase.from("discounts").select("*").eq("is_active", true).order("created_at", { ascending: false }),
  ]);

  const now = Date.now();
  const currentMonth = new Date().getMonth();
  const birthMonth = profile?.date_of_birth ? Number(profile.date_of_birth.slice(5, 7)) - 1 : null;

  const visible = (discounts ?? []).filter((d) => {
    if (!d.code) return false;
    if (d.starts_at && new Date(d.starts_at).getTime() > now) return false;
    if (d.expires_at && new Date(d.expires_at).getTime() < now) return false;
    if (d.usage_limit != null && d.used_count >= d.usage_limit) return false;
    if (d.is_birthday_offer) return birthMonth !== null && birthMonth === currentMonth;
    return true;
  });

  return (
    <PageShell
      eyebrow="My Offers"
      title="Coupons You Can Use Right Now"
      intro="Tap a code to copy it, then paste it at checkout. Birthday rewards only show up during your birthday month."
    >
      {!profile?.date_of_birth && (
        <div className="mb-6 rounded-2xl border border-(--color-leaf)/30 bg-(--color-leaf)/10 p-5 text-sm text-(--color-forest)">
          Add your date of birth on your{" "}
          <a href="/#join" className="font-semibold underline underline-offset-4">
            account
          </a>{" "}
          to unlock a birthday reward during your birth month.
        </div>
      )}

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-black/[0.07] bg-white p-10 text-center shadow-[0_2px_14px_rgba(31,58,36,0.06)]">
          <p className="text-(--color-forest)/70">No offers right now. Check back soon — new coupons and seasonal deals show up here.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {visible.map((discount) => (
            <OfferCard key={discount.id} discount={discount} />
          ))}
        </div>
      )}
    </PageShell>
  );
}
