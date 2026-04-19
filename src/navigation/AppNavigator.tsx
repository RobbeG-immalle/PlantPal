import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { PaywallScreen } from '../screens/subscription/PaywallScreen';
import { useAuthStore } from '../stores/authStore';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useNotifications } from '../hooks/useNotifications';
import { useSubscription } from '../hooks/useSubscription';

const Stack = createNativeStackNavigator<RootStackParamList>();

/** Root navigator that switches between Auth and Main based on login state. */
export const AppNavigator = () => {
  const { loading, firebaseUser } = useAuthStore();
  const { loading: subscriptionLoading } = useSubscription();

  // Register for notifications when authenticated
  useNotifications();

  if (loading || (firebaseUser && subscriptionLoading)) {
    return <LoadingSpinner fullScreen message="Loading PlantPal..." />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {firebaseUser ? (
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen
              name="Paywall"
              component={PaywallScreen}
              options={{ presentation: 'modal', headerShown: false }}
            />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
