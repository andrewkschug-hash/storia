import { StyleSheet, Text, View } from 'react-native';

import { Typography } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

export function StoriesHeader() {
  const { colors } = useTheme();

  return (
    <View style={styles.wrap}>
      <Text style={[styles.title, { color: colors.text }]}>Stories</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Continue your journey.{'\n'}Pick up where you left off, or explore another level.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 32,
  },
  title: {
    ...Typography.brand,
    fontSize: 36,
    lineHeight: 42,
  },
  subtitle: {
    ...Typography.body,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
    opacity: 0.85,
  },
});
