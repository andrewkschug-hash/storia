import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { useAccessibility } from '@/src/accessibility/AccessibilityProvider';
import type { AccessibilitySettings as Settings, ColorMode, LineSpacing, TextSize } from '@/src/accessibility/types';
import { Radii, Spacing } from '@/src/theme/tokens';
import { useSystemColorScheme } from '@/src/theme/useSystemColorScheme';

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; accessibilityLabel?: string }[];
  value: T;
  onChange: (next: T) => void;
}) {
  const { colors, type, minTouchTarget } = useAccessibility();
  return (
    <View
      style={[
        styles.segmentTrack,
        {
          borderColor: colors.border,
          backgroundColor: colors.backgroundElevated,
          minHeight: minTouchTarget,
        },
      ]}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityLabel={option.accessibilityLabel ?? option.label}
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.segment,
              {
                backgroundColor: selected ? colors.accentSoft : 'transparent',
                opacity: pressed ? 0.88 : 1,
              },
            ]}>
            <Text
              style={[
                type.label,
                {
                  color: selected ? colors.tint : colors.textSecondary,
                  textAlign: 'center',
                },
              ]}
              numberOfLines={1}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function ToggleRow({
  label,
  description,
  value,
  onValueChange,
}: {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
}) {
  const { colors, type, minTouchTarget } = useAccessibility();
  return (
    <View style={[styles.toggleRow, { minHeight: minTouchTarget, borderBottomColor: colors.border }]}>
      <View style={styles.toggleCopy}>
        <Text style={[type.label, { color: colors.text }]}>{label}</Text>
        {description ? (
          <Text style={[type.caption, { color: colors.textMuted, marginTop: 2 }]}>{description}</Text>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.tint }}
        thumbColor={colors.backgroundElevated}
        ios_backgroundColor={colors.border}
        accessibilityLabel={label}
      />
    </View>
  );
}

export function AccessibilitySettings() {
  const { colors, type, settings, updateSettings } = useAccessibility();
  const systemScheme = useSystemColorScheme();

  const set = (patch: Partial<Settings>) => {
    void updateSettings(patch);
  };

  const appearanceHint =
    settings.colorMode === 'system'
      ? `Follows your device · currently ${systemScheme}`
      : settings.colorMode === 'dark'
        ? 'Always dark'
        : 'Always light';

  return (
    <View style={styles.section}>
      <Text style={[type.label, { color: colors.text }]}>Reading</Text>
      <Text style={[type.caption, { color: colors.textMuted, marginTop: Spacing.xs }]}>
        Applies across stories, dictionary, and review.
      </Text>

      <Text style={[styles.fieldLabel, type.caption, { color: colors.textSecondary }]}>Appearance</Text>
      <SegmentedControl<ColorMode>
        value={settings.colorMode}
        onChange={(colorMode) => set({ colorMode })}
        options={[
          { value: 'system', label: 'System' },
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark' },
        ]}
      />
      <Text style={[type.caption, { color: colors.textMuted, marginTop: Spacing.xs }]}>{appearanceHint}</Text>

      <View style={[styles.toggleGroup, { borderColor: colors.border, marginTop: Spacing.lg }]}>
        <ToggleRow
          label="High contrast"
          description="Stronger borders and text"
          value={settings.highContrast}
          onValueChange={(highContrast) => set({ highContrast })}
        />
        <ToggleRow
          label="Reduce motion"
          description="Less animation"
          value={settings.reducedMotion}
          onValueChange={(reducedMotion) => set({ reducedMotion })}
        />
        <ToggleRow
          label="Comfortable width"
          description="Narrower column on large screens"
          value={settings.comfortableWidth}
          onValueChange={(comfortableWidth) => set({ comfortableWidth })}
        />
      </View>

      <Text style={[styles.fieldLabel, type.caption, { color: colors.textSecondary }]}>Text size</Text>
      <SegmentedControl<TextSize>
        value={settings.textSize}
        onChange={(textSize) => set({ textSize })}
        options={[
          { value: 'small', label: 'S', accessibilityLabel: 'Small' },
          { value: 'default', label: 'M', accessibilityLabel: 'Default' },
          { value: 'large', label: 'L', accessibilityLabel: 'Large' },
          { value: 'xlarge', label: 'XL', accessibilityLabel: 'Extra large' },
        ]}
      />

      <Text style={[styles.fieldLabel, type.caption, { color: colors.textSecondary }]}>Line spacing</Text>
      <SegmentedControl<LineSpacing>
        value={settings.lineSpacing}
        onChange={(lineSpacing) => set({ lineSpacing })}
        options={[
          { value: 'tight', label: 'Tight' },
          { value: 'default', label: 'Default' },
          { value: 'relaxed', label: 'Relaxed' },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 0,
  },
  fieldLabel: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  segmentTrack: {
    flexDirection: 'row',
    borderRadius: Radii.sm,
    borderWidth: StyleSheet.hairlineWidth * 2,
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  toggleGroup: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  toggleCopy: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
});
