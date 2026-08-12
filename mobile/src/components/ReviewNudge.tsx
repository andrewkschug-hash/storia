import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { HomeReviewCopy } from '@/src/review/ReviewService';
import { Radii, Spacing, Typography } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

type Props = {
  copy: HomeReviewCopy;
};

export function ReviewNudge({ copy }: Props) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.backgroundElevated,
          borderColor: colors.border,
        },
      ]}>
      <Text style={[Typography.chapterEyebrow, { color: colors.textMuted }]}>
        Vocabulary
      </Text>
      <Text style={[Typography.label, { color: colors.text, marginTop: Spacing.sm }]}>
        {copy.headline}
      </Text>
      <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: 4 }]}>
        {copy.detail}
      </Text>
      {copy.cta ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Review vocabulary"
          onPress={() => router.push('/review' as Href)}
          style={({ pressed }) => [
            styles.cta,
            {
              borderColor: colors.border,
              backgroundColor: colors.backgroundElevated,
              opacity: pressed ? 0.88 : 1,
            },
          ]}>
          <Text style={[Typography.label, { color: colors.tint }]}>{copy.cta}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.lg,
  },
  cta: {
    alignSelf: 'flex-start',
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.sm,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
