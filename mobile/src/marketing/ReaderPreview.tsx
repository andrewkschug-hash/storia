import { StyleSheet, Text, View } from 'react-native';

import { Radii, Spacing, Typography } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

/** Static marketing mock of the reader. Does not use the real Reader screen. */
export function ReaderPreview() {
  const { colors } = useTheme();

  return (
    <View
      accessibilityLabel="Preview of reading Italian in Storibase"
      style={[
        styles.card,
        { backgroundColor: colors.readerSurface, borderColor: colors.border },
      ]}>
      <View style={styles.metaRow}>
        <Text style={[Typography.chapterEyebrow, { color: colors.tint }]}>Chapter 1</Text>
        <Text style={[Typography.caption, { color: colors.textMuted }]}>Meet Luca</Text>
      </View>
      <View
        style={[styles.track, { backgroundColor: colors.progressTrack }]}
        accessibilityLabel="Chapter progress, about 20 percent">
        <View style={[styles.fill, { width: '22%', backgroundColor: colors.progressFill }]} />
      </View>
      <Text style={[Typography.reader, { color: colors.text, marginTop: Spacing.lg }]}>
        Luca{' '}
        <Text
          style={{
            backgroundColor: colors.sentenceHighlight,
            color: colors.text,
          }}>
          entra
        </Text>{' '}
        nel bar e guarda intorno.
      </Text>
      <View
        style={[
          styles.gloss,
          { backgroundColor: colors.backgroundElevated, borderColor: colors.border },
        ]}>
        <Text style={[Typography.label, { color: colors.text }]}>entra</Text>
        <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
          to enter / goes in
        </Text>
      </View>
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
  },
  track: {
    height: 6,
    borderRadius: Radii.pill,
    marginTop: Spacing.md,
    overflow: 'hidden',
  },
  fill: {
    height: 6,
    borderRadius: Radii.pill,
  },
  gloss: {
    marginTop: Spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radii.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    alignSelf: 'flex-start',
  },
});
