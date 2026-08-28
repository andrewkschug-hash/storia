import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Radii, Spacing } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

type Props = {
  onStartReading: () => void;
  filteredMessage?: string;
};

export function NotebookEmptyState({ onStartReading, filteredMessage }: Props) {
  const { colors, minTouchTarget, type } = useTheme();

  if (filteredMessage) {
    return (
      <View style={styles.filteredContainer}>
        <Text style={[type.body, { color: colors.textSecondary, textAlign: 'center', fontSize: 14 }]}>
          {filteredMessage}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.bookIcon}>📖</Text>
      <Text style={[type.heroTitle, styles.title, { color: colors.text }]}>
        Your Notebook is just beginning.
      </Text>
      <Text style={[type.body, styles.bodyText, { color: colors.textSecondary }]}>
        Your first words, phrases, and little discoveries will appear here as you read Luca&apos;s story.
      </Text>

      <Pressable
        onPress={onStartReading}
        accessibilityRole="button"
        accessibilityLabel="Start with Chapter 1"
        style={({ pressed }) => [
          styles.actionBtn,
          {
            backgroundColor: colors.buttonPrimary,
            minHeight: Math.max(40, minTouchTarget),
            opacity: pressed ? 0.85 : 1,
          },
        ]}>
        <Text style={[type.button, { color: colors.onButtonPrimary, fontSize: 14 }]}>
          Start with Chapter 1 →
        </Text>
      </Pressable>

      <Text style={[type.caption, styles.footnote, { color: colors.textMuted }]}>
        Your Italian will grow with the story.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.xl * 1.5,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filteredContainer: {
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookIcon: {
    fontSize: 32,
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
    fontFamily: 'Literata_600SemiBold',
    textAlign: 'center',
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 380,
  },
  actionBtn: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radii.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footnote: {
    fontSize: 12,
    fontFamily: 'Literata_400Regular_Italic',
    marginTop: Spacing.md,
    textAlign: 'center',
  },
});
