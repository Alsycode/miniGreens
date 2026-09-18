import { LoginForm } from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;

  return (
    <main className="mx-auto max-w-md px-6 py-16 md:px-10">
      <h1 className="font-display text-3xl font-bold text-(--color-navy)">Sign In</h1>
      <p className="mt-3 text-sm leading-relaxed text-(--color-muted)">
        Sign in to place an order or view your order history.
      </p>
      <div className="mt-8">
        <LoginForm redirectTo={redirect || "/"} />
      </div>
    </main>
  );
}
