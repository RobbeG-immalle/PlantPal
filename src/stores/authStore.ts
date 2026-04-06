import { create } from 'zustand';
import { User as FirebaseUser } from 'firebase/auth';
import { User } from '../types/user';

interface AuthState {
  /** Firebase auth user (or null when signed out). */
  firebaseUser: FirebaseUser | null;
  /** Firestore user profile. */
  userProfile: User | null;
  loading: boolean;
  error: string | null;

  setFirebaseUser: (user: FirebaseUser | null) => void;
  setUserProfile: (profile: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

/** Zustand store for authentication state. */
export const useAuthStore = create<AuthState>((set) => ({
  firebaseUser: null,
  userProfile: null,
  loading: true,
  error: null,

  setFirebaseUser: (user) => set({ firebaseUser: user }),
  setUserProfile: (profile) => set({ userProfile: profile }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));
