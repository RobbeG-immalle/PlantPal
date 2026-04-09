import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { useHousehold } from '../../hooks/useHousehold';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';

/** Screen for entering an invite code to join a household. */
export const JoinHouseholdScreen = () => {
  const { colors, typography } = useTheme();
  const { joinHousehold, loading, error } = useHousehold();
  const [inviteCode, setInviteCode] = useState('');

  const handleJoin = async () => {
    if (!inviteCode.trim() || inviteCode.trim().length < 6) {
      Alert.alert('Invalid code', 'Please enter a valid invite code.');
      return;
    }

    try {
      await joinHousehold(inviteCode.trim());
      Alert.alert('🎉 Joined!', 'You are now part of the household!');
    } catch {
      // Error handled by hook
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View style={styles.content}>
          <Text style={{ fontSize: 64, textAlign: 'center', marginBottom: 16 }}>🔑</Text>
          <Text style={[styles.title, typography.title1, { color: colors.text }]}>
            Join a household
          </Text>
          <Text style={[styles.subtitle, typography.body, { color: colors.textSecondary }]}>
            Enter the invite code shared by your housemate.
          </Text>

          {error && (
            <View style={[styles.errorBanner, { backgroundColor: `${colors.danger}15` }]}>
              <Text style={{ color: colors.danger, fontSize: 14, textAlign: 'center' }}>
                {error}
              </Text>
            </View>
          )}

          <Input
            label="Invite code"
            value={inviteCode}
            onChangeText={(t) => setInviteCode(t.toUpperCase())}
            autoCapitalize="characters"
            placeholder="E.g. ABCD1234"
            style={styles.codeInput}
          />

          <Button
            title={loading ? 'Joining...' : 'Join household'}
            onPress={handleJoin}
            loading={loading}
            fullWidth
            size="lg"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  content: {
    flex: 1,
    padding: 24,
    gap: 12,
    justifyContent: 'center',
  },
  title: { fontWeight: '700', textAlign: 'center' },
  subtitle: { textAlign: 'center', lineHeight: 24, marginBottom: 16 },
  errorBanner: { borderRadius: 12, padding: 12, marginBottom: 8 },
  codeInput: { letterSpacing: 4 },
});
