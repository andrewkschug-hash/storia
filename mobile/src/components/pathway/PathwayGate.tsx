import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PathwayWorldCard } from '@/src/components/pathway/PathwayWorldCard';
import { A2_PLUS_PATHWAYS, type PathwayDefinition } from '@/src/pathway/paths';
import { Radii, Spacing, Typography } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

type Props = {
  visible: boolean;
  onBeginPathway: (pathway: PathwayDefinition) => void;
  onNotNow: () => void;
};

/**
 * "Una pausa di lettura" — 3-beat diegetic transition after Luca a Roma Ch 40.
 * 1. Emotional landing (Luca takes a break at the café).
 * 2. Luca acts as diegetic host ("Cosa vuoi leggere?").
 * 3. Book-cover cards for independent stories.
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
            paddingTop: insets.top + Spacing.md,
            paddingBottom: insets.bottom + Spacing.md,
          },
        ]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <View style={styles.inner}>
            {/* Beat 1: Emotional landing */}
            <View style={styles.beatOne}>
              <Text style={[Typography.chapterEyebrow, { color: colors.tint }]}>
                🌿 Una pausa di lettura
              </Text>
              <Text style={[Typography.body, { color: colors.text, marginTop: Spacing.md }]}>
                Luca si siede al tavolino del bar.
              </Text>
              <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.xs }]}>
                Per un momento, non pensa al lavoro, ai clienti o al futuro.
              </Text>
              <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.xs }]}>
                Prende il telefono.
              </Text>
              <View
                style={[
                  styles.lucaReflection,
                  { backgroundColor: colors.accentSoft, borderColor: colors.border },
                ]}>
                <Text
                  style={[
                    Typography.readerDialogue,
                    { color: colors.text, fontSize: 18, lineHeight: 28 },
                  ]}>
                  «Forse è il momento di leggere qualcosa di diverso.»
                </Text>
              </View>
            </View>

            {/* Beat 2: Luca as host */}
            <View style={styles.beatTwo}>
              <Text style={[Typography.body, { color: colors.textSecondary }]}>
                Anche Luca ogni tanto cambia storia. Ci sono storie nuove da scoprire.
              </Text>
              <Text style={[Typography.heroTitle, { color: colors.text, marginTop: Spacing.sm }]}>
                Cosa vuoi leggere?
              </Text>
            </View>

            {/* Beat 3: Book Cover Cards */}
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
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1, marginTop: Spacing.xl }]}>
              <Text style={[Typography.label, { color: colors.textMuted, textAlign: 'center' }]}>
                Per ora no
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: Spacing.md,
  },
  inner: {
    maxWidth: 540,
    width: '100%',
    alignSelf: 'center',
  },
  beatOne: {
    marginBottom: Spacing.lg,
  },
  lucaReflection: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.sm,
    borderWidth: StyleSheet.hairlineWidth,
  },
  beatTwo: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  cards: {
    gap: Spacing.md,
  },
});
