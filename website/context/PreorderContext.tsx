"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export interface SubscriptionSelection {
  planId: string;
}

interface PreorderState {
  subscription: SubscriptionSelection | null;
  hydrated: boolean;
  setSubscription: (next: SubscriptionSelection | null) => void;
  clearAll: () => void;
}

const STORAGE_KEY = "minigreens.subscription";

const PreorderContext = createContext<PreorderState | null>(null);

export function PreorderProvider({ children }: { children: React.ReactNode }) {
  const [subscription, setSubscriptionState] =
    useState<SubscriptionSelection | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- SSR-safe localStorage hydration; window is unavailable during render on the server, so this can't move to a lazy useState initializer
        setSubscriptionState(parsed.subscription ?? null);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ subscription }));
  }, [subscription, hydrated]);

  const clearAll = useCallback(() => {
    setSubscriptionState(null);
  }, []);

  return (
    <PreorderContext.Provider
      value={{
        subscription,
        hydrated,
        setSubscription: setSubscriptionState,
        clearAll,
      }}
    >
      {children}
    </PreorderContext.Provider>
  );
}

export function usePreorder() {
  const ctx = useContext(PreorderContext);
  if (!ctx) throw new Error("usePreorder must be used within PreorderProvider");
  return ctx;
}
