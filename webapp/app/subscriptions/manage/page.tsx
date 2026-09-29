import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { ManageSubscriptionsClient } from "@/components/ManageSubscriptionsClient";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Manage Subscriptions | Mini Greens Company",
  robots: { index: false, follow: false },
};

export default async function ManageSubscriptionsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/subscriptions/manage");
  }

  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select("*, subscription_plans(name, price, delivery_frequency)")
    .order("started_at", { ascending: false });

  return (
    <PageShell
      eyebrow="My Subscriptions"
      title="Manage Your Subscriptions"
      intro="Pause a delivery when you're travelling, resume whenever you're ready, or cancel outright — no calls needed."
    >
      <div className="mx-auto max-w-2xl">
        <ManageSubscriptionsClient subscriptions={subscriptions ?? []} />
      </div>
    </PageShell>
  );
}
