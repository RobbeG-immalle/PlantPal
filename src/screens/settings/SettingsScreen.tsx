import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../stores/authStore';
import { useHouseholdStore } from '../../stores/householdStore';
import { useSubscriptionStore } from '../../stores/subscriptionStore';
import { useSubscription } from '../../hooks/useSubscription';
import { Button } from '../../components/Button';
import { APP_VERSION } from '../../utils/constants';
import { SUBSCRIPTION_PLANS } from '../../utils/subscriptionConfig';
import { RootStackParamList } from '../../types/navigation';

type SettingsNavProp = NativeStackNavigationProp<RootStackParamList>;

interface SettingsRowProps {
  label: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  destructive?: boolean;
}

const SettingsRow = ({
  label,
  value,
  onPress,
  rightElement,
  destructive = false,
}: SettingsRowProps) => {
  const { colors, typography } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={[styles.row, { borderBottomColor: colors.border }]}
    >
      <Text
        style={[
          typography.body,
          { color: destructive ? colors.danger : colors.text },
        ]}
      >
        {label}
      </Text>
      <View style={styles.rowRight}>
        {value && (
          <Text style={[typography.body, { color: colors.textSecondary }]}>{value}</Text>
        )}
        {rightElement}
        {onPress && !rightElement && (
          <Text style={{ color: colors.textSecondary, fontSize: 18 }}>›</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

/** Settings screen with profile info, theme toggle, and sign out. */
export const SettingsScreen = () => {
  const { colors, typography, borderRadius, shadows, isDark, toggleTheme } = useTheme();
  const { signOut } = useAuth();
  const { userProfile } = useAuthStore();
  const { household } = useHouseholdStore();
  const { subscription } = useSubscriptionStore();
  const { restore } = useSubscription();
  const navigation = useNavigation<SettingsNavProp>();

  const currentPlan = SUBSCRIPTION_PLANS.find((p) => p.tier === subscription.tier);

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: signOut,
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, typography.title1, { color: colors.text }]}>
          ⚙️ Settings
        </Text>

        {/* Profile section */}
        <View
          style={[
            styles.section,
            {
              backgroundColor: colors.surface,
              borderRadius: borderRadius.lg,
              ...shadows.sm,
            },
          ]}
        >
          <View style={styles.profileHeader}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: `${colors.primary}25` },
              ]}
            >
              <Text style={styles.avatarText}>
                {userProfile?.displayName?.[0]?.toUpperCase() ?? '?'}
              </Text>
            </View>
            <View>
              <Text
                style={[typography.headline, { color: colors.text, fontWeight: '700' }]}
              >
                {userProfile?.displayName ?? 'Plant Parent'}
              </Text>
              <Text style={[typography.footnote, { color: colors.textSecondary }]}>
                {userProfile?.email}
              </Text>
            </View>
          </View>
        </View>

        {/* Household section */}
        <View
          style={[
            styles.section,
            {
              backgroundColor: colors.surface,
              borderRadius: borderRadius.lg,
              ...shadows.sm,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, typography.footnote, { color: colors.textSecondary }]}>
            HOUSEHOLD
          </Text>
          <SettingsRow
            label="Current household"
            value={household?.name ?? 'Not joined'}
          />
          {household && (
            <SettingsRow
              label="Invite code"
              value={household.inviteCode}
            />
          )}
        </View>

        {/* Subscription */}
        <View
          style={[
            styles.section,
            {
              backgroundColor: colors.surface,
              borderRadius: borderRadius.lg,
              ...shadows.sm,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, typography.footnote, { color: colors.textSecondary }]}>
            SUBSCRIPTION
          </Text>
          <SettingsRow
            label="Current plan"
            value={
              subscription.tier === 'free'
                ? `${currentPlan?.name ?? 'Seedling'} (Free)`
                : `${currentPlan?.name ?? 'Premium'} 💎`
            }
            onPress={subscription.tier === 'free' ? () => navigation.navigate('Paywall', { source: 'settings' }) : undefined}
            rightElement={
              subscription.tier === 'free' ? (
                <Text style={[typography.footnote, { color: colors.primary, fontWeight: '600' }]}>
                  Upgrade →
                </Text>
              ) : (
                <Text style={[typography.footnote, { color: colors.primary }]}>Active</Text>
              )
            }
          />
          {subscription.tier === 'free' && (
            <SettingsRow
              label="Go Premium"
              onPress={() => navigation.navigate('Paywall', { source: 'settings' })}
            />
          )}
          <SettingsRow
            label="Restore purchases"
            onPress={async () => {
              await restore();
              Alert.alert('Restored', 'Your purchases have been restored.');
            }}
          />
        </View>

        {/* Appearance */}
        <View
          style={[
            styles.section,
            {
              backgroundColor: colors.surface,
              borderRadius: borderRadius.lg,
              ...shadows.sm,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, typography.footnote, { color: colors.textSecondary }]}>
            APPEARANCE
          </Text>
          <SettingsRow
            label="Dark mode"
            rightElement={
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            }
          />
        </View>

        {/* App info */}
        <View
          style={[
            styles.section,
            {
              backgroundColor: colors.surface,
              borderRadius: borderRadius.lg,
              ...shadows.sm,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, typography.footnote, { color: colors.textSecondary }]}>
            APP
          </Text>
          <SettingsRow label="Version" value={APP_VERSION} />
          <SettingsRow label="Built with 💚 for plant lovers" />
        </View>

        {/* Sign out */}
        <View
          style={[
            styles.section,
            {
              backgroundColor: colors.surface,
              borderRadius: borderRadius.lg,
              ...shadows.sm,
            },
          ]}
        >
          <SettingsRow label="Sign out" onPress={handleSignOut} destructive />
        </View>

        <Text style={[styles.footer, { color: colors.textSecondary }]}>
          🌱 PlantPal v{APP_VERSION} – Keep your plants happy!
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 24, paddingBottom: 48, gap: 16 },
  title: { fontWeight: '700', marginBottom: 8 },
  section: { overflow: 'hidden' },
  sectionTitle: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 22, fontWeight: '700' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footer: {
    textAlign: 'center',
    fontSize: 13,
    marginTop: 8,
  },
});
