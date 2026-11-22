// =============================================================================
// context/FavoritesContext.js
// -----------------------------------------------------------------------------
// The "brain" for saved favorites. It covers:
//   #6 — a LOCAL copy of the data (React state + AsyncStorage on the phone)
//   #7 — keeping the LOCAL copy and the REMOTE copy (Firebase) in sync
//   #8 — useEffect() to load the data when the app first starts
//
// HOW THE SYNC WORKS
// ------------------
// Firebase is the "source of truth". Our local list is a mirror of it.
//
//   • App starts  → show the cached list from the phone instantly, then
//                   download the real list from Firebase and replace it.
//   • Add         → write to Firebase FIRST. Only if that succeeds do we add
//                   it to the local list. If it fails, local stays unchanged.
//   • Delete      → delete in Firebase FIRST. Only if that succeeds do we
//                   remove it locally.
//   • Refresh     → re-download from Firebase (pull-to-refresh), to pick up
//                   changes made somewhere else, e.g. the Firebase console.
//
// Because local only changes AFTER remote confirms, the two copies can never
// disagree. And because screens read from the local list, showing / switching
// tabs / checking "is this saved?" never needs a new network request.
//
// WHY A "CONTEXT"?
// ----------------
// Several screens need the same favorites list. React Context lets us keep
// ONE list here and share it with every screen, instead of each screen
// downloading its own copy (which could get out of sync with each other).
// =============================================================================

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  createFavorite,
  readFavorites,
  deleteFavorite,
} from '../services/favoritesDb';
import { loadFromCache, saveToCache, CACHE_KEYS } from '../storage/localCache';
import { isFirebaseConfigured } from '../config';

// The shared "box" that screens will read from.
const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  // ---------------------------------------------------------------------------
  // LOCAL STATE — the local version of the data the screens render from.
  // ---------------------------------------------------------------------------
  const [favorites, setFavorites] = useState([]); // the list itself
  const [isLoading, setIsLoading] = useState(true); // first load in progress?
  const [error, setError] = useState(null); // last error message, if any

  // ---------------------------------------------------------------------------
  // Save the list to the phone. Called every time the list changes, so the
  // phone's copy always matches what's on screen (and therefore Firebase).
  // ---------------------------------------------------------------------------
  const updateLocal = useCallback((newList) => {
    setFavorites(newList);
    saveToCache(CACHE_KEYS.favorites, newList);
  }, []);

  // ---------------------------------------------------------------------------
  // READ from Firebase and replace the local copy with the result.
  // ---------------------------------------------------------------------------
  const refresh = useCallback(async () => {
    if (!isFirebaseConfigured) {
      setError('Firebase is not set up yet. Add your config in src/config.js.');
      setIsLoading(false);
      return;
    }
    try {
      setError(null);
      const remoteList = await readFavorites(); // network request
      updateLocal(remoteList); // remote wins → local now matches it
    } catch (e) {
      // Keep showing the cached list, but tell the user it may be outdated.
      setError(`Could not reach the database: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [updateLocal]);

  // ---------------------------------------------------------------------------
  // useEffect with an empty dependency list [] runs ONCE, when the app first
  // starts. (#8) We show the cached copy immediately, then sync with Firebase.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    async function loadOnStart() {
      const cached = await loadFromCache(CACHE_KEYS.favorites);
      if (cached) {
        setFavorites(cached); // instant — no waiting on the internet
        setIsLoading(false);
      }
      await refresh(); // then make sure it matches the real database
    }
    loadOnStart();
  }, [refresh]);

  // ---------------------------------------------------------------------------
  // CREATE: Firebase first, then local.
  // Returns true/false so the screen can show success or failure.
  // ---------------------------------------------------------------------------
  const addFavorite = useCallback(
    async (apod) => {
      // Check the LOCAL copy first — no network request needed to know
      // whether this picture is already saved.
      if (favorites.some((f) => f.date === apod.date)) {
        return true;
      }
      try {
        setError(null);
        const saved = await createFavorite(apod); // remote write
        updateLocal([saved, ...favorites]); // succeeded → mirror it locally
        return true;
      } catch (e) {
        setError(`Could not save: ${e.message}`); // local left untouched
        return false;
      }
    },
    [favorites, updateLocal]
  );

  // ---------------------------------------------------------------------------
  // DELETE: Firebase first, then local.
  // ---------------------------------------------------------------------------
  const removeFavorite = useCallback(
    async (id) => {
      try {
        setError(null);
        await deleteFavorite(id); // remote delete
        updateLocal(favorites.filter((f) => f.id !== id)); // then local
        return true;
      } catch (e) {
        setError(`Could not delete: ${e.message}`);
        return false;
      }
    },
    [favorites, updateLocal]
  );

  // Helper screens use to decide "Save" vs "Saved ✓" — reads LOCAL data only.
  const isFavorite = useCallback(
    (date) => favorites.some((f) => f.date === date),
    [favorites]
  );

  // Everything inside `value` is available to any screen via useFavorites().
  const value = {
    favorites,
    isLoading,
    error,
    refresh,
    addFavorite,
    removeFavorite,
    isFavorite,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

// Screens call this to get the shared favorites data and functions.
export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used inside <FavoritesProvider>');
  }
  return context;
}
