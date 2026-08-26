import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { HomeReviewCopy } from '@/src/review/ReviewService';
import { Radii, Spacing } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

type Props = {
  copy: HomeReviewCopy;
};

export function ReviewNudge({ copy }: Props) {
  const { colors, type, minTouchTarget } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.backgroundElevated,
          borderLeftWidth: 3,
          borderLeftColor: colors.accentSecondary,
        },
      ]}>
      <Text style={[type.chapterEyebrow, { color: colors.accentSecondary, letterSpacing: 1.4 }]}>
        Una piccola ripetizione
      </Text>
      <Text style={[type.heroTitle, { color: colors.text, marginTop: Spacing.xs, fontSize: 20, lineHeight: 26 }]}>
        {copy.headline || 'Parole da rivedere'}
      </Text>
      <Text style={[type.body, { color: colors.textSecondary, marginTop: Spacing.xs, fontSize: 14, lineHeight: 20 }]}>
        {copy.detail || 'Ripassale prima della prossima storia.'}
      </Text>
      {copy.cta ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Review vocabulary"
          onPress={() => router.push('/practice' as Href)}
          style={({ pressed }) => [
            styles.cta,
            {
              opacity: pressed ? 0.75 : 1,
              minHeight: minTouchTarget,
            },
          ]}>
          <Text style={[type.label, { color: colors.tint, fontFamily: 'Literata_600SemiBold' }]}>
            {copy.cta} →
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radii.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  cta: {
    alignSelf: 'flex-start',
    marginTop: Spacing.sm,
    justifyContent: 'center',
  },
});

