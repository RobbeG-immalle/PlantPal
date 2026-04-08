import { create } from 'zustand';
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

  setSubscription: (sub: UserSubscription) => void;
  setLoading: (loading: boolean) => void;
  isPremium: () => boolean;
}

/** Zustand store for subscription state. */
export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  subscription: DEFAULT_SUBSCRIPTION,
  featureAccess: getFeatureAccess('free'),
  loading: false,

  setSubscription: (sub) =>
    set({
      subscription: sub,
      featureAccess: getFeatureAccess(sub.tier),
    }),

  setLoading: (loading) => set({ loading }),

  isPremium: () => {
    const { subscription } = get();
    return subscription.tier === 'premium' || subscription.tier === 'lifetime';
  },
}));
