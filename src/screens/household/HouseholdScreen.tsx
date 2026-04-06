import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Clipboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useTheme } from '../../theme/ThemeContext';
import { useHousehold } from '../../hooks/useHousehold';
import { useAuthStore } from '../../stores/authStore';
import { useSubscriptionStore } from '../../stores/subscriptionStore';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { MainTabParamList, HouseholdStackParamList, RootStackParamList } from '../../types/navigation';

type HouseholdNavProp = CompositeNavigationProp<
  CompositeNavigationProp<
    NativeStackNavigationProp<HouseholdStackParamList, 'HouseholdMain'>,
    BottomTabNavigationProp<MainTabParamList>
  >,
  NativeStackNavigationProp<RootStackParamList>
>;

/** Screen for managing a household – create, view, invite members. */
export const HouseholdScreen = () => {
  const { colors, typography, borderRadius, shadows, spacing } = useTheme();
  const { household, members, loading, error, fetchHousehold, createHousehold, leaveHousehold } =
    useHousehold();
  const { userProfile } = useAuthStore();
  const { featureAccess } = useSubscriptionStore();
  const navigation = useNavigation<HouseholdNavProp>();

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [householdName, setHouseholdName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchHousehold();
  }, [fetchHousehold, userProfile?.householdId]);

  const handleCreate = async () => {
    if (!householdName.trim()) {
      Alert.alert('Error', 'Please enter a household name.');
      return;
    }
    setCreating(true);
    try {
      await createHousehold(householdName.trim());
      setCreateModalVisible(false);
      setHouseholdName('');
    } catch {
      Alert.alert('Error', 'Failed to create household.');
    } finally {
      setCreating(false);
    }
  };

  const handleLeave = () => {
    Alert.alert(
      'Leave household?',
      'You will no longer have access to the shared plants. You can rejoin with the invite code.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            await leaveHousehold();
          },
        },
      ],
    );
  };

  const copyInviteCode = () => {
    if (household?.inviteCode) {
      Clipboard.setString(household.inviteCode);
      Alert.alert('Copied!', 'Invite code copied to clipboard.');
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading household..." />;
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, typography.title1, { color: colors.text }]}>
          🏡 Household
        </Text>

        {error && (
          <View style={[styles.errorBanner, { backgroundColor: `${colors.danger}15` }]}>
            <Text style={{ color: colors.danger, fontSize: 14 }}>{error}</Text>
          </View>
        )}

        {!household ? (
          // No household state
          <View style={styles.noHousehold}>
            <Text style={{ fontSize: 64, textAlign: 'center', marginBottom: 16 }}>🏠</Text>
            <Text
              style={[styles.noHouseholdTitle, typography.title2, { color: colors.text }]}
            >
              No household yet
            </Text>
            <Text
              style={[styles.noHouseholdSub, typography.body, { color: colors.textSecondary }]}
            >
              Create a new household or join one with an invite code to start managing plants together!
            </Text>

            <Button
              title="🏡 Create household"
              onPress={() => {
                if (!featureAccess.householdSharing) {
                  navigation.navigate('Paywall', { source: 'household' });
                } else {
                  setCreateModalVisible(true);
                }
              }}
              fullWidth
              size="lg"
              style={styles.createBtn}
            />
            <Button
              title="🔑 Join with invite code"
              onPress={() => {
                if (!featureAccess.householdSharing) {
                  navigation.navigate('Paywall', { source: 'household' });
                } else {
                  navigation.navigate('JoinHousehold');
                }
              }}
              variant="outline"
              fullWidth
              size="lg"
            />
          </View>
        ) : (
          // Household info
          <>
            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.surface,
                  borderRadius: borderRadius.lg,
                  ...shadows.md,
                },
              ]}
            >
              <Text style={[styles.householdName, typography.title2, { color: colors.text }]}>
                {household.name}
              </Text>
              <Text style={[styles.memberCount, { color: colors.textSecondary }]}>
                {members.length} {members.length === 1 ? 'member' : 'members'}
              </Text>
            </View>

            {/* Invite code */}
            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.surface,
                  borderRadius: borderRadius.lg,
                  ...shadows.sm,
                },
              ]}
            >
              <Text style={[styles.sectionLabel, typography.headline, { color: colors.text }]}>
                🔑 Invite code
              </Text>
              <TouchableOpacity
                onPress={copyInviteCode}
                style={[
                  styles.inviteCodeBox,
                  { backgroundColor: `${colors.primary}15`, borderRadius: borderRadius.md },
                ]}
                activeOpacity={0.7}
              >
                <Text style={[styles.inviteCode, { color: colors.primary }]}>
                  {household.inviteCode}
                </Text>
              </TouchableOpacity>
              <Text style={[styles.tapToCopy, { color: colors.textSecondary }]}>
                Tap to copy • Share with housemates to let them join
              </Text>
            </View>

            {/* Members */}
            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.surface,
                  borderRadius: borderRadius.lg,
                  ...shadows.sm,
                },
              ]}
            >
              <Text style={[styles.sectionLabel, typography.headline, { color: colors.text }]}>
                👥 Members
              </Text>
              {members.map((member) => (
                <View key={member.id} style={styles.memberRow}>
                  <View
                    style={[styles.avatar, { backgroundColor: `${colors.primary}25` }]}
                  >
                    <Text style={{ fontSize: 18 }}>
                      {member.displayName?.[0]?.toUpperCase() ?? '?'}
                    </Text>
                  </View>
                  <View>
                    <Text style={[typography.callout, { color: colors.text, fontWeight: '600' }]}>
                      {member.displayName}
                      {member.id === household.createdBy ? ' 👑' : ''}
                    </Text>
                    <Text style={[typography.footnote, { color: colors.textSecondary }]}>
                      {member.email}
                    </Text>
                  </View>
                </View>
              ))}

              <Button
                title="🔑 Invite more people"
                onPress={copyInviteCode}
                variant="ghost"
                size="sm"
                style={styles.inviteMoreBtn}
              />
            </View>

            <Button
              title="Leave household"
              onPress={handleLeave}
              variant="danger"
              fullWidth
              style={styles.leaveBtn}
            />
          </>
        )}
      </ScrollView>

      {/* Create Household Modal */}
      <Modal
        visible={createModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <SafeAreaView style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[typography.title2, { color: colors.text }]}>New household</Text>
            <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
              <Text style={{ fontSize: 24, color: colors.textSecondary }}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Household name</Text>
            <TextInput
              value={householdName}
              onChangeText={setHouseholdName}
              placeholder="E.g. The Green Apartment"
              placeholderTextColor={colors.textSecondary}
              style={[
                styles.textInput,
                { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface },
              ]}
              autoFocus
            />
            <Button
              title="Create"
              onPress={handleCreate}
              loading={creating}
              fullWidth
              size="lg"
            />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 24, paddingBottom: 48, gap: 16 },
  title: { fontWeight: '700', marginBottom: 8 },
  errorBanner: { borderRadius: 12, padding: 12 },
  noHousehold: { alignItems: 'center', paddingTop: 24, gap: 12 },
  noHouseholdTitle: { fontWeight: '700', textAlign: 'center' },
  noHouseholdSub: { textAlign: 'center', lineHeight: 24 },
  createBtn: { marginTop: 8 },
  card: { padding: 16, gap: 8 },
  householdName: { fontWeight: '700' },
  memberCount: { fontSize: 14 },
  sectionLabel: { marginBottom: 8 },
  inviteCodeBox: { padding: 16, alignItems: 'center' },
  inviteCode: { fontSize: 28, fontWeight: '700', letterSpacing: 4 },
  tapToCopy: { fontSize: 12, textAlign: 'center' },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inviteMoreBtn: { marginTop: 8, alignSelf: 'center' },
  leaveBtn: { marginTop: 8 },
  modal: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: { paddingHorizontal: 20, gap: 12 },
  inputLabel: { fontWeight: '600', fontSize: 15, marginBottom: 4 },
  textInput: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 8,
  },
});
