import { StyleSheet, View } from 'react-native';

import { Radii, Spacing } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

type Props = {
  progress: number;
  height?: number;
};

export function ProgressBar({ progress, height = 8 }: Props) {
  const { colors } = useTheme();
  const clamped = Math.max(0, Math.min(1, progress));

  return (
    <View
      style={[
        styles.track,
        {
          height,
          backgroundColor: colors.progressTrack,
        },
      ]}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}>
      <View
        style={[
          styles.fill,
          {
            width: `${clamped * 100}%`,
            backgroundColor: colors.progressFill,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    borderRadius: Radii.pill,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radii.pill,
  },
});
