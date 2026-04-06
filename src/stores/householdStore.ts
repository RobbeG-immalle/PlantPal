import { create } from 'zustand';
import { Household } from '../types/household';
import { User } from '../types/user';

interface HouseholdState {
  household: Household | null;
  members: User[];
  loading: boolean;
  error: string | null;

  setHousehold: (household: Household | null) => void;
  setMembers: (members: User[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

/** Zustand store for household state. */
export const useHouseholdStore = create<HouseholdState>((set) => ({
  household: null,
  members: [],
  loading: false,
  error: null,

  setHousehold: (household) => set({ household }),
  setMembers: (members) => set({ members }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));
