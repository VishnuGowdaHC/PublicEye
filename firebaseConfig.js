import { initializeApp, getApps } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyCyDFAWEI9bGA5ge2WgGNjcgbhfvOXN5G4",
  authDomain: "publiceye-904be.firebaseapp.com",
  projectId: "publiceye-904be",
  storageBucket: "publiceye-904be.firebasestorage.app",
  appId: "1:258509712799:android:24213124946f90fac9e1aa",
};

const firebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

import { getAuth } from "firebase/auth";

let firebaseAuth;
try {
  firebaseAuth = getAuth(firebaseApp);
} catch {
  firebaseAuth = initializeAuth(firebaseApp, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

export { firebaseApp, firebaseAuth, db, storage };
