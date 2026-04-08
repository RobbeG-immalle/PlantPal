import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { logger } from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

interface Plant {
  id: string;
  name: string;
  wateringIntervalDays: number;
  lastWateredAt: admin.firestore.Timestamp;
  householdId: string;
}

interface User {
  id: string;
  pushToken?: string;
  householdId?: string;
}

/**
 * Runs daily to check for plants that need watering and sends push notifications.
 * Scheduled to run at 9 AM UTC every day.
 */
export const dailyWateringCheck = onSchedule(
  { schedule: '0 9 * * *', timeZone: 'UTC' },
  async () => {
    logger.info('Running daily watering check');

    const now = admin.firestore.Timestamp.now();
    const plantsSnap = await db.collection('plants').get();

    const overdueByHousehold: Record<string, string[]> = {};

    for (const plantDoc of plantsSnap.docs) {
      const plant = { id: plantDoc.id, ...plantDoc.data() } as Plant;

      const lastWatered = plant.lastWateredAt.toDate();
      const nextWatering = new Date(lastWatered);
      nextWatering.setDate(nextWatering.getDate() + plant.wateringIntervalDays);

      const isOverdue = nextWatering <= now.toDate();

      if (isOverdue) {
        if (!overdueByHousehold[plant.householdId]) {
          overdueByHousehold[plant.householdId] = [];
        }
        overdueByHousehold[plant.householdId].push(plant.name);
      }
    }

    // Send notifications to members of households with overdue plants
    for (const [householdId, plantNames] of Object.entries(overdueByHousehold)) {
      const householdDoc = await db.collection('households').doc(householdId).get();
      if (!householdDoc.exists) continue;

      const memberIds: string[] = householdDoc.data()?.memberIds ?? [];

      for (const memberId of memberIds) {
        const userDoc = await db.collection('users').doc(memberId).get();
        if (!userDoc.exists) continue;

        const user = userDoc.data() as User;
        if (!user.pushToken) continue;

        const plantList =
          plantNames.length === 1
            ? plantNames[0]
            : `${plantNames.slice(0, -1).join(', ')} and ${plantNames.slice(-1)[0]}`;

        const message: admin.messaging.Message = {
          token: user.pushToken,
          notification: {
            title: '🌿 PlantPal',
            body: `${plantList} ${plantNames.length === 1 ? 'needs' : 'need'} water today! 💧`,
          },
          data: { type: 'daily_check', householdId },
        };

        try {
          await messaging.send(message);
          logger.info(`Sent notification to user ${memberId}`);
        } catch (error) {
          logger.error(`Failed to send notification to ${memberId}:`, error);
        }
      }
    }

    logger.info('Daily watering check complete');
  },
);

/**
 * Triggered when a plant is added – logs the event.
 */
export const onPlantAdded = onDocumentCreated(
  'plants/{plantId}',
  async (event) => {
    const snap = event.data;
    if (!snap) return;
    const plant = snap.data() as Plant;
    logger.info(`New plant added: ${plant.name} (${event.params.plantId})`);
  },
);

/**
 * Triggered when a plant is watered (lastWateredAt changes).
 */
export const onPlantWatered = onDocumentUpdated(
  'plants/{plantId}',
  async (event) => {
    const change = event.data;
    if (!change) return;
    const before = change.before.data() as Plant;
    const after = change.after.data() as Plant;

    if (before.lastWateredAt.isEqual(after.lastWateredAt)) return;

    logger.info(`Plant watered: ${after.name} (${event.params.plantId})`);
  },
);
