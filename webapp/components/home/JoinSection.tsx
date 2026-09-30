"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Cake, CheckCircle, Package, Key } from "@phosphor-icons/react";
import { useAuth } from "@/context/AuthContext";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

// Capture uses the existing account system rather than a separate mailing list:
// sign-up is email + code, and a date of birth on the profile unlocks the
// birthday discounts `apply_discount` already honours during the birth month.

const PERKS = [
  { Icon: Cake, label: "A birthday reward in your birthday month" },
  { Icon: Package, label: "Track orders and manage subscriptions in one place" },
  { Icon: Key, label: "Sign in with an emailed code, no password" },
];

type DobState = "unknown" | "missing" | "set";

export function JoinSection() {
  const { user, loading } = useAuth();
  const [dobState, setDobState] = useState<DobState>("unknown");
  const [dob, setDob] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const supabase = createSupabaseBrowserClient();
    supabase
      .from("profiles")
      .select("date_of_birth")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => setDobState(data?.date_of_birth ? "set" : "missing"));
  }, [user]);

  async function saveDob(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !dob) return;
    setSaving(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const { error: updateError } = await supabase.from("profiles").update({ date_of_birth: dob }).eq("id", user.id);
    setSaving(false);
    if (updateError) {
      setError("Couldn't save your birthday right now. Please try again.");
      return;
    }
    setDobState("set");
  }

  const today = new Date().toISOString().slice(0, 10);

  let action: React.ReactNode;
  if (!user || loading) {
    action = (
      <Link
        href={`/login?redirect=${encodeURIComponent("/#join")}`}
        className="inline-flex items-center gap-2 rounded-full bg-(--color-forest) px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-(--color-leaf)"
      >
        Create Your Account
        <ArrowRight size={15} weight="bold" />
      </Link>
    );
  } else if (dobState === "missing") {
    action = (
      <form onSubmit={saveDob} className="max-w-sm">
        <label htmlFor="join-dob" className="block text-sm font-semibold text-(--color-forest)">
          Add your birthday to unlock birthday rewards
        </label>
        <div className="mt-3 flex gap-2">
          <input
            id="join-dob"
            type="date"
            required
            max={today}
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="h-12 min-w-0 flex-1 rounded-full border border-(--color-forest)/20 bg-white px-5 text-sm text-(--color-forest) outline-none focus:border-(--color-forest)"
          />
          <button
            type="submit"
            disabled={saving || !dob}
            className="h-12 shrink-0 rounded-full bg-(--color-forest) px-6 text-sm font-semibold text-white transition-colors hover:bg-(--color-leaf) disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-(--color-sale)">{error}</p>}
      </form>
    );
  } else if (dobState === "set") {
    action = (
      <div>
        <p className="flex items-center gap-2 text-sm font-semibold text-(--color-forest)">
          <CheckCircle size={20} weight="fill" className="text-(--color-leaf)" />
          You&apos;re all set. Birthday rewards unlock in your birthday month.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/offers"
            className="rounded-full border border-(--color-forest)/30 bg-white px-5 py-2.5 text-sm font-semibold text-(--color-forest) transition-colors hover:border-(--color-forest)"
          >
            My Offers
          </Link>
          <Link
            href="/orders"
            className="rounded-full border border-(--color-forest)/30 bg-white px-5 py-2.5 text-sm font-semibold text-(--color-forest) transition-colors hover:border-(--color-forest)"
          >
            My Orders
          </Link>
          <Link
            href="/subscriptions/manage"
            className="rounded-full border border-(--color-forest)/30 bg-white px-5 py-2.5 text-sm font-semibold text-(--color-forest) transition-colors hover:border-(--color-forest)"
          >
            My Subscriptions
          </Link>
        </div>
      </div>
    );
  } else {
    action = <div className="h-12" aria-hidden="true" />;
  }

  return (
    <section id="join" className="scroll-mt-24 bg-(--color-sun)">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-14 md:px-10 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--color-forest)/70">Join MGC</p>
          <h2 className="font-serif-display mt-2 text-4xl leading-[1.08] text-(--color-forest) sm:text-5xl">
            Good Greens,
            <br />
            Good Perks.
          </h2>
          <ul className="mt-6 space-y-3">
            {PERKS.map(({ Icon, label }) => (
              <li key={label} className="flex items-center gap-3 text-[15px] text-(--color-forest)">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/60">
                  <Icon size={18} weight="light" />
                </span>
                {label}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl bg-white/50 p-6 sm:p-8">{action}</div>
      </div>
    </section>
  );
}
