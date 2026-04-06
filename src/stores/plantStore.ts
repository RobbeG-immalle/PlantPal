import { create } from 'zustand';
import { Plant } from '../types/plant';

interface PlantState {
  plants: Plant[];
  selectedPlant: Plant | null;
  loading: boolean;
  error: string | null;

  setPlants: (plants: Plant[]) => void;
  addPlantToStore: (plant: Plant) => void;
  updatePlantInStore: (id: string, updates: Partial<Plant>) => void;
  removePlantFromStore: (id: string) => void;
  setSelectedPlant: (plant: Plant | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

/** Zustand store for plant state. */
export const usePlantStore = create<PlantState>((set) => ({
  plants: [],
  selectedPlant: null,
  loading: false,
  error: null,

  setPlants: (plants) => set({ plants }),
  addPlantToStore: (plant) =>
    set((state) => ({ plants: [plant, ...state.plants] })),
  updatePlantInStore: (id, updates) =>
    set((state) => ({
      plants: state.plants.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      selectedPlant:
        state.selectedPlant?.id === id
          ? { ...state.selectedPlant, ...updates }
          : state.selectedPlant,
    })),
  removePlantFromStore: (id) =>
    set((state) => ({
      plants: state.plants.filter((p) => p.id !== id),
      selectedPlant: state.selectedPlant?.id === id ? null : state.selectedPlant,
    })),
  setSelectedPlant: (plant) => set({ selectedPlant: plant }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));
