import { StyleSheet, Text, View } from 'react-native';

import type { ChapterRecap } from '@/src/content/chapterRecap';
import { Radii, Spacing } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

type Props = {
  recap: ChapterRecap;
  /** Reader shows a shorter preview; recap screen shows everything. */
  variant?: 'compact' | 'full';
};

export function ChapterEndNotes({ recap, variant = 'full' }: Props) {
  const { colors, type } = useTheme();
  const lookFors = variant === 'compact' ? recap.lookFors.slice(0, 4) : recap.lookFors;

  if (lookFors.length === 0) return null;

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: colors.backgroundElevated,
          borderColor: colors.border,
        },
      ]}>
      <Text style={[type.chapterEyebrow, { color: colors.tint }]}>
        {variant === 'compact' ? 'Before you continue' : 'Takeaways'}
      </Text>

      <View style={styles.section}>
        <Text style={[type.label, { color: colors.text, marginTop: Spacing.md }]}>
          Look for
        </Text>
        <Text style={[type.caption, { color: colors.textMuted, marginTop: 2 }]}>
          Words and phrases that matter in this chapter
        </Text>
        <View style={{ marginTop: Spacing.sm, gap: Spacing.sm }}>
          {lookFors.map((item) => (
            <View key={`${item.kind}:${item.italian}`} style={styles.row}>
              <Text style={[type.body, { color: colors.text, flex: 1 }]}>
                {item.italian}
                {item.kind === 'phrase' ? (
                  <Text style={{ color: colors.textMuted }}> · phrase</Text>
                ) : null}
              </Text>
              <Text style={[type.caption, { color: colors.textSecondary, flex: 1 }]}>
                {item.english}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: Spacing.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radii.md,
    padding: Spacing.md,
  },
  section: {},
  row: {
    gap: 2,
  },
});
