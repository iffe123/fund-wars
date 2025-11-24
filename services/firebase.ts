import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAnalytics, Analytics } from "firebase/analytics";

// Helper to access env vars in Vite safely
const getEnv = (key: string) => {
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    // @ts-ignore
    return import.meta.env[key];
  }
  return undefined;
};

const firebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY'),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('VITE_FIREBASE_APP_ID'),
  measurementId: getEnv('VITE_FIREBASE_MEASUREMENT_ID')
};

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let googleProvider: GoogleAuthProvider | undefined;
let analytics: Analytics | undefined;

// Initialize only if config is valid
if (firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.authDomain) {
  try {
      if (getApps().length === 0) {
        app = initializeApp(firebaseConfig);
      } else {
        app = getApps()[0];
      }
      
      auth = getAuth(app);
      db = getFirestore(app);
      googleProvider = new GoogleAuthProvider();
      
      if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
        analytics = getAnalytics(app);
      }
      
      console.log("[FIREBASE] Initialized successfully");
  } catch (error) {
      console.error("[FIREBASE] Initialization failed", error);
  }
} else {
    console.warn("[FIREBASE] Configuration missing. App running in Guest/Offline mode.");
}

export { auth, db, googleProvider, analytics };
