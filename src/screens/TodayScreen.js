// =============================================================================
// screens/TodayScreen.js  — TAB 1
// -----------------------------------------------------------------------------
// Shows NASA's Astronomy Picture of the Day, with a button to save it to the
// Firebase favorites list.
//
// Requirement #8: useEffect() fetches the picture when the screen first loads.
// Requirement #4: the fetch is a network request to the NASA API.
// Requirement #6: fetchApodForDate() checks the phone's cache first, so
//                 reopening the app later today makes NO network request.
// =============================================================================

import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import ApodCard from '../components/ApodCard';
import StatusMessage from '../components/StatusMessage';
import { fetchApodForDate, toDateString } from '../services/nasaApi';
import { useFavorites } from '../context/FavoritesContext';
import { colors } from '../theme';

export default function TodayScreen() {
  const [apod, setApod] = useState(null); // the picture, once loaded
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Shared favorites data (from FavoritesContext — the local copy).
  const { addFavorite, isFavorite } = useFavorites();

  // ---------------------------------------------------------------------------
  // Runs once when the screen first appears (empty dependency list []).
  // ---------------------------------------------------------------------------
  useEffect(() => {
    async function loadPicture() {
      const today = new Date();
      try {
        setApod(await fetchApodForDate(toDateString(today)));
      } catch {
        // NASA posts each picture in US Eastern time, so early in the day (or
        // in a time zone ahead of New York) "today" may not exist yet.
        // In that case, fall back to yesterday's picture.
        try {
          const yesterday = new Date(today);
          yesterday.setDate(today.getDate() - 1);
          setApod(await fetchApodForDate(toDateString(yesterday)));
        } catch (e) {
          setError(`Could not load the picture: ${e.message}`);
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadPicture();
  }, []);

  // Decide what to show based on the current state.
  if (isLoading) return <StatusMessage loading message="Contacting NASA…" />;
  if (error) return <StatusMessage message={error} />;

  // isFavorite() reads the LOCAL list — no network request to check this.
  const alreadySaved = isFavorite(apod.date);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <ApodCard
        apod={apod}
        showExplanation
        buttonLabel={alreadySaved ? 'Saved ✓' : 'Save to Favorites'}
        buttonDisabled={alreadySaved}
        onPressButton={() => addFavorite(apod)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16 },
});
