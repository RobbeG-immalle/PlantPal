import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

/** A themed loading spinner with optional message. */
export const LoadingSpinner = ({
  message,
  fullScreen = false,
}: LoadingSpinnerProps) => {
  const { colors, typography } = useTheme();

  return (
    <View
      style={[
        styles.container,
        fullScreen && styles.fullScreen,
        fullScreen && { backgroundColor: colors.background },
      ]}
    >
      <ActivityIndicator size="large" color={colors.primary} />
      {message && (
        <Text
          style={[
            styles.message,
            typography.subheadline,
            { color: colors.textSecondary },
          ]}
        >
          {message}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  fullScreen: {
    flex: 1,
  },
  message: {
    textAlign: 'center',
  },
});
