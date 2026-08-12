import { StyleSheet, Text, View } from 'react-native';

import type { ChapterRecap } from '@/src/content/chapterRecap';
import { Radii, Spacing, Typography } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

type Props = {
  recap: ChapterRecap;
  /** Reader shows a shorter preview; recap screen shows everything. */
  variant?: 'compact' | 'full';
};

export function ChapterEndNotes({ recap, variant = 'full' }: Props) {
  const { colors } = useTheme();
  const lookFors = variant === 'compact' ? recap.lookFors.slice(0, 4) : recap.lookFors;
  const factCount = variant === 'compact' ? 3 : Math.max(recap.facts.length, recap.italianFacts.length);
  const italianFacts = recap.italianFacts.slice(0, factCount);
  const englishFacts = recap.facts.slice(0, factCount);
  const rememberLabel = recap.italianPrimary ? 'Ricorda' : 'Remember';
  const showBilingual = recap.bilingual || recap.italianPrimary;

  if (lookFors.length === 0 && italianFacts.length === 0 && englishFacts.length === 0) return null;

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: colors.backgroundElevated,
          borderColor: colors.border,
        },
      ]}>
      <Text style={[Typography.chapterEyebrow, { color: colors.tint }]}>
        {variant === 'compact' ? 'Before you continue' : 'Takeaways'}
      </Text>

      {lookFors.length > 0 ? (
        <View style={styles.section}>
          <Text style={[Typography.label, { color: colors.text, marginTop: Spacing.md }]}>
            Look for
          </Text>
          <Text style={[Typography.caption, { color: colors.textMuted, marginTop: 2 }]}>
            Words and phrases that matter in this chapter
          </Text>
          <View style={{ marginTop: Spacing.sm, gap: Spacing.sm }}>
            {lookFors.map((item) => (
              <View key={`${item.kind}:${item.italian}`} style={styles.row}>
                <Text style={[Typography.body, { color: colors.text, flex: 1 }]}>
                  {item.italian}
                  {item.kind === 'phrase' ? (
                    <Text style={{ color: colors.textMuted }}> · phrase</Text>
                  ) : null}
                </Text>
                <Text style={[Typography.caption, { color: colors.textSecondary, flex: 1 }]}>
                  {item.english}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {italianFacts.length > 0 || englishFacts.length > 0 ? (
        <View style={styles.section}>
          <Text style={[Typography.label, { color: colors.text, marginTop: Spacing.lg }]}>
            {rememberLabel}
          </Text>
          <Text style={[Typography.caption, { color: colors.textMuted, marginTop: 2 }]}>
            Keep the story straight
          </Text>
          <View style={{ marginTop: Spacing.sm, gap: Spacing.sm }}>
            {Array.from({ length: Math.max(italianFacts.length, englishFacts.length) }).map(
              (_, index) => {
                const it = italianFacts[index];
                const en = englishFacts[index];
                const key = `${it ?? ''}:${en ?? ''}:${index}`;
                if (showBilingual && it && en) {
                  return (
                    <View
                      key={key}
                      style={[
                        styles.factRow,
                        { backgroundColor: colors.readerSurface, borderColor: colors.border },
                      ]}>
                      {recap.italianPrimary || it ? (
                        <Text style={[Typography.body, { color: colors.text }]}>{it}</Text>
                      ) : null}
                      {en ? (
                        <Text
                          style={[
                            Typography.caption,
                            {
                              color: recap.italianPrimary ? colors.textMuted : colors.text,
                              marginTop: it ? 4 : 0,
                            },
                          ]}>
                          {en}
                        </Text>
                      ) : null}
                    </View>
                  );
                }
                const primary = recap.italianPrimary ? it : en;
                if (!primary) return null;
                return (
                  <View
                    key={key}
                    style={[
                      styles.factRow,
                      { backgroundColor: colors.readerSurface, borderColor: colors.border },
                    ]}>
                    <Text style={[Typography.body, { color: colors.text }]}>{primary}</Text>
                  </View>
                );
              },
            )}
          </View>
        </View>
      ) : null}
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
  factRow: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radii.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
});
