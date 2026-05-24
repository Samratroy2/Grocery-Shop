// ─────────────────────────────────────────
// firebase.js
// ─────────────────────────────────────────

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

// ───────────────── Firestore ─────────────────

import {

  getFirestore,

  collection,
  getDocs,
  addDoc,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,

  query,
  where,
  orderBy,

  serverTimestamp,
  increment

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ───────────────── Auth ─────────────────

import {

  getAuth,

  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,

  signOut as fbSignOut,

  onAuthStateChanged,

  updateProfile

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// ───────────────── Config ─────────────────

const firebaseConfig = {

  apiKey: "AIzaSyBLQzZ3fs_VAImz7VURVytKnpDDWlbReRc",
  authDomain: "grocery-store-e0e81.firebaseapp.com",
  projectId: "grocery-store-e0e81",
  storageBucket: "grocery-store-e0e81.firebasestorage.app",
  messagingSenderId: "578320966151",
  appId: "1:578320966151:web:a208a973e9c19b21fa00a2",
  measurementId: "G-PXG1XEMZ2E"

};

// ───────────────── Init ─────────────────

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);

// ───────────────── Exports ─────────────────

export {

  db,
  auth,

  // firestore

  collection,
  getDocs,
  addDoc,

  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,

  query,
  where,
  orderBy,

  serverTimestamp,
  increment,

  // auth

  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,

  fbSignOut,

  onAuthStateChanged,

  updateProfile

};