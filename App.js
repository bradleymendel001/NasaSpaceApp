// =============================================================================
// App.js — the root of the app.
// -----------------------------------------------------------------------------
// Requirement #1: multiple screens, traversable via BOTTOM TAB navigation.
//
// The layers, from outside in:
//   FavoritesProvider   shares the favorites list with every screen
//   NavigationContainer keeps track of which screen is showing
//   Tab.Navigator       draws the tab bar at the bottom and swaps screens
//   Tab.Screen (x3)     the three screens: Today, Explore, Favorites
// =============================================================================

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { FavoritesProvider, useFavorites } from './src/context/FavoritesContext';
import TodayScreen from './src/screens/TodayScreen';
import ExploreScreen from './src/screens/ExploreScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import { colors } from './src/theme';

// Creates the tab navigator "factory" we use below.
const Tab = createBottomTabNavigator();

// Which icon each tab shows (names come from https://icons.expo.fyi).
const TAB_ICONS = {
  Today: 'planet',
  Explore: 'telescope',
  Favorites: 'heart',
};

// Make React Navigation's built-in dark theme use our space colors.
const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.card,
    primary: colors.accent,
    text: colors.text,
  },
};

// The tabs live in their own component so they can read the favorites count
// (hooks like useFavorites only work INSIDE <FavoritesProvider>).
function Tabs() {
  const { favorites } = useFavorites();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // Draw the icon for each tab; `focused` is true for the active tab.
        tabBarIcon: ({ focused, color, size }) => {
          const base = TAB_ICONS[route.name];
          const name = focused ? base : `${base}-outline`;
          return <Ionicons name={name} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.mutedText,
      })}
    >
      <Tab.Screen
        name="Today"
        component={TodayScreen}
        options={{ title: 'Picture of the Day', tabBarLabel: 'Today' }}
      />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        // The little number badge comes from the LOCAL list — no network.
        options={{ tabBarBadge: favorites.length > 0 ? favorites.length : undefined }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <FavoritesProvider>
      <NavigationContainer theme={navigationTheme}>
        <Tabs />
        <StatusBar style="light" />
      </NavigationContainer>
    </FavoritesProvider>
  );
}
