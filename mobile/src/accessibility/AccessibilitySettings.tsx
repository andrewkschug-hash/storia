import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAccessibility } from '@/src/accessibility/AccessibilityProvider';
import type { AccessibilitySettings, ColorMode, LineSpacing, TextSize } from '@/src/accessibility/types';
import { Radii, Spacing } from '@/src/theme/tokens';
import { useSystemColorScheme } from '@/src/theme/useSystemColorScheme';

function Chip<T extends string>({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { colors, type, minTouchTarget } = useAccessibility();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          minHeight: minTouchTarget,
          borderColor: selected ? colors.tint : colors.border,
          backgroundColor: selected ? colors.accentSoft : colors.backgroundElevated,
          opacity: pressed ? 0.88 : 1,
        },
      ]}>
      <Text style={[type.label, { color: selected ? colors.tint : colors.text }]}>{label}</Text>
    </Pressable>
  );
}

export function AccessibilitySettings() {
  const { colors, type, settings, scheme, updateSettings } = useAccessibility();
  const systemScheme = useSystemColorScheme();

  const set = (patch: Partial<AccessibilitySettings>) => {
    void updateSettings(patch);
  };

  const appearanceHint =
    settings.colorMode === 'system'
      ? `System follows your device (currently ${systemScheme}).`
      : settings.colorMode === 'dark'
        ? 'Dark mode is always on.'
        : 'Light mode is always on.';

  return (
    <View>
      <Text style={[type.label, { color: colors.text, marginTop: Spacing.xl }]}>Reading display</Text>
      <Text style={[type.caption, { color: colors.textMuted, marginTop: Spacing.xs }]}>
        These settings apply everywhere — stories, reader, dictionary, and review.
      </Text>

      <Text style={[type.caption, { color: colors.textSecondary, marginTop: Spacing.md }]}>Appearance</Text>
      <View style={styles.row}>
        {([
          ['system', 'System'],
          ['light', 'Light'],
          ['dark', 'Dark'],
        ] as [ColorMode, string][]).map(([value, label]) => (
          <Chip key={value} label={label} selected={settings.colorMode === value} onPress={() => set({ colorMode: value })} />
        ))}
      </View>
      <Text style={[type.caption, { color: colors.textMuted, marginTop: Spacing.xs }]}>
        {appearanceHint} Active theme: {scheme}.
      </Text>
      <View style={styles.row}>
        <Chip
          label="High contrast"
          selected={settings.highContrast}
          onPress={() => set({ highContrast: !settings.highContrast })}
        />
        <Chip
          label="Reduce motion"
          selected={settings.reducedMotion}
          onPress={() => set({ reducedMotion: !settings.reducedMotion })}
        />
      </View>

      <Text style={[type.caption, { color: colors.textSecondary, marginTop: Spacing.md }]}>Text size</Text>
      <View style={styles.row}>
        {([
          ['small', 'Small'],
          ['default', 'Default'],
          ['large', 'Large'],
          ['xlarge', 'Extra large'],
        ] as [TextSize, string][]).map(([value, label]) => (
          <Chip key={value} label={label} selected={settings.textSize === value} onPress={() => set({ textSize: value })} />
        ))}
      </View>

      <Text style={[type.caption, { color: colors.textSecondary, marginTop: Spacing.md }]}>Line spacing</Text>
      <View style={styles.row}>
        {([
          ['tight', 'Tight'],
          ['default', 'Default'],
          ['relaxed', 'Relaxed'],
        ] as [LineSpacing, string][]).map(([value, label]) => (
          <Chip key={value} label={label} selected={settings.lineSpacing === value} onPress={() => set({ lineSpacing: value })} />
        ))}
      </View>

      <View style={styles.row}>
        <Chip
          label="Comfortable width"
          selected={settings.comfortableWidth}
          onPress={() => set({ comfortableWidth: !settings.comfortableWidth })}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.pill,
    borderWidth: StyleSheet.hairlineWidth * 2,
    justifyContent: 'center',
  },
});
