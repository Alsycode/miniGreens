import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign In | Mini Greens Company",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; email?: string }>;
}) {
  const { redirect, email } = await searchParams;

  return (
    <main className="mx-auto max-w-md px-6 py-16 md:px-10">
      <h1 className="font-serif-display text-4xl leading-[1.08] text-(--color-forest)">Sign In</h1>
      <p className="mt-3 text-sm leading-relaxed text-(--color-forest)/70">
        Sign in to place an order or view your order history.
      </p>
      <div className="mt-8">
        <LoginForm redirectTo={redirect || "/"} initialEmail={email} />
      </div>
    </main>
  );
}
