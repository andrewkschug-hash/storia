import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Radii, Spacing, Typography } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';
import { useLayout } from '@/src/theme/useLayout';

type Props = {
  visible: boolean;
  onDismiss: () => void;
};

export function ReadingMindsetModal({ visible, onDismiss }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const layout = useLayout();

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onDismiss}>
      <View
        style={[
          styles.backdrop,
          {
            paddingTop: insets.top + (layout.isPhone ? Spacing.md : Spacing.xl),
            paddingBottom: insets.bottom + (layout.isPhone ? Spacing.md : Spacing.xl),
            paddingHorizontal: layout.isPhone ? Spacing.md : Spacing.xl,
          },
        ]}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.backgroundElevated,
              borderColor: colors.border,
              maxWidth: 540,
            },
          ]}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.eyebrowRow}>
                <Text style={[Typography.chapterEyebrow, { color: colors.tint }]}>
                  🌿 GUIDA ALLA LETTURA
                </Text>
                <Pressable
                  onPress={onDismiss}
                  accessibilityRole="button"
                  accessibilityLabel="Close reading mindset guide"
                  hitSlop={12}
                  style={styles.closeBtn}>
                  <Text style={[styles.closeText, { color: colors.textMuted }]}>✕</Text>
                </Pressable>
              </View>
              <Text
                style={[
                  Typography.heroTitle,
                  {
                    color: colors.text,
                    fontSize: layout.isPhone ? 24 : 28,
                    lineHeight: layout.isPhone ? 32 : 36,
                    marginTop: Spacing.xs,
                  },
                ]}>
                Patterns, Not Perfection
              </Text>
            </View>

            <View style={[styles.rule, { backgroundColor: colors.accent }]} />

            {/* Core Reassurance */}
            <View
              style={[
                styles.highlightBox,
                { backgroundColor: colors.accentSoft, borderColor: colors.border },
              ]}>
              <Text
                style={[
                  Typography.readerDialogue,
                  {
                    color: colors.text,
                    fontSize: layout.isPhone ? 16 : 17,
                    lineHeight: layout.isPhone ? 25 : 27,
                  },
                ]}>
                «You do not need to understand every individual word to enjoy and master Italian.»
              </Text>
            </View>

            {/* 3 Key Mindset Pillars */}
            <View style={styles.pillars}>
              <View style={styles.pillar}>
                <Text style={styles.pillarIcon}>🌊</Text>
                <View style={styles.pillarTextWrap}>
                  <Text style={[Typography.label, { color: colors.text }]}>
                    Follow the Sentence Flow
                  </Text>
                  <Text style={[Typography.body, styles.pillarDesc, { color: colors.textSecondary }]}>
                    Look for the whole meaning of each sentence. Let the story carry you forward rather than analyzing each word in isolation.
                  </Text>
                </View>
              </View>

              <View style={styles.pillar}>
                <Text style={styles.pillarIcon}>🔍</Text>
                <View style={styles.pillarTextWrap}>
                  <Text style={[Typography.label, { color: colors.text }]}>
                    Patterns Over Memorization
                  </Text>
                  <Text style={[Typography.body, styles.pillarDesc, { color: colors.textSecondary }]}>
                    Key verbs, connectors, and vocabulary will repeat naturally. Your brain picks up linguistic patterns through context and exposure.
                  </Text>
                </View>
              </View>

              <View style={styles.pillar}>
                <Text style={styles.pillarIcon}>💡</Text>
                <View style={styles.pillarTextWrap}>
                  <Text style={[Typography.label, { color: colors.text }]}>
                    Assistance Is Always Here
                  </Text>
                  <Text style={[Typography.body, styles.pillarDesc, { color: colors.textSecondary }]}>
                    Whenever you feel stuck, simply tap any word or sentence to see its meaning and hear natural native pronunciation.
                  </Text>
                </View>
              </View>
            </View>

            {/* Primary Action */}
            <Pressable
              onPress={onDismiss}
              accessibilityRole="button"
              accessibilityLabel="Start reading"
              style={({ pressed }) => [
                styles.primaryBtn,
                {
                  backgroundColor: colors.accent,
                  opacity: pressed ? 0.88 : 1,
                },
              ]}>
              <Text style={[Typography.button, { color: colors.onButtonPrimary, fontSize: 16 }]}>
                Iniziamo • Start Reading
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxHeight: '92%',
    borderRadius: Radii.lg,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  scrollContent: {
    padding: Spacing.xl,
  },
  header: {
    marginBottom: Spacing.xs,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeBtn: {
    padding: Spacing.xs,
  },
  closeText: {
    fontSize: 18,
    fontWeight: '600',
  },
  rule: {
    width: 44,
    height: 2,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
    borderRadius: 1,
  },
  highlightBox: {
    borderRadius: Radii.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.lg,
  },
  pillars: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  pillar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  pillarIcon: {
    fontSize: 22,
    lineHeight: 28,
  },
  pillarTextWrap: {
    flex: 1,
  },
  pillarDesc: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 2,
  },
  primaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radii.md,
    minHeight: 50,
  },
});
