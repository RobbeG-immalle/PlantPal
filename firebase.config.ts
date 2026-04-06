import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY ?? 'demo-api-key',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN ?? 'demo.firebaseapp.com',
  projectId: process.env.FIREBASE_PROJECT_ID ?? 'demo-project',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET ?? 'demo.appspot.com',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID ?? '000000000000',
  appId: process.env.FIREBASE_APP_ID ?? '1:000000000000:web:demo',
};

// Initialize Firebase app (avoid duplicate initialization)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Auth with AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Firestore
export const db = getFirestore(app);

// Storage (for plant images)
export const storage = getStorage(app);

export default app;
