"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export interface ContactProfile {
  full_name: string;
  whatsapp_number: string | null;
  date_of_birth: string | null;
  whatsapp_opt_in: boolean;
}

// A profile is "complete" once we can reach the customer: a name and a WhatsApp number.
// Birthday is optional and never blocks anything.
export function isProfileComplete(profile: ContactProfile | null): boolean {
  return Boolean(profile && profile.full_name.trim() && profile.whatsapp_number);
}

export function useProfile() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<ContactProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase
      .from("profiles")
      .select("full_name, whatsapp_number, date_of_birth, whatsapp_opt_in")
      .eq("id", user.id)
      .single();
    setProfile(data ?? null);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount for the current user
    void refresh();
  }, [authLoading, refresh]);

  return { profile, loading: authLoading || loading, refresh, complete: isProfileComplete(profile) };
}
