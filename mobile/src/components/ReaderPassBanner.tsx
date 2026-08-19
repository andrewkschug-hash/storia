import { StyleSheet, Text, View } from 'react-native';

import type { PassInstructionCopy } from '@/src/reader/readerPassCopy';
import { Radii, Spacing } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

type Props = {
  copy: PassInstructionCopy;
  detailed: boolean;
};

export function ReaderPassBanner({ copy, detailed }: Props) {
  const { colors, type } = useTheme();

  return (
    <View
      style={[
        styles.banner,
        {
          backgroundColor: colors.readerSurface,
          borderColor: colors.border,
        },
      ]}
      accessibilityRole="summary">
      <Text style={[type.chapterEyebrow, { color: colors.accent }]}>{copy.phaseLabel}</Text>
      {detailed ? (
        <>
          <Text style={[type.label, { color: colors.text, marginTop: Spacing.xs }]}>{copy.headline}</Text>
          <Text style={[type.caption, { color: colors.textSecondary, marginTop: 4, lineHeight: 20 }]}>
            {copy.body}
          </Text>
        </>
      ) : (
        <Text style={[type.caption, { color: colors.textMuted, marginTop: Spacing.xs }]}>
          {copy.compactLabel}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    marginHorizontal: Spacing.readerHorizontal,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
