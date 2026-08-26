import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Radii, Spacing } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

type TransitionProps = {
  phaseLabel: string;
  headline: string;
  body: string;
  actionLabel: string;
  onAction: () => void;
  skipLabel?: string;
  onSkip?: () => void;
};

type CompleteProps = {
  phaseLabel: string;
  headline: string;
  body: string;
  continueLabel: string;
  onContinue: () => void;
};

export function ReaderReadToListenTransition({
  phaseLabel,
  headline,
  body,
  actionLabel,
  onAction,
  skipLabel,
  onSkip,
}: TransitionProps) {
  const { colors, type, minTouchTarget } = useTheme();

  return (
    <View style={[styles.screen, { backgroundColor: colors.readerSurface }]}>
      <View
        style={[
          styles.card,
          { backgroundColor: colors.backgroundElevated, borderColor: colors.border },
        ]}>
        <Text style={[type.chapterEyebrow, { color: colors.accent }]}>{phaseLabel}</Text>
        <Text style={[type.heroTitle, { color: colors.text, marginTop: Spacing.sm, fontSize: 28 }]}>
          {headline}
        </Text>
        <Text style={[type.body, { color: colors.textSecondary, marginTop: Spacing.md, lineHeight: 24 }]}>
          {body}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          onPress={onAction}
          style={({ pressed }) => [
            styles.primaryBtn,
            {
              backgroundColor: colors.buttonPrimary,
              opacity: pressed ? 0.88 : 1,
              minHeight: minTouchTarget,
            },
          ]}>
          <Text style={[type.button, { color: colors.onButtonPrimary }]}>{actionLabel}</Text>
        </Pressable>
        {skipLabel && onSkip ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={skipLabel}
            onPress={onSkip}
            style={({ pressed }) => [
              styles.secondaryBtn,
              {
                borderColor: colors.border,
                opacity: pressed ? 0.88 : 1,
                minHeight: minTouchTarget,
              },
            ]}>
            <Text style={[type.button, { color: colors.textMuted }]}>{skipLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export function ReaderListenComplete({
  phaseLabel,
  headline,
  body,
  continueLabel,
  onContinue,
}: CompleteProps) {
  const { colors, type, minTouchTarget } = useTheme();

  return (
    <View style={[styles.screen, { backgroundColor: colors.readerSurface }]}>
      <View
        style={[
          styles.card,
          { backgroundColor: colors.backgroundElevated, borderColor: colors.border },
        ]}>
        <Text style={[type.chapterEyebrow, { color: colors.accent }]}>{phaseLabel}</Text>
        <Text style={[type.heroTitle, { color: colors.text, marginTop: Spacing.sm, fontSize: 28 }]}>
          {headline}
        </Text>
        <Text style={[type.body, { color: colors.textSecondary, marginTop: Spacing.md, lineHeight: 24 }]}>
          {body}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={continueLabel}
          onPress={onContinue}
          style={({ pressed }) => [
            styles.primaryBtn,
            {
              backgroundColor: colors.buttonPrimary,
              opacity: pressed ? 0.88 : 1,
              minHeight: minTouchTarget,
            },
          ]}>
          <Text style={[type.button, { color: colors.onButtonPrimary }]}>{continueLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
  card: {
    borderRadius: Radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.xl,
    gap: Spacing.sm,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  primaryBtn: {
    marginTop: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radii.md,
  },
  secondaryBtn: {
    marginTop: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radii.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
