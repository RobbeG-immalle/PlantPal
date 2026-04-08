import { create } from 'zustand';
import { PurchasesOfferings } from 'react-native-purchases';
import { FeatureAccess, UserSubscription } from '../types/subscription';
import { getFeatureAccess } from '../utils/subscriptionConfig';

const DEFAULT_SUBSCRIPTION: UserSubscription = {
  tier: 'free',
  purchasedAt: null,
  expiresAt: null,
  isActive: true,
  productId: null,
};

interface SubscriptionState {
  subscription: UserSubscription;
  featureAccess: FeatureAccess;
  loading: boolean;
  offerings: PurchasesOfferings | null;

  setSubscription: (sub: UserSubscription) => void;
  setLoading: (loading: boolean) => void;
  setOfferings: (offerings: PurchasesOfferings | null) => void;
  isPremium: () => boolean;
}

/** Zustand store for subscription state. */
export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  subscription: DEFAULT_SUBSCRIPTION,
  featureAccess: getFeatureAccess('free'),
  loading: false,
  offerings: null,

  setSubscription: (sub) =>
    set({
      subscription: sub,
      featureAccess: getFeatureAccess(sub.tier),
    }),

  setLoading: (loading) => set({ loading }),

  setOfferings: (offerings) => set({ offerings }),

  isPremium: () => {
    const { subscription } = get();
    return subscription.tier === 'premium' || subscription.tier === 'lifetime';
  },
}));
