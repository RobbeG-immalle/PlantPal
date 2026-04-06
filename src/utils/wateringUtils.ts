import { Timestamp } from 'firebase/firestore';
import { PlantStatus } from '../types/plant';

/**
 * Calculates the next watering date given the last watered date
 * and the watering interval in days.
 */
export const getNextWateringDate = (
  lastWateredAt: Timestamp,
  intervalDays: number,
): Date => {
  const last = lastWateredAt.toDate();
  const next = new Date(last);
  next.setDate(next.getDate() + intervalDays);
  return next;
};

/**
 * Determines a plant's status based on its watering schedule.
 * - happy: next watering is more than 1 day away
 * - thirsty: due today or tomorrow
 * - dying: overdue
 */
export const getPlantStatus = (
  lastWateredAt: Timestamp,
  intervalDays: number,
): PlantStatus => {
  const nextDate = getNextWateringDate(lastWateredAt, intervalDays);
  const now = new Date();
  const diffMs = nextDate.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffDays < 0) return 'dying';
  if (diffDays <= 1) return 'thirsty';
  return 'happy';
};

/**
 * Returns how many days until/since a plant needs water.
 * Negative = overdue.
 */
export const getDaysUntilWatering = (
  lastWateredAt: Timestamp,
  intervalDays: number,
): number => {
  const nextDate = getNextWateringDate(lastWateredAt, intervalDays);
  const now = new Date();
  const diffMs = nextDate.getTime() - now.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
};

/** Returns a human-readable string for the next watering date. */
export const formatNextWatering = (
  lastWateredAt: Timestamp,
  intervalDays: number,
): string => {
  const days = getDaysUntilWatering(lastWateredAt, intervalDays);

  if (days < -1) return `${Math.abs(days)} days overdue 💀`;
  if (days === -1) return 'Due yesterday 😰';
  if (days === 0) return 'Due today 🌱';
  if (days === 1) return 'Tomorrow 😊';
  return `In ${days} days`;
};

/** Formats a Firestore Timestamp into a readable date string. */
export const formatDate = (timestamp: Timestamp): string => {
  return timestamp.toDate().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
