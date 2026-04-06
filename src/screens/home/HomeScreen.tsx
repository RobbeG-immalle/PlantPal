import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeContext';
import { usePlants } from '../../hooks/usePlants';
import { useAuthStore } from '../../stores/authStore';
import { PlantCard } from '../../components/PlantCard';
import { EmptyState } from '../../components/EmptyState';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Plant } from '../../types/plant';
import { MainTabParamList, HomeStackParamList } from '../../types/navigation';

type HomeNavProp = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList, 'PlantList'>,
  BottomTabNavigationProp<MainTabParamList>
>;

/** Main plant list screen showing all plants in the household. */
export const HomeScreen = () => {
  const { colors, typography, spacing } = useTheme();
  const { plants, loading, error, fetchPlants, setSelectedPlant } = usePlants();
  const { userProfile } = useAuthStore();
  const navigation = useNavigation<HomeNavProp>();

  useEffect(() => {
    fetchPlants();
  }, [fetchPlants, userProfile?.householdId]);

  const handleRefresh = useCallback(() => {
    fetchPlants();
  }, [fetchPlants]);

  const handlePlantPress = (plant: Plant) => {
    setSelectedPlant(plant);
    navigation.navigate('PlantDetail', { plantId: plant.id });
  };

  if (!userProfile?.householdId) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <EmptyState
          emoji="🏡"
          title="No household yet"
          subtitle="Join or create a household to start managing plants with your housemates!"
          actionLabel="Set up household"
          onAction={() => navigation.navigate('Household')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: spacing.md }]}>
        <View>
          <Text style={[styles.greeting, typography.subheadline, { color: colors.textSecondary }]}>
            👋 Hey {userProfile?.displayName?.split(' ')[0] ?? 'there'}!
          </Text>
          <Text style={[styles.title, typography.title1, { color: colors.text }]}>
            My Plants
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('AddPlant')}
          style={[styles.fab, { backgroundColor: colors.primary }]}
          activeOpacity={0.8}
        >
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      </View>

      {loading && plants.length === 0 ? (
        <LoadingSpinner message="Loading your plants..." />
      ) : error ? (
        <EmptyState
          emoji="😰"
          title="Something went wrong"
          subtitle={error}
          actionLabel="Try again"
          onAction={fetchPlants}
        />
      ) : plants.length === 0 ? (
        <EmptyState
          emoji="🌱"
          title="No plants yet!"
          subtitle="Add your first plant and start your green journey. Your future plants are rooting for you! 🌿"
          actionLabel="Add a plant"
          onAction={() => navigation.navigate('AddPlant')}
        />
      ) : (
        <FlatList
          data={plants}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          renderItem={({ item }) => (
            <PlantCard plant={item} onPress={handlePlantPress} />
          )}
          ListHeaderComponent={
            <Text
              style={[
                styles.countLabel,
                typography.footnote,
                { color: colors.textSecondary },
              ]}
            >
              {plants.length} {plants.length === 1 ? 'plant' : 'plants'}
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingBottom: 12,
  },
  greeting: { marginBottom: 2 },
  title: { fontWeight: '700' },
  fab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '300',
    lineHeight: 28,
  },
  list: {
    padding: 12,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  countLabel: {
    paddingHorizontal: 4,
    marginBottom: 8,
  },
});
