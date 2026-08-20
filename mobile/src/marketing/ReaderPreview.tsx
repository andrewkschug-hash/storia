import { StyleSheet, Text, View } from 'react-native';

import { LandingColors } from '@/src/marketing/landingTheme';
import { Radii, Spacing, Typography } from '@/src/theme/tokens';

/** Static marketing mock of the reader. Does not use the real Reader screen. */
export function ReaderPreview() {
  const colors = LandingColors;

  return (
    <View
      accessibilityLabel="Preview of reading Italian in Storibase"
      style={[
        styles.card,
        { backgroundColor: colors.backgroundCard, borderColor: colors.border },
      ]}>
      <View style={styles.metaRow}>
        <Text style={[Typography.chapterEyebrow, { color: colors.textMuted }]}>
          CHAPTER 1 · Meet Luca
        </Text>
        <View style={[styles.badge, { borderColor: colors.border }]}>
          <Text style={[Typography.caption, { color: colors.accent }]}>IT · Italiano</Text>
        </View>
      </View>

      <Text style={[Typography.reader, { color: colors.text, marginTop: Spacing.lg, lineHeight: 36 }]}>
        Luca{' '}
        <Text style={[styles.hotWord, { color: colors.accent, borderBottomColor: colors.accent }]}>
          entra
        </Text>{' '}
        nel bar e{' '}
        <Text style={[styles.hotWord, { color: colors.accent, borderBottomColor: colors.accent }]}>
          guarda
        </Text>{' '}
        intorno.
      </Text>

      <View
        style={[
          styles.gloss,
          { backgroundColor: colors.backgroundElevated, borderColor: colors.accent },
        ]}>
        <Text style={[Typography.label, { color: colors.text }]}>entra</Text>
        <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
          to enter / goes in
        </Text>
      </View>

      <Text
        style={[
          Typography.caption,
          {
            color: colors.textMuted,
            marginTop: Spacing.xl,
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            fontSize: 11,
          },
        ]}>
        Tap any word to see what it means
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  badge: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radii.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  hotWord: {
    borderBottomWidth: 1.5,
    borderStyle: 'dotted',
  },
  gloss: {
    marginTop: Spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: 2,
    borderRadius: Radii.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    alignSelf: 'flex-start',
  },
});
