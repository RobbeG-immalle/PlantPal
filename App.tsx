import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useAuth } from './src/hooks/useAuth';
import { initRevenueCat } from './src/services/revenueCatService';
import { configureGoogleSignIn } from './src/services/googleAuthService';

// Keep the splash screen visible until auth state is resolved
SplashScreen.preventAutoHideAsync();

// Initialise third-party SDKs once at module scope
// Initialise RevenueCat once at module scope (anonymous until user signs in).
// User identification happens later via identifyUser() in useSubscription.
initRevenueCat().catch((err) =>
  console.warn('[RevenueCat] Initialization failed:', err),
);
try {
  configureGoogleSignIn();
} catch (err) {
  console.warn('[GoogleAuth] Native module not available – Google Sign-In disabled:', err);
}

/** Inner component that has access to the theme context. */
const AppContent = () => {
  const { isDark } = useTheme();
  const { loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync();
    }
  }, [loading]);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AppNavigator />
    </>
  );
};

/** Root app component – wraps everything in providers. */
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
