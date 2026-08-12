import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ProgressBar } from '@/src/components/ProgressBar';
import type { ReadingProgress } from '@/src/domain/models/types';
import { Radii, Spacing, Typography } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

type Props = {
  chapterTitleIt: string;
  progress: ReadingProgress;
  onContinue: () => void;
};

export function ContinueReadingCard({ chapterTitleIt, progress, onContinue }: Props) {
  const { colors } = useTheme();
  const chapterPercent = progress.chapterPercentComplete ?? 0;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.backgroundElevated,
          borderColor: colors.border,
        },
      ]}>
      <Text style={[Typography.chapterEyebrow, { color: colors.tint }]}>Continue reading</Text>
      <Text style={[Typography.heroTitle, { color: colors.text, marginTop: Spacing.sm, fontSize: 28 }]}>
        {chapterTitleIt}
      </Text>
      <Text style={[Typography.caption, { color: colors.textMuted, marginTop: Spacing.sm }]}>
        Chapter {progress.chapterNumber} of {progress.totalChapters}
        {progress.chaptersCompleted > 0
          ? ` · ${progress.chaptersCompleted} finished`
          : ''}
      </Text>

      <View style={styles.progressBlock}>
        <ProgressBar progress={progress.percentComplete / 100} />
        <Text style={[Typography.caption, { color: colors.textMuted, marginTop: Spacing.sm }]}>
          {progress.percentComplete}% through the story
        </Text>
        {chapterPercent > 0 && chapterPercent < 100 ? (
          <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: 4 }]}>
            {chapterPercent}% through this chapter
          </Text>
        ) : null}
      </View>

      <Pressable
        onPress={onContinue}
        accessibilityRole="button"
        accessibilityLabel={`Continue reading ${chapterTitleIt}`}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: colors.tint,
            opacity: pressed ? 0.88 : 1,
          },
        ]}>
        <Text style={[Typography.button, { color: '#F7FAF9' }]}>Continue reading</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.lg,
  },
  progressBlock: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radii.md,
  },
});
