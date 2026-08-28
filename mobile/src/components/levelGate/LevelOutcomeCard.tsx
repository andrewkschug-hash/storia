import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ReadinessEvaluation } from '@/src/cefr/readinessAssessments';
import { Radii, Spacing, Typography } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

type Props = {
  evaluation: ReadinessEvaluation;
  onStartChapter: (chapterNumber: number, chapterId: string) => void;
  onContinueStory: () => void;
  onSecondaryAction?: () => void;
};

export function LevelOutcomeCard({
  evaluation,
  onStartChapter,
  onContinueStory,
  onSecondaryAction,
}: Props) {
  const { colors, minTouchTarget } = useTheme();
  const isReady = evaluation.isReady;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.backgroundElevated,
          borderColor: isReady ? colors.tint : colors.border,
        },
      ]}>
      {/* Top eyebrow badge */}
      <View
        style={[
          styles.badge,
          {
            backgroundColor: isReady
              ? 'rgba(120, 182, 163, 0.15)'
              : 'rgba(255, 255, 255, 0.06)',
            borderColor: isReady ? colors.tint : colors.border,
          },
        ]}>
        <Text
          style={[
            styles.badgeText,
            { color: isReady ? colors.tint : colors.textSecondary },
          ]}>
          {isReady ? `✦ ${evaluation.targetLevel} READY` : 'FINDING YOUR STARTING POINT'}
        </Text>
      </View>

      {/* Main Headline */}
      <Text style={[styles.headline, { color: colors.text }]}>{evaluation.headline}</Text>
      <Text style={[styles.subheadline, { color: colors.textSecondary }]}>
        {evaluation.subheadline}
      </Text>

      {/* Domain Score Breakdown */}
      <View style={[styles.domainsBox, { borderColor: colors.divider }]}>
        <Text style={[Typography.chapterEyebrow, { color: colors.textMuted, fontSize: 10 }]}>
          ASSESSMENT SUMMARY
        </Text>
        <View style={styles.domainGrid}>
          {Object.values(evaluation.domains).map((domain) => (
            <View key={domain.domain} style={styles.domainItem}>
              <View style={styles.domainHeader}>
                <Text style={[styles.domainName, { color: colors.text }]}>{domain.label}</Text>
                <Text
                  style={[
                    styles.domainScore,
                    { color: domain.metFloor ? colors.tint : colors.textSecondary },
                  ]}>
                  {domain.earned} / {domain.possible} {domain.metFloor ? '✓' : ''}
                </Text>
              </View>
              <View style={[styles.domainBarTrack, { backgroundColor: colors.background }]}>
                <View
                  style={[
                    styles.domainBarFill,
                    {
                      width: `${Math.min(100, domain.percentage)}%`,
                      backgroundColor: domain.metFloor ? colors.tint : colors.textMuted,
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Advice note */}
      <Text style={[styles.adviceText, { color: colors.textSecondary }]}>
        {evaluation.remediationAdvice}
      </Text>

      {/* Action Buttons */}
      <View style={styles.actions}>
        {isReady ? (
          <>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Start Chapter ${evaluation.targetChapterNumber}`}
              onPress={() =>
                onStartChapter(evaluation.targetChapterNumber, evaluation.targetChapterId)
              }
              style={({ pressed }) => [
                styles.primaryBtn,
                {
                  backgroundColor: colors.tint,
                  opacity: pressed ? 0.88 : 1,
                  minHeight: minTouchTarget,
                },
              ]}>
              <Text style={[styles.primaryBtnText, { color: colors.background }]}>
                Start Chapter {evaluation.targetChapterNumber} →
              </Text>
            </Pressable>

            {onSecondaryAction ? (
              <Pressable
                onPress={onSecondaryAction}
                style={({ pressed }) => [
                  styles.secondaryBtn,
                  { opacity: pressed ? 0.7 : 1, minHeight: minTouchTarget },
                ]}>
                <Text style={[Typography.caption, { color: colors.textMuted }]}>
                  Return to library
                </Text>
              </Pressable>
            ) : null}
          </>
        ) : (
          <>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Continue the story"
              onPress={onContinueStory}
              style={({ pressed }) => [
                styles.primaryBtn,
                {
                  backgroundColor: colors.tint,
                  opacity: pressed ? 0.88 : 1,
                  minHeight: minTouchTarget,
                },
              ]}>
              <Text style={[styles.primaryBtnText, { color: colors.background }]}>
                Continue the story →
              </Text>
            </Pressable>

            {onSecondaryAction ? (
              <Pressable
                onPress={onSecondaryAction}
                style={({ pressed }) => [
                  styles.secondaryBtn,
                  { opacity: pressed ? 0.7 : 1, minHeight: minTouchTarget },
                ]}>
                <Text style={[Typography.caption, { color: colors.textMuted }]}>
                  Try again later
                </Text>
              </Pressable>
            ) : null}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radii.lg,
    borderWidth: 1.5,
    padding: Spacing.lg,
    marginVertical: Spacing.md,
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radii.pill,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  badgeText: {
    fontFamily: 'Literata_600SemiBold',
    fontSize: 11,
    letterSpacing: 1.2,
  },
  headline: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 28,
    lineHeight: 34,
    textAlign: 'center',
  },
  subheadline: {
    fontFamily: 'Literata_400Regular',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  domainsBox: {
    width: '100%',
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  domainGrid: {
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  domainItem: {
    gap: 4,
  },
  domainHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  domainName: {
    fontFamily: 'Literata_400Regular',
    fontSize: 13,
  },
  domainScore: {
    fontFamily: 'Literata_600SemiBold',
    fontSize: 13,
  },
  domainBarTrack: {
    height: 4,
    borderRadius: Radii.pill,
    overflow: 'hidden',
  },
  domainBarFill: {
    height: '100%',
    borderRadius: Radii.pill,
  },
  adviceText: {
    fontFamily: 'Literata_400Regular',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: Spacing.md,
    fontStyle: 'italic',
  },
  actions: {
    width: '100%',
    marginTop: Spacing.lg,
    gap: Spacing.xs,
  },
  primaryBtn: {
    width: '100%',
    borderRadius: Radii.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    fontFamily: 'Literata_600SemiBold',
    fontSize: 15,
    letterSpacing: 0.4,
  },
  secondaryBtn: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
  },
});
