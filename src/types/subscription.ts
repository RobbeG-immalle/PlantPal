import { Timestamp } from 'firebase/firestore';

/** Subscription tier identifiers. */
export type SubscriptionTier = 'free' | 'premium' | 'lifetime';

/** Subscription plan with pricing metadata. */
export interface SubscriptionPlan {
  id: string;
  tier: SubscriptionTier;
  name: string;
  /** e.g. "€3.49/month" or "€24.99" */
  price: string;
  /** Numeric amount for sorting/display. */
  priceAmount: number;
  period: 'monthly' | 'lifetime' | 'none';
  description: string;
  features: string[];
  isMostPopular?: boolean;
}

/** Feature flags gated by subscription tier. */
export interface FeatureAccess {
  /** 5 for free, Infinity for premium/lifetime. */
  maxPlants: number;
  aiRecognition: boolean;
  householdSharing: boolean;
  funnyNotifications: boolean;
  escalatingReminders: boolean;
}

/** User subscription state stored in Firestore. */
export interface UserSubscription {
  tier: SubscriptionTier;
  purchasedAt: Timestamp | null;
  /** null for lifetime purchases. */
  expiresAt: Timestamp | null;
  isActive: boolean;
  productId: string | null;
}
