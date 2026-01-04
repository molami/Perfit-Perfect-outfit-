// Import Firebase core and required services
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Your Firebase configuration (from your console)
const firebaseConfig = {
  apiKey: "AIzaSyA6qhqb12ajoO72ZeUp0Y_ro8T2duaGd7I",
  authDomain: "perfit-smart-closet.firebaseapp.com",
  projectId: "perfit-smart-closet",
  storageBucket: "perfit-smart-closet.appspot.com",
  messagingSenderId: "406345680527",
  appId: "1:406345680527:web:10891d4a86d1f563bc52fa",
  measurementId: "G-1TJ8NWSL5X",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// ✅ Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export { analytics, app };

