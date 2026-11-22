// =============================================================================
// components/ApodCard.js
// -----------------------------------------------------------------------------
// A reusable "card" that shows one space picture: image, title, date and an
// optional explanation, plus ONE action button (Save, or Delete).
// All three screens use this same component so they look consistent.
// =============================================================================

import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors } from '../theme';

// Props (inputs) this component accepts:
//   apod            the picture object { date, title, url, explanation, ... }
//   showExplanation true → show the full description text under the title
//   buttonLabel     text on the button, e.g. "Save" or "Delete"
//   buttonDisabled  true → grey the button out (e.g. already saved)
//   onPressButton   async function to run when the button is pressed
//   danger          true → red button (used for Delete)
export default function ApodCard({
  apod,
  showExplanation = false,
  buttonLabel,
  buttonDisabled = false,
  onPressButton,
  danger = false,
}) {
  // While the button's network request runs, show a spinner and block
  // double-taps (which would otherwise send two requests).
  const [isWorking, setIsWorking] = useState(false);

  async function handlePress() {
    setIsWorking(true);
    await onPressButton();
    setIsWorking(false);
  }

  return (
    <View style={styles.card}>
      <Image source={{ uri: apod.url }} style={styles.image} resizeMode="cover" />

      <View style={styles.body}>
        <Text style={styles.title}>{apod.title}</Text>
        <Text style={styles.meta}>
          {apod.date}
          {apod.mediaType === 'video' ? '  ·  video' : ''}
          {apod.copyright ? `  ·  © ${apod.copyright}` : ''}
        </Text>

        {showExplanation && (
          <Text style={styles.explanation}>{apod.explanation}</Text>
        )}

        {/* Only draw the button if the screen gave us something to do */}
        {onPressButton && (
          <Pressable
            onPress={handlePress}
            disabled={buttonDisabled || isWorking}
            style={({ pressed }) => [
              styles.button,
              danger && styles.buttonDanger,
              (buttonDisabled || isWorking) && styles.buttonDisabled,
              pressed && styles.buttonPressed,
            ]}
          >
            {isWorking ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>{buttonLabel}</Text>
            )}
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    overflow: 'hidden', // clip the image to the rounded corners
    marginBottom: 16,
  },
  image: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: '#000',
  },
  body: {
    padding: 14,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  meta: {
    color: colors.mutedText,
    marginTop: 4,
    fontSize: 13,
  },
  explanation: {
    color: colors.text,
    marginTop: 10,
    lineHeight: 21,
  },
  button: {
    marginTop: 12,
    backgroundColor: colors.accent,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonDanger: {
    backgroundColor: colors.danger,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
