import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ProgressBar } from '@/src/components/ProgressBar';
import { Typography } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

type Props = {
  chapterNumber: number;
  chapterTitleIt: string;
  storyTitleIt: string;
  percentComplete: number;
  chapterPercent: number;
  hasProgress: boolean;
  eyebrow?: string;
  subtitle?: string;
  onRead: () => void;
  onListen: () => void;
};

export function StoriesContinueHero({
  chapterNumber,
  chapterTitleIt,
  storyTitleIt,
  percentComplete,
  chapterPercent,
  hasProgress,
  eyebrow,
  subtitle,
  onRead,
  onListen,
}: Props) {
  const { colors, minTouchTarget } = useTheme();
  const borderColor = colors.border;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.readerSurface,
          borderColor,
        },
      ]}>
      <Text style={[styles.eyebrow, { color: colors.tint }]}>
        {eyebrow ?? (hasProgress ? 'Continue Reading' : 'Start Reading')}
      </Text>
      <Text style={[styles.chapterLine, { color: colors.text }]}>
        {subtitle ?? `Capitolo ${chapterNumber} · ${chapterTitleIt}`}
      </Text>
      <Text style={[styles.meta, { color: colors.textMuted }]}>
        {storyTitleIt} · {percentComplete}% complete
      </Text>

      <View style={styles.progressWrap}>
        <ProgressBar progress={percentComplete / 100} height={4} />
      </View>

      {chapterPercent > 0 && chapterPercent < 100 ? (
        <Text style={[styles.meta, { color: colors.textMuted, marginTop: 8 }]}>
          {chapterPercent}% through this chapter
        </Text>
      ) : null}

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Read"
          onPress={onRead}
          style={({ pressed }) => [
            styles.readBtn,
            {
              backgroundColor: colors.tint,
              opacity: pressed ? 0.88 : 1,
              minHeight: minTouchTarget,
            },
          ]}>
          <Text style={[styles.readLabel, { color: colors.onTint }]}>Read</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Listen"
          onPress={onListen}
          style={({ pressed }) => [
            styles.listenBtn,
            {
              borderColor,
              opacity: pressed ? 0.88 : 1,
              minHeight: minTouchTarget,
            },
          ]}>
          <Text style={[styles.listenLabel, { color: colors.text }]}>Listen</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 28,
    marginBottom: 32,
  },
  eyebrow: {
    ...Typography.chapterEyebrow,
    letterSpacing: 1.2,
  },
  chapterLine: {
    fontFamily: 'Literata_600SemiBold',
    fontSize: 20,
    lineHeight: 28,
    marginTop: 12,
  },
  meta: {
    ...Typography.body,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 6,
    opacity: 0.6,
  },
  progressWrap: {
    marginTop: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  readBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  readLabel: {
    ...Typography.button,
    fontSize: 15,
  },
  listenBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  listenLabel: {
    fontFamily: 'Literata_500Medium',
    fontSize: 15,
    lineHeight: 20,
  },
});
