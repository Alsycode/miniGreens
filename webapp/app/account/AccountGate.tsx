"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ProfileForm } from "@/components/ProfileForm";

export function AccountGate() {
  const { user, loading, signOut } = useAuth();
  if (loading) return null;
  if (!user) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-[0_4px_20px_rgba(31,58,36,0.08)]">
        <p className="text-sm text-(--color-forest)/70">Log in to manage your details.</p>
        <Link
          href="/login?redirect=/account"
          className="mt-6 inline-flex rounded-full bg-(--color-sun) px-7 py-3.5 text-sm font-semibold text-(--color-forest) transition-colors hover:bg-(--color-sun-dark)"
        >
          Log in
        </Link>
      </div>
    );
  }
  return (
    <>
      <ProfileForm submitLabel="Save changes" />
      <p className="mt-4 text-center text-xs text-(--color-forest)/50">Signed in as {user.email}</p>
      <button
        type="button"
        onClick={signOut}
        className="mt-3 w-full rounded-full border border-(--color-forest)/20 px-7 py-3 text-sm font-semibold text-(--color-forest) transition-colors hover:border-(--color-forest)"
      >
        Log out
      </button>
    </>
  );
}
