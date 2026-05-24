// ─────────────────────────────────────────
// firebase.js  —  Firebase init & exports
// ─────────────────────────────────────────

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey:            "AIzaSyBLQzZ3fs_VAImz7VURVytKnpDDWlbReRc",
  authDomain:        "grocery-store-e0e81.firebaseapp.com",
  projectId:         "grocery-store-e0e81",
  storageBucket:     "grocery-store-e0e81.firebasestorage.app",
  messagingSenderId: "578320966151",
  appId:             "1:578320966151:web:a208a973e9c19b21fa00a2",
  measurementId:     "G-PXG1XEMZ2E",
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

export {
  auth, db,
  // Auth helpers
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  fbSignOut,
  onAuthStateChanged,
  updateProfile,
  // Firestore helpers
  collection, doc, setDoc, getDoc, getDocs,
  addDoc, updateDoc, deleteDoc,
  query, where, orderBy, serverTimestamp,
};
