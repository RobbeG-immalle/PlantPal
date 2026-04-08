import { useCallback, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useSubscriptionStore } from '../stores/subscriptionStore';
import {
  getUserSubscription,
  purchaseSubscription,
  restorePurchases,
} from '../services/subscriptionService';
import { FeatureAccess } from '../types/subscription';

/**
 * Hook providing subscription state and actions.
 * Automatically loads the subscription from Firestore on mount when authenticated.
 */
export const useSubscription = () => {
  const { firebaseUser } = useAuthStore();
  const {
    subscription,
    featureAccess,
    loading,
    setSubscription,
    setLoading,
    isPremium,
  } = useSubscriptionStore();

  /** Fetches subscription from Firestore and updates the store. */
  const loadSubscription = useCallback(async () => {
    if (!firebaseUser) return;

    try {
      setLoading(true);
      const sub = await getUserSubscription(firebaseUser.uid);
      setSubscription(sub);
    } catch {
      // Subscription load failure is non-fatal; fall back to free tier
    } finally {
      setLoading(false);
    }
  }, [firebaseUser, setSubscription, setLoading]);

  useEffect(() => {
    loadSubscription();
  }, [loadSubscription]);

  /**
   * Initiates a mock purchase for the given plan ID.
   * TODO: Replace body with RevenueCat / expo-in-app-purchases flow.
   */
  const purchase = useCallback(
    async (planId: string) => {
      if (!firebaseUser) throw new Error('Not authenticated');

      try {
        setLoading(true);
        const updated = await purchaseSubscription(firebaseUser.uid, planId);
        setSubscription(updated);
      } finally {
        setLoading(false);
      }
    },
    [firebaseUser, setSubscription, setLoading],
  );

  /** Restores previous purchases from Firestore / IAP SDK. */
  const restore = useCallback(async () => {
    if (!firebaseUser) return;

    try {
      setLoading(true);
      const sub = await restorePurchases(firebaseUser.uid);
      setSubscription(sub);
    } finally {
      setLoading(false);
    }
  }, [firebaseUser, setSubscription, setLoading]);

  /**
   * Returns true if the user can add another plant given their current count.
   * Free users are limited to FREE_PLANT_LIMIT plants.
   */
  const canAddPlant = useCallback(
    (currentCount: number): boolean => {
      return currentCount < featureAccess.maxPlants;
    },
    [featureAccess.maxPlants],
  );

  /**
   * Returns true if the user has access to the requested feature.
   * Useful for conditional rendering of gated UI elements.
   */
  const requirePremium = useCallback(
    (feature: keyof FeatureAccess): boolean => {
      const value = featureAccess[feature];
      if (typeof value === 'boolean') return value;
      // maxPlants: treat as premium if Infinity
      return value === Infinity;
    },
    [featureAccess],
  );

  return {
    subscription,
    featureAccess,
    loading,
    isPremium,
    loadSubscription,
    purchase,
    restore,
    canAddPlant,
    requirePremium,
  };
};
