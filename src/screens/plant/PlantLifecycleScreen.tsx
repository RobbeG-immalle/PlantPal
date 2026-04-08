import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../theme/ThemeContext';
import { EmptyState } from '../../components/EmptyState';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { addGrowthEntry, getGrowthEntries } from '../../services/plantService';
import { formatDate } from '../../utils/wateringUtils';
import { GrowthEntry } from '../../types/plant';
import { HomeStackParamList } from '../../types/navigation';

type LifecycleRouteProp = RouteProp<HomeStackParamList, 'PlantLifecycle'>;
type LifecycleNavProp = NativeStackNavigationProp<HomeStackParamList, 'PlantLifecycle'>;

/** Premium screen showing a plant's photo-based growth timeline. */
export const PlantLifecycleScreen = () => {
  const { colors, typography, borderRadius, shadows, spacing } = useTheme();
  const navigation = useNavigation<LifecycleNavProp>();
  const route = useRoute<LifecycleRouteProp>();
  const { plantId } = route.params;

  const [entries, setEntries] = useState<GrowthEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [addingNote, setAddingNote] = useState(false);
  const [pendingUri, setPendingUri] = useState<string | null>(null);
  const [note, setNote] = useState('');

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getGrowthEntries(plantId);
      setEntries(data);
    } catch {
      Alert.alert('Error', 'Failed to load growth timeline.');
    } finally {
      setLoading(false);
    }
  }, [plantId]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow access to your photo library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (!result.canceled && result.assets.length > 0) {
      setPendingUri(result.assets[0].uri);
      setNote('');
      setAddingNote(true);
    }
  };

  const handleUpload = async () => {
    if (!pendingUri) return;
    setAddingNote(false);
    setUploading(true);
    try {
      // householdId is embedded in the plant but we only have plantId here;
      // pass plantId as the folder key so paths remain unique.
      await addGrowthEntry(plantId, plantId, pendingUri, note.trim());
      setPendingUri(null);
      setNote('');
      await fetchEntries();
    } catch {
      Alert.alert('Error', 'Failed to save growth photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleCancelNote = () => {
    setPendingUri(null);
    setNote('');
    setAddingNote(false);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: spacing.md, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={[styles.backArrow, { color: colors.primary }]}>‹</Text>
        </TouchableOpacity>
        <Text style={[typography.title2, styles.headerTitle, { color: colors.text }]}>
          🌱 Growth Timeline
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Note + preview modal */}
      {addingNote && pendingUri && (
        <View style={[styles.noteOverlay, { backgroundColor: colors.background }]}>
          <Image source={{ uri: pendingUri }} style={styles.previewImage} resizeMode="cover" />
          <View style={[styles.noteForm, { paddingHorizontal: spacing.md }]}>
            <Text style={[typography.headline, { color: colors.text, marginBottom: 8 }]}>
              Add a note (optional)
            </Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="e.g. First signs of new leaf! 🍃"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
              style={[
                styles.noteInput,
                {
                  color: colors.text,
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                  borderRadius: borderRadius.md,
                },
              ]}
            />
            <View style={styles.noteActions}>
              <Button
                title="Cancel"
                onPress={handleCancelNote}
                variant="outline"
                style={styles.noteBtn}
              />
              <Button
                title="Save photo"
                onPress={handleUpload}
                style={styles.noteBtn}
              />
            </View>
          </View>
        </View>
      )}

      {/* Upload progress */}
      {uploading && (
        <View style={[styles.uploadingBanner, { backgroundColor: `${colors.primary}15` }]}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[typography.subheadline, { color: colors.primary, marginLeft: 8 }]}>
            Saving growth photo…
          </Text>
        </View>
      )}

      {loading ? (
        <LoadingSpinner message="Loading timeline…" />
      ) : entries.length === 0 ? (
        <EmptyState
          emoji="📷"
          title="No growth photos yet"
          subtitle="Capture your plant's first milestone! Add a photo to start tracking its journey over time."
          actionLabel="Add first photo"
          onAction={handlePickImage}
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.list, { paddingHorizontal: spacing.md }]}
        >
          {entries.map((entry, index) => (
            <View
              key={entry.id}
              style={[
                styles.entryCard,
                { backgroundColor: colors.surface, borderRadius: borderRadius.lg, ...shadows.sm },
              ]}
            >
              {/* Timeline dot + line */}
              <View style={styles.timelineColumn}>
                <View style={[styles.dot, { backgroundColor: colors.primary }]} />
                {index < entries.length - 1 && (
                  <View style={[styles.line, { backgroundColor: colors.border }]} />
                )}
              </View>

              <View style={styles.entryContent}>
                <Image
                  source={{ uri: entry.imageUrl }}
                  style={[styles.entryImage, { borderRadius: borderRadius.md }]}
                  resizeMode="cover"
                />
                <View style={styles.entryMeta}>
                  <Text style={[typography.subheadline, { color: colors.textSecondary }]}>
                    {formatDate(entry.capturedAt)}
                  </Text>
                  {entry.note ? (
                    <Text style={[typography.body, { color: colors.text, marginTop: 4 }]}>
                      {entry.note}
                    </Text>
                  ) : null}
                </View>
              </View>
            </View>
          ))}

          <Button
            title="📷 Add growth photo"
            onPress={handlePickImage}
            variant="outline"
            fullWidth
            style={styles.addButton}
          />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: { padding: 4, minWidth: 40 },
  backArrow: { fontSize: 32, lineHeight: 36, fontWeight: '300' },
  headerTitle: { flex: 1, textAlign: 'center', fontWeight: '700' },
  headerSpacer: { minWidth: 40 },
  uploadingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  list: {
    paddingTop: 24,
    paddingBottom: 48,
    gap: 4,
  },
  entryCard: {
    flexDirection: 'row',
    marginBottom: 20,
    overflow: 'visible',
  },
  timelineColumn: {
    width: 28,
    alignItems: 'center',
    paddingTop: 12,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    zIndex: 1,
  },
  line: {
    flex: 1,
    width: 2,
    marginTop: 4,
  },
  entryContent: {
    flex: 1,
    marginLeft: 8,
    gap: 8,
  },
  entryImage: {
    width: '100%',
    height: 200,
  },
  entryMeta: {
    paddingHorizontal: 4,
    paddingBottom: 8,
  },
  noteOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  previewImage: {
    width: '100%',
    height: 260,
  },
  noteForm: {
    paddingTop: 20,
    gap: 12,
  },
  noteInput: {
    borderWidth: 1.5,
    padding: 14,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  noteActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  noteBtn: { flex: 1 },
  addButton: { marginTop: 8 },
});
