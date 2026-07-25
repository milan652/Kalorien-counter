import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInAnonymously, 
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile, MealEntry, WeightLog, WaterLog } from '../types';

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();

// Auth functions
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google Sign-in error:', error);
    throw error;
  }
}

export async function signInAsGuest() {
  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (error) {
    console.error('Guest Sign-in error:', error);
    throw error;
  }
}

export async function registerWithEmail(email: string, pass: string) {
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  return result.user;
}

export async function loginWithEmail(email: string, pass: string) {
  const result = await signInWithEmailAndPassword(auth, email, pass);
  return result.user;
}

export async function logoutUser() {
  await firebaseSignOut(auth);
}

// User Profile Firestore functions
export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export function cleanFirestoreObject<T extends Record<string, any>>(obj: T): T {
  if (!obj || typeof obj !== 'object') return obj;
  const cleaned: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (value !== undefined) {
      if (value !== null && typeof value === 'object' && !(value instanceof Date) && !Array.isArray(value)) {
        cleaned[key] = cleanFirestoreObject(value);
      } else {
        cleaned[key] = value;
      }
    }
  }
  return cleaned as T;
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  try {
    const userDocRef = doc(db, 'users', profile.uid);
    const cleaned = cleanFirestoreObject({
      ...profile,
      updatedAt: new Date().toISOString()
    });
    await setDoc(userDocRef, cleaned, { merge: true });
  } catch (error) {
    console.error('Error saving user profile:', error);
    throw error;
  }
}

// Meal Entries Firestore functions
export async function fetchMealEntriesForDate(uid: string, dateStr: string): Promise<MealEntry[]> {
  try {
    const mealsRef = collection(db, 'users', uid, 'mealEntries');
    const q = query(mealsRef, where('date', '==', dateStr));
    const snapshot = await getDocs(q);
    const meals: MealEntry[] = [];
    snapshot.forEach((docSnap) => {
      meals.push({ id: docSnap.id, ...docSnap.data() } as MealEntry);
    });
    return meals.sort((a, b) => a.timestamp - b.timestamp);
  } catch (error) {
    console.error('Error fetching meals:', error);
    return [];
  }
}

export async function addMealEntry(uid: string, entry: Omit<MealEntry, 'id'>): Promise<string> {
  try {
    const mealsRef = collection(db, 'users', uid, 'mealEntries');
    const cleaned = cleanFirestoreObject(entry);

    // Enforce Firestore 1MB document limit safety check
    if (cleaned.imageUrl && cleaned.imageUrl.length > 400000) {
      console.warn('imageUrl string too large for Firestore document limit (>400KB). Omitting image payload.');
      delete cleaned.imageUrl;
    }

    const docRef = await addDoc(mealsRef, cleaned);
    return docRef.id;
  } catch (error) {
    console.error('Error adding meal:', error);
    throw error;
  }
}

export async function deleteMealEntry(uid: string, entryId: string): Promise<void> {
  try {
    const mealDocRef = doc(db, 'users', uid, 'mealEntries', entryId);
    await deleteDoc(mealDocRef);
  } catch (error) {
    console.error('Error deleting meal:', error);
    throw error;
  }
}

// Weight Logs Firestore functions
export async function fetchWeightLogs(uid: string): Promise<WeightLog[]> {
  try {
    const weightRef = collection(db, 'users', uid, 'weightLogs');
    const snapshot = await getDocs(weightRef);
    const logs: WeightLog[] = [];
    snapshot.forEach((docSnap) => {
      logs.push({ id: docSnap.id, ...docSnap.data() } as WeightLog);
    });
    return logs.sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error('Error fetching weight logs:', error);
    return [];
  }
}

export async function addWeightLog(uid: string, log: Omit<WeightLog, 'id'>): Promise<string> {
  try {
    const weightRef = collection(db, 'users', uid, 'weightLogs');
    const cleaned = cleanFirestoreObject(log);
    const docRef = await addDoc(weightRef, cleaned);
    return docRef.id;
  } catch (error) {
    console.error('Error adding weight log:', error);
    throw error;
  }
}

// Water Logs Firestore functions
export async function fetchWaterLog(uid: string, dateStr: string): Promise<number> {
  try {
    const waterDocRef = doc(db, 'users', uid, 'waterLogs', dateStr);
    const snap = await getDoc(waterDocRef);
    if (snap.exists()) {
      return snap.data().amountMl || 0;
    }
    return 0;
  } catch (error) {
    console.error('Error fetching water log:', error);
    return 0;
  }
}

export async function saveWaterLog(uid: string, dateStr: string, amountMl: number): Promise<void> {
  try {
    const waterDocRef = doc(db, 'users', uid, 'waterLogs', dateStr);
    const cleaned = cleanFirestoreObject({
      userId: uid,
      date: dateStr,
      amountMl,
      timestamp: Date.now()
    });
    await setDoc(waterDocRef, cleaned, { merge: true });
  } catch (error) {
    console.error('Error saving water log:', error);
    throw error;
  }
}
