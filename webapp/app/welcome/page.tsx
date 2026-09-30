import type { Metadata } from "next";
import { ProfileForm } from "@/components/ProfileForm";

export const metadata: Metadata = {
  title: "Complete Your Profile | Mini Greens Company",
  robots: { index: false, follow: false },
};

function safeRedirect(value: string | undefined): string {
  // Same-site paths only, so this can't be used as an open redirect.
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

export default async function WelcomePage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;

  return (
    <main className="mx-auto max-w-md px-6 py-16 md:px-10">
      <h1 className="font-serif-display text-4xl leading-[1.08] text-(--color-forest)">Welcome</h1>
      <p className="mt-3 text-sm leading-relaxed text-(--color-forest)/70">
        Just once: tell us how to reach you so we can confirm your deliveries.
      </p>
      <div className="mt-8">
        <ProfileForm redirectTo={safeRedirect(redirect)} submitLabel="Continue" />
      </div>
    </main>
  );
}
