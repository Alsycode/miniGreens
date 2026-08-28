import { create } from 'zustand';
import { Address, Profile, Preorder } from '../types';

interface AppState {
  // Onboarding
  hasCompletedOnboarding: boolean;
  setOnboardingComplete: () => void;

  // Profile
  profile: Profile | null;
  setProfile: (profile: Profile) => void;

  // Addresses
  addresses: Address[];
  setAddresses: (addresses: Address[]) => void;
  addAddress: (address: Address) => void;
  removeAddress: (id: string) => void;
  updateAddress: (address: Address) => void;

  // Preorder
  preorder: Partial<Preorder> | null;
  setPreorder: (preorder: Partial<Preorder>) => void;
  clearPreorder: () => void;

  // Search
  searchHistory: string[];
  addSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  hasCompletedOnboarding: false,
  setOnboardingComplete: () => set({ hasCompletedOnboarding: true }),

  profile: null,
  setProfile: (profile) => set({ profile }),

  addresses: [],
  setAddresses: (addresses) => set({ addresses }),
  addAddress: (address) => set((state) => ({ addresses: [...state.addresses, address] })),
  removeAddress: (id) => set((state) => ({ addresses: state.addresses.filter((a) => a.id !== id) })),
  updateAddress: (address) => set((state) => ({
    addresses: state.addresses.map((a) => (a.id === address.id ? address : a)),
  })),

  preorder: null,
  setPreorder: (preorder) => set({ preorder }),
  clearPreorder: () => set({ preorder: null }),

  searchHistory: [],
  addSearchHistory: (query) => set((state) => ({
    searchHistory: [query, ...state.searchHistory.filter((q) => q !== query)].slice(0, 10),
  })),
  clearSearchHistory: () => set({ searchHistory: [] }),
}));
