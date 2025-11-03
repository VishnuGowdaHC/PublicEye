// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyCyDFAWEI9bGA5ge2WgGNjcgbhfvOXN5G4',
  authDomain: 'publiceye-904be.firebaseapp.com',
  projectId: 'publiceye-904be',
  storageBucket: 'publiceye-904be.appspot.com',
  appId: '1:258509712799:android:24213124946f90fac9e1aa',
};
 
export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
