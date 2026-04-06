import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  subtitle?: string;
  emoji?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** Shown when a list is empty – encourages the user to take action. */
export const EmptyState = ({
  title,
  subtitle,
  emoji = '🌱',
  actionLabel,
  onAction,
}: EmptyStateProps) => {
  const { colors, typography } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.title, typography.title3, { color: colors.text }]}>
        {title}
      </Text>
      {subtitle && (
        <Text
          style={[
            styles.subtitle,
            typography.body,
            { color: colors.textSecondary },
          ]}
        >
          {subtitle}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          onPress={onAction}
          style={styles.button}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
    gap: 12,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 8,
  },
  title: {
    textAlign: 'center',
    fontWeight: '700',
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    marginTop: 8,
  },
});
