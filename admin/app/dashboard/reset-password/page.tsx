"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "ready" | "invalid" | "saving" | "done">("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setStatus("ready");
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setStatus("ready");
      } else {
        setStatus((current) => (current === "checking" ? "invalid" : current));
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setStatus("saving");
    const supabase = createSupabaseBrowserClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setStatus("ready");
      return;
    }

    setStatus("done");
    setTimeout(() => router.replace("/dashboard/login"), 1500);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-bg px-4">
      <div className="w-full max-w-sm rounded-2xl border border-brand-border bg-brand-surface p-8 shadow-sm animate-fade-up">
        <h1 className="text-xl font-semibold text-foreground">Set a new password</h1>

        {status === "checking" && (
          <p className="mt-4 text-sm text-muted">Verifying your reset link…</p>
        )}

        {status === "invalid" && (
          <p className="mt-4 text-sm text-red-600">
            This reset link is invalid or has expired. Please request a new one.
          </p>
        )}

        {(status === "ready" || status === "saving") && (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                New password
              </label>
              <input
                id="password"
                type="password"
                required
                autoFocus
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
              />
            </div>
            <div>
              <label htmlFor="confirm" className="block text-sm font-medium text-foreground">
                Confirm password
              </label>
              <input
                id="confirm"
                type="password"
                required
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="mt-1 w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={status === "saving"}
              className="w-full rounded-lg bg-brand-primary px-3 py-2 text-sm font-medium text-white transition hover:bg-brand-primary-dark disabled:opacity-60"
            >
              {status === "saving" ? "Saving…" : "Set password"}
            </button>
          </form>
        )}

        {status === "done" && (
          <p className="mt-4 text-sm text-brand-primary">Password updated. Redirecting to sign in…</p>
        )}
      </div>
    </div>
  );
}
