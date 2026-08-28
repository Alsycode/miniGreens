"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle } from "@phosphor-icons/react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const inputClass =
  "w-full rounded-xl border border-(--color-border) bg-(--color-surface-2) px-4 py-3 text-sm text-(--color-cream) outline-none transition-colors placeholder:text-(--color-muted) focus:border-(--color-sage)";
const labelClass = "mb-2 block text-xs font-medium tracking-wide text-(--color-muted) uppercase";

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [stage, setStage] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setStage("code");
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.verifyOtp({ email, token: code, type: "email" });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push(redirectTo);
    router.refresh();
  }

  if (stage === "email") {
    return (
      <form onSubmit={sendCode} className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 md:p-8">
        <h2 className="font-display text-2xl">Sign in to continue</h2>
        <p className="mt-2 text-sm text-(--color-muted)">
          We&apos;ll email you a 6-digit code — no password needed.
        </p>
        <div className="mt-6">
          <label className={labelClass} htmlFor="email">Email</label>
          <input
            id="email"
            required
            type="email"
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-full bg-(--color-olive) px-7 py-4 font-medium text-white transition-colors hover:bg-(--color-olive-dark) disabled:opacity-60"
        >
          {loading ? "Sending code..." : "Send code"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={verifyCode} className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 md:p-8">
      <CheckCircle size={32} weight="fill" className="text-(--color-sage)" />
      <h2 className="font-display mt-3 text-2xl">Enter your code</h2>
      <p className="mt-2 text-sm text-(--color-muted)">
        We sent a 6-digit code to {email}.
      </p>
      <div className="mt-6">
        <label className={labelClass} htmlFor="code">Code</label>
        <input
          id="code"
          required
          inputMode="numeric"
          maxLength={6}
          className={inputClass}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="123456"
        />
      </div>
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full rounded-full bg-(--color-olive) px-7 py-4 font-medium text-white transition-colors hover:bg-(--color-olive-dark) disabled:opacity-60"
      >
        {loading ? "Verifying..." : "Verify & continue"}
      </button>
      <button
        type="button"
        onClick={() => setStage("email")}
        className="mt-3 w-full text-center text-xs text-(--color-muted) underline"
      >
        Use a different email
      </button>
    </form>
  );
}
