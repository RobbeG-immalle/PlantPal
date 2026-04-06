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
import { getUserProfile } from '../services/authService';

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
      if (!userProfile) return;

      try {
        setLoading(true);
        clearError();
        const h = await createHouseholdService(name, userProfile.id);
        setHousehold(h);
        setMembers([userProfile]);

        // Refresh user profile
        const updated = await getUserProfile(userProfile.id);
        if (updated) setUserProfile(updated);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create household.';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [userProfile, setHousehold, setMembers, setUserProfile, setLoading, setError, clearError],
  );

  /** Joins an existing household via invite code. */
  const joinHousehold = useCallback(
    async (inviteCode: string) => {
      if (!userProfile) return;

      try {
        setLoading(true);
        clearError();
        const h = await joinHouseholdService(inviteCode, userProfile.id);
        setHousehold(h);

        const memberProfiles = await getMembersService(h.memberIds);
        setMembers(memberProfiles);

        // Refresh user profile
        const updated = await getUserProfile(userProfile.id);
        if (updated) setUserProfile(updated);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to join household.';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [userProfile, setHousehold, setMembers, setUserProfile, setLoading, setError, clearError],
  );

  /** Leaves the current household. */
  const leaveHousehold = useCallback(async () => {
    if (!userProfile?.householdId || !userProfile) return;

    try {
      setLoading(true);
      clearError();
      await leaveHouseholdService(userProfile.householdId, userProfile.id);
      setHousehold(null);
      setMembers([]);

      const updated = await getUserProfile(userProfile.id);
      if (updated) setUserProfile(updated);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to leave household.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userProfile, setHousehold, setMembers, setUserProfile, setLoading, setError, clearError]);

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
