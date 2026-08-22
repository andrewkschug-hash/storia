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
  const { colors } = useTheme();
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
          borderColor: selected ? colors.tint : colors.border,
          opacity: pressed && interactive ? 0.92 : 1,
        },
      ]}>
      <Text style={[Typography.chapterEyebrow, { color: colors.textMuted }]}>{pathway.genre}</Text>
      <Text style={[Typography.chapterTitle, { color: colors.text, marginTop: 6 }]}>
        {pathway.titleIt}
      </Text>
      <Text style={[Typography.body, { color: colors.textSecondary, marginTop: 8 }]}>
        {pathway.hookEn}
      </Text>
      <View style={styles.footer}>
        {available ? (
          <Text style={[Typography.label, { color: colors.tint }]}>
            {primary ? 'Your path · Open' : 'Begin this story'}
          </Text>
        ) : (
          <Text style={[Typography.label, { color: colors.textMuted }]}>Coming soon</Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
  },
  footer: {
    marginTop: Spacing.md,
  },
});
