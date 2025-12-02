import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;

const createFirebaseApp = () => {
  if (app) return app;
  if (typeof window === "undefined") return null;
  if (!firebaseConfig.apiKey) return null;

  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return app;
};

export const getAuthClient = (): Auth | null => {
  const firebaseApp = createFirebaseApp();
  return firebaseApp ? getAuth(firebaseApp) : null;
};

export const getDb = (): Firestore | null => {
  const firebaseApp = createFirebaseApp();
  return firebaseApp ? getFirestore(firebaseApp) : null;
};
