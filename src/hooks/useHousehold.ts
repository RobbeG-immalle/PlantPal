import { useCallback } from 'react';
import { useHouseholdStore } from '../stores/householdStore';
import { useAuthStore } from '../stores/authStore';
import {
  createHousehold as createHouseholdService,
  joinHousehold as joinHouseholdService,
  getHousehold as getHouseholdService,
  getMembers as getMembersService,
  leaveHousehold as leaveHouseholdService,
} from '../services/householdService';
import { getUserProfile, getCurrentUser } from '../services/authService';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { COLLECTIONS } from '../utils/constants';

/**
 * Hook providing household management operations and state.
 */
export const useHousehold = () => {
  const {
    household,
    members,
    loading,
    error,
    setHousehold,
    setMembers,
    setLoading,
    setError,
    clearError,
  } = useHouseholdStore();

  const { userProfile, setUserProfile } = useAuthStore();

  /** Returns the current userProfile, fetching or recreating it if not yet loaded. */
  const ensureUserProfile = useCallback(async () => {
    if (userProfile) return userProfile;
    const firebaseUser = getCurrentUser();
    if (!firebaseUser) return null;

    // Try to fetch existing profile
    let profile = await getUserProfile(firebaseUser.uid);

    // If profile doc is missing (e.g. sign-up failed to write to Firestore), recreate it
    if (!profile) {
      const userDoc = {
        email: firebaseUser.email ?? '',
        displayName: firebaseUser.displayName ?? '',
        householdId: null,
        createdAt: serverTimestamp(),
      };
      await setDoc(doc(db, COLLECTIONS.USERS, firebaseUser.uid), userDoc);
      profile = await getUserProfile(firebaseUser.uid);
    }

    if (profile) setUserProfile(profile);
    return profile;
  }, [userProfile, setUserProfile]);

  /** Fetches the current user's household and its members. */
  const fetchHousehold = useCallback(async () => {
    const householdId = userProfile?.householdId;
    if (!householdId) {
      setHousehold(null);
      setMembers([]);
      return;
    }

    try {
      setLoading(true);
      clearError();

      const h = await getHouseholdService(householdId);

      if (!h) {
        setHousehold(null);
        setMembers([]);
        return;
      }

      setHousehold(h);
      const memberProfiles = await getMembersService(h.memberIds);
      setMembers(memberProfiles);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load household.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [userProfile?.householdId, setHousehold, setMembers, setLoading, setError, clearError]);

  /** Creates a new household and updates the user profile. */
  const createHousehold = useCallback(
    async (name: string) => {
      const profile = await ensureUserProfile();
      if (!profile) {
        const message = 'Your profile is still loading. Please try again in a moment.';
        setError(message);
        throw new Error(message);
      }

      try {
        setLoading(true);
        clearError();
        const h = await createHouseholdService(name, profile.id);
        setHousehold(h);
        setMembers([profile]);

        // Refresh user profile
        const updated = await getUserProfile(profile.id);
        if (updated) setUserProfile(updated);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create household.';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [ensureUserProfile, setHousehold, setMembers, setUserProfile, setLoading, setError, clearError],
  );

  /** Joins an existing household via invite code. */
  const joinHousehold = useCallback(
    async (inviteCode: string) => {
      const profile = await ensureUserProfile();
      if (!profile) {
        const message = 'Your profile is still loading. Please try again in a moment.';
        setError(message);
        throw new Error(message);
      }

      try {
        setLoading(true);
        clearError();
        const h = await joinHouseholdService(inviteCode, profile.id);
        setHousehold(h);

        const memberProfiles = await getMembersService(h.memberIds);
        setMembers(memberProfiles);

        // Refresh user profile
        const updated = await getUserProfile(profile.id);
        if (updated) setUserProfile(updated);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to join household.';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [ensureUserProfile, setHousehold, setMembers, setUserProfile, setLoading, setError, clearError],
  );

  /** Leaves the current household. */
  const leaveHousehold = useCallback(async () => {
    const profile = await ensureUserProfile();
    if (!profile) {
      const message = 'Your profile is still loading. Please try again in a moment.';
      setError(message);
      throw new Error(message);
    }
    if (!profile.householdId) {
      const message = 'You are not currently in a household.';
      setError(message);
      throw new Error(message);
    }

    try {
      setLoading(true);
      clearError();
      await leaveHouseholdService(profile.householdId, profile.id);
      setHousehold(null);
      setMembers([]);

      const updated = await getUserProfile(profile.id);
      if (updated) setUserProfile(updated);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to leave household.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [ensureUserProfile, setHousehold, setMembers, setUserProfile, setLoading, setError, clearError]);

  return {
    household,
    members,
    loading,
    error,
    fetchHousehold,
    createHousehold,
    joinHousehold,
    leaveHousehold,
    clearError,
  };
};
