import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase web config for the court-of-blades project. These values are public by
// design (they identify the project; firestore.rules protects the data). VITE_FB_*
// environment variables override them, e.g. for a staging project.
const env = import.meta.env;
const config = {
  apiKey: env.VITE_FB_API_KEY || "AIzaSyDLMovGapK5MU-XlCCgOk1JvzuQFPlCqls",
  authDomain: env.VITE_FB_AUTH_DOMAIN || "court-of-blades.firebaseapp.com",
  projectId: env.VITE_FB_PROJECT_ID || "court-of-blades",
  storageBucket: env.VITE_FB_STORAGE_BUCKET || "court-of-blades.firebasestorage.app",
  messagingSenderId: env.VITE_FB_MESSAGING_SENDER_ID || "330369464223",
  appId: env.VITE_FB_APP_ID || "1:330369464223:web:ef2b667ff618a3e0c92faa",
  measurementId: env.VITE_FB_MEASUREMENT_ID || "G-Q6FZJS9SEJ",
};

export const configured = Boolean(config.apiKey && config.projectId);
export const app = configured ? initializeApp(config) : null;
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
