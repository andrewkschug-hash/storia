import { StyleSheet, Text, View } from 'react-native';

import type { ReadingProgress } from '@/src/domain/models/types';
import { Radii, Spacing, Typography } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

type Props = {
  progress: ReadingProgress;
};

export function ItalianStats({ progress }: Props) {
  const { colors } = useTheme();

  const items = [
    { label: 'words encountered', value: progress.wordsEncountered },
    { label: 'familiar', value: progress.wordsFamiliar },
    { label: 'day streak', value: progress.readingStreakDays },
  ];

  return (
    <View>
      <Text style={[Typography.chapterEyebrow, { color: colors.textMuted }]}>Your Italian</Text>
      <View style={styles.row}>
        {items.map((item) => (
          <View
            key={item.label}
            style={[
              styles.stat,
              {
                backgroundColor: colors.backgroundElevated,
                borderColor: colors.border,
              },
            ]}>
            <Text style={[Typography.stat, { color: colors.text }]}>{item.value}</Text>
            <Text style={[Typography.caption, { color: colors.textMuted, marginTop: 4 }]}>
              {item.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  stat: {
    flex: 1,
    borderRadius: Radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
});
