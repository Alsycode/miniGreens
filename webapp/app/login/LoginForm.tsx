"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle } from "@phosphor-icons/react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const inputClass =
  "w-full rounded-xl border border-black/[0.07] bg-white px-4 py-3 text-sm text-(--color-forest) outline-none transition-colors placeholder:text-(--color-forest)/70 focus:border-(--color-forest)";
const labelClass = "mb-2 block text-xs font-semibold tracking-wide text-(--color-forest)/70 uppercase";

const RESEND_COOLDOWN_SECONDS = 30;

// Supabase error strings are developer-facing; show something a customer can act on.
function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("rate limit") || m.includes("too many") || m.includes("security purposes")) {
    return "Too many attempts. Please wait a minute and try again.";
  }
  if (m.includes("expired") || m.includes("invalid")) {
    return "That code is incorrect or has expired. Check the code or request a new one.";
  }
  if (m.includes("email") && (m.includes("valid") || m.includes("format"))) {
    return "Please enter a valid email address.";
  }
  if (m.includes("failed to fetch") || m.includes("network")) {
    return "Couldn't connect. Check your internet connection and try again.";
  }
  return "Something went wrong. Please try again.";
}

export function LoginForm({ redirectTo, initialEmail = "" }: { redirectTo: string; initialEmail?: string }) {
  const router = useRouter();
  const [stage, setStage] = useState<"email" | "code">("email");
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function requestCode(): Promise<boolean> {
    setLoading(true);
    setError(null);
    setNotice(null);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true },
    });
    setLoading(false);
    if (error) {
      setError(friendlyAuthError(error.message));
      return false;
    }
    setCooldown(RESEND_COOLDOWN_SECONDS);
    return true;
  }

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    if (await requestCode()) setStage("code");
  }

  async function resendCode() {
    if (cooldown > 0 || loading) return;
    if (await requestCode()) setNotice("A new code is on its way. Check spam if you don't see it.");
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.auth.verifyOtp({ email, token: code.trim(), type: "email" });
    if (error) {
      setLoading(false);
      setError(friendlyAuthError(error.message));
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
      <p className="mt-2 text-sm text-(--color-forest)/70">We sent an 8-digit code to {email}. It can take a minute, and may land in spam.</p>
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
      {notice && <p className="mt-3 text-sm text-(--color-leaf)">{notice}</p>}
      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full rounded-full bg-(--color-sun) px-7 py-4 font-semibold text-(--color-forest) transition-colors hover:bg-(--color-sun-dark) disabled:opacity-60"
      >
        {loading ? "Verifying..." : "Verify & continue"}
      </button>
      <button
        type="button"
        onClick={resendCode}
        disabled={cooldown > 0 || loading}
        className="mt-3 w-full text-center text-xs font-semibold text-(--color-forest) underline disabled:no-underline disabled:opacity-60"
      >
        {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
      </button>
      <button
        type="button"
        onClick={() => {
          setStage("email");
          setError(null);
          setNotice(null);
          setCode("");
        }}
        className="mt-3 w-full text-center text-xs text-(--color-forest)/70 underline"
      >
        Use a different email
      </button>
    </form>
  );
}
