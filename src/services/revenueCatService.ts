import { Platform } from 'react-native';
import Purchases, {
  PurchasesOfferings,
  PurchasesPackage,
  CustomerInfo,
  LOG_LEVEL,
  CustomerInfoUpdateListener,
} from 'react-native-purchases';
import { UserSubscription, SubscriptionTier } from '../types/subscription';
import { Timestamp } from 'firebase/firestore';

/** RevenueCat entitlement identifier configured in the RevenueCat dashboard. */
const PREMIUM_ENTITLEMENT_ID = 'PlantPal Pro';

/**
 * Initialises the RevenueCat SDK.
 * Must be called once at app start (before any purchase calls).
 */
export const initRevenueCat = async (firebaseUserId?: string): Promise<void> => {
  const apiKey = Platform.select({
    ios: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS,
    android: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID,
  });

  if (!apiKey) {
    console.warn('[RevenueCat] No API key found for this platform. Purchases will not work.');
    return;
  }

  if (__DEV__) {
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  }

  await Purchases.configure({
    apiKey,
    appUserID: firebaseUserId ?? undefined,
  });
};

/**
 * Identifies the user with RevenueCat using their Firebase UID.
 * Call after sign-in so purchases are tied to the correct account.
 */
export const identifyUser = async (firebaseUserId: string): Promise<CustomerInfo> => {
  return Purchases.logIn(firebaseUserId).then(({ customerInfo }) => customerInfo);
};

/**
 * Resets the RevenueCat anonymous user (call on sign-out).
 */
export const resetUser = async (): Promise<void> => {
  await Purchases.logOut();
};

/**
 * Fetches the current offerings configured in the RevenueCat dashboard.
 */
export const getOfferings = async (): Promise<PurchasesOfferings> => {
  return Purchases.getOfferings();
};

/**
 * Purchases a specific RevenueCat package.
 * Returns the updated CustomerInfo after a successful purchase.
 */
export const purchasePackage = async (
  pkg: PurchasesPackage,
): Promise<CustomerInfo> => {
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return customerInfo;
};

/**
 * Restores previous purchases.
 * Returns the restored CustomerInfo.
 */
export const restoreRevenueCatPurchases = async (): Promise<CustomerInfo> => {
  return Purchases.restorePurchases();
};

/**
 * Fetches the current customer info from RevenueCat.
 */
export const getCustomerInfo = async (): Promise<CustomerInfo> => {
  return Purchases.getCustomerInfo();
};

/**
 * Maps RevenueCat CustomerInfo to the app's UserSubscription model.
 */
export const mapCustomerInfoToSubscription = (
  customerInfo: CustomerInfo,
): UserSubscription => {
  if (__DEV__) {
    console.log('[RevenueCat] CustomerInfo mapping:');
    console.log('  Active entitlements:', Object.keys(customerInfo.entitlements.active));
    console.log('  All entitlements:', Object.keys(customerInfo.entitlements.all));
    console.log('  Active subscriptions:', customerInfo.activeSubscriptions);
    console.log('  Looking for entitlement ID:', PREMIUM_ENTITLEMENT_ID);
  }

  const entitlement = customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID];

  if (!entitlement) {
    if (__DEV__) {
      console.warn(
        `[RevenueCat] No active entitlement found for "${PREMIUM_ENTITLEMENT_ID}".`,
        'Make sure your RevenueCat product is attached to an entitlement named exactly "premium".',
      );
    }
    return {
      tier: 'free',
      purchasedAt: null,
      expiresAt: null,
      isActive: true,
      productId: null,
    };
  }

  // Determine tier based on the entitlement period / product identifier.
  // Heuristic: lifetime purchases have no expiration date in RevenueCat.
  // Verify this matches your RevenueCat dashboard product configuration.
  let tier: SubscriptionTier = 'premium';
  const productId = entitlement.productIdentifier;

  if (!entitlement.expirationDate) {
    tier = 'lifetime';
  }

  return {
    tier,
    purchasedAt: entitlement.originalPurchaseDate
      ? Timestamp.fromDate(new Date(entitlement.originalPurchaseDate))
      : Timestamp.now(),
    expiresAt: entitlement.expirationDate
      ? Timestamp.fromDate(new Date(entitlement.expirationDate))
      : null,
    isActive: true,
    productId,
  };
};

/**
 * Registers a listener that fires whenever RevenueCat's CustomerInfo changes
 * (e.g. after a purchase, renewal, or restore – even if it happened outside the app).
 * Returns an unsubscribe function.
 */
export const addCustomerInfoListener = (
  listener: CustomerInfoUpdateListener,
): (() => void) => {
  return Purchases.addCustomerInfoUpdateListener(listener);
};
