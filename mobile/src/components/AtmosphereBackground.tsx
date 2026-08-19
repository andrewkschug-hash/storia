import { LinearGradient } from 'expo-linear-gradient';
import { type ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { useTheme } from '@/src/theme/useTheme';

type Props = {
  children: ReactNode;
  style?: ViewStyle;
};

export function AtmosphereBackground({ children, style }: Props) {
  const { colors } = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }, style]}>
      <LinearGradient
        pointerEvents="none"
        colors={[colors.backgroundAtmosphereTop, colors.backgroundAtmosphereBottom]}
        locations={[0, 0.55]}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
