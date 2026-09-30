"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle } from "@phosphor-icons/react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const inputClass =
  "w-full rounded-xl border border-black/[0.07] bg-white px-4 py-3 text-sm text-(--color-forest) outline-none transition-colors placeholder:text-(--color-forest)/70 focus:border-(--color-forest)";
const labelClass = "mb-2 block text-xs font-semibold tracking-wide text-(--color-forest)/70 uppercase";

export function LoginForm({ redirectTo, initialEmail = "" }: { redirectTo: string; initialEmail?: string }) {
  const router = useRouter();
  const [stage, setStage] = useState<"email" | "code">("email");
  const [email, setEmail] = useState(initialEmail);
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
    const { data, error } = await supabase.auth.verifyOtp({ email, token: code, type: "email" });
    if (error) {
      setLoading(false);
      setError(error.message);
      return;
    }

    // First login (or an old account with no contact number): collect name + WhatsApp
    // number once before anything else, then continue to where they were headed.
    let destination = redirectTo;
    if (data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, whatsapp_number")
        .eq("id", data.user.id)
        .single();
      if (!profile?.full_name.trim() || !profile.whatsapp_number) {
        destination = `/welcome?redirect=${encodeURIComponent(redirectTo)}`;
      }
    }
    setLoading(false);
    router.push(destination);
    router.refresh();
  }

  if (stage === "email") {
    return (
      <form onSubmit={sendCode} className="rounded-2xl border border-black/[0.07] bg-white p-6 shadow-[0_2px_14px_rgba(31,58,36,0.06)] md:p-8">
        <h2 className="font-serif-display text-2xl text-(--color-forest)">Sign in to continue</h2>
        <p className="mt-2 text-sm text-(--color-forest)/70">We&apos;ll email you an 8-digit code. No password needed.</p>
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
        {error && <p className="mt-3 text-sm text-(--color-sale)">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-full bg-(--color-sun) px-7 py-4 font-semibold text-(--color-forest) transition-colors hover:bg-(--color-sun-dark) disabled:opacity-60"
        >
          {loading ? "Sending code..." : "Send code"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={verifyCode} className="rounded-2xl border border-black/[0.07] bg-white p-6 shadow-[0_2px_14px_rgba(31,58,36,0.06)] md:p-8">
      <CheckCircle size={32} weight="fill" className="text-(--color-leaf)" />
      <h2 className="font-serif-display mt-3 text-2xl text-(--color-forest)">Enter your code</h2>
      <p className="mt-2 text-sm text-(--color-forest)/70">We sent an 8-digit code to {email}.</p>
      <div className="mt-6">
        <label className={labelClass} htmlFor="code">Code</label>
        <input
          id="code"
          required
          inputMode="numeric"
          maxLength={10}
          className={inputClass}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="12345678"
        />
      </div>
      {error && <p className="mt-3 text-sm text-(--color-sale)">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full rounded-full bg-(--color-sun) px-7 py-4 font-semibold text-(--color-forest) transition-colors hover:bg-(--color-sun-dark) disabled:opacity-60"
      >
        {loading ? "Verifying..." : "Verify & continue"}
      </button>
      <button
        type="button"
        onClick={() => setStage("email")}
        className="mt-3 w-full text-center text-xs text-(--color-forest)/70 underline"
      >
        Use a different email
      </button>
    </form>
  );
}
