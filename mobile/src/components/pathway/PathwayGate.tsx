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
 * A Well-Deserved Break - narrative transition after Luca a Roma Ch 40.
 * 1. Emotional landing in English (Luca resting at home in his Rome apartment).
 * 2. Luca asks the reader for help choosing a book.
 * 3. Book-cover cards with English descriptions.
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
            {/* Beat 1: Connecting A2 to Luca resting at home */}
            <View style={styles.beatOne}>
              <Text style={[Typography.chapterEyebrow, { color: colors.tint, letterSpacing: 1.4 }]}>
                🌿 A Well-Deserved Break · A2+
              </Text>

              <Text style={[styles.headline, { color: colors.text }]}>
                Luca is resting at home in Rome.
              </Text>

              <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
                After months of intense shifts at the café, adjusting to city life, and making the big decision to stay in Rome ("for now, this is home"), Luca finally has a quiet evening all to himself.
              </Text>

              <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.xs }]}>
                Far from the clatter of espresso cups and the rush of customers, he sits on the sofa with a warm drink, ready to unwind. He wants to pick up a book and get lost in a great story, but three intriguing titles are sitting on his table, and he cannot decide where to begin.
              </Text>

              <View
                style={[
                  styles.lucaReflection,
                  { backgroundColor: colors.accentSoft, borderColor: colors.border },
                ]}>
                <Text
                  style={[
                    Typography.readerDialogue,
                    { color: colors.text, fontSize: 16, lineHeight: 24, fontStyle: 'italic' },
                  ]}>
                  “I finally have a peaceful evening to read... but every book here looks so captivating. Which one should I open first?”
                </Text>
              </View>
            </View>

            {/* Beat 2: User prompt to help Luca choose */}
            <View style={styles.beatTwo}>
              <Text style={[Typography.body, { color: colors.textSecondary }]}>
                Help Luca choose which book to pick up first. You will read the story right alongside him!
              </Text>
              <Text style={[styles.subHeadline, { color: colors.text, marginTop: Spacing.xs }]}>
                Which book should Luca read?
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
                I will help him decide later
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
  headline: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 26,
    lineHeight: 32,
    marginTop: Spacing.xs,
  },
  subHeadline: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 22,
    lineHeight: 28,
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
