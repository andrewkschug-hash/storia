import { StyleSheet, Text, View } from 'react-native';

import { Spacing } from '@/src/theme/tokens';
import { useLayout } from '@/src/theme/useLayout';
import { useTheme } from '@/src/theme/useTheme';

type Props = {
  footprintLabel: string;
};

export function NotebookHeader({ footprintLabel }: Props) {
  const { colors, type } = useTheme();
  const layout = useLayout();

  return (
    <View style={styles.container}>
      <Text
        style={[
          type.heroTitle,
          styles.title,
          {
            color: colors.text,
            fontSize: layout.isPhone ? 28 : 34,
            lineHeight: layout.isPhone ? 34 : 42,
          },
        ]}>
        My Notebook
      </Text>
      <Text style={[type.body, styles.subtitle, { color: colors.textSecondary }]}>
        The Italian you&apos;ve picked up along the way.
      </Text>
      {footprintLabel ? (
        <Text style={[type.caption, styles.footprint, { color: colors.tint }]}>
          {footprintLabel}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm + 2,
  },
  title: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: 'Literata_400Regular_Italic',
    fontSize: 15,
    lineHeight: 21,
    marginTop: 2,
  },
  footprint: {
    fontFamily: 'Literata_500Medium',
    fontSize: 12,
    lineHeight: 16,
    marginTop: 6,
    letterSpacing: 0.2,
  },
});
