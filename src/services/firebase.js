// =============================================================================
// services/firebase.js
// -----------------------------------------------------------------------------
// Connects the app to YOUR Firebase project and exports `db`, a handle to the
// Cloud Firestore database. Every other file that talks to the database
// imports `db` from here, so the connection is only set up once.
// =============================================================================

import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';
import { firebaseConfig } from '../config';

// Step 1: "Log in" to our Firebase project using the settings from config.js.
const app = initializeApp(firebaseConfig);

// Step 2: Open the Firestore database inside that project.
// `experimentalForceLongPolling` makes Firestore use plain HTTP requests
// instead of WebSocket-style streaming connections, which React Native does
// not fully support. Without it, requests can hang forever on a phone.
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});
