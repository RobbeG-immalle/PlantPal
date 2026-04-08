import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface PremiumBadgeProps {
  size?: 'sm' | 'md';
}

/** Small badge displayed next to premium-gated features. */
export const PremiumBadge = ({ size = 'md' }: PremiumBadgeProps) => {
  const { colors, borderRadius } = useTheme();

  const isSm = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: `${colors.accent}30`,
          borderRadius: borderRadius.full,
          paddingHorizontal: isSm ? 6 : 10,
          paddingVertical: isSm ? 2 : 4,
        },
      ]}
    >
      <Text
        style={[
          styles.label,
          { color: colors.accent, fontSize: isSm ? 10 : 12 },
        ]}
      >
        💎 PRO
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
