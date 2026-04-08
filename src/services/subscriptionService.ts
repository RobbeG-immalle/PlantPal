import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { PurchasesPackage } from 'react-native-purchases';
import { db } from './firebase';
import { UserSubscription } from '../types/subscription';
import { COLLECTIONS } from '../utils/constants';
import {
  purchasePackage,
  restoreRevenueCatPurchases,
  getCustomerInfo,
  mapCustomerInfoToSubscription,
} from './revenueCatService';

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
 * Purchases a RevenueCat package, syncs the resulting subscription to Firestore,
 * and returns the updated UserSubscription.
 */
export const purchaseSubscription = async (
  userId: string,
  pkg: PurchasesPackage,
): Promise<UserSubscription> => {
  const customerInfo = await purchasePackage(pkg);
  const subscription = mapCustomerInfoToSubscription(customerInfo);

  await updateUserSubscription(userId, subscription);
  return subscription;
};

/**
 * Restores previous purchases via RevenueCat, syncs to Firestore,
 * and returns the restored UserSubscription.
 */
export const restorePurchases = async (userId: string): Promise<UserSubscription> => {
  const customerInfo = await restoreRevenueCatPurchases();
  const subscription = mapCustomerInfoToSubscription(customerInfo);

  await updateUserSubscription(userId, subscription);
  return subscription;
};

/**
 * Fetches the current subscription status from RevenueCat (not Firestore).
 * Useful for ensuring local state is in sync with the store.
 */
export const syncSubscriptionFromRevenueCat = async (
  userId: string,
): Promise<UserSubscription> => {
  const customerInfo = await getCustomerInfo();
  const subscription = mapCustomerInfoToSubscription(customerInfo);

  await updateUserSubscription(userId, subscription);
  return subscription;
};
