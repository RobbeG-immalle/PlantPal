import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../stores/authStore';
import { useHouseholdStore } from '../../stores/householdStore';
import { Button } from '../../components/Button';
import { APP_VERSION } from '../../utils/constants';

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
