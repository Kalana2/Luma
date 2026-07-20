import { initializeApp } from 'firebase/app'
import { getDatabase, ref, onValue, off, get, set, update, connectDatabaseEmulator } from 'firebase/database'
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'demo.firebaseapp.com',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || 'http://localhost:9000?ns=demo',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'demo.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '000000000000',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:000000000000:web:demo',
}

const useEmulator = import.meta.env.VITE_USE_EMULATOR === 'true'

let app, db, auth

try {
  app = initializeApp(firebaseConfig)
  db = getDatabase(app)
  auth = getAuth(app)

  if (useEmulator) {
    connectDatabaseEmulator(db, 'localhost', 9000)
    console.log('Connected to Firebase Emulator')
  }
} catch (err) {
  console.error('Firebase init failed:', err)
  db = null
  auth = null
}

export { db, auth, ref, onValue, off, get, set, update, signInAnonymously, onAuthStateChanged }
