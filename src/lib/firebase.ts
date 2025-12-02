import {
  getApp,
  getApps,
  initializeApp,
  type FirebaseApp,
} from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

const getFirebaseApp = () => {
  if (app) return app;
  if (!firebaseConfig.apiKey) {
    return null;
  }
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return app;
};

export const getAuthClient = (): Auth | null => {
  if (authInstance) return authInstance;
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return null;

  authInstance = getAuth(firebaseApp);
  return authInstance;
};

export const getDb = (): Firestore | null => {
  if (dbInstance) return dbInstance;
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return null;
  dbInstance = getFirestore(firebaseApp);
  return dbInstance;
};
