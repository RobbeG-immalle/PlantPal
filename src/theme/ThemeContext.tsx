import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors, ColorScheme } from './colors';
import { spacing, borderRadius, shadows } from './spacing';
import { typography } from './typography';

const THEME_KEY = '@plantpal_theme';

interface Theme {
  colors: ColorScheme;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  shadows: typeof shadows;
  typography: typeof typography;
  isDark: boolean;
}

interface ThemeContextValue extends Theme {
  toggleTheme: () => void;
}

const buildTheme = (isDark: boolean): Theme => ({
  colors: isDark ? darkColors : lightColors,
  spacing,
  borderRadius,
  shadows,
  typography,
  isDark,
});

const ThemeContext = createContext<ThemeContextValue>({
  ...buildTheme(false),
  toggleTheme: () => {},
});

interface ThemeProviderProps {
  children: ReactNode;
}

/** Provides light/dark theme context with AsyncStorage persistence. */
export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((val) => {
      if (val !== null) setIsDark(val === 'dark');
    });
  }, []);

  const toggleTheme = async () => {
    const next = !isDark;
    setIsDark(next);
    await AsyncStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ ...buildTheme(isDark), toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

/** Hook to access the current theme. */
export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;
