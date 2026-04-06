import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User } from '../types/user';
import { COLLECTIONS } from '../utils/constants';

/**
 * Signs up a new user with email/password and creates a Firestore profile.
 */
export const signUp = async (
  email: string,
  password: string,
  displayName: string,
): Promise<FirebaseUser> => {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);

  await updateProfile(user, { displayName });

  const userDoc: Omit<User, 'id'> = {
    email,
    displayName,
    householdId: null,
    createdAt: serverTimestamp() as User['createdAt'],
  };

  await setDoc(doc(db, COLLECTIONS.USERS, user.uid), userDoc);

  return user;
};

/**
 * Signs in an existing user with email/password.
 */
export const signIn = async (
  email: string,
  password: string,
): Promise<FirebaseUser> => {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return user;
};

/**
 * Signs out the current user.
 */
export const signOut = async (): Promise<void> => {
  await firebaseSignOut(auth);
};

/**
 * Returns the currently authenticated Firebase user, or null.
 */
export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

/**
 * Fetches the Firestore user profile for a given uid.
 */
export const getUserProfile = async (uid: string): Promise<User | null> => {
  const snap = await getDoc(doc(db, COLLECTIONS.USERS, uid));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as User;
};

/**
 * Subscribes to auth state changes. Returns an unsubscribe function.
 */
export const subscribeToAuthChanges = (
  callback: (user: FirebaseUser | null) => void,
): (() => void) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Updates the user's push notification token in Firestore.
 */
export const updatePushToken = async (
  uid: string,
  pushToken: string,
): Promise<void> => {
  await setDoc(
    doc(db, COLLECTIONS.USERS, uid),
    { pushToken },
    { merge: true },
  );
};
