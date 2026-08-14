import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Radii, Spacing } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

type Props = {
  hasAudio: boolean;
  isPlaying: boolean;
  isChapterMode: boolean;
  chapterProgress?: { current: number; total: number } | null;
  speed: 'normal' | 'slow';
  onPlayPause: () => void;
  onStop: () => void;
  onSetSpeed: (speed: 'normal' | 'slow') => void;
  onContinueFromChapter: () => void;
};

export function ReaderAudioBar({
  hasAudio,
  isPlaying,
  isChapterMode,
  chapterProgress,
  speed,
  onPlayPause,
  onStop,
  onSetSpeed,
  onContinueFromChapter,
}: Props) {
  const { colors, type, minTouchTarget } = useTheme();

  const progressLabel =
    hasAudio && isChapterMode && chapterProgress && chapterProgress.total > 0
      ? `Sentence ${chapterProgress.current} of ${chapterProgress.total}`
      : hasAudio && isPlaying
        ? 'Listening…'
        : hasAudio
          ? 'Tap play to hear the chapter'
          : 'Audio for this chapter is not ready yet.';

  return (
    <View style={[styles.bar, { borderTopColor: colors.border, backgroundColor: colors.readerSurface }]}>
      <View style={styles.row}>
        <View style={styles.controls}>
          {hasAudio ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={isPlaying ? 'Pause chapter audio' : 'Play chapter audio'}
              onPress={onPlayPause}
              style={({ pressed }) => [
                styles.primaryBtn,
                { backgroundColor: colors.tint, opacity: pressed ? 0.88 : 1, minHeight: minTouchTarget },
              ]}>
              <Text style={[type.button, { color: colors.onTint, fontSize: 14 }]}>
                {isPlaying ? 'Pause' : 'Play'}
              </Text>
            </Pressable>
          ) : null}

          {hasAudio && (isChapterMode || isPlaying) ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Stop audio"
              onPress={onStop}
              style={({ pressed }) => [styles.secondaryBtn, { opacity: pressed ? 0.7 : 1 }]}>
              <Text style={[type.label, { color: colors.textSecondary }]}>Stop</Text>
            </Pressable>
          ) : null}

          {hasAudio ? (
            <View
              style={[
                styles.segment,
                { borderColor: colors.border, backgroundColor: colors.backgroundElevated },
              ]}
              accessibilityRole="radiogroup"
              accessibilityLabel="Playback speed">
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ selected: speed === 'normal' }}
                accessibilityLabel="Natural speed"
                onPress={() => onSetSpeed('normal')}
                style={[
                  styles.segmentOption,
                  speed === 'normal' && { backgroundColor: colors.tint },
                ]}>
                <Text
                  style={[
                    type.caption,
                    { color: speed === 'normal' ? colors.onTint : colors.textSecondary },
                  ]}>
                  Natural
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ selected: speed === 'slow' }}
                accessibilityLabel="Slow speed"
                onPress={() => onSetSpeed('slow')}
                style={[
                  styles.segmentOption,
                  speed === 'slow' && { backgroundColor: colors.tint },
                ]}>
                <Text
                  style={[
                    type.caption,
                    { color: speed === 'slow' ? colors.onTint : colors.textSecondary },
                  ]}>
                  Slow
                </Text>
              </Pressable>
            </View>
          ) : null}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Continue"
          onPress={onContinueFromChapter}
          style={({ pressed }) => [
            styles.continueBtn,
            {
              borderColor: colors.tint,
              backgroundColor: colors.tint,
              opacity: pressed ? 0.88 : 1,
            },
          ]}>
          <Text style={[type.label, { color: colors.onTint }]}>Continue</Text>
        </Pressable>
      </View>

      <Text style={[type.caption, { color: colors.textMuted, marginTop: Spacing.sm }]}>
        {progressLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    paddingHorizontal: Spacing.readerHorizontal,
    paddingVertical: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flexWrap: 'wrap',
    flex: 1,
  },
  primaryBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 10,
    minWidth: 88,
    alignItems: 'center',
  },
  secondaryBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  segment: {
    flexDirection: 'row',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radii.sm,
    overflow: 'hidden',
  },
  segmentOption: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    minWidth: 64,
    alignItems: 'center',
  },
  continueBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 10,
    minHeight: 44,
    minWidth: 108,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
