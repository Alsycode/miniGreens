import type { Metadata } from "next";

export const metadata: Metadata = { title: "Build Your Own Subscription | Mini Greens Company", robots: { index: false, follow: false } };

export default function CustomSubscriptionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
