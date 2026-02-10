import * as admin from 'firebase-admin';
import { SessionProps } from '../../types';
import { StickyBarConfig } from '@/types/config';

// Firebase Admin SDK initialization for server-side operations
const { 
  FIRE_ADMIN_PROJECT_ID, 
  FIRE_ADMIN_CLIENT_EMAIL, 
  FIRE_ADMIN_PRIVATE_KEY 
} = process.env;

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: FIRE_ADMIN_PROJECT_ID,
      clientEmail: FIRE_ADMIN_CLIENT_EMAIL,
      privateKey: FIRE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

export async function setUser ({ user }: SessionProps, storeHash: string) {
  if (!user || !storeHash) return null;

  const { email, id, username } = user;
  const ref = db.collection("users").doc(String(id));

  const docSnap = await ref.get();

  if (!docSnap.exists) {
    await ref.set({ email, username, stores: [storeHash] });
  } else {
    await ref.update({ email, username: username || null, stores: admin.firestore.FieldValue.arrayUnion(storeHash) });
  }
}
 
export async function setStore(session: SessionProps) {
  const {
    access_token: accessToken,
    context,
    scope,
    user: { id },
  } = session;
  // Only set on app install or update
  if (!accessToken || !scope) return null;
 
  const storeHash = context?.split('/')[1] || '';
  const ref = db.collection('stores').doc(storeHash);
  const data = { accessToken, adminId: id, scope };
 
  await ref.set(data);

  return ref.id;
}
 
export async function getStoreToken(storeHash: string) {
    if (!storeHash) return null;
    const storeDoc = await db.collection('stores').doc(storeHash).get();
 
    return storeDoc.data()?.accessToken ?? null;
}
 
export async function deleteStore(session: SessionProps): Promise<[string, string] | null> {
    const contextString = session?.context || session?.sub || '';
    const storeHash = contextString.split('/')[1] || '';

    if (!storeHash) return null;
    
    const ref = db.collection('stores').doc(storeHash);
    const docSnap = await ref.get();

    if (!docSnap.exists) return null;
    
    const userId = docSnap.data()?.adminId || '';

    await ref.delete();

    return [userId, storeHash];
}

export async function deleteUser(userId: string, storeHash: string) {
  if (!userId || !storeHash) return null;

  const userRef = db.collection('users').doc(String(userId));
  const userSnapBefore = await userRef.get();

  if (!userSnapBefore.exists) {
    return null;
  }

  // Ensure we're removing the correct hash
  try {
    await userRef.update({
      stores: admin.firestore.FieldValue.arrayRemove(storeHash),
    });
  } catch (error) {
    return null;
  }

  // Wait for Firestore consistency
  await new Promise((r) => setTimeout(r, 200));

  const userSnapAfter = await userRef.get();
  const dataAfter = userSnapAfter.data();

  if (!dataAfter?.stores?.length) {
    await userRef.delete();
  }
}

export async function setStickyBarConfig(storeHash: string, config: StickyBarConfig) {
  if (!storeHash || !config) return null;

  try {
    const ref = db.collection('stores').doc(storeHash).collection('stickyBar').doc('config');
    await ref.set(config);
    return ref.id;
  } catch (error) {
    return null;
  }
}

export async function getStickyBarConfig(storeHash: string): Promise<StickyBarConfig | null> {
  if (!storeHash) return null;

  try {
    const ref = db.collection('stores').doc(storeHash).collection('stickyBar').doc('config');
    const doc = await ref.get();
    return doc.data() as StickyBarConfig;
  } catch (error) {
    return null;
  }
}

export async function deleteStickyBarConfig(storeHash: string) {
  if (!storeHash) return null;

  try {
    const ref = db.collection('stores').doc(storeHash).collection('stickyBar').doc('config');
    await ref.delete();
    return;
  } catch (error) {
    return null;
  }
}
