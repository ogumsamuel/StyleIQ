import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDISpVflELDpuy1YvOUmJr7iFLXav10VTs',
  authDomain: 'styleiq-f7cbd.firebaseapp.com',
  projectId: 'styleiq-f7cbd',
  storageBucket: 'styleiq-f7cbd.firebasestorage.app',
  messagingSenderId: '321958020385',
  appId: '1:321958020385:web:6e4b0588b476672690ea60',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);