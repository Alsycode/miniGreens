import type { Metadata } from "next";

export const metadata: Metadata = { title: "Start Your Subscription | Mini Greens Company", robots: { index: false, follow: false } };

export default function SubscribeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
