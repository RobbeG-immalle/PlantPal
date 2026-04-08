import { Timestamp } from 'firebase/firestore';

/** Status of a plant based on its watering schedule. */
export type PlantStatus = 'happy' | 'thirsty' | 'dying';

/** A plant stored in Firestore. */
export interface Plant {
  id: string;
  name: string;
  species: string;
  commonName: string;
  imageUrl: string;
  wateringIntervalDays: number;
  lastWateredAt: Timestamp;
  wateringHistory: Timestamp[];
  notes: string;
  householdId: string;
  addedBy: string;
  createdAt: Timestamp;
  confidence: number;
}

/** Plant data when creating a new plant (no id/timestamps yet). */
export type NewPlant = Omit<Plant, 'id' | 'createdAt' | 'wateringHistory'>;

/** A single growth timeline entry for a plant (premium feature). */
export interface GrowthEntry {
  id: string;
  imageUrl: string;
  capturedAt: Timestamp;
  note?: string;
}

/** Plant result from identification API. */
export interface PlantIdentificationResult {
  species: string;
  commonName: string;
  confidence: number;
  suggestedWateringDays: number;
}
