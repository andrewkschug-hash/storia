import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ProgressBar } from '@/src/components/ProgressBar';
import type { ReadingProgress } from '@/src/domain/models/types';
import { Radii, Spacing } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

type Props = {
  chapterTitleIt: string;
  storyTitleIt?: string;
  isStart?: boolean;
  eyebrow?: string;
  subtitle?: string;
  buttonLabel?: string;
  progress: ReadingProgress;
  onContinue: () => void;
};

export function ContinueReadingCard({
  chapterTitleIt,
  storyTitleIt,
  isStart = false,
  eyebrow,
  subtitle,
  buttonLabel,
  progress,
  onContinue,
}: Props) {
  const { colors, type, minTouchTarget } = useTheme();
  const chapterPercent = progress.chapterPercentComplete ?? 0;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.readerSurface,
          borderColor: colors.border,
        },
      ]}>
      <Text style={[type.chapterEyebrow, { color: colors.tint }]}>
        {eyebrow ?? (isStart ? 'Start reading' : 'Continue reading')}
      </Text>
      {storyTitleIt ? (
        <Text style={[type.caption, { color: colors.textMuted, marginTop: Spacing.xs }]}>
          {storyTitleIt}
        </Text>
      ) : null}
      <Text style={[type.heroTitle, { color: colors.text, marginTop: Spacing.sm, fontSize: 28 }]}>
        {chapterTitleIt}
      </Text>
      <Text style={[type.caption, { color: colors.textMuted, marginTop: Spacing.sm }]}>
        {subtitle ??
          `Chapter ${progress.chapterNumber} of ${progress.totalChapters}${
            progress.chaptersCompleted > 0
              ? ` · ${progress.chaptersCompleted} finished`
              : ''
          }`}
      </Text>

      <View style={styles.progressBlock}>
        <ProgressBar progress={progress.percentComplete / 100} />
        <Text style={[type.caption, { color: colors.textMuted, marginTop: Spacing.sm }]}>
          {progress.percentComplete}% through the story
        </Text>
        {chapterPercent > 0 && chapterPercent < 100 ? (
          <Text style={[type.caption, { color: colors.textSecondary, marginTop: 4 }]}>
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
            minHeight: minTouchTarget,
          },
        ]}>
        <Text style={[type.button, { color: colors.onTint }]}>
          {buttonLabel ?? (isStart ? 'Start reading' : 'Continue reading')}
        </Text>
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
