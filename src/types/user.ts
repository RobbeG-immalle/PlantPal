import { Timestamp } from 'firebase/firestore';
import { UserSubscription } from './subscription';

/** A registered user in Firestore. */
export interface User {
  id: string;
  email: string;
  displayName: string;
  householdId: string | null;
  createdAt: Timestamp;
  pushToken?: string;
  subscription?: UserSubscription;
}
