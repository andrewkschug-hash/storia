import { Pressable, StyleSheet, Text, View } from 'react-native';

import { selfAssessmentStyle } from '@/src/theme/assessmentStyles';
import { Radii, Spacing } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';
import type { SelfAssessment } from '@/src/vocabulary/selfAssessment';

const OPTIONS: { id: SelfAssessment; label: string }[] = [
  { id: 'got_it', label: 'I got it' },
  { id: 'almost', label: 'Almost' },
  { id: 'not_yet', label: 'Not yet' },
];

type Props = {
  disabled?: boolean;
  selected?: SelfAssessment | null;
  onVote: (vote: SelfAssessment) => void;
};

export function SelfAssessmentVoteButtons({ disabled = false, selected = null, onVote }: Props) {
  const { colors, type, minTouchTarget } = useTheme();

  return (
    <View style={styles.row}>
      {OPTIONS.map((option) => {
        const isSelected = selected === option.id;
        const style = selfAssessmentStyle(option.id, colors, isSelected);
        return (
          <Pressable
            key={option.id}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onVote(option.id)}
            style={({ pressed }) => [
              styles.button,
              {
                backgroundColor: style.backgroundColor,
                borderColor: style.borderColor,
                opacity: pressed || disabled ? 0.88 : 1,
                minHeight: minTouchTarget,
              },
            ]}>
            <View style={[styles.indicator, { backgroundColor: style.indicatorColor }]} />
            <Text
              style={[
                type.label,
                { color: style.textColor, textAlign: 'center', fontSize: 13 },
              ]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  button: {
    flex: 1,
    borderRadius: Radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  indicator: {
    width: 20,
    height: 3,
    borderRadius: Radii.pill,
  },
});
