// =============================================================================
// services/nasaApi.js
// -----------------------------------------------------------------------------
// Requirement #4 — network requests to an EXTERNAL API to retrieve data.
//
// We use NASA's "Astronomy Picture of the Day" (APOD) API:
//   https://api.nasa.gov/planetary/apod?api_key=KEY&date=YYYY-MM-DD
// It answers with JSON describing one space picture (title, image url,
// explanation, ...). With `count=N` instead of `date`, it returns N random ones.
//
// Requirement #6 also shows up here: a single day's picture never changes,
// so once we've downloaded it we keep it on the phone and never ask again.
// =============================================================================

import { NASA_API_KEY } from '../config';
import { loadFromCache, saveToCache, CACHE_KEYS } from '../storage/localCache';

const BASE_URL = 'https://api.nasa.gov/planetary/apod';

// -----------------------------------------------------------------------------
// NASA's raw JSON uses names like `media_type` and `thumbnail_url`. This turns
// it into the simpler shape the rest of our app uses. For videos we show the
// video's thumbnail picture instead, so every item has an image to display.
// -----------------------------------------------------------------------------
function toApod(raw) {
  const isVideo = raw.media_type === 'video';
  return {
    date: raw.date,
    title: raw.title,
    explanation: raw.explanation,
    mediaType: raw.media_type,
    url: isVideo ? raw.thumbnail_url : raw.url,
    copyright: raw.copyright ? raw.copyright.trim() : null,
  };
}

// -----------------------------------------------------------------------------
// The actual network request. `fetch` is built into React Native.
// `params` is an object like { date: '2026-11-02' } that we add to the URL.
// -----------------------------------------------------------------------------
async function requestNasa(params) {
  // URLSearchParams builds "api_key=...&thumbs=true&date=..." for us safely.
  const queryString = new URLSearchParams({
    api_key: NASA_API_KEY,
    thumbs: 'true', // ask NASA to include thumbnail images for videos
    ...params,
  }).toString();

  const response = await fetch(`${BASE_URL}?${queryString}`);

  // fetch only throws on "no internet". A server error (like 404 or 500)
  // still "succeeds", so we check `response.ok` ourselves.
  if (!response.ok) {
    throw new Error(`NASA request failed (status ${response.status})`);
  }

  return response.json(); // turn the response body text into JS objects
}

// -----------------------------------------------------------------------------
// Get the picture for one date ("YYYY-MM-DD").
// 1. Look in the local cache first  → instant, no network.
// 2. Otherwise download it from NASA → then save a local copy for next time.
// -----------------------------------------------------------------------------
export async function fetchApodForDate(date) {
  const cacheKey = CACHE_KEYS.apodForDate(date);

  const cached = await loadFromCache(cacheKey);
  if (cached) {
    return cached; // we already have it — skip the network request entirely
  }

  const raw = await requestNasa({ date });
  const apod = toApod(raw);
  await saveToCache(cacheKey, apod);
  return apod;
}

// -----------------------------------------------------------------------------
// Get `count` random pictures from NASA's archive. Random results are
// different each time, so the caller decides when to ask for a new batch.
// -----------------------------------------------------------------------------
export async function fetchRandomApods(count = 10) {
  const rawList = await requestNasa({ count: String(count) });
  // Skip the rare entry that has no picture at all (nothing to display).
  return rawList.map(toApod).filter((apod) => Boolean(apod.url));
}

// -----------------------------------------------------------------------------
// Helper: turn a JS Date into the "YYYY-MM-DD" text NASA expects.
// -----------------------------------------------------------------------------
export function toDateString(dateObject) {
  const year = dateObject.getFullYear();
  const month = String(dateObject.getMonth() + 1).padStart(2, '0'); // months start at 0
  const day = String(dateObject.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
