import { StyleSheet, Text, View } from 'react-native';

import { Spacing, Typography } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

export function StoriesHeader() {
  const { colors } = useTheme();

  return (
    <View style={styles.wrap}>
      <Text style={[styles.title, { color: colors.text }]}>Library</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Choose a story to read.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.brand,
    fontSize: 34,
    lineHeight: 40,
  },
  subtitle: {
    ...Typography.body,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 4,
  },
});

