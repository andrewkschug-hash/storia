import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ProductionExercise } from '@/src/content/schemas';
import {
  productionCardView,
  type SelfAssessment,
  type StorySentenceCue,
} from '@/src/production/flow';
import { Radii, Spacing } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

type Props = {
  exercise: ProductionExercise;
  index: number;
  total: number;
  onContinue: () => void;
  /** Story sentence this exercise is based on. Used so prompts match 3rd-person narration. */
  sourceSentence?: StorySentenceCue | null;
  onAssessed?: (assessment: SelfAssessment | null) => void;
};

const SELF_ASSESSMENT: { id: SelfAssessment; label: string }[] = [
  { id: 'got_it', label: 'I got it' },
  { id: 'almost', label: 'Almost' },
  { id: 'not_yet', label: 'Not yet' },
];

export function ProductionExerciseCard({
  exercise,
  index,
  total,
  onContinue,
  sourceSentence,
  onAssessed,
}: Props) {
  const { colors, type, minTouchTarget } = useTheme();
  const [revealed, setRevealed] = useState(false);
  const [assessment, setAssessment] = useState<SelfAssessment | null>(null);
  const view = productionCardView(exercise, index, total, revealed, sourceSentence);

  useEffect(() => {
    setRevealed(false);
    setAssessment(null);
  }, [exercise.exerciseId]);

  return (
    <View>
      <Text style={[type.chapterEyebrow, { color: colors.tint }]}>
        Say it in Italian
      </Text>
      <Text style={[type.caption, { color: colors.textMuted, marginTop: Spacing.xs }]}>
        {view.progressLabel}
      </Text>
      <Text style={[type.heroTitle, { color: colors.text, marginTop: Spacing.sm }]}>
        Can you say this in Italian?
      </Text>
      <Text style={[type.body, { color: colors.textSecondary, marginTop: Spacing.md }]}>
        Say it out loud the way the story said it, then check your answer.
      </Text>

      <View
        style={[
          styles.promptCard,
          { backgroundColor: colors.backgroundElevated, borderColor: colors.border },
        ]}>
        <Text style={[type.caption, { color: colors.textMuted }]}>English</Text>
        <Text
          style={[type.heroTitle, { color: colors.text, marginTop: Spacing.sm }]}
          accessibilityRole="text">
          {view.promptEn}
        </Text>
      </View>

      {view.showAnswerVisible ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Show answer"
          onPress={() => setRevealed(true)}
          style={({ pressed, focused }) => [
            styles.primaryBtn,
            {
              backgroundColor: colors.tint,
              opacity: pressed ? 0.88 : 1,
              marginTop: Spacing.xl,
              borderWidth: focused ? 2 : 0,
              borderColor: colors.accent,
            },
          ]}>
          <Text style={[type.button, { color: colors.onTint }]}>Show answer</Text>
        </Pressable>
      ) : null}

      {view.expectedIt ? (
        <View
          style={[
            styles.answerCard,
            {
              backgroundColor: colors.readerSurface,
              borderColor: colors.tint,
            },
          ]}>
          <Text style={[type.caption, { color: colors.textMuted }]}>Expected answer</Text>
          <Text
            style={[type.reader, { color: colors.text, marginTop: Spacing.sm }]}
            accessibilityRole="text">
            {view.expectedIt}
          </Text>
          {view.acceptableAnswers.length > 0 ? (
            <View style={{ marginTop: Spacing.lg }}>
              <Text style={[type.label, { color: colors.text }]}>Also acceptable:</Text>
              {view.acceptableAnswers.map((alt) => (
                <Text
                  key={alt}
                  style={[type.body, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
                  {alt}
                </Text>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}

      {view.howDidYouDoVisible ? (
        <View style={{ marginTop: Spacing.xl }}>
          <Text style={[type.label, { color: colors.text }]}>How did you do?</Text>
          <View style={styles.assessmentRow}>
            {SELF_ASSESSMENT.map((option) => {
              const selected = assessment === option.id;
              return (
                <Pressable
                  key={option.id}
                  accessibilityRole="button"
                  accessibilityLabel={option.label}
                  accessibilityState={{ selected }}
                  onPress={() => {
                    setAssessment(option.id);
                    onAssessed?.(option.id);
                  }}
                  style={({ pressed, focused }) => [
                    styles.assessmentBtn,
                    {
                      backgroundColor: selected ? colors.tint : colors.backgroundElevated,
                      borderColor: focused || selected ? colors.tint : colors.border,
                      opacity: pressed ? 0.88 : 1,
                    },
                  ]}>
                  <Text
                    style={[
                      type.caption,
                      { color: selected ? colors.onTint : colors.text, textAlign: 'center' },
                    ]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      {view.continueVisible ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Continue"
          onPress={onContinue}
          style={({ pressed, focused }) => [
            styles.primaryBtn,
            {
              backgroundColor: colors.tint,
              opacity: pressed ? 0.88 : 1,
              marginTop: Spacing.xl,
              minHeight: minTouchTarget,
              borderWidth: focused ? 2 : 0,
              borderColor: colors.accent,
            },
          ]}>
          <Text style={[type.button, { color: colors.onTint }]}>Continue</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  promptCard: {
    marginTop: Spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
  },
  answerCard: {
    marginTop: Spacing.lg,
    borderWidth: 1.5,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
  },
  primaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radii.md,
  },
  assessmentRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  assessmentBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderRadius: Radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 44,
  },
});
