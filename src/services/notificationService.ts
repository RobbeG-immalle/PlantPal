import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { Timestamp } from 'firebase/firestore';
import { getNotificationMessage } from '../utils/notificationMessages';
import { getNextWateringDate } from '../utils/wateringUtils';
import { NOTIFICATION_CHANNEL_ID } from '../utils/constants';
import { SubscriptionTier } from '../types/subscription';

// Configure how notifications appear when the app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Requests notification permissions and returns the Expo push token.
 * Returns null if permissions are denied or on a non-device.
 */
export const registerForPushNotifications = async (): Promise<string | null> => {
  if (!Device.isDevice) return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
      name: 'Plant Watering Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6BCB77',
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;

  try {
    const token = await Notifications.getExpoPushTokenAsync();
    return token.data;
  } catch (error) {
    // Expo Go does not support remote push token registration for newer SDKs.
    console.warn('Push token unavailable in this runtime:', error);
    return null;
  }
};

/**
 * Schedules escalating watering notifications for a plant.
 * Cancels any previously scheduled notifications for the same plant.
 *
 * Free tier: only the day-of notification with a generic message.
 * Premium/Lifetime: all three (day-of, +1 day, +3 days) with funny messages.
 */
export const schedulePlantWateringNotifications = async (
  plantId: string,
  plantName: string,
  lastWateredAt: Timestamp,
  intervalDays: number,
  tier: SubscriptionTier = 'free',
): Promise<void> => {
  // Cancel existing notifications for this plant
  await cancelPlantNotifications(plantId);

  const nextWatering = getNextWateringDate(lastWateredAt, intervalDays);
  const now = new Date();

  if (nextWatering <= now) return; // Already overdue, don't schedule

  const isPremiumTier = tier === 'premium' || tier === 'lifetime';

  // Day-of reminder (at 9 AM on due date)
  // Free tier: generic message. Premium/Lifetime: funny message.
  const dayOfMsg = isPremiumTier
    ? getNotificationMessage(plantName, 'friendly')
    : { title: '🌿 PlantPal', body: `Time to water ${plantName} today!` };

  const dayOfDate = new Date(nextWatering);
  dayOfDate.setHours(9, 0, 0, 0);
  if (dayOfDate > now) {
    await Notifications.scheduleNotificationAsync({
      identifier: `${plantId}_day0`,
      content: {
        title: dayOfMsg.title,
        body: dayOfMsg.body,
        data: { plantId, type: 'watering_reminder' },
        categoryIdentifier: NOTIFICATION_CHANNEL_ID,
      },
      trigger: { date: dayOfDate },
    });
  }

  // Escalating reminders are premium-only
  if (!isPremiumTier) return;

  const sassyMsg = getNotificationMessage(plantName, 'sassy');
  const emergencyMsg = getNotificationMessage(plantName, 'emergency');

  // +1 day sassy reminder
  const sassyDate = new Date(nextWatering);
  sassyDate.setDate(sassyDate.getDate() + 1);
  sassyDate.setHours(9, 0, 0, 0);
  if (sassyDate > now) {
    await Notifications.scheduleNotificationAsync({
      identifier: `${plantId}_day1`,
      content: {
        title: sassyMsg.title,
        body: sassyMsg.body,
        data: { plantId, type: 'watering_reminder' },
        categoryIdentifier: NOTIFICATION_CHANNEL_ID,
      },
      trigger: { date: sassyDate },
    });
  }

  // +3 days emergency
  const emergencyDate = new Date(nextWatering);
  emergencyDate.setDate(emergencyDate.getDate() + 3);
  emergencyDate.setHours(9, 0, 0, 0);
  if (emergencyDate > now) {
    await Notifications.scheduleNotificationAsync({
      identifier: `${plantId}_day3`,
      content: {
        title: emergencyMsg.title,
        body: emergencyMsg.body,
        data: { plantId, type: 'watering_reminder' },
        categoryIdentifier: NOTIFICATION_CHANNEL_ID,
      },
      trigger: { date: emergencyDate },
    });
  }
};

/**
 * Cancels all scheduled notifications for a specific plant.
 */
export const cancelPlantNotifications = async (plantId: string): Promise<void> => {
  await Notifications.cancelScheduledNotificationAsync(`${plantId}_day0`).catch(() => {});
  await Notifications.cancelScheduledNotificationAsync(`${plantId}_day1`).catch(() => {});
  await Notifications.cancelScheduledNotificationAsync(`${plantId}_day3`).catch(() => {});
};

/**
 * Cancels all scheduled notifications (e.g., on sign-out).
 */
export const cancelAllNotifications = async (): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};
