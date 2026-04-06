import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Plant } from '../types/plant';
import { StatusBadge } from './StatusBadge';
import { useTheme } from '../theme/ThemeContext';
import { getPlantStatus, formatNextWatering } from '../utils/wateringUtils';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface PlantCardProps {
  plant: Plant;
  onPress: (plant: Plant) => void;
}

/** Animated card showing plant photo, name, status, and next watering date. */
export const PlantCard = ({ plant, onPress }: PlantCardProps) => {
  const { colors, borderRadius, shadows, typography } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const status = getPlantStatus(plant.lastWateredAt, plant.wateringIntervalDays);
  const nextWatering = formatNextWatering(plant.lastWateredAt, plant.wateringIntervalDays);

  return (
    <Animated.View style={[animatedStyle, { width: CARD_WIDTH }]}>
      <TouchableOpacity
        onPress={() => onPress(plant)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderRadius: borderRadius.lg,
            ...shadows.md,
          },
        ]}
      >
        {plant.imageUrl ? (
          <Image
            source={{ uri: plant.imageUrl }}
            style={[styles.image, { borderRadius: borderRadius.lg }]}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              styles.imagePlaceholder,
              { backgroundColor: `${colors.primary}20`, borderRadius: borderRadius.lg },
            ]}
          >
            <Text style={styles.plantEmoji}>🌿</Text>
          </View>
        )}

        <View style={styles.content}>
          <Text
            style={[styles.name, typography.headline, { color: colors.text }]}
            numberOfLines={1}
          >
            {plant.name}
          </Text>
          <Text
            style={[styles.species, typography.caption1, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {plant.commonName || plant.species}
          </Text>

          <StatusBadge status={status} />

          <Text
            style={[styles.watering, typography.caption2, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            💧 {nextWatering}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    margin: 4,
  },
  image: {
    width: '100%',
    height: 130,
  },
  imagePlaceholder: {
    width: '100%',
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plantEmoji: {
    fontSize: 40,
  },
  content: {
    padding: 12,
    gap: 4,
  },
  name: {
    fontWeight: '700',
  },
  species: {
    marginBottom: 4,
  },
  watering: {
    marginTop: 4,
  },
});
