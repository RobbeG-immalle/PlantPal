import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { UserSubscription, SubscriptionTier } from '../types/subscription';
import { COLLECTIONS } from '../utils/constants';
import { Timestamp } from 'firebase/firestore';

const DEFAULT_SUBSCRIPTION: UserSubscription = {
  tier: 'free',
  purchasedAt: null,
  expiresAt: null,
  isActive: true,
  productId: null,
};

/**
 * Reads the subscription from the user's Firestore document.
 * Falls back to the default free-tier subscription if none is stored.
 */
export const getUserSubscription = async (userId: string): Promise<UserSubscription> => {
  const ref = doc(db, COLLECTIONS.USERS, userId);
  const snap = await getDoc(ref);

  if (!snap.exists()) return DEFAULT_SUBSCRIPTION;

  const data = snap.data();
  return (data.subscription as UserSubscription) ?? DEFAULT_SUBSCRIPTION;
};

/**
 * Writes a subscription update to the user's Firestore document.
 */
export const updateUserSubscription = async (
  userId: string,
  subscription: UserSubscription,
): Promise<void> => {
  const ref = doc(db, COLLECTIONS.USERS, userId);
  await updateDoc(ref, { subscription });
};

/**
 * Mock purchase implementation.
 * In production, replace this with expo-in-app-purchases or RevenueCat (react-native-purchases).
 *
 * TODO: Replace with RevenueCat / expo-in-app-purchases
 */
export const purchaseSubscription = async (
  userId: string,
  planId: string,
): Promise<UserSubscription> => {
  let tier: SubscriptionTier = 'free';
  let expiresAt: Timestamp | null = null;

  if (planId === 'premium_monthly') {
    tier = 'premium';
    // Expires in 30 days
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);
    expiresAt = Timestamp.fromDate(expiry);
  } else if (planId === 'premium_lifetime') {
    tier = 'lifetime';
    expiresAt = null;
  }

  const subscription: UserSubscription = {
    tier,
    purchasedAt: Timestamp.now(),
    expiresAt,
    isActive: true,
    productId: planId,
  };

  await updateUserSubscription(userId, subscription);
  return subscription;
};

/**
 * Placeholder for restoring previous purchases.
 * In production, call RevenueCat's restorePurchases() or expo-in-app-purchases equivalent.
 *
 * TODO: Replace with RevenueCat / expo-in-app-purchases restore flow
 */
export const restorePurchases = async (userId: string): Promise<UserSubscription> => {
  // For now, simply re-read from Firestore (production would call the IAP SDK)
  return getUserSubscription(userId);
};
