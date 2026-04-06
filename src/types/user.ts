import { Timestamp } from 'firebase/firestore';

/** A registered user in Firestore. */
export interface User {
  id: string;
  email: string;
  displayName: string;
  householdId: string | null;
  createdAt: Timestamp;
  pushToken?: string;
}
