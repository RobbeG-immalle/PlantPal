/** App-wide constants for PlantPal. */

/** Default watering interval (days) when species is unknown. */
export const DEFAULT_WATERING_DAYS = 7;

/** Max confidence threshold for plant identification (0-1). */
export const MIN_CONFIDENCE_THRESHOLD = 0.1;

/** PlantNet API base URL. */
export const PLANTNET_API_BASE = 'https://my-api.plantnet.org/v2';

/** Firestore collection names. */
export const COLLECTIONS = {
  USERS: 'users',
  HOUSEHOLDS: 'households',
  PLANTS: 'plants',
  INVITATIONS: 'invitations',
  GROWTH_ENTRIES: 'growthEntries',
} as const;

/** Maximum number of plants allowed on the free tier. */
export const FREE_PLANT_LIMIT = 5;

/** Default watering intervals by species (days). */
export const SPECIES_WATERING_DEFAULTS: Record<string, number> = {
  // Succulents & Cacti
  cactus: 21,
  succulent: 14,
  aloe: 14,
  'echeveria': 10,

  // Tropical / indoor
  monstera: 7,
  pothos: 7,
  'peace lily': 5,
  'snake plant': 14,
  'zz plant': 14,
  philodendron: 7,
  fern: 3,
  orchid: 5,
  bromeliad: 5,

  // Flowering
  rose: 3,
  lavender: 5,
  sunflower: 2,
  tulip: 3,
  hydrangea: 3,

  // Herbs
  basil: 2,
  mint: 2,
  rosemary: 5,
  thyme: 5,

  // Trees / shrubs
  bonsai: 3,
  'olive tree': 7,
  bamboo: 3,
};

/**
 * Returns a suggested watering interval for a given species name.
 * Falls back to DEFAULT_WATERING_DAYS if not found.
 */
export const getSuggestedWateringDays = (species: string): number => {
  const normalized = species.toLowerCase();
  for (const [key, days] of Object.entries(SPECIES_WATERING_DEFAULTS)) {
    if (normalized.includes(key)) return days;
  }
  return DEFAULT_WATERING_DAYS;
};

/** App version string. */
export const APP_VERSION = '1.0.0';

/** Invite code length. */
export const INVITE_CODE_LENGTH = 8;

/** Notification channel ID for Android. */
export const NOTIFICATION_CHANNEL_ID = 'plant-watering';
