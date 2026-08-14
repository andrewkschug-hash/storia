import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { deriveIndependence, type IndependenceSnapshot } from '@/src/telemetry/independenceStats';
import { listReadingEvents } from '@/src/telemetry/ReadingEventStore';
import { Radii, Spacing } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

export function ReadingIndependenceCard() {
  const { colors, type } = useTheme();
  const [snapshot, setSnapshot] = useState<IndependenceSnapshot | null>(null);

  useFocusEffect(
    useCallback(() => {
      void listReadingEvents().then((events) => setSnapshot(deriveIndependence(events)));
    }, []),
  );

  if (!snapshot || snapshot.tokensRead === 0) return null;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.backgroundElevated, borderColor: colors.border },
      ]}>
      <Text style={[type.chapterEyebrow, { color: colors.tint }]}>Your reading independence</Text>
      <Text style={[type.body, { color: colors.text, marginTop: Spacing.sm }]}>{snapshot.headline}</Text>
      <Text style={[type.caption, { color: colors.textMuted, marginTop: Spacing.sm }]}>
        {snapshot.lookupsPer100Words.toFixed(1)} lookups per 100 words read · {snapshot.tokensRead}{' '}
        words met
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: Spacing.xl,
    borderRadius: Radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.lg,
  },
});
