import { useCallback } from 'react';
import { Timestamp } from 'firebase/firestore';
import { usePlantStore } from '../stores/plantStore';
import { useAuthStore } from '../stores/authStore';
import {
  addPlant as addPlantService,
  updatePlant as updatePlantService,
  deletePlant as deletePlantService,
  getPlants as getPlantsService,
  waterPlant as waterPlantService,
} from '../services/plantService';
import { schedulePlantWateringNotifications, cancelPlantNotifications } from '../services/notificationService';
import { Plant, NewPlant } from '../types/plant';

/**
 * Hook providing plant CRUD operations and state.
 */
export const usePlants = () => {
  const {
    plants,
    selectedPlant,
    loading,
    error,
    setPlants,
    addPlantToStore,
    updatePlantInStore,
    removePlantFromStore,
    setSelectedPlant,
    setLoading,
    setError,
    clearError,
  } = usePlantStore();

  const { userProfile } = useAuthStore();

  /** Fetches all plants for the current household. */
  const fetchPlants = useCallback(async () => {
    if (!userProfile?.householdId) {
      setPlants([]);
      return;
    }

    try {
      setLoading(true);
      clearError();
      const result = await getPlantsService(userProfile.householdId);
      setPlants(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load plants.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [userProfile?.householdId, setPlants, setLoading, setError, clearError]);

  /** Adds a new plant and schedules its watering notifications. */
  const addPlant = useCallback(
    async (plant: NewPlant): Promise<string | null> => {
      try {
        setLoading(true);
        clearError();
        const id = await addPlantService(plant);
        const newPlant: Plant = {
          id,
          ...plant,
          wateringHistory: [plant.lastWateredAt],
          createdAt: Timestamp.now(),
        };
        addPlantToStore(newPlant);

        await schedulePlantWateringNotifications(
          id,
          plant.name,
          plant.lastWateredAt,
          plant.wateringIntervalDays,
        ).catch(() => {}); // Notifications are best-effort

        return id;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to add plant.';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [addPlantToStore, setLoading, setError, clearError],
  );

  /** Updates a plant's fields. */
  const updatePlant = useCallback(
    async (id: string, updates: Partial<Omit<Plant, 'id'>>) => {
      try {
        clearError();
        await updatePlantService(id, updates);
        updatePlantInStore(id, updates);

        // Re-schedule notifications if watering schedule changed
        const plant = plants.find((p) => p.id === id);
        if (plant && (updates.wateringIntervalDays || updates.lastWateredAt)) {
          const lastWatered = updates.lastWateredAt ?? plant.lastWateredAt;
          const interval = updates.wateringIntervalDays ?? plant.wateringIntervalDays;
          await schedulePlantWateringNotifications(id, plant.name, lastWatered, interval).catch(() => {});
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update plant.';
        setError(message);
      }
    },
    [plants, updatePlantInStore, setError, clearError],
  );

  /** Deletes a plant and cancels its notifications. */
  const deletePlant = useCallback(
    async (id: string) => {
      try {
        clearError();
        await deletePlantService(id);
        await cancelPlantNotifications(id).catch(() => {});
        removePlantFromStore(id);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete plant.';
        setError(message);
      }
    },
    [removePlantFromStore, setError, clearError],
  );

  /** Records a watering event and reschedules notifications. */
  const waterPlant = useCallback(
    async (id: string) => {
      try {
        clearError();
        await waterPlantService(id);
        const now = Timestamp.now();
        const plant = plants.find((p) => p.id === id);

        if (plant) {
          const updatedHistory = [...plant.wateringHistory, now];
          updatePlantInStore(id, { lastWateredAt: now, wateringHistory: updatedHistory });

          await schedulePlantWateringNotifications(
            id,
            plant.name,
            now,
            plant.wateringIntervalDays,
          ).catch(() => {});
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to record watering.';
        setError(message);
      }
    },
    [plants, updatePlantInStore, setError, clearError],
  );

  return {
    plants,
    selectedPlant,
    loading,
    error,
    fetchPlants,
    addPlant,
    updatePlant,
    deletePlant,
    waterPlant,
    setSelectedPlant,
    clearError,
  };
};
