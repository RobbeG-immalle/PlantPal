import React, { ReactNode } from 'react';
import { useSubscriptionStore } from '../stores/subscriptionStore';
import { FeatureAccess } from '../types/subscription';

interface FeatureGateProps {
  /** The feature key to check access for. */
  feature: keyof FeatureAccess;
  /** Content to render when the user has access. */
  children: ReactNode;
  /** Fallback content to render when the user does not have access. */
  fallback?: ReactNode;
}

/**
 * Renders `children` if the current subscription has access to `feature`,
 * otherwise renders `fallback` (or nothing).
 *
 * @example
 * <FeatureGate feature="aiRecognition" fallback={<UpgradePrompt />}>
 *   <AIRecognitionButton />
 * </FeatureGate>
 */
export const FeatureGate = ({ feature, children, fallback = null }: FeatureGateProps) => {
  const { featureAccess } = useSubscriptionStore();
  const value = featureAccess[feature];
  const hasAccess = typeof value === 'boolean' ? value : value === Infinity;

  return <>{hasAccess ? children : fallback}</>;
};
