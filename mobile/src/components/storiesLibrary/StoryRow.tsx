import { AppSymbol } from '@/src/components/AppSymbol';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { LibraryStoryRow } from '@/src/components/storiesLibrary/types';
import { Typography } from '@/src/theme/tokens';
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
          backgroundColor: pressed ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
          minHeight: minTouchTarget,
        },
      ]}>
      <View style={styles.main}>
        {row.eyebrow ? (
          <Text style={[styles.eyebrow, { color: colors.tint }]}>{row.eyebrow}</Text>
        ) : null}
        <Text style={[styles.title, { color: colors.text }]}>{row.titleIt}</Text>
        <Text style={[styles.meta, { color: colors.textMuted }]}>
          {row.completed} / {row.total} chapters
        </Text>
      </View>
      <AppSymbol
        name={{
          ios: expanded ? 'chevron.up' : 'chevron.right',
          android: expanded ? 'expand_less' : 'chevron_right',
          web: expanded ? 'expand_less' : 'chevron_right',
        }}
        tintColor={colors.textMuted}
        size={18}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  main: {
    flex: 1,
    paddingRight: 12,
  },
  eyebrow: {
    ...Typography.caption,
    fontSize: 13,
    marginBottom: 2,
  },
  title: {
    fontFamily: 'Literata_600SemiBold',
    fontSize: 20,
    lineHeight: 28,
  },
  meta: {
    ...Typography.body,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 4,
    opacity: 0.6,
  },
});
