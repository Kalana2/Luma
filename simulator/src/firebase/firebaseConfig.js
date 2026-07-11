import { initializeApp } from 'firebase/app'
import { getDatabase, ref, onValue, off, get, set, update } from 'firebase/database'
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

let app, db, auth

try {
  app = initializeApp(firebaseConfig)
  db = getDatabase(app)
  auth = getAuth(app)
} catch (err) {
  console.error('Firebase init failed:', err)
  db = null
  auth = null
}

export { db, auth, ref, onValue, off, get, set, update, signInAnonymously, onAuthStateChanged }
