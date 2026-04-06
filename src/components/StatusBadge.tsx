import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { PlantStatus } from '../types/plant';
import { useTheme } from '../theme/ThemeContext';

interface StatusBadgeProps {
  status: PlantStatus;
  label?: string;
}

const STATUS_CONFIG: Record<PlantStatus, { emoji: string; defaultLabel: string }> = {
  happy: { emoji: '😊', defaultLabel: 'Happy' },
  thirsty: { emoji: '😰', defaultLabel: 'Thirsty' },
  dying: { emoji: '💀', defaultLabel: 'Dying' },
};

/** Displays a coloured badge indicating a plant's watering status. */
export const StatusBadge = ({ status, label }: StatusBadgeProps) => {
  const { colors, borderRadius } = useTheme();
  const config = STATUS_CONFIG[status];

  const getBackgroundColor = () => {
    switch (status) {
      case 'happy': return `${colors.happy}25`;
      case 'thirsty': return `${colors.thirsty}25`;
      case 'dying': return `${colors.dying}25`;
    }
  };

  const getTextColor = () => {
    switch (status) {
      case 'happy': return colors.happy;
      case 'thirsty': return '#B8860B';
      case 'dying': return colors.dying;
    }
  };

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: getBackgroundColor(),
          borderRadius: borderRadius.full,
        },
      ]}
    >
      <Text style={styles.emoji}>{config.emoji}</Text>
      <Text style={[styles.label, { color: getTextColor() }]}>
        {label ?? config.defaultLabel}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    gap: 4,
  },
  emoji: {
    fontSize: 13,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
