import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { Timestamp } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { useAuthStore } from '../../stores/authStore';
import { usePlants } from '../../hooks/usePlants';
import { useSubscriptionStore } from '../../stores/subscriptionStore';
import { identifyPlant } from '../../services/plantRecognitionService';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { PlantIdentificationResult } from '../../types/plant';
import { RootStackParamList } from '../../types/navigation';

type AddPlantNavProp = NativeStackNavigationProp<RootStackParamList>;

/** Screen for adding a new plant via camera or gallery + AI identification. */
export const AddPlantScreen = () => {
  const { colors, typography, borderRadius, shadows } = useTheme();
  const { userProfile } = useAuthStore();
  const { addPlant } = usePlants();
  const { featureAccess } = useSubscriptionStore();
  const navigation = useNavigation<AddPlantNavProp>();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [identifying, setIdentifying] = useState(false);
  const [identified, setIdentified] = useState<PlantIdentificationResult | null>(null);
  const [plantName, setPlantName] = useState('');
  const [wateringDays, setWateringDays] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handlePickImage = async (useCamera: boolean) => {
    const permission = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Permission Required',
        `Please allow ${useCamera ? 'camera' : 'photo library'} access to add plants.`,
      );
      return;
    }

    const result = useCamera
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8,
          aspect: [4, 3],
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8,
          aspect: [4, 3],
        });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      setIdentified(null);
      // AI recognition is a premium feature
      if (featureAccess.aiRecognition) {
        await handleIdentify(uri);
      }
    }
  };

  const handleIdentify = async (uri: string) => {
    setIdentifying(true);
    try {
      const result = await identifyPlant(uri);
      setIdentified(result);
      setWateringDays(String(result.suggestedWateringDays));
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert(
        'Could not identify plant',
        error instanceof Error ? error.message : 'Please try a clearer photo.',
      );
    } finally {
      setIdentifying(false);
    }
  };

  const handleSave = async () => {
    if (!userProfile?.householdId) {
      Alert.alert('No household', 'Please join or create a household first.');
      return;
    }
    if (!imageUri) {
      Alert.alert('Missing photo', 'Please take or upload a photo of your plant.');
      return;
    }
    if (!plantName.trim()) {
      Alert.alert('Missing name', 'Please give your plant a name!');
      return;
    }

    const interval = parseInt(wateringDays, 10);
    if (!interval || interval < 1) {
      Alert.alert('Invalid interval', 'Please enter a valid watering interval (1+ days).');
      return;
    }

    setSaving(true);
    try {
      await addPlant({
        name: plantName.trim(),
        species: identified?.species ?? 'Unknown species',
        commonName: identified?.commonName ?? 'Unknown plant',
        imageUrl: imageUri,
        wateringIntervalDays: interval,
        lastWateredAt: Timestamp.now(),
        notes: notes.trim(),
        householdId: userProfile.householdId,
        addedBy: userProfile.id,
        confidence: identified?.confidence ?? 0,
      });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Reset form
      setImageUri(null);
      setIdentified(null);
      setPlantName('');
      setWateringDays('');
      setNotes('');

      Alert.alert('🌱 Plant added!', `${plantName} is now part of your household!`);
    } catch {
      Alert.alert('Error', 'Failed to save plant. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.title, typography.title1, { color: colors.text }]}>
            Add a plant 🌿
          </Text>
          <Text style={[styles.subtitle, typography.body, { color: colors.textSecondary }]}>
            Take a photo and we'll identify it for you.
          </Text>

          {/* Image area */}
          {imageUri ? (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: imageUri }}
                style={[styles.image, { borderRadius: borderRadius.lg }]}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={[styles.retakeBtn, { backgroundColor: colors.surface, ...shadows.sm }]}
                onPress={() => handlePickImage(false)}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 13, color: colors.text, fontWeight: '600' }}>
                  📷 Retake
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View
              style={[
                styles.photoPlaceholder,
                {
                  borderColor: colors.border,
                  borderRadius: borderRadius.lg,
                  backgroundColor: colors.surface,
                },
              ]}
            >
              <Text style={styles.placeholderEmoji}>📸</Text>
              <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
                Add a photo of your plant
              </Text>
            </View>
          )}

          <View style={styles.photoButtons}>
            <Button
              title="📷 Take photo"
              onPress={() => handlePickImage(true)}
              variant="outline"
              style={styles.photoBtn}
            />
            <Button
              title="🖼 Upload"
              onPress={() => handlePickImage(false)}
              variant="outline"
              style={styles.photoBtn}
            />
          </View>

          {/* Upgrade prompt for free users */}
          {!featureAccess.aiRecognition && (
            <TouchableOpacity
              onPress={() => navigation.navigate('Paywall', { source: 'ai_recognition' })}
              style={[
                styles.upgradePrompt,
                { backgroundColor: `${colors.accent}20`, borderRadius: borderRadius.md },
              ]}
            >
              <Text style={[typography.footnote, { color: colors.text }]}>
                🔒 Upgrade to identify plants automatically
              </Text>
              <Text style={[typography.caption1, { color: colors.textSecondary }]}>
                Tap to unlock AI plant recognition →
              </Text>
            </TouchableOpacity>
          )}

          {/* Identification result */}
          {identifying && (
            <LoadingSpinner message="Identifying your plant... 🔍" />
          )}

          {identified && !identifying && (
            <View
              style={[
                styles.identifiedCard,
                {
                  backgroundColor: colors.surface,
                  borderRadius: borderRadius.lg,
                  ...shadows.sm,
                },
              ]}
            >
              <Text style={[styles.identifiedTitle, { color: colors.text }]}>
                ✅ Plant identified!
              </Text>
              <Text style={[styles.speciesText, typography.headline, { color: colors.text }]}>
                {identified.commonName}
              </Text>
              <Text style={[styles.scientificText, { color: colors.textSecondary }]}>
                {identified.species}
              </Text>
              <Text style={[styles.confidenceText, { color: colors.primary }]}>
                {Math.round(identified.confidence * 100)}% confidence
              </Text>
            </View>
          )}

          {/* Plant details form */}
          {(identified || imageUri) && (
            <View style={styles.form}>
              <Input
                label="Give your plant a name 🌱"
                value={plantName}
                onChangeText={setPlantName}
                placeholder="E.g. Barry, Fernando, Greg..."
                autoCapitalize="words"
              />
              <Input
                label="Water every (days)"
                value={wateringDays}
                onChangeText={setWateringDays}
                keyboardType="number-pad"
                placeholder={identified ? String(identified.suggestedWateringDays) : '7'}
                hint={identified ? `Suggested for ${identified.commonName}: every ${identified.suggestedWateringDays} days` : undefined}
              />
              <Input
                label="Notes (optional)"
                value={notes}
                onChangeText={setNotes}
                placeholder="Any special care instructions..."
                multiline
                numberOfLines={3}
                style={{ height: 80, textAlignVertical: 'top' }}
              />

              <Button
                title={saving ? 'Saving...' : '🌿 Add to my plants'}
                onPress={handleSave}
                loading={saving}
                fullWidth
                size="lg"
              />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: {
    padding: 24,
    paddingBottom: 48,
  },
  title: { fontWeight: '700', marginBottom: 8 },
  subtitle: { marginBottom: 24 },
  imageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 240,
  },
  retakeBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  photoPlaceholder: {
    height: 200,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 8,
  },
  placeholderEmoji: { fontSize: 48 },
  placeholderText: { fontSize: 15 },
  photoButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  photoBtn: { flex: 1 },
  upgradePrompt: {
    padding: 12,
    gap: 4,
    marginBottom: 8,
  },
  identifiedCard: {
    padding: 16,
    marginBottom: 24,
    gap: 4,
  },
  identifiedTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  speciesText: { fontWeight: '700' },
  scientificText: { fontStyle: 'italic', fontSize: 14 },
  confidenceText: { fontSize: 13, fontWeight: '600' },
  form: { gap: 4 },
});
