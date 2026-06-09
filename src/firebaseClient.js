import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { supabase } from './supabaseClient';

// Default configuration with env loaders and placeholders
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyFakeKeyPlaceholderHere",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "polytechnic-karle.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "polytechnic-karle",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "polytechnic-karle.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1234567890:web:abcd1234efgh"
};

let db = null;
let firebaseInitialized = false;

try {
  // Only initialize if we have a valid key (not default placeholder) or explicit setup
  if (import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_API_KEY !== "AIzaSyFakeKeyPlaceholderHere") {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    firebaseInitialized = true;
  } else {
    console.warn("Using local storage fallback for live logins. Set VITE_FIREBASE_API_KEY to enable real Firebase.");
  }
} catch (error) {
  console.warn("Firebase failed to initialize. Gracefully falling back.", error.message);
}

/**
 * Log student login event to Firebase Firestore
 * @param {Object} student 
 * @param {boolean} isDemo 
 */
export const logStudentLogin = async (student, isDemo = false) => {
  const loginPayload = {
    roll: String(student.roll || "Unknown"),
    name: String(student.name || "Unknown"),
    rank: parseInt(student.rank) || 0,
    category: String(student.category || "UR"),
    isPremium: Boolean(student.isPremium || false),
    isDemo: Boolean(isDemo),
    timestamp: new Date().toISOString()
  };

  // 1. Write to Supabase student_logins table for multi-device database persistence
  try {
    await supabase
      .from('student_logins')
      .insert([{
        roll: loginPayload.roll,
        name: loginPayload.name,
        rank: loginPayload.rank,
        category: loginPayload.category,
        is_premium: loginPayload.isPremium,
        is_demo: loginPayload.isDemo
      }]);
  } catch (err) {
    console.warn("Supabase logins write warning:", err.message);
  }

  // 2. Local storage fallback log (always update this so we have a local backup)
  try {
    const fallbackLog = JSON.parse(localStorage.getItem('pk_fallback_logins') || '[]');
    fallbackLog.push(loginPayload);
    localStorage.setItem('pk_fallback_logins', JSON.stringify(fallbackLog.slice(-100))); // Keep last 100 entries
  } catch (e) {
    console.warn("Failed to write login fallback to localStorage:", e);
  }

  // 3. Firebase write
  if (firebaseInitialized && db) {
    try {
      await addDoc(collection(db, "student_logins"), {
        ...loginPayload,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.warn("Firebase push failed, fallback log saved.", error.message);
    }
  }
};

export { db, collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, limit, getDocs, firebaseInitialized };
