import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PathwayWorldCard } from '@/src/components/pathway/PathwayWorldCard';
import { A2_PLUS_PATHWAYS, type PathwayDefinition } from '@/src/pathway/paths';
import { Spacing, Typography } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

type Props = {
  visible: boolean;
  onBeginPathway: (pathway: PathwayDefinition) => void;
  onNotNow: () => void;
};

/**
 * First-time A2+ pathway gate.
 * Atmospheric world cards (Three Doors feeling) — not a game-menu of literal doors.
 */
export function PathwayGate({ visible, onBeginPathway, onNotNow }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onNotNow}>
      <View
        style={[
          styles.backdrop,
          {
            backgroundColor: colors.background,
            paddingTop: insets.top + Spacing.xl,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}>
        <View style={styles.inner}>
          <Text style={[Typography.chapterEyebrow, { color: colors.textMuted }]}>A2+</Text>
          <Text style={[Typography.heroTitle, { color: colors.text, marginTop: Spacing.sm }]}>
            Your Italian continues.
          </Text>
          <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
            Choose your next story.
          </Text>

          <View style={styles.cards}>
            {A2_PLUS_PATHWAYS.map((pathway) => (
              <PathwayWorldCard
                key={pathway.id}
                pathway={pathway}
                onPress={
                  pathway.status === 'available' ? () => onBeginPathway(pathway) : undefined
                }
              />
            ))}
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={onNotNow}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1, marginTop: Spacing.lg }]}>
            <Text style={[Typography.label, { color: colors.textMuted, textAlign: 'center' }]}>
              Not now
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  inner: {
    flex: 1,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  cards: {
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },
});
