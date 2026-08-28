import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { LevelGate } from '@/src/cefr/levelGates';
import { AppSymbol } from '@/src/components/AppSymbol';
import { Radii, Spacing, Typography } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

type Props = {
  visible: boolean;
  gate: LevelGate | null;
  onClose: () => void;
  onContinueJourney: () => void;
  onTakeReadinessTest: (gate: LevelGate) => void;
};

export function LevelGateModal({
  visible,
  gate,
  onClose,
  onContinueJourney,
  onTakeReadinessTest,
}: Props) {
  const { colors, minTouchTarget } = useTheme();
  const insets = useSafeAreaInsets();

  if (!gate) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.backgroundElevated,
              borderColor: colors.border,
              paddingBottom: Math.max(Spacing.lg, insets.bottom + Spacing.sm),
            },
          ]}>
          {/* Header */}
          <View style={styles.header}>
            <View
              style={[
                styles.levelBadge,
                { backgroundColor: 'rgba(120, 182, 163, 0.15)', borderColor: colors.tint },
              ]}>
              <Text style={[styles.levelBadgeText, { color: colors.tint }]}>{gate.level}</Text>
            </View>
            <Pressable
              onPress={onClose}
              hitSlop={12}
              style={({ pressed }) => [styles.closeBtn, { opacity: pressed ? 0.6 : 1 }]}>
              <AppSymbol
                name={{ ios: 'xmark', android: 'close', web: 'close' }}
                tintColor={colors.textMuted}
                size={20}
              />
            </Pressable>
          </View>

          {/* Narrative message */}
          <Text style={[styles.narrativeTitle, { color: colors.text }]}>
            Luca’s story continues here.
          </Text>
          <Text style={[styles.narrativeSub, { color: colors.textSecondary }]}>
            Already comfortable with {gate.level} Italian? You don’t have to start from the beginning.
          </Text>

          <View style={styles.pathwaysContainer}>
            {/* Option 1: Continue normal story journey */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Continue the story"
              onPress={onContinueJourney}
              style={({ pressed }) => [
                styles.pathwayOption,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  opacity: pressed ? 0.85 : 1,
                  minHeight: minTouchTarget,
                },
              ]}>
              <View style={styles.optionContent}>
                <Text style={[Typography.chapterEyebrow, { color: colors.textMuted, fontSize: 10 }]}>
                  CONTINUE THE STORY
                </Text>
                <Text style={[styles.optionTitle, { color: colors.text }]}>
                  Read {gate.previousChaptersText}
                </Text>
                <Text style={[styles.optionHint, { color: colors.textSecondary }]}>
                  Start from the beginning →
                </Text>
              </View>
            </Pressable>

            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: colors.divider }]} />
              <Text style={[styles.dividerText, { color: colors.textMuted }]}>or</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.divider }]} />
            </View>

            {/* Option 2: Destination-level readiness test */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Take the ${gate.level} Readiness Test`}
              onPress={() => onTakeReadinessTest(gate)}
              style={({ pressed }) => [
                styles.pathwayOption,
                styles.readinessOption,
                {
                  backgroundColor: 'rgba(120, 182, 163, 0.08)',
                  borderColor: colors.tint,
                  opacity: pressed ? 0.85 : 1,
                  minHeight: minTouchTarget,
                },
              ]}>
              <View style={styles.optionContent}>
                <Text style={[Typography.chapterEyebrow, { color: colors.tint, fontSize: 10 }]}>
                  ALREADY KNOW THIS LEVEL?
                </Text>
                <Text style={[styles.optionTitle, { color: colors.tint }]}>
                  Take the {gate.level} Readiness Test →
                </Text>
                <Text style={[styles.optionHint, { color: colors.textSecondary }]}>
                  Show you’re ready and start at Chapter {gate.targetChapterNumber}.
                </Text>
              </View>
            </Pressable>
          </View>

          {/* Dismiss button */}
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.dismissButton,
              { opacity: pressed ? 0.7 : 1, minHeight: minTouchTarget },
            ]}>
            <Text style={[Typography.caption, { color: colors.textMuted, textAlign: 'center' }]}>
              Close
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    borderRadius: Radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  levelBadge: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: Radii.pill,
    borderWidth: 1,
  },
  levelBadgeText: {
    fontFamily: 'Literata_600SemiBold',
    fontSize: 13,
    letterSpacing: 0.8,
  },
  closeBtn: {
    padding: Spacing.xs,
  },
  narrativeTitle: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 24,
    lineHeight: 28,
    textAlign: 'center',
  },
  narrativeSub: {
    fontFamily: 'Literata_400Regular',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  pathwaysContainer: {
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  pathwayOption: {
    borderRadius: Radii.md,
    borderWidth: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    justifyContent: 'center',
  },
  readinessOption: {
    borderWidth: 1.5,
  },
  optionContent: {
    gap: 3,
  },
  optionTitle: {
    fontFamily: 'Literata_600SemiBold',
    fontSize: 15,
    lineHeight: 20,
  },
  optionHint: {
    fontFamily: 'Literata_400Regular',
    fontSize: 12,
    lineHeight: 16,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
    paddingHorizontal: Spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  dividerText: {
    fontFamily: 'Literata_400Regular',
    fontSize: 12,
    marginHorizontal: Spacing.sm,
  },
  dismissButton: {
    marginTop: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
