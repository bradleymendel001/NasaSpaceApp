// =============================================================================
// screens/FavoritesScreen.js  — TAB 3
// -----------------------------------------------------------------------------
// Lists every picture saved in Firebase, with a Delete button on each.
//
// This screen does NOT make its own network request to show the list — it
// renders the LOCAL copy kept by FavoritesContext (requirement #6). That copy
// was loaded from Firebase by a useEffect when the app started (#8), and is
// updated after every successful save/delete, so it always matches the
// database (#7). Pull down to force a fresh READ from Firebase.
// =============================================================================

import React, { useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text } from 'react-native';
import ApodCard from '../components/ApodCard';
import StatusMessage from '../components/StatusMessage';
import { useFavorites } from '../context/FavoritesContext';
import { colors } from '../theme';

export default function FavoritesScreen() {
  const { favorites, isLoading, error, refresh, removeFavorite } = useFavorites();
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function handleRefresh() {
    setIsRefreshing(true);
    await refresh(); // network READ from Firebase → replaces local copy
    setIsRefreshing(false);
  }

  if (isLoading) return <StatusMessage loading message="Loading favorites…" />;

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.content}
      data={favorites}
      // Firebase document ids are unique, so they make perfect keys.
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        error ? <Text style={styles.error}>{error}</Text> : null
      }
      ListEmptyComponent={
        <Text style={styles.empty}>
          No favorites yet. Save a picture from the Today or Explore tab!
        </Text>
      }
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor={colors.accent}
        />
      }
      renderItem={({ item }) => (
        <ApodCard
          apod={item}
          buttonLabel="Delete"
          danger
          onPressButton={() => removeFavorite(item.id)}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, flexGrow: 1 },
  error: { color: colors.danger, marginBottom: 12, textAlign: 'center' },
  empty: { color: colors.mutedText, textAlign: 'center', marginTop: 40 },
});
