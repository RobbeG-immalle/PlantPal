import { Timestamp } from 'firebase/firestore';

/** A household shared between multiple users. */
export interface Household {
  id: string;
  name: string;
  inviteCode: string;
  createdBy: string;
  memberIds: string[];
  createdAt: Timestamp;
}

/** An invitation to join a household. */
export interface Invitation {
  id: string;
  householdId: string;
  inviteCode: string;
  createdBy: string;
  createdAt: Timestamp;
  expiresAt: Timestamp;
}
