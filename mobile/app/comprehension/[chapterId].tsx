import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AtmosphereBackground } from '@/src/components/AtmosphereBackground';
import { ProductionExerciseCard } from '@/src/components/ProductionExerciseCard';
import { getChapter, getChapterByNumber, getContentBundle } from '@/src/content';
import { getProductionExercisesForChapter } from '@/src/content/productionExercises';
import { evaluateAnswer } from '@/src/comprehension/evaluate';
import { shuffleQuestionChoices } from '@/src/comprehension/shuffle';
import { getProgressService } from '@/src/progress';
import type { ComprehensionAnswerRecord } from '@/src/progress/types';
import { comprehensionUsesItalianPrompt } from '@/src/content/scaffolding';
import { advanceProduction, afterComprehensionResults } from '@/src/production/flow';
import { getReviewService } from '@/src/review';
import { getVocabularyService } from '@/src/vocabulary';
import { Radii, Spacing, Typography } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

type Phase = 'intro' | 'question' | 'feedback' | 'results' | 'production' | 'review';

type QuestionState = {
  attempts: number;
  correct: boolean | null;
  selectedIndex: number | null;
};

export default function ComprehensionScreen() {
  const { chapterId } = useLocalSearchParams<{ chapterId: string }>();
  const chapter = getChapter(chapterId);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const questions = chapter?.questions ?? [];
  const productionExercises = useMemo(
    () => (chapter ? getProductionExercisesForChapter(chapter.id) : []),
    [chapter],
  );
  const [phase, setPhase] = useState<Phase>('intro');
  const [index, setIndex] = useState(0);
  const [productionIndex, setProductionIndex] = useState(0);
  const [states, setStates] = useState<QuestionState[]>(() =>
    questions.map(() => ({ attempts: 0, correct: null, selectedIndex: null })),
  );
  const [lastFeedback, setLastFeedback] = useState<{
    correct: boolean;
    explanation: string;
    correctChoice: number;
    correctLabel: string;
  } | null>(null);
  const [displayChoices, setDisplayChoices] = useState<{
    choices: string[];
    correctChoice: number;
  } | null>(null);
  const [finishing, setFinishing] = useState(false);
  const [reviewCopy, setReviewCopy] = useState<{
    headline: string;
    detail: string;
    readyCount: number;
  } | null>(null);

  const current = questions[index];

  const summary = useMemo(() => {
    const correct = states.filter((s) => s.correct).length;
    return { correct, total: questions.length };
  }, [states, questions.length]);

  function questionPrompt(question: (typeof questions)[number]): string {
    if (!chapter) return question.question;
    if (comprehensionUsesItalianPrompt(chapter.number) && question.questionIt) {
      return question.questionIt;
    }
    return question.question;
  }

  const continueAfterComplete = (chapterNumber: number) => {
    if (chapterNumber === 20 || chapterNumber === 24) {
      router.replace(`/level-readiness?fromChapter=${chapterNumber}` as import('expo-router').Href);
      return;
    }
    const next = getChapterByNumber(chapterNumber + 1);
    if (next) {
      router.replace(`/reader/${next.id}` as import('expo-router').Href);
    } else {
      router.replace('/(tabs)/home' as import('expo-router').Href);
    }
  };

  if (!chapter || questions.length === 0) {
    return (
      <AtmosphereBackground>
        <Stack.Screen options={{ title: 'Understanding' }} />
        <View style={styles.center}>
          <Text style={[Typography.body, { color: colors.textSecondary }]}>
            No comprehension questions for this chapter.
          </Text>
        </View>
      </AtmosphereBackground>
    );
  }

  const shuffleCurrent = (questionIndex: number) => {
    const question = questions[questionIndex];
    if (!question) return;
    setDisplayChoices(shuffleQuestionChoices(question.choices, question.correctChoice));
  };

  const onSelect = (choiceIndex: number) => {
    if (!current || !displayChoices || phase !== 'question') return;
    const evaluation = evaluateAnswer(
      { ...current, choices: displayChoices.choices, correctChoice: displayChoices.correctChoice },
      choiceIndex,
    );
    setStates((prev) => {
      const next = [...prev];
      const row = { ...next[index] };
      row.attempts += 1;
      row.selectedIndex = choiceIndex;
      row.correct = evaluation.correct;
      next[index] = row;
      return next;
    });
    setLastFeedback({
      correct: evaluation.correct,
      explanation: evaluation.explanation,
      correctChoice: evaluation.correctChoice,
      correctLabel: displayChoices.choices[evaluation.correctChoice] ?? current.choices[current.correctChoice],
    });
    setPhase('feedback');
  };

  const goNextFromFeedback = () => {
    if (index + 1 < questions.length) {
      const nextIndex = index + 1;
      setIndex(nextIndex);
      setLastFeedback(null);
      shuffleCurrent(nextIndex);
      setPhase('question');
      return;
    }
    setPhase('results');
  };

  const retryCurrent = () => {
    setLastFeedback(null);
    shuffleCurrent(index);
    setPhase('question');
  };

  const finish = async () => {
    if (finishing) return;
    setFinishing(true);
    try {
      const answers: ComprehensionAnswerRecord[] = questions.map((q, i) => ({
        questionId: q.id,
        correct: Boolean(states[i]?.correct),
        attempts: Math.max(1, states[i]?.attempts ?? 1),
      }));
      await getProgressService().finishComprehensionAndComplete(chapter.id, answers);
      const vocab = await getVocabularyService().getState();
      const copy = getReviewService().chapterNudgeCopy(
        chapter.number,
        getContentBundle(),
        vocab,
      );
      if (copy.readyCount > 0) {
        setReviewCopy(copy);
        setPhase('review');
        setFinishing(false);
        return;
      }
      continueAfterComplete(chapter.number);
    } catch (e) {
      setFinishing(false);
      console.error(e);
    }
  };

  const skipReviewAndContinue = async () => {
    if (finishing) return;
    setFinishing(true);
    continueAfterComplete(chapter.number);
  };

  const continueFromResults = () => {
    const next = afterComprehensionResults(productionExercises);
    if (next.action === 'show_production') {
      setProductionIndex(0);
      setPhase('production');
      return;
    }
    void finish();
  };

  const continueFromProduction = () => {
    const next = advanceProduction(productionIndex, productionExercises.length);
    if (next.done) {
      void finish();
      return;
    }
    setProductionIndex(next.index);
  };

  return (
    <AtmosphereBackground>
      <Stack.Screen
        options={{
          title: `Capitolo ${chapter.number}`,
          headerBackVisible: phase === 'intro',
        }}
      />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Spacing.lg,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}>
        {phase === 'intro' ? (
          <View>
            <Text style={[Typography.chapterEyebrow, { color: colors.tint }]}>
              Check your understanding
            </Text>
            <Text style={[Typography.heroTitle, { color: colors.text, marginTop: Spacing.sm }]}>
              {chapter.titleIt}
            </Text>
            <Text
              style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.md }]}>
              A few short questions about what happened — not grammar, not flashcards.
            </Text>
            <Pressable
              onPress={() => {
                shuffleCurrent(0);
                setPhase('question');
              }}
              style={({ pressed }) => [
                styles.primaryBtn,
                { backgroundColor: colors.tint, opacity: pressed ? 0.88 : 1, marginTop: Spacing.xl },
              ]}>
              <Text style={[Typography.button, { color: '#F7FAF9' }]}>Begin</Text>
            </Pressable>
          </View>
        ) : null}

        {phase === 'question' && current ? (
          <View>
            <Text style={[Typography.caption, { color: colors.textMuted }]}>
              Question {index + 1} of {questions.length}
            </Text>
            <Text style={[Typography.heroTitle, { color: colors.text, marginTop: Spacing.md }]}>
              {questionPrompt(current)}
            </Text>
            <View style={{ marginTop: Spacing.lg, gap: Spacing.sm }}>
              {(displayChoices?.choices ?? current.choices).map((choice, choiceIndex) => (
                <Pressable
                  key={`${current.id}-${choiceIndex}-${choice}`}
                  onPress={() => onSelect(choiceIndex)}
                  style={({ pressed }) => [
                    styles.choice,
                    {
                      backgroundColor: colors.backgroundElevated,
                      borderColor: colors.border,
                      opacity: pressed ? 0.88 : 1,
                    },
                  ]}>
                  <Text style={[Typography.body, { color: colors.text }]}>{choice}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        {phase === 'feedback' && lastFeedback && current ? (
          <View>
            <Text
              style={[
                Typography.heroTitle,
                {
                  color: lastFeedback.correct ? colors.tint : colors.danger,
                  marginTop: Spacing.sm,
                },
              ]}>
              {lastFeedback.correct ? '✓ Esatto!' : 'Not quite.'}
            </Text>
            {!lastFeedback.correct ? (
              <Text
                style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.md }]}>
                Correct answer: {lastFeedback.correctLabel}
              </Text>
            ) : null}
            <Text style={[Typography.body, { color: colors.text, marginTop: Spacing.md }]}>
              {lastFeedback.explanation}
            </Text>
            <View style={styles.row}>
              {!lastFeedback.correct ? (
                <Pressable
                  onPress={retryCurrent}
                  style={({ pressed }) => [
                    styles.secondaryBtn,
                    {
                      borderColor: colors.border,
                      opacity: pressed ? 0.88 : 1,
                    },
                  ]}>
                  <Text style={[Typography.button, { color: colors.text }]}>Try again</Text>
                </Pressable>
              ) : null}
              <Pressable
                onPress={goNextFromFeedback}
                style={({ pressed }) => [
                  styles.primaryBtn,
                  {
                    flex: 1,
                    backgroundColor: colors.tint,
                    opacity: pressed ? 0.88 : 1,
                  },
                ]}>
                <Text style={[Typography.button, { color: '#F7FAF9' }]}>
                  {index + 1 < questions.length ? 'Continue' : 'See results'}
                </Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {phase === 'review' && reviewCopy ? (
          <View>
            <Text style={[Typography.chapterEyebrow, { color: colors.tint }]}>Quick review?</Text>
            <Text style={[Typography.heroTitle, { color: colors.text, marginTop: Spacing.sm }]}>
              {reviewCopy.headline}
            </Text>
            <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.md }]}>
              {reviewCopy.detail}
            </Text>
            <View style={styles.row}>
              <Pressable
                onPress={() => router.push('/review' as import('expo-router').Href)}
                style={({ pressed }) => [
                  styles.secondaryBtn,
                  { borderColor: colors.border, opacity: pressed ? 0.88 : 1, flex: 1 },
                ]}>
                <Text style={[Typography.button, { color: colors.text }]}>Review</Text>
              </Pressable>
              <Pressable
                disabled={finishing}
                onPress={() => void skipReviewAndContinue()}
                style={({ pressed }) => [
                  styles.primaryBtn,
                  {
                    flex: 1,
                    backgroundColor: colors.tint,
                    opacity: pressed || finishing ? 0.88 : 1,
                  },
                ]}>
                <Text style={[Typography.button, { color: '#F7FAF9' }]}>Continue</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {phase === 'results' ? (
          <View>
            <Text style={[Typography.chapterEyebrow, { color: colors.tint }]}>Results</Text>
            <Text style={[Typography.heroTitle, { color: colors.text, marginTop: Spacing.sm }]}>
              {summary.correct} of {summary.total} understood
            </Text>
            <Text
              style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.md }]}>
              You can keep reading either way — this just checks the story, not your worth as a
              learner.
            </Text>
            <Pressable
              disabled={finishing}
              onPress={continueFromResults}
              style={({ pressed, focused }) => [
                styles.primaryBtn,
                {
                  backgroundColor: colors.tint,
                  opacity: pressed || finishing ? 0.88 : 1,
                  marginTop: Spacing.xl,
                  borderWidth: focused ? 2 : 0,
                  borderColor: colors.accent,
                },
              ]}>
              <Text style={[Typography.button, { color: '#F7FAF9' }]}>
                {productionExercises.length > 0
                  ? 'Continue'
                  : getChapterByNumber(chapter.number + 1)
                    ? 'Continue story'
                    : 'Back to home'}
              </Text>
            </Pressable>
          </View>
        ) : null}

        {phase === 'production' && productionExercises[productionIndex] ? (
          <ProductionExerciseCard
            key={productionExercises[productionIndex].exerciseId}
            exercise={productionExercises[productionIndex]}
            index={productionIndex}
            total={productionExercises.length}
            sourceSentence={chapter.paragraphs
              .flatMap((paragraph) => paragraph.sentences)
              .find((sentence) => sentence.id === productionExercises[productionIndex].sourceSentenceId)}
            onContinue={continueFromProduction}
          />
        ) : null}
      </ScrollView>
    </AtmosphereBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.lg,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  choice: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radii.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  primaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radii.md,
  },
  secondaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radii.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xl,
  },
});
