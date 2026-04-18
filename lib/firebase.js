"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

// Add databaseURL to config — this fixes the "different region" warning
const firebaseConfig = {
  apiKey: "AIzaSyBfJ9WB6EdRR-58hg8pOgInVJBKb2R2dXo",
  authDomain: "quailiotapp.firebaseapp.com",
  databaseURL: "https://quailiotapp-default-rtdb.asia-southeast1.firebasedatabase.app", // ✅ important
  projectId: "quailiotapp",
  storageBucket: "quailiotapp.firebasestorage.app",
  messagingSenderId: "107546727116",
  appId: "1:107546727116:web:1ea5a6d9ee0ac4d824a869",
  measurementId: "G-CMQE79E4V9"
};

// Initialize app only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Export auth and database
export const auth = getAuth(app);
export const database = getDatabase(app);