import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { PathwayDefinition } from '@/src/pathway/paths';
import { Radii, Spacing, Typography } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

type Props = {
  pathway: PathwayDefinition;
  selected?: boolean;
  primary?: boolean;
  onPress?: () => void;
};

export function PathwayWorldCard({ pathway, selected, primary, onPress }: Props) {
  const { colors, minTouchTarget } = useTheme();
  const available = pathway.status === 'available';
  const interactive = available && typeof onPress === 'function';

  return (
    <Pressable
      accessibilityRole={interactive ? 'button' : 'text'}
      disabled={!interactive}
      onPress={interactive ? onPress : undefined}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.backgroundElevated,
          borderLeftWidth: 3.5,
          borderLeftColor: selected
            ? colors.tint
            : primary
              ? colors.highlight
              : colors.accentSecondary,
          opacity: pressed && interactive ? 0.9 : 1,
          minHeight: minTouchTarget,
        },
      ]}>
      <View style={styles.headerRow}>
        <Text style={[Typography.chapterEyebrow, { color: colors.tint, letterSpacing: 1.2 }]}>
          A2+ · {pathway.genreIt ?? pathway.genre}
        </Text>
        {primary ? (
          <Text style={[Typography.caption, { color: colors.highlight, fontFamily: 'Literata_600SemiBold' }]}>
            ★ Current Choice
          </Text>
        ) : null}
      </View>

      <Text style={[styles.title, { color: colors.text }]}>
        {pathway.titleIt}
      </Text>

      <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.xs, fontSize: 14, lineHeight: 20 }]}>
        {pathway.hookIt ?? pathway.hookEn}
      </Text>

      {pathway.lucaQuoteIt ? (
        <View
          style={[
            styles.quoteContainer,
            {
              backgroundColor: 'rgba(201, 120, 88, 0.08)',
              borderLeftWidth: 2,
              borderLeftColor: colors.tint,
            },
          ]}>
          <Text style={[Typography.caption, { color: colors.textSecondary, fontStyle: 'italic' }]}>
            Luca: “{pathway.lucaQuoteIt}”
          </Text>
        </View>
      ) : null}

      <View style={styles.footer}>
        {available ? (
          <Text style={[Typography.label, { color: colors.tint, fontFamily: 'Literata_600SemiBold' }]}>
            {selected ? 'Close chapters ▴' : primary ? 'Continue reading →' : 'Read this story →'}
          </Text>
        ) : (
          <Text style={[Typography.label, { color: colors.textMuted }]}>Coming soon 🔒</Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radii.md,
    padding: Spacing.lg,
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
    marginTop: 4,
  },
  quoteContainer: {
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radii.sm,
  },
  footer: {
    marginTop: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
});

