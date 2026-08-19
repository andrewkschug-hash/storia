import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { LexiconEntry, ProductionExercise, Sentence } from '@/src/content/schemas';
import {
  productionCardView,
  type SelfAssessment,
  type StorySentenceCue,
} from '@/src/production/flow';
import { buildWordHintSegments } from '@/src/production/wordHints';
import { SelfAssessmentVoteButtons } from '@/src/components/SelfAssessmentVoteButtons';
import { Radii, Spacing } from '@/src/theme/tokens';
import { isPressableFocused } from '@/src/theme/pressableState';
import { useTheme } from '@/src/theme/useTheme';

type Props = {
  exercise: ProductionExercise;
  index: number;
  total: number;
  onContinue: () => void;
  /** Story sentence this exercise is based on. Used so prompts match 3rd-person narration. */
  sourceSentence?: (StorySentenceCue & Partial<Pick<Sentence, 'tokens' | 'phrases'>>) | null;
  lexiconById?: Map<string, LexiconEntry>;
  onAssessed?: (assessment: SelfAssessment | null) => void;
};

export function ProductionExerciseCard({
  exercise,
  index,
  total,
  onContinue,
  sourceSentence,
  lexiconById,
  onAssessed,
}: Props) {
  const { colors, type, minTouchTarget } = useTheme();
  const [revealed, setRevealed] = useState(false);
  const [assessment, setAssessment] = useState<SelfAssessment | null>(null);
  const [revealedHints, setRevealedHints] = useState<Record<string, boolean>>({});
  const view = productionCardView(exercise, index, total, revealed, sourceSentence);
  const hintSegments =
    lexiconById && sourceSentence?.tokens?.length
      ? buildWordHintSegments(
          view.promptEn,
          sourceSentence as Sentence,
          lexiconById,
        )
      : null;

  useEffect(() => {
    setRevealed(false);
    setAssessment(null);
    setRevealedHints({});
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
        Say it out loud the way the story said it, then check your answer. Tap an English word if
        you forget the Italian for it.
      </Text>

      <View
        style={[
          styles.promptCard,
          { backgroundColor: colors.backgroundElevated, borderColor: colors.border },
        ]}>
        <Text style={[type.caption, { color: colors.textMuted }]}>English</Text>
        {hintSegments ? (
          <Text style={[type.heroTitle, { color: colors.text, marginTop: Spacing.sm, flexWrap: 'wrap' }]}>
            {hintSegments.map((segment, segmentIndex) => {
              if (!segment.tappable || !segment.hint) {
                return (
                  <Text key={`${segment.text}-${segmentIndex}`} style={{ color: colors.text }}>
                    {segment.text}
                  </Text>
                );
              }
              const hintKey = `${segmentIndex}-${segment.text}`;
              const hintVisible = revealedHints[hintKey];
              return (
                <Text key={hintKey}>
                  <Text
                    onPress={() =>
                      setRevealedHints((prev) => ({ ...prev, [hintKey]: !prev[hintKey] }))
                    }
                    style={{
                      color: hintVisible ? colors.tint : colors.text,
                      textDecorationLine: 'underline',
                      textDecorationStyle: 'dotted',
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Hint for ${segment.text.trim()}`}>
                    {segment.text}
                  </Text>
                  {hintVisible ? (
                    <Text style={{ color: colors.tint, fontSize: type.caption.fontSize }}>
                      {' '}
                      ({segment.hint}){' '}
                    </Text>
                  ) : null}
                </Text>
              );
            })}
          </Text>
        ) : (
          <Text
            style={[type.heroTitle, { color: colors.text, marginTop: Spacing.sm }]}
            accessibilityRole="text">
            {view.promptEn}
          </Text>
        )}
      </View>

      {view.showAnswerVisible ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Show answer"
          onPress={() => setRevealed(true)}
          style={(state) => [
            styles.primaryBtn,
            {
              backgroundColor: colors.buttonPrimary,
              opacity: state.pressed ? 0.88 : 1,
              marginTop: Spacing.xl,
              borderWidth: isPressableFocused(state) ? 2 : 0,
              borderColor: colors.accent,
            },
          ]}>
          <Text style={[type.button, { color: colors.onButtonPrimary }]}>Show answer</Text>
        </Pressable>
      ) : null}

      {view.expectedIt ? (
        <View
          style={[
            styles.answerCard,
            {
              backgroundColor: colors.readerSurface,
              borderColor: colors.border,
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
          <SelfAssessmentVoteButtons
            selected={assessment}
            onVote={(option) => {
              setAssessment(option);
              onAssessed?.(option);
            }}
          />
        </View>
      ) : null}

      {view.continueVisible ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Continue"
          onPress={onContinue}
          style={(state) => [
            styles.primaryBtn,
            {
              backgroundColor: colors.buttonPrimary,
              opacity: state.pressed ? 0.88 : 1,
              marginTop: Spacing.xl,
              minHeight: minTouchTarget,
              borderWidth: isPressableFocused(state) ? 2 : 0,
              borderColor: colors.accent,
            },
          ]}>
          <Text style={[type.button, { color: colors.onButtonPrimary }]}>Continue</Text>
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
});
