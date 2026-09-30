import type { Metadata } from "next";
import { AccountGate } from "./AccountGate";

export const metadata: Metadata = {
  title: "My Account | Mini Greens Company",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return (
    <main className="mx-auto max-w-md px-6 py-16 md:px-10">
      <h1 className="font-serif-display text-4xl leading-[1.08] text-(--color-forest)">My Account</h1>
      <div className="mt-8">
        <AccountGate />
      </div>
    </main>
  );
}
