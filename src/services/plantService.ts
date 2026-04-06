import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  arrayUnion,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Plant, NewPlant } from '../types/plant';
import { COLLECTIONS } from '../utils/constants';

/**
 * Adds a new plant to the household's plant collection.
 */
export const addPlant = async (plant: NewPlant): Promise<string> => {
  const ref = await addDoc(collection(db, COLLECTIONS.PLANTS), {
    ...plant,
    wateringHistory: [plant.lastWateredAt],
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

/**
 * Updates fields on an existing plant.
 */
export const updatePlant = async (
  id: string,
  updates: Partial<Omit<Plant, 'id'>>,
): Promise<void> => {
  await updateDoc(doc(db, COLLECTIONS.PLANTS, id), updates);
};

/**
 * Deletes a plant by ID.
 */
export const deletePlant = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, COLLECTIONS.PLANTS, id));
};

/**
 * Fetches all plants belonging to a household.
 */
export const getPlants = async (householdId: string): Promise<Plant[]> => {
  const q = query(
    collection(db, COLLECTIONS.PLANTS),
    where('householdId', '==', householdId),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Plant));
};

/**
 * Fetches a single plant by ID.
 */
export const getPlant = async (id: string): Promise<Plant | null> => {
  const snap = await getDoc(doc(db, COLLECTIONS.PLANTS, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Plant;
};

/**
 * Records a watering event for a plant (updates lastWateredAt + history).
 */
export const waterPlant = async (id: string): Promise<void> => {
  const now = Timestamp.now();
  await updateDoc(doc(db, COLLECTIONS.PLANTS, id), {
    lastWateredAt: now,
    wateringHistory: arrayUnion(now),
  });
};
