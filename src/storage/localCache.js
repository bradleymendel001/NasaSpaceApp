// =============================================================================
// storage/localCache.js
// -----------------------------------------------------------------------------
// Requirement #6 — storing "local versions" of data.
//
// AsyncStorage is a small key/value store saved ON THE PHONE ITSELF. Data put
// here survives closing and reopening the app, and reading it is instant —
// no internet required. We use it as a cache: before asking NASA or Firebase
// for something, we check if we already have a local copy.
//
// AsyncStorage can only store STRINGS, so these helpers convert our objects
// to text (JSON.stringify) on the way in and back (JSON.parse) on the way out.
// =============================================================================

import AsyncStorage from '@react-native-async-storage/async-storage';

// Read a value. Returns `null` if nothing is saved under that key yet.
export async function loadFromCache(key) {
  try {
    const text = await AsyncStorage.getItem(key);
    return text === null ? null : JSON.parse(text);
  } catch (error) {
    // A broken cache should never crash the app — just act like it's empty.
    console.warn(`Could not read "${key}" from local cache`, error);
    return null;
  }
}

// Save (or overwrite) a value.
export async function saveToCache(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Could not write "${key}" to local cache`, error);
  }
}

// The names ("keys") we save things under, kept in one spot to avoid typos.
export const CACHE_KEYS = {
  favorites: 'favorites',
  exploreList: 'explore-list',
  apodForDate: (date) => `apod-${date}`, // e.g. "apod-2026-11-02"
};
