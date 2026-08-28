import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { LexiconEntry, ProductionExercise, Sentence } from '@/src/content/schemas';
import {
  productionCardView,
  type SelfAssessment,
  type StorySentenceCue,
} from '@/src/production/flow';
import {
  buildTargetedWordHints,
  deriveFocusKeywords,
  generateSentenceCloze,
  type HintLevel,
} from '@/src/production/hintLadder';
import { speakItalian, stopSpeakingItalian } from '@/src/walkthrough/speakItalian';
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
  const [hintLevel, setHintLevel] = useState<HintLevel>(0);
  const [revealed, setRevealed] = useState(false);
  const [assessment, setAssessment] = useState<SelfAssessment | null>(null);
  const [revealedMicroHints, setRevealedMicroHints] = useState<Record<string, boolean>>({});
  const [audioPlaying, setAudioPlaying] = useState(false);

  const view = productionCardView(exercise, index, total, revealed || hintLevel === 3, sourceSentence, {
    storySentence: sourceSentence,
    lexiconById,
  });

  const canonicalSentence = (sourceSentence?.tokens?.length ? sourceSentence : null) as Sentence | null;
  const focusKeywords = deriveFocusKeywords(exercise, canonicalSentence, lexiconById);
  const sentenceCloze = generateSentenceCloze(
    exercise.expectedIt,
    focusKeywords,
    exercise.focus,
    canonicalSentence,
  );
  const targetedSegments = buildTargetedWordHints(
    view.promptEn,
    focusKeywords,
    canonicalSentence,
    lexiconById,
  );

  useEffect(() => {
    setHintLevel(0);
    setRevealed(false);
    setAssessment(null);
    setRevealedMicroHints({});
    setAudioPlaying(false);
    stopSpeakingItalian();
    return () => {
      stopSpeakingItalian();
    };
  }, [exercise.exerciseId]);

  const handleStepHint = () => {
    if (hintLevel === 0) {
      setHintLevel(1);
    } else if (hintLevel === 1) {
      setHintLevel(2);
    } else if (hintLevel === 2) {
      setHintLevel(3);
      setRevealed(true);
    }
  };

  const handleShowAnswer = () => {
    setHintLevel(3);
    setRevealed(true);
  };

  const handlePlayAudio = async () => {
    stopSpeakingItalian();
    setAudioPlaying(true);
    try {
      await speakItalian(exercise.expectedIt, 0.95);
    } finally {
      setAudioPlaying(false);
    }
  };

  const isComplete = revealed || hintLevel === 3;

  return (
    <View>
      <Text style={[type.chapterEyebrow, { color: colors.tint }]}>
        Say it in Italian
      </Text>
      <Text style={[type.caption, { color: colors.textMuted, marginTop: Spacing.xs }]}>
        {view.progressLabel}
      </Text>
      <Text style={[type.heroTitle, { color: colors.text, marginTop: Spacing.sm }]}>
        Say the full sentence in Italian
      </Text>
      <Text style={[type.body, { color: colors.textSecondary, marginTop: Spacing.md }]}>
        Say it out loud the way the story said it, then check your answer.
      </Text>

      {/* ENGLISH PROMPT CARD WITH TARGETED MICRO-HINTS */}
      <View
        style={[
          styles.promptCard,
          { backgroundColor: colors.backgroundElevated, borderColor: colors.border },
        ]}>
        <Text style={[type.caption, { color: colors.textMuted }]}>English</Text>
        <Text style={[type.heroTitle, { color: colors.text, marginTop: Spacing.sm, flexWrap: 'wrap' }]}>
          {targetedSegments.map((segment, segmentIndex) => {
            if (!segment.tappable || !segment.hint) {
              return (
                <Text key={`${segment.text}-${segmentIndex}`} style={{ color: colors.text }}>
                  {segment.text}
                </Text>
              );
            }
            const hintKey = `${segmentIndex}-${segment.text}`;
            const hintVisible = revealedMicroHints[hintKey];
            return (
              <Text key={hintKey}>
                <Text
                  onPress={() =>
                    setRevealedMicroHints((prev) => ({ ...prev, [hintKey]: !prev[hintKey] }))
                  }
                  style={{
                    color: hintVisible ? colors.tint : colors.text,
                    textDecorationLine: 'underline',
                    textDecorationStyle: 'dotted',
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Vocabulary clue for ${segment.text.trim()}`}>
                  {segment.text}
                </Text>
                {hintVisible ? (
                  <Text style={{ color: colors.tint, fontSize: type.caption.fontSize, fontWeight: '600' }}>
                    {' '}
                    ({segment.hint}){' '}
                  </Text>
                ) : null}
              </Text>
            );
          })}
        </Text>
      </View>

      {/* 3-LEVEL PROGRESSIVE HINT LADDER */}
      {(hintLevel > 0 || isComplete) && (
        <View
          style={[
            styles.ladderCard,
            { backgroundColor: colors.backgroundElevated, borderColor: colors.border },
          ]}>
          {/* Level 1: Key Words */}
          {hintLevel >= 1 && focusKeywords.length > 0 && (
            <View style={styles.ladderSection}>
              <Text style={[type.caption, { color: colors.textMuted, fontWeight: '700' }]}>
                💡 KEY WORDS
              </Text>
              <View style={styles.keywordRow}>
                {focusKeywords.map((kw, i) => (
                  <View
                    key={i}
                    style={[
                      styles.keywordChip,
                      { backgroundColor: colors.readerSurface, borderColor: colors.border },
                    ]}>
                    <Text style={[type.label, { color: colors.text }]}>{kw}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Level 2: Sentence Frame */}
          {hintLevel >= 2 && (
            <View style={[styles.ladderSection, { marginTop: Spacing.md }]}>
              <Text style={[type.caption, { color: colors.textMuted, fontWeight: '700' }]}>
                🧩 SENTENCE FRAME
              </Text>
              <Text style={[type.body, { color: colors.tint, fontWeight: '600', fontSize: 17, marginTop: 4 }]}>
                {sentenceCloze}
              </Text>
            </View>
          )}

          {/* Level 3: Listen & Repeat / Complete Model */}
          {isComplete && (
            <View style={[styles.ladderSection, { marginTop: hintLevel >= 1 ? Spacing.md : 0 }]}>
              <Text style={[type.caption, { color: colors.textMuted, fontWeight: '700' }]}>
                🔊 LISTEN & REPEAT
              </Text>
              <Text
                style={[type.reader, { color: colors.text, marginTop: Spacing.xs }]}
                accessibilityRole="text">
                {exercise.expectedIt}
              </Text>
              <Pressable
                onPress={handlePlayAudio}
                accessibilityRole="button"
                accessibilityLabel="Listen to pronunciation"
                style={({ pressed }) => [
                  styles.audioBtn,
                  {
                    borderColor: colors.tint,
                    backgroundColor: colors.accentSoft,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}>
                <Text style={[type.caption, { color: colors.tint, fontWeight: '700' }]}>
                  {audioPlaying ? '🔊 Playing...' : '▶ Listen'}
                </Text>
              </Pressable>
              <Text style={[type.caption, { color: colors.textSecondary, marginTop: Spacing.xs, fontStyle: 'italic' }]}>
                Now say it yourself.
              </Text>

              {view.acceptableAnswers.length > 0 && (
                <View style={{ marginTop: Spacing.md }}>
                  <Text style={[type.caption, { color: colors.textMuted }]}>Also acceptable:</Text>
                  {view.acceptableAnswers.map((alt) => (
                    <Text
                      key={alt}
                      style={[type.body, { color: colors.textSecondary, marginTop: 2 }]}>
                      {alt}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      )}

      {/* PROGRESSIVE HINT STEP BUTTON */}
      {!isComplete && (
        <View style={{ marginTop: Spacing.md }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              hintLevel === 0
                ? 'Give me a clue'
                : hintLevel === 1
                  ? 'Help me build it'
                  : 'Show me'
            }
            onPress={handleStepHint}
            style={({ pressed }) => [
              styles.hintStepBtn,
              {
                borderColor: colors.border,
                backgroundColor: colors.backgroundElevated,
                opacity: pressed ? 0.8 : 1,
              },
            ]}>
            <Text style={[type.label, { color: colors.tint }]}>
              {hintLevel === 0
                ? '💡 Give me a clue'
                : hintLevel === 1
                  ? '🧩 Help me build it'
                  : '🔊 Show me'}
            </Text>
          </Pressable>
        </View>
      )}

      {/* SHOW ANSWER BUTTON */}
      {!isComplete && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Show answer"
          onPress={handleShowAnswer}
          style={(state) => [
            styles.primaryBtn,
            {
              backgroundColor: colors.buttonPrimary,
              opacity: state.pressed ? 0.88 : 1,
              marginTop: Spacing.md,
              borderWidth: isPressableFocused(state) ? 2 : 0,
              borderColor: colors.accent,
            },
          ]}>
          <Text style={[type.button, { color: colors.onButtonPrimary }]}>Show answer</Text>
        </Pressable>
      )}

      {/* HOW DID YOU DO? */}
      {isComplete && (
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
      )}

      {/* CONTINUE BUTTON */}
      {isComplete && (
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
      )}
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
  ladderCard: {
    marginTop: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
  },
  ladderSection: {
    marginVertical: 2,
  },
  keywordRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  keywordChip: {
    borderWidth: 1,
    borderRadius: Radii.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  audioBtn: {
    borderWidth: 1,
    borderRadius: Radii.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginTop: Spacing.sm,
  },
  hintStepBtn: {
    borderWidth: 1,
    borderRadius: Radii.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radii.md,
  },
});
