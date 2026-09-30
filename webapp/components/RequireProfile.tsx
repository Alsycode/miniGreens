"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/lib/useProfile";

// Logged-in customers must have a name + WhatsApp number on file before ordering.
// Sends them to /welcome once, then back to where they were headed. Logged-out visitors
// pass straight through so the page's own sign-in prompt shows.
export function RequireProfile({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { loading, complete } = useProfile();
  const router = useRouter();
  const pathname = usePathname();
  const blocked = Boolean(user) && !loading && !complete;

  useEffect(() => {
    if (blocked) router.replace(`/welcome?redirect=${encodeURIComponent(pathname)}`);
  }, [blocked, router, pathname]);

  if (user && (loading || blocked)) return null;
  return <>{children}</>;
}
