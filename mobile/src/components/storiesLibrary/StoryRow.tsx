import { AppSymbol } from '@/src/components/AppSymbol';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { LibraryStoryRow } from '@/src/components/storiesLibrary/types';
import { Radii, Spacing, Typography } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

type Props = {
  row: LibraryStoryRow;
  expanded: boolean;
  onPress: () => void;
};

export function StoryRow({ row, expanded, onPress }: Props) {
  const { colors, minTouchTarget } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ expanded }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: colors.backgroundElevated,
          borderLeftWidth: 3.5,
          borderLeftColor: row.locked ? colors.textMuted : colors.tint,
          opacity: row.locked ? 0.6 : pressed ? 0.88 : 1,
          minHeight: minTouchTarget,
        },
      ]}>
      <View style={styles.main}>
        {row.eyebrow ? (
          <Text style={[Typography.chapterEyebrow, { color: colors.tint, fontSize: 11, letterSpacing: 1.2 }]}>
            {row.eyebrow}
          </Text>
        ) : null}
        <Text style={[styles.title, { color: colors.text }]}>{row.titleIt}</Text>
        <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
          {row.completed} / {row.total} chapters
          {row.locked ? ' · Complete prior arc or test readiness' : ''}
        </Text>
      </View>
      <AppSymbol
        name={{
          ios: expanded ? 'chevron.up' : row.locked ? 'lock.fill' : 'chevron.right',
          android: expanded ? 'expand_less' : row.locked ? 'lock' : 'chevron_right',
          web: expanded ? 'expand_less' : row.locked ? 'lock' : 'chevron_right',
        }}
        tintColor={row.locked ? colors.textMuted : colors.tint}
        size={18}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radii.md,
    marginBottom: Spacing.xs,
  },
  main: {
    flex: 1,
    paddingRight: Spacing.md,
    gap: 2,
  },
  title: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 22,
    lineHeight: 28,
  },
});

