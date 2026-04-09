import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PurchasesPackage } from 'react-native-purchases';
import { useTheme } from '../../theme/ThemeContext';
import { Button } from '../../components/Button';
import { useSubscription } from '../../hooks/useSubscription';
import { SUBSCRIPTION_PLANS } from '../../utils/subscriptionConfig';
import { RootStackParamList } from '../../types/navigation';

type PaywallNavProp = NativeStackNavigationProp<RootStackParamList, 'Paywall'>;

const ALL_FEATURES = [
  { key: 'unlimited', label: 'Unlimited plants', free: false },
  { key: 'ai', label: 'AI plant recognition', free: false },
  { key: 'household', label: 'Household sharing', free: false },
  { key: 'funny', label: 'Funny notifications', free: false },
  { key: 'escalating', label: 'Escalating reminders', free: false },
  { key: 'reminders', label: 'Basic reminders', free: true },
  { key: 'darkmode', label: 'Dark mode', free: true },
];

interface PackageCardProps {
  pkg: PurchasesPackage;
  selected: boolean;
  onSelect: () => void;
}

/** Card displaying a RevenueCat package. */
const PackageCard = ({ pkg, selected, onSelect }: PackageCardProps) => {
  const { colors, borderRadius, shadows, typography } = useTheme();
  const product = pkg.product;

  return (
    <TouchableOpacity
      onPress={onSelect}
      activeOpacity={0.8}
      style={[
        styles.planCard,
        {
          backgroundColor: colors.surface,
          borderRadius: borderRadius.lg,
          borderWidth: selected ? 2 : 1,
          borderColor: selected ? colors.primary : colors.border,
          ...(selected ? shadows.md : shadows.sm),
        },
      ]}
    >
      <View style={styles.planHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[typography.headline, { color: colors.text, fontWeight: '700' }]}>
            {product.title}
          </Text>
          <Text style={[typography.footnote, { color: colors.textSecondary }]}>
            {product.description}
          </Text>
        </View>
        <View style={styles.priceBox}>
          <Text style={[styles.price, { color: colors.primary }]}>{product.priceString}</Text>
          {pkg.packageType === 'MONTHLY' && (
            <Text style={[typography.caption1, { color: colors.textSecondary }]}>per month</Text>
          )}
          {pkg.packageType === 'LIFETIME' && (
            <Text style={[typography.caption1, { color: colors.textSecondary }]}>one-time</Text>
          )}
        </View>
      </View>

      {selected && (
        <View style={[styles.selectedDot, { backgroundColor: colors.primary }]} />
      )}
    </TouchableOpacity>
  );
};

interface FallbackPlanCardProps {
  plan: (typeof SUBSCRIPTION_PLANS)[number];
  selected: boolean;
  onSelect: () => void;
}

/** Fallback card for when RevenueCat offerings are unavailable. */
const FallbackPlanCard = ({ plan, selected, onSelect }: FallbackPlanCardProps) => {
  const { colors, borderRadius, shadows, typography } = useTheme();

  return (
    <TouchableOpacity
      onPress={onSelect}
      activeOpacity={0.8}
      style={[
        styles.planCard,
        {
          backgroundColor: colors.surface,
          borderRadius: borderRadius.lg,
          borderWidth: selected ? 2 : 1,
          borderColor: selected ? colors.primary : colors.border,
          ...(selected ? shadows.md : shadows.sm),
        },
      ]}
    >
      {plan.isMostPopular && (
        <View style={[styles.popularBadge, { backgroundColor: colors.primary }]}>
          <Text style={styles.popularText}>⭐ Most Popular</Text>
        </View>
      )}
      <View style={styles.planHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[typography.headline, { color: colors.text, fontWeight: '700' }]}>
            {plan.name}
          </Text>
          <Text style={[typography.footnote, { color: colors.textSecondary }]}>
            {plan.description}
          </Text>
        </View>
        <View style={styles.priceBox}>
          <Text style={[styles.price, { color: colors.primary }]}>{plan.price}</Text>
          {plan.period === 'monthly' && (
            <Text style={[typography.caption1, { color: colors.textSecondary }]}>per month</Text>
          )}
          {plan.period === 'lifetime' && (
            <Text style={[typography.caption1, { color: colors.textSecondary }]}>one-time</Text>
          )}
        </View>
      </View>

      <View style={styles.featureList}>
        {plan.features.map((f) => (
          <View key={f} style={styles.featureRow}>
            <Text style={styles.check}>✅</Text>
            <Text style={[typography.footnote, { color: colors.text }]}>{f}</Text>
          </View>
        ))}
      </View>

      {selected && (
        <View style={[styles.selectedDot, { backgroundColor: colors.primary }]} />
      )}
    </TouchableOpacity>
  );
};

/** Paywall screen showing RevenueCat offerings or fallback plans. */
export const PaywallScreen = () => {
  const { colors, typography, borderRadius, shadows, spacing } = useTheme();
  const navigation = useNavigation<PaywallNavProp>();
  const { purchase, restore, loading, offerings } = useSubscription();

  // RevenueCat packages from the current offering
  const packages = offerings?.current?.availablePackages ?? [];
  const hasRevenueCatPackages = packages.length > 0;

  // Track selection
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedFallbackPlanId, setSelectedFallbackPlanId] = useState('premium_monthly');

  const paidPlans = SUBSCRIPTION_PLANS.filter((p) => p.tier !== 'free');

  const handlePurchase = async () => {
    if (!hasRevenueCatPackages) {
      Alert.alert(
        'Purchases unavailable',
        'In-app purchases are not configured yet. Please try again later.',
      );
      return;
    }

    const selectedPkg = packages[selectedIndex];
    if (!selectedPkg) return;

    try {
      await purchase(selectedPkg);
      Alert.alert('🎉 Welcome to Premium!', 'Your plants deserve the best. Enjoy all features!', [
        { text: 'Let\'s go!', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('Purchase failed', 'Something went wrong. Please try again.');
    }
  };

  const handleRestore = async () => {
    try {
      await restore();
      Alert.alert('Purchases restored', 'Your previous purchases have been restored.');
    } catch {
      Alert.alert('Restore failed', 'Could not restore purchases. Please try again.');
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      {/* Close button */}
      <TouchableOpacity
        style={[styles.closeBtn, { backgroundColor: `${colors.text}15` }]}
        onPress={() => navigation.goBack()}
        hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
      >
        <Text style={[styles.closeIcon, { color: colors.text }]}>✕</Text>
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingHorizontal: spacing.lg }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero header */}
        <Animated.View entering={FadeInDown.delay(0).duration(500)} style={styles.hero}>
          <View
            style={[
              styles.heroGradient,
              { backgroundColor: `${colors.primary}18`, borderRadius: borderRadius.xl },
            ]}
          >
            <Text style={styles.heroEmoji}>🌱</Text>
            <Text style={[styles.heroTitle, typography.title1, { color: colors.text }]}>
              Unlock your inner{'\n'}plant parent
            </Text>
            <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center' }]}>
              Your plants deserve the best 🌱
            </Text>
          </View>
        </Animated.View>

        {/* Feature comparison */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <View
            style={[
              styles.comparisonCard,
              {
                backgroundColor: colors.surface,
                borderRadius: borderRadius.lg,
                ...shadows.sm,
              },
            ]}
          >
            <View style={styles.comparisonHeader}>
              <Text style={[typography.footnote, { color: colors.textSecondary, flex: 1 }]}>
                Feature
              </Text>
              <Text style={[typography.footnote, { color: colors.textSecondary, width: 48, textAlign: 'center' }]}>
                Free
              </Text>
              <Text style={[typography.footnote, { color: colors.primary, width: 56, textAlign: 'center', fontWeight: '700' }]}>
                Pro
              </Text>
            </View>
            {ALL_FEATURES.map((feat) => (
              <View key={feat.key} style={[styles.comparisonRow, { borderTopColor: colors.border }]}>
                <Text style={[typography.footnote, { color: colors.text, flex: 1 }]}>
                  {feat.label}
                </Text>
                <Text style={[styles.checkCell, { width: 48 }]}>
                  {feat.free ? '✅' : '❌'}
                </Text>
                <Text style={[styles.checkCell, { width: 56 }]}>✅</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Plan/Package cards */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.plansSection}>
          <Text style={[typography.headline, { color: colors.text, fontWeight: '700', marginBottom: 12 }]}>
            Choose your plan
          </Text>

          {hasRevenueCatPackages
            ? packages.map((pkg, index) => (
                <PackageCard
                  key={pkg.identifier}
                  pkg={pkg}
                  selected={selectedIndex === index}
                  onSelect={() => setSelectedIndex(index)}
                />
              ))
            : paidPlans.map((plan) => (
                <FallbackPlanCard
                  key={plan.id}
                  plan={plan}
                  selected={selectedFallbackPlanId === plan.id}
                  onSelect={() => setSelectedFallbackPlanId(plan.id)}
                />
              ))}
        </Animated.View>

        {/* CTA */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.ctaSection}>
          <Button
            title="🌱 Go Premium"
            onPress={handlePurchase}
            loading={loading}
            fullWidth
            size="lg"
          />
          <Text style={[styles.ctaSubtext, { color: colors.textSecondary }]}>
            Cancel anytime. No hidden fees.
          </Text>
        </Animated.View>

        {/* Restore link */}
        <TouchableOpacity onPress={handleRestore} style={styles.restoreLink}>
          <Text style={[typography.footnote, { color: colors.textSecondary }]}>
            Restore purchases
          </Text>
        </TouchableOpacity>

        <Text style={[styles.legalText, { color: colors.textSecondary }]}>
          Prices are in EUR. Subscriptions auto-renew unless cancelled.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  closeBtn: {
    position: 'absolute',
    top: 56,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  closeIcon: { fontSize: 14, fontWeight: '600' },
  scroll: { paddingTop: 24, paddingBottom: 48, gap: 20 },
  hero: {},
  heroGradient: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    gap: 10,
  },
  heroEmoji: { fontSize: 56 },
  heroTitle: {
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 34,
  },
  comparisonCard: { overflow: 'hidden' },
  comparisonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  checkCell: { textAlign: 'center', fontSize: 14 },
  plansSection: { gap: 12 },
  planCard: {
    padding: 16,
    gap: 12,
    overflow: 'hidden',
  },
  popularBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 4,
  },
  popularText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  priceBox: { alignItems: 'flex-end' },
  price: { fontSize: 20, fontWeight: '800' },
  featureList: { gap: 6 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  check: { fontSize: 14 },
  selectedDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  ctaSection: { gap: 8 },
  ctaSubtext: { textAlign: 'center', fontSize: 12 },
  restoreLink: { alignItems: 'center', paddingVertical: 4 },
  legalText: { fontSize: 11, textAlign: 'center' },
});
