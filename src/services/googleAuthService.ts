import {
  GoogleSignin,
  isSuccessResponse,
} from '@react-native-google-signin/google-signin';
import {
  GoogleAuthProvider,
  signInWithCredential,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User } from '../types/user';
import { COLLECTIONS } from '../utils/constants';

/**
 * Configures the Google Sign-In SDK.
 * Must be called once before any sign-in attempt (typically at app start).
 */
export const configureGoogleSignIn = (): void => {
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

  if (!webClientId) {
    console.warn('[GoogleAuth] EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID is not set. Google Sign-In will not work.');
    return;
  }

  try {
    GoogleSignin.configure({
      webClientId,
      offlineAccess: false,
    });
  } catch {
    console.warn('[GoogleAuth] Native module not available. Google Sign-In will not work in Expo Go.');
  }
};

/**
 * Performs the full Google Sign-In flow:
 * 1. Opens the Google Sign-In prompt.
 * 2. Exchanges the Google ID token for a Firebase credential.
 * 3. Signs in to Firebase Authentication.
 * 4. Creates a Firestore user profile if one does not already exist.
 *
 * Returns the Firebase user on success.
 */
export const signInWithGoogle = async (): Promise<FirebaseUser> => {
  // Ensure any previous session is cleared so the account picker shows
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

  const response = await GoogleSignin.signIn();

  if (!isSuccessResponse(response)) {
    throw new Error('Google Sign-In was cancelled or failed.');
  }

  const idToken = response.data.idToken;
  if (!idToken) {
    throw new Error('No ID token returned from Google Sign-In.');
  }

  // Exchange for Firebase credential
  const credential = GoogleAuthProvider.credential(idToken);
  const { user } = await signInWithCredential(auth, credential);

  // Create Firestore profile if it doesn't exist yet
  const userRef = doc(db, COLLECTIONS.USERS, user.uid);
  const existingDoc = await getDoc(userRef);

  if (!existingDoc.exists()) {
    const userDoc: Omit<User, 'id'> = {
      email: user.email ?? '',
      displayName: user.displayName ?? 'Plant Parent',
      householdId: null,
      createdAt: serverTimestamp() as User['createdAt'],
    };

    await setDoc(userRef, userDoc);
  }

  return user;
};
