import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Business Orders | Mini Greens Company",
  robots: { index: false, follow: false },
};

export default function BusinessOrderLayout({ children }: { children: React.ReactNode }) {
  return children;
}
