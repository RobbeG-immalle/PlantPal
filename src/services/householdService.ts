import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  arrayUnion,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Household, Invitation } from '../types/household';
import { User } from '../types/user';
import { COLLECTIONS, INVITE_CODE_LENGTH } from '../utils/constants';

/** Generates a random alphanumeric invite code. */
const generateInviteCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < INVITE_CODE_LENGTH; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};

/**
 * Creates a new household and sets the creator as its first member.
 */
export const createHousehold = async (
  name: string,
  creatorId: string,
): Promise<Household> => {
  const inviteCode = generateInviteCode();
  const now = serverTimestamp() as Timestamp;

  const householdData = {
    name,
    inviteCode,
    createdBy: creatorId,
    memberIds: [creatorId],
    createdAt: now,
  };

  const ref = await addDoc(collection(db, COLLECTIONS.HOUSEHOLDS), householdData);
  const household: Household = { id: ref.id, ...householdData };

  // Update user with householdId
  await updateDoc(doc(db, COLLECTIONS.USERS, creatorId), {
    householdId: ref.id,
  });

  // Create invitation record
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await addDoc(collection(db, COLLECTIONS.INVITATIONS), {
    householdId: ref.id,
    inviteCode,
    createdBy: creatorId,
    createdAt: now,
    expiresAt: Timestamp.fromDate(expiresAt),
  });

  return household;
};

/**
 * Joins an existing household via invite code.
 */
export const joinHousehold = async (
  inviteCode: string,
  userId: string,
): Promise<Household> => {
  // Find invitation
  const invQuery = query(
    collection(db, COLLECTIONS.INVITATIONS),
    where('inviteCode', '==', inviteCode.toUpperCase()),
  );
  const invSnap = await getDocs(invQuery);

  if (invSnap.empty) {
    throw new Error('Invalid invite code. Please check and try again.');
  }

  const invitation = invSnap.docs[0].data() as Invitation;

  // Check expiry
  if (invitation.expiresAt.toDate() < new Date()) {
    throw new Error('This invite code has expired.');
  }

  // Get household
  const householdSnap = await getDoc(
    doc(db, COLLECTIONS.HOUSEHOLDS, invitation.householdId),
  );

  if (!householdSnap.exists()) {
    throw new Error('Household not found.');
  }

  // Add user to household
  await updateDoc(doc(db, COLLECTIONS.HOUSEHOLDS, invitation.householdId), {
    memberIds: arrayUnion(userId),
  });

  // Update user profile
  await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
    householdId: invitation.householdId,
  });

  return { id: householdSnap.id, ...householdSnap.data() } as Household;
};

/**
 * Fetches a household by ID.
 */
export const getHousehold = async (id: string): Promise<Household | null> => {
  const snap = await getDoc(doc(db, COLLECTIONS.HOUSEHOLDS, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Household;
};

/**
 * Fetches all member profiles for a household.
 */
export const getMembers = async (memberIds: string[]): Promise<User[]> => {
  if (memberIds.length === 0) return [];

  const members: User[] = [];
  for (const uid of memberIds) {
    const snap = await getDoc(doc(db, COLLECTIONS.USERS, uid));
    if (snap.exists()) {
      members.push({ id: snap.id, ...snap.data() } as User);
    }
  }
  return members;
};

/**
 * Removes a user from a household and clears their householdId.
 */
export const leaveHousehold = async (
  householdId: string,
  userId: string,
): Promise<void> => {
  const snap = await getDoc(doc(db, COLLECTIONS.HOUSEHOLDS, householdId));
  if (!snap.exists()) return;

  const household = snap.data() as Household;
  const updatedMembers = household.memberIds.filter((id) => id !== userId);

  await updateDoc(doc(db, COLLECTIONS.HOUSEHOLDS, householdId), {
    memberIds: updatedMembers,
  });

  await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
    householdId: null,
  });
};
