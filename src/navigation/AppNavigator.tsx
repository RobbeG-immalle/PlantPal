import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { useAuthStore } from '../stores/authStore';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useNotifications } from '../hooks/useNotifications';

const Stack = createNativeStackNavigator<RootStackParamList>();

/** Root navigator that switches between Auth and Main based on login state. */
export const AppNavigator = () => {
  const { loading, firebaseUser } = useAuthStore();

  // Register for notifications when authenticated
  useNotifications();

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading PlantPal..." />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {firebaseUser ? (
          <Stack.Screen name="Main" component={MainTabNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
