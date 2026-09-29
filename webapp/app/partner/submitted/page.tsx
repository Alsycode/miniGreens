import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { PageShell } from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Application Submitted | Mini Greens Company",
  robots: { index: false, follow: false },
};

export default function PartnerSubmittedPage() {
  return (
    <PageShell
      eyebrow="Grow With Us"
      title="Application Submitted"
      intro="Thanks for applying to become an MGC Partner."
    >
      <div className="mx-auto max-w-lg rounded-2xl border border-black/[0.07] bg-white p-10 text-center">
        <CheckCircle size={40} weight="fill" className="mx-auto text-(--color-leaf)" />
        <h2 className="font-serif-display mt-4 text-2xl text-(--color-forest)">
          We've got your details
        </h2>
        <div className="mt-6 space-y-3 text-left text-sm leading-relaxed text-(--color-forest)/70">
          <p>1. Our team reviews your application and any documents you shared.</p>
          <p>2. Once approved, your account is upgraded to a Partner account.</p>
          <p>3. Once approved, visit your Partner Dashboard here on the site — place business orders, track sales, and request payouts.</p>
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="rounded-full bg-(--color-sun) px-7 py-3.5 text-sm font-semibold text-(--color-forest) transition-colors hover:bg-(--color-sun-dark)"
          >
            Back to Home
          </Link>
          <Link
            href="/contact"
            className="rounded-full border border-black/[0.07] px-7 py-3.5 text-sm font-semibold text-(--color-forest) transition-colors hover:border-(--color-forest)"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
