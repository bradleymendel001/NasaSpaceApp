// =============================================================================
// screens/ExploreScreen.js  — TAB 2
// -----------------------------------------------------------------------------
// Shows 10 random pictures from NASA's archive. Pull down to get a new batch.
//
// Requirement #8: useEffect() loads the list when the screen first appears.
// Requirement #6: the last batch is saved on the phone, so opening the app
//                 again shows it instantly instead of re-downloading. A new
//                 network request only happens when the user pulls to refresh.
// =============================================================================

import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text } from 'react-native';
import ApodCard from '../components/ApodCard';
import StatusMessage from '../components/StatusMessage';
import { fetchRandomApods } from '../services/nasaApi';
import { loadFromCache, saveToCache, CACHE_KEYS } from '../storage/localCache';
import { useFavorites } from '../context/FavoritesContext';
import { colors } from '../theme';

export default function ExploreScreen() {
  const [pictures, setPictures] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // first load
  const [isRefreshing, setIsRefreshing] = useState(false); // pull-to-refresh
  const [error, setError] = useState(null);

  const { addFavorite, isFavorite } = useFavorites();

  // ---------------------------------------------------------------------------
  // Download a NEW random batch from NASA and keep a local copy of it.
  // useCallback keeps the same function between renders, so useEffect below
  // doesn't think it changed and re-run.
  // ---------------------------------------------------------------------------
  const loadNewBatch = useCallback(async () => {
    try {
      setError(null);
      const batch = await fetchRandomApods(10); // network request
      setPictures(batch); // local state → screen updates
      saveToCache(CACHE_KEYS.exploreList, batch); // local copy on the phone
    } catch (e) {
      setError(`Could not load pictures: ${e.message}`);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // First load: use the saved batch if there is one, otherwise download.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    async function loadOnStart() {
      const cached = await loadFromCache(CACHE_KEYS.exploreList);
      if (cached && cached.length > 0) {
        setPictures(cached); // no network request needed
      } else {
        await loadNewBatch();
      }
      setIsLoading(false);
    }
    loadOnStart();
  }, [loadNewBatch]);

  // Called when the user drags the list down.
  async function handleRefresh() {
    setIsRefreshing(true);
    await loadNewBatch();
    setIsRefreshing(false);
  }

  if (isLoading) return <StatusMessage loading message="Searching the cosmos…" />;
  if (error && pictures.length === 0) return <StatusMessage message={error} />;

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.content}
      data={pictures}
      // Every row needs a unique key so React can tell rows apart.
      keyExtractor={(item) => item.date}
      ListHeaderComponent={
        <Text style={styles.hint}>
          {error ?? 'Pull down for a new set of random pictures.'}
        </Text>
      }
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor={colors.accent}
        />
      }
      renderItem={({ item }) => {
        const alreadySaved = isFavorite(item.date); // local check
        return (
          <ApodCard
            apod={item}
            buttonLabel={alreadySaved ? 'Saved ✓' : 'Save to Favorites'}
            buttonDisabled={alreadySaved}
            onPressButton={() => addFavorite(item)}
          />
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16 },
  hint: { color: colors.mutedText, marginBottom: 12, textAlign: 'center' },
});
