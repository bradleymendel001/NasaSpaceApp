// Copy this file to src/config.js and fill in your own values.
// src/config.js is git-ignored so your real keys never get uploaded.
// Get a free NASA key at https://api.nasa.gov
export const NASA_API_KEY = 'PASTE_YOUR_NASA_API_KEY';

const firebaseConfig = {
  apiKey: "PASTE_YOUR_FIREBASE_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.firebasestorage.app",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:0000000000000000",
  measurementId: "G-XXXXXXXXXX"
};

export const isFirebaseConfigured = !firebaseConfig.apiKey.startsWith('PASTE_');
