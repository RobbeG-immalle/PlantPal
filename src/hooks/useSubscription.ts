import { useCallback, useEffect } from 'react';
import { PurchasesPackage } from 'react-native-purchases';
import { useAuthStore } from '../stores/authStore';
import { useSubscriptionStore } from '../stores/subscriptionStore';
import {
  getUserSubscription,
  purchaseSubscription,
  restorePurchases,
  syncSubscriptionFromRevenueCat,
} from '../services/subscriptionService';
import {
  getOfferings,
  identifyUser,
} from '../services/revenueCatService';
import { FeatureAccess } from '../types/subscription';

/**
 * Hook providing subscription state and actions.
 * Automatically loads the subscription and RevenueCat offerings on mount when authenticated.
 */
export const useSubscription = () => {
  const { firebaseUser } = useAuthStore();
  const {
    subscription,
    featureAccess,
    loading,
    offerings,
    setSubscription,
    setLoading,
    setOfferings,
    isPremium,
  } = useSubscriptionStore();

  /** Fetches subscription from Firestore and RevenueCat offerings. */
  const loadSubscription = useCallback(async () => {
    if (!firebaseUser) return;

    try {
      setLoading(true);

      // Identify user with RevenueCat and sync subscription
      try {
        await identifyUser(firebaseUser.uid);
        const sub = await syncSubscriptionFromRevenueCat(firebaseUser.uid);
        setSubscription(sub);
      } catch {
        // RevenueCat may not be configured; fall back to Firestore
        const sub = await getUserSubscription(firebaseUser.uid);
        setSubscription(sub);
      }

      // Load offerings from RevenueCat
      try {
        const currentOfferings = await getOfferings();
        setOfferings(currentOfferings);
      } catch {
        // Offerings may fail in development; this is non-fatal
      }
    } finally {
      setLoading(false);
    }
  }, [firebaseUser, setSubscription, setLoading, setOfferings]);

  useEffect(() => {
    loadSubscription();
  }, [loadSubscription]);

  /**
   * Purchases a RevenueCat package and syncs the result to Firestore.
   */
  const purchase = useCallback(
    async (pkg: PurchasesPackage) => {
      if (!firebaseUser) throw new Error('Not authenticated');

      try {
        setLoading(true);
        const updated = await purchaseSubscription(firebaseUser.uid, pkg);
        setSubscription(updated);
      } finally {
        setLoading(false);
      }
    },
    [firebaseUser, setSubscription, setLoading],
  );

  /** Restores previous purchases via RevenueCat. */
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
    offerings,
    isPremium,
    loadSubscription,
    purchase,
    restore,
    canAddPlant,
    requirePremium,
  };
};
