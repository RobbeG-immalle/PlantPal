import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { Timestamp } from 'firebase/firestore';
import { getNotificationMessage } from '../utils/notificationMessages';
import { getNextWateringDate } from '../utils/wateringUtils';
import { NOTIFICATION_CHANNEL_ID } from '../utils/constants';

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

  const token = await Notifications.getExpoPushTokenAsync();
  return token.data;
};

/**
 * Schedules escalating watering notifications for a plant.
 * Cancels any previously scheduled notifications for the same plant.
 */
export const schedulePlantWateringNotifications = async (
  plantId: string,
  plantName: string,
  lastWateredAt: Timestamp,
  intervalDays: number,
): Promise<void> => {
  // Cancel existing notifications for this plant
  await cancelPlantNotifications(plantId);

  const nextWatering = getNextWateringDate(lastWateredAt, intervalDays);
  const now = new Date();

  if (nextWatering <= now) return; // Already overdue, don't schedule

  const friendlyMsg = getNotificationMessage(plantName, 'friendly');
  const sassyMsg = getNotificationMessage(plantName, 'sassy');
  const emergencyMsg = getNotificationMessage(plantName, 'emergency');

  // Day-of reminder (at 9 AM on due date)
  const dayOfDate = new Date(nextWatering);
  dayOfDate.setHours(9, 0, 0, 0);
  if (dayOfDate > now) {
    await Notifications.scheduleNotificationAsync({
      identifier: `${plantId}_day0`,
      content: {
        title: friendlyMsg.title,
        body: friendlyMsg.body,
        data: { plantId, type: 'watering_reminder' },
        categoryIdentifier: NOTIFICATION_CHANNEL_ID,
      },
      trigger: { date: dayOfDate },
    });
  }

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
