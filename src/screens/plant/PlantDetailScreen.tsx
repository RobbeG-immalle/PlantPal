import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme/ThemeContext';
import { usePlants } from '../../hooks/usePlants';
import { usePlantStore } from '../../stores/plantStore';
import { StatusBadge } from '../../components/StatusBadge';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { getPlantStatus, formatNextWatering, formatDate } from '../../utils/wateringUtils';
import { Plant } from '../../types/plant';

/** Screen showing full details of a plant with watering actions. */
export const PlantDetailScreen = () => {
  const { colors, typography, borderRadius, shadows, spacing } = useTheme();
  const { selectedPlant } = usePlantStore();
  const { waterPlant, deletePlant, updatePlant } = usePlants();

  const [watering, setWatering] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editInterval, setEditInterval] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const plant = selectedPlant;

  useEffect(() => {
    if (plant) {
      setEditName(plant.name);
      setEditInterval(String(plant.wateringIntervalDays));
      setEditNotes(plant.notes ?? '');
    }
  }, [plant]);

  if (!plant) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={styles.noPlant}>
          <Text style={{ fontSize: 48 }}>🌿</Text>
          <Text style={[typography.title3, { color: colors.text, marginTop: 12 }]}>
            Select a plant from the list
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const status = getPlantStatus(plant.lastWateredAt, plant.wateringIntervalDays);
  const nextWatering = formatNextWatering(plant.lastWateredAt, plant.wateringIntervalDays);

  const handleWater = async () => {
    setWatering(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    try {
      await waterPlant(plant.id);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('💧 Watered!', `${plant.name} says thank you! 🌱`);
    } catch {
      Alert.alert('Error', 'Failed to record watering.');
    } finally {
      setWatering(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete plant?',
      `Are you sure you want to remove ${plant.name}? This cannot be undone. 😢`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deletePlant(plant.id);
          },
        },
      ],
    );
  };

  const handleSaveEdit = async () => {
    const interval = parseInt(editInterval, 10);
    if (!editName.trim()) {
      Alert.alert('Error', 'Plant name cannot be empty.');
      return;
    }
    if (!interval || interval < 1) {
      Alert.alert('Error', 'Watering interval must be at least 1 day.');
      return;
    }
    await updatePlant(plant.id, {
      name: editName.trim(),
      wateringIntervalDays: interval,
      notes: editNotes.trim(),
    });
    setEditModalVisible(false);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Plant image */}
        {plant.imageUrl ? (
          <Image
            source={{ uri: plant.imageUrl }}
            style={styles.heroImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: `${colors.primary}20` }]}>
            <Text style={{ fontSize: 64 }}>🌿</Text>
          </View>
        )}

        <View style={[styles.content, { paddingHorizontal: spacing.md }]}>
          {/* Header */}
          <View style={styles.nameRow}>
            <View style={styles.nameInfo}>
              <Text style={[styles.plantName, typography.largeTitle, { color: colors.text }]}>
                {plant.name}
              </Text>
              <Text style={[styles.species, typography.callout, { color: colors.textSecondary }]}>
                {plant.commonName || plant.species}
              </Text>
              <Text style={[styles.scientific, { color: colors.textSecondary, fontStyle: 'italic', fontSize: 13 }]}>
                {plant.species}
              </Text>
            </View>
            <StatusBadge status={status} />
          </View>

          {/* Watering info card */}
          <View
            style={[
              styles.infoCard,
              { backgroundColor: colors.surface, borderRadius: borderRadius.lg, ...shadows.sm },
            ]}
          >
            <InfoRow label="💧 Next watering" value={nextWatering} colors={colors} typography={typography} />
            <InfoRow
              label="🔁 Frequency"
              value={`Every ${plant.wateringIntervalDays} days`}
              colors={colors}
              typography={typography}
            />
            <InfoRow
              label="🕐 Last watered"
              value={formatDate(plant.lastWateredAt)}
              colors={colors}
              typography={typography}
            />
            {plant.confidence > 0 && (
              <InfoRow
                label="🔍 ID confidence"
                value={`${Math.round(plant.confidence * 100)}%`}
                colors={colors}
                typography={typography}
              />
            )}
          </View>

          {plant.notes ? (
            <View
              style={[
                styles.notesCard,
                { backgroundColor: colors.surface, borderRadius: borderRadius.lg, ...shadows.sm },
              ]}
            >
              <Text style={[styles.notesTitle, { color: colors.text }]}>📝 Notes</Text>
              <Text style={[typography.body, { color: colors.textSecondary }]}>
                {plant.notes}
              </Text>
            </View>
          ) : null}

          {/* Watering history */}
          {plant.wateringHistory && plant.wateringHistory.length > 0 && (
            <View
              style={[
                styles.historyCard,
                { backgroundColor: colors.surface, borderRadius: borderRadius.lg, ...shadows.sm },
              ]}
            >
              <Text style={[styles.historyTitle, typography.headline, { color: colors.text }]}>
                💧 Watering history
              </Text>
              {[...plant.wateringHistory]
                .reverse()
                .slice(0, 5)
                .map((ts, i) => (
                  <Text
                    key={i}
                    style={[typography.subheadline, { color: colors.textSecondary, paddingVertical: 4 }]}
                  >
                    {formatDate(ts)}
                  </Text>
                ))}
            </View>
          )}

          {/* Actions */}
          <Button
            title={watering ? '💧 Watering...' : '💧 I watered this plant'}
            onPress={handleWater}
            loading={watering}
            fullWidth
            size="lg"
            style={styles.waterButton}
          />

          <View style={styles.secondaryActions}>
            <Button
              title="✏️ Edit"
              onPress={() => setEditModalVisible(true)}
              variant="outline"
              style={styles.actionBtn}
            />
            <Button
              title="🗑 Delete"
              onPress={handleDelete}
              variant="danger"
              style={styles.actionBtn}
            />
          </View>
        </View>
      </ScrollView>

      {/* Edit modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <SafeAreaView style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[typography.title2, { color: colors.text }]}>Edit plant</Text>
            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <Text style={{ fontSize: 24, color: colors.textSecondary }}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.modalContent}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={[styles.label, { color: colors.text }]}>Name</Text>
            <TextInput
              value={editName}
              onChangeText={setEditName}
              style={[
                styles.modalInput,
                { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface },
              ]}
              placeholderTextColor={colors.textSecondary}
            />

            <Text style={[styles.label, { color: colors.text }]}>Water every (days)</Text>
            <TextInput
              value={editInterval}
              onChangeText={setEditInterval}
              keyboardType="number-pad"
              style={[
                styles.modalInput,
                { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface },
              ]}
              placeholderTextColor={colors.textSecondary}
            />

            <Text style={[styles.label, { color: colors.text }]}>Notes</Text>
            <TextInput
              value={editNotes}
              onChangeText={setEditNotes}
              multiline
              numberOfLines={4}
              style={[
                styles.modalInput,
                styles.notesInput,
                { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface },
              ]}
              placeholderTextColor={colors.textSecondary}
              placeholder="Any care notes..."
            />

            <Button title="Save changes" onPress={handleSaveEdit} fullWidth size="lg" />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const InfoRow = ({
  label,
  value,
  colors,
  typography,
}: {
  label: string;
  value: string;
  colors: ReturnType<typeof useTheme>['colors'];
  typography: ReturnType<typeof useTheme>['typography'];
}) => (
  <View style={styles.infoRow}>
    <Text style={[typography.subheadline, { color: colors.textSecondary }]}>{label}</Text>
    <Text style={[typography.subheadline, { color: colors.text, fontWeight: '600' }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1 },
  noPlant: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroImage: {
    width: '100%',
    height: 280,
  },
  imagePlaceholder: {
    width: '100%',
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingTop: 24,
    paddingBottom: 48,
    gap: 16,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  nameInfo: { flex: 1, marginRight: 12 },
  plantName: { fontWeight: '700', marginBottom: 4 },
  species: { marginBottom: 2 },
  scientific: {},
  infoCard: { padding: 16, gap: 2 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E9ECEF',
  },
  notesCard: { padding: 16, gap: 8 },
  notesTitle: { fontWeight: '700', fontSize: 15 },
  historyCard: { padding: 16, gap: 4 },
  historyTitle: { marginBottom: 8 },
  waterButton: { marginTop: 8 },
  secondaryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: { flex: 1 },
  modal: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 0,
  },
  modalContent: { padding: 20, gap: 4 },
  label: { fontWeight: '600', marginBottom: 6, marginTop: 12, fontSize: 15 },
  modalInput: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 8,
  },
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
  },
});
