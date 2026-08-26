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
          backgroundColor: colors.backgroundElevated,
          borderLeftWidth: 4,
          borderLeftColor: colors.tint,
        },
      ]}>
      <Text style={[type.chapterEyebrow, { color: colors.tint, letterSpacing: 1.4 }]}>
        {eyebrow ?? (isStart ? 'Inizia a leggere' : 'Continua la tua storia')}
      </Text>
      {storyTitleIt ? (
        <Text style={[type.caption, { color: colors.textSecondary, marginTop: Spacing.xs, letterSpacing: 0.8 }]}>
          {storyTitleIt.toUpperCase()}
        </Text>
      ) : null}
      <Text
        style={[
          type.heroTitle,
          {
            color: colors.text,
            marginTop: Spacing.xs,
            fontSize: 26,
            lineHeight: 32,
          },
        ]}>
        {chapterTitleIt}
      </Text>
      <Text style={[type.body, { color: colors.textSecondary, marginTop: Spacing.xs, fontSize: 14, lineHeight: 20 }]}>
        {subtitle ??
          `Capitolo ${progress.chapterNumber} di ${progress.totalChapters}${
            progress.chaptersCompleted > 0
              ? ` · ${progress.chaptersCompleted} completati`
              : ''
          }`}
      </Text>

      <View style={styles.progressBlock}>
        <ProgressBar progress={progress.percentComplete / 100} />
        <View style={styles.progressMeta}>
          <Text style={[type.caption, { color: colors.textMuted }]}>
            {progress.percentComplete}% della storia
          </Text>
          {chapterPercent > 0 && chapterPercent < 100 ? (
            <Text style={[type.caption, { color: colors.textSecondary }]}>
              {chapterPercent}% di questo capitolo
            </Text>
          ) : null}
        </View>
      </View>

      <Pressable
        onPress={onContinue}
        accessibilityRole="button"
        accessibilityLabel={`Continua a leggere ${chapterTitleIt}`}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: colors.buttonPrimary,
            opacity: pressed ? 0.88 : 1,
            minHeight: minTouchTarget,
          },
        ]}>
        <Text style={[type.button, { color: colors.onButtonPrimary }]}>
          {buttonLabel ?? (isStart ? 'Inizia a leggere →' : 'Continua a leggere →')}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radii.lg,
    padding: Spacing.lg,
  },
  progressBlock: {
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  progressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radii.md,
  },
});

