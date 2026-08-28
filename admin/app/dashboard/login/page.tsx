import { login } from "./actions";

const ERROR_MESSAGES: Record<string, string> = {
  invalid: "Incorrect email or password. Please try again.",
  not_admin: "This account does not have admin access.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; error?: string }>;
}) {
  const { from, error } = await searchParams;
  const errorMessage = error ? ERROR_MESSAGES[error] ?? "Something went wrong. Please try again." : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-bg px-4">
      <div className="w-full max-w-sm rounded-2xl border border-brand-border bg-brand-surface p-8 shadow-sm animate-fade-up">
        <h1 className="text-xl font-semibold text-foreground">MiniGreens Admin</h1>
        <p className="mt-1 text-sm text-muted">Sign in with your admin account to continue.</p>

        <form action={login} className="mt-6 space-y-4">
          <input type="hidden" name="from" value={from ?? "/dashboard"} />
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoFocus
              autoComplete="email"
              className="mt-1 w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="mt-1 w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
            />
          </div>

          {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

          <button
            type="submit"
            className="w-full rounded-lg bg-brand-primary px-3 py-2 text-sm font-medium text-white transition hover:bg-brand-primary-dark"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
