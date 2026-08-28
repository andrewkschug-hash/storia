import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Radii, Spacing } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

type Props = {
  count: number;
  onPress: () => void;
};

export function NotebookReviewStrip({ count, onPress }: Props) {
  const { colors, minTouchTarget, type } = useTheme();

  if (count <= 0) return null;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${count} words ready to revisit. Start review.`}
      style={({ pressed }) => [
        styles.strip,
        {
          backgroundColor: colors.backgroundElevated,
          borderColor: colors.border,
          minHeight: Math.max(38, minTouchTarget - 6),
          opacity: pressed ? 0.8 : 1,
        },
      ]}>
      <View style={styles.leftRow}>
        <Text style={[styles.icon, { color: colors.tint }]}>↻</Text>
        <Text style={[type.body, styles.message, { color: colors.text }]}>
          <Text style={{ fontFamily: 'Literata_600SemiBold' }}>{count}</Text>{' '}
          {count === 1 ? 'word' : 'words'} ready to revisit
        </Text>
      </View>

      <Text style={[type.caption, styles.actionText, { color: colors.tint }]}>
        Review →
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.sm + 2,
    borderWidth: 1,
    marginBottom: Spacing.sm + 2,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'Literata_400Regular',
  },
  actionText: {
    fontSize: 12,
    fontFamily: 'Literata_600SemiBold',
    letterSpacing: 0.2,
  },
});
