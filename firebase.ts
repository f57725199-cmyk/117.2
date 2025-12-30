
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const getUserProgress = async (userId: string) => {
  try {
    const docRef = doc(db, "users", userId.toLowerCase().trim());
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};

export const saveUserProgress = async (userId: string, data: any) => {
  try {
    const docRef = doc(db, "users", userId.toLowerCase().trim());
    await setDoc(docRef, data, { merge: true });
  } catch (error) {
    console.error("Error saving to Firestore:", error);
  }
};
