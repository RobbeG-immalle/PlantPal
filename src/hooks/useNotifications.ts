import { useEffect, useCallback } from 'react';
import { registerForPushNotifications } from '../services/notificationService';
import { updatePushToken } from '../services/authService';
import { useAuthStore } from '../stores/authStore';

/**
 * Hook that handles notification permission registration and push token storage.
 */
export const useNotifications = () => {
  const { firebaseUser } = useAuthStore();

  /** Requests notification permissions and saves the token to Firestore. */
  const registerNotifications = useCallback(async () => {
    if (!firebaseUser) return;

    try {
      const token = await registerForPushNotifications();
      if (token) {
        await updatePushToken(firebaseUser.uid, token);
      }
    } catch {
      // Notifications are best-effort – silently fail
    }
  }, [firebaseUser]);

  useEffect(() => {
    registerNotifications();
  }, [registerNotifications]);

  return { registerNotifications };
};
