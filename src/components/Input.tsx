import React, { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
}

/** A styled text input with label, error, and icon support. */
export const Input = ({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  onRightIconPress,
  style,
  ...props
}: InputProps) => {
  const { colors, borderRadius, typography } = useTheme();
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? colors.danger
    : focused
    ? colors.primary
    : colors.border;

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: colors.text, ...typography.subheadline }]}>
          {label}
        </Text>
      )}

      <View
        style={[
          styles.inputWrapper,
          {
            borderColor,
            borderRadius: borderRadius.md,
            backgroundColor: colors.surface,
          },
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        <TextInput
          {...props}
          style={[
            styles.input,
            {
              color: colors.text,
              ...typography.body,
              paddingLeft: leftIcon ? 4 : 16,
              paddingRight: rightIcon ? 4 : 16,
            },
            style,
          ]}
          placeholderTextColor={colors.textSecondary}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
        />

        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIcon}
            activeOpacity={0.7}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>

      {error ? (
        <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
      ) : hint ? (
        <Text style={[styles.hint, { color: colors.textSecondary }]}>{hint}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 6,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    minHeight: 52,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
  },
  leftIcon: {
    paddingLeft: 14,
    paddingRight: 4,
  },
  rightIcon: {
    paddingRight: 14,
    paddingLeft: 4,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  hint: {
    fontSize: 12,
    marginTop: 4,
  },
});
