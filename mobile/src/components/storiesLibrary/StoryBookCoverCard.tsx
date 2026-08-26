import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Radii, Spacing, Typography } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

type Props = {
  titleIt: string;
  eyebrow?: string;
  levelLabel?: string;
  completed: number;
  total: number;
  locked?: boolean;
  onPress: () => void;
};

export function StoryBookCoverCard({
  titleIt,
  eyebrow,
  levelLabel,
  completed,
  total,
  locked = false,
  onPress,
}: Props) {
  const { colors, minTouchTarget } = useTheme();
  const isFinished = total > 0 && completed >= total;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${titleIt}, ${completed} di ${total} capitoli`}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.backgroundElevated,
          borderLeftWidth: 3.5,
          borderLeftColor: locked
            ? colors.textMuted
            : isFinished
              ? colors.accentSecondary
              : colors.tint,
          opacity: locked ? 0.6 : pressed ? 0.88 : 1,
          minHeight: minTouchTarget,
        },
      ]}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          {levelLabel || eyebrow ? (
            <Text style={[Typography.chapterEyebrow, { color: colors.tint, fontSize: 11, letterSpacing: 1.2 }]}>
              {[levelLabel, eyebrow].filter(Boolean).join(' · ')}
            </Text>
          ) : null}
          {locked ? (
            <Text style={[Typography.caption, { color: colors.textMuted }]}>🔒</Text>
          ) : isFinished ? (
            <Text style={[Typography.caption, { color: colors.accentSecondary, fontFamily: 'Literata_600SemiBold' }]}>
              Completato ✓
            </Text>
          ) : null}
        </View>

        <Text style={[styles.title, { color: colors.text }]}>{titleIt}</Text>

        <View style={styles.footerRow}>
          <Text style={[Typography.caption, { color: colors.textSecondary }]}>
            {completed > 0 ? `${completed} / ${total} capitoli` : `${total} capitoli`}
          </Text>
          <Text style={[Typography.caption, { color: colors.tint, fontFamily: 'Literata_600SemiBold' }]}>
            {locked ? 'Bloccato' : completed === 0 ? 'Inizia →' : isFinished ? 'Rileggi →' : 'Continua →'}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radii.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginVertical: Spacing.xs,
  },
  content: {
    gap: Spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 22,
    lineHeight: 28,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
});
