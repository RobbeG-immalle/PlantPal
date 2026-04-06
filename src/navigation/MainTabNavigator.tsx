import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabParamList, HomeStackParamList, HouseholdStackParamList } from '../types/navigation';
import { HomeScreen } from '../screens/home/HomeScreen';
import { PlantDetailScreen } from '../screens/plant/PlantDetailScreen';
import { AddPlantScreen } from '../screens/plant/AddPlantScreen';
import { HouseholdScreen } from '../screens/household/HouseholdScreen';
import { JoinHouseholdScreen } from '../screens/household/JoinHouseholdScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { useTheme } from '../theme/ThemeContext';

const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const HouseholdStack = createNativeStackNavigator<HouseholdStackParamList>();

const TabIcon = ({ emoji, focused }: { emoji: string; focused: boolean }) => (
  <Text style={{ fontSize: focused ? 26 : 22 }}>{emoji}</Text>
);

/** Home stack: plant list → plant detail. */
const HomeStackNavigator = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="PlantList" component={HomeScreen} />
    <HomeStack.Screen name="PlantDetail" component={PlantDetailScreen} />
  </HomeStack.Navigator>
);

/** Household stack: household → join. */
const HouseholdStackNavigator = () => (
  <HouseholdStack.Navigator screenOptions={{ headerShown: false }}>
    <HouseholdStack.Screen name="HouseholdMain" component={HouseholdScreen} />
    <HouseholdStack.Screen name="JoinHousehold" component={JoinHouseholdScreen} />
  </HouseholdStack.Navigator>
);

/** Bottom tab navigator for the main app experience. */
export const MainTabNavigator = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
          paddingBottom: 8,
          paddingTop: 8,
          height: 64,
        },
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'My Plants',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🌿" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="AddPlant"
        component={AddPlantScreen}
        options={{
          tabBarLabel: 'Add Plant',
          tabBarIcon: ({ focused }) => <TabIcon emoji="➕" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Household"
        component={HouseholdStackNavigator}
        options={{
          tabBarLabel: 'Household',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏡" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
};
