import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
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
import { ReviewNudge } from '@/src/components/ReviewNudge';
import { LUCA_STORY_ID, findStoryIdForChapter, getChapter, getChapterByNumber, getContentBundle } from '@/src/content';
import { getProductionExercisesForChapter } from '@/src/content/productionExercises';
import { readerHref } from '@/src/content/storyHrefs';
import { evaluateAnswer } from '@/src/comprehension/evaluate';
import { selectComprehensionQuestions } from '@/src/comprehension/selectQuestions';
import { shuffleQuestionChoices } from '@/src/comprehension/shuffle';
import type { ComprehensionQuestion } from '@/src/content/schemas';
import { getProgressService } from '@/src/progress';
import { routeAfterChapterComplete } from '@/src/progress/batchMilestoneRoute';
import {
  chapterCompleteView,
  comprehensionResultsContinueLabel,
} from '@/src/progress/chapterComplete';
import type {
  ChapterProductionAttempt,
  ComprehensionAnswerRecord,
  ProductionSelfAssessment,
} from '@/src/progress/types';
import { comprehensionUsesItalianPrompt } from '@/src/content/scaffolding';
import { grammarNoteForChapter, isLessonBatchEnd } from '@/src/content/lessonBatches';
import {
  advanceProduction,
  afterComprehensionResults,
  skipProduction,
  type SelfAssessment,
} from '@/src/production/flow';
import { getVocabularyService } from '@/src/vocabulary';
import { resolveProductionFocusLemmas } from '@/src/vocabulary/productionFocusLemmas';
import { getReviewService } from '@/src/review';
import type { HomeReviewCopy } from '@/src/review/ReviewService';
import { trackReadingEvent } from '@/src/telemetry/ReadingEventStore';
import { Radii, Spacing } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

type Phase = 'intro' | 'question' | 'feedback' | 'results' | 'production' | 'complete';

type QuestionState = {
  attempts: number;
  correct: boolean | null;
  selectedIndex: number | null;
};

export default function ComprehensionScreen() {
  const { chapterId, story } = useLocalSearchParams<{ chapterId: string; story?: string }>();
  const storyId =
    (typeof story === 'string' && story) || findStoryIdForChapter(chapterId) || undefined;
  const chapter = storyId ? getChapter(chapterId, storyId) : undefined;
  const { colors, type, minTouchTarget } = useTheme();
  const insets = useSafeAreaInsets();

  const [questions, setQuestions] = useState<ComprehensionQuestion[]>([]);
  const [questionsReady, setQuestionsReady] = useState(false);
  const productionExercises = useMemo(
    () =>
      chapter
        ? getProductionExercisesForChapter(chapter.id, storyId ?? chapter.storyId)
        : [],
    [chapter, storyId],
  );
  const [phase, setPhase] = useState<Phase>('intro');
  const [index, setIndex] = useState(0);
  const [productionIndex, setProductionIndex] = useState(0);
  const [productionAssessments, setProductionAssessments] = useState<
    Record<string, SelfAssessment | null>
  >({});
  const [states, setStates] = useState<QuestionState[]>([]);
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
  const [chapterReview, setChapterReview] = useState<HomeReviewCopy | null>(null);

  useEffect(() => {
    if (!chapter) {
      setChapterReview(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      const state = await getVocabularyService().getState();
      if (cancelled) return;
      const bundle = getContentBundle(storyId ?? chapter.storyId);
      const copy = getReviewService().chapterNudgeCopy(chapter.number, bundle, state);
      setChapterReview(copy.cta ? copy : null);
    })();
    return () => {
      cancelled = true;
    };
  }, [chapter, storyId]);

  useEffect(() => {
    if (!chapter) {
      setQuestions([]);
      setQuestionsReady(true);
      return;
    }
    let cancelled = false;
    void (async () => {
      const progress = await getProgressService(storyId ?? chapter.storyId).getOrCreate();
      if (cancelled) return;
      const selected = selectComprehensionQuestions(chapter, progress);
      setQuestions(selected);
      setStates(selected.map(() => ({ attempts: 0, correct: null, selectedIndex: null })));
      setIndex(0);
      setPhase('intro');
      setQuestionsReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [chapter, storyId]);

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
    const resolvedStoryId = storyId ?? chapter?.storyId;
    if (!resolvedStoryId) {
      router.replace('/(tabs)/home' as import('expo-router').Href);
      return;
    }
    if (isLessonBatchEnd(chapterNumber) && grammarNoteForChapter(chapterNumber)) {
      router.replace(
        `/grammar-note?story=${encodeURIComponent(resolvedStoryId)}&chapter=${chapterNumber}` as import('expo-router').Href,
      );
      return;
    }
    const milestoneRoute = routeAfterChapterComplete(resolvedStoryId, chapterNumber);
    if (milestoneRoute) {
      router.replace(milestoneRoute);
      return;
    }
    const next = getChapterByNumber(chapterNumber + 1, resolvedStoryId);
    if (next) {
      router.replace(readerHref(resolvedStoryId, next.id));
    } else {
      router.replace('/(tabs)/home' as import('expo-router').Href);
    }
  };

  if (!chapter || !questionsReady) {
    return (
      <AtmosphereBackground>
        <Stack.Screen options={{ title: 'Understanding' }} />
        <View style={styles.center}>
          <Text style={[type.body, { color: colors.textSecondary }]}>Loading…</Text>
        </View>
      </AtmosphereBackground>
    );
  }

  if (questions.length === 0) {
    return (
      <AtmosphereBackground>
        <Stack.Screen options={{ title: 'Understanding' }} />
        <View style={styles.center}>
          <Text style={[type.body, { color: colors.textSecondary }]}>
            No comprehension questions for this chapter.
          </Text>
        </View>
      </AtmosphereBackground>
    );
  }

  const completeCopy = chapterCompleteView(
    chapter.number,
    getChapterByNumber(chapter.number + 1, storyId ?? chapter.storyId)?.number ?? null,
    storyId ?? chapter.storyId,
  );
  const nextChapterNumber =
    getChapterByNumber(chapter.number + 1, storyId ?? chapter.storyId)?.number ?? null;
  const resolvedStoryId = storyId ?? chapter.storyId;

  const openListenAgain = () => {
    router.push(readerHref(resolvedStoryId, chapter.id, true));
  };

  const shuffleCurrent = (questionIndex: number) => {
    const question = questions[questionIndex];
    if (!question) return;
    setDisplayChoices(shuffleQuestionChoices(question.choices, question.correctChoice));
  };

  const onSelect = (choiceIndex: number) => {
    if (!current || !displayChoices || !chapter || phase !== 'question') return;
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
    trackReadingEvent({
      type: 'comprehension_attempt',
      storyId: storyId ?? chapter.storyId,
      chapterId: chapter.id,
      meta: { correct: evaluation.correct, questionId: current.id },
    });
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

  const persistProduction = async (
    skipped: boolean,
    assessments: Record<string, SelfAssessment | null> = productionAssessments,
  ) => {
    const resolvedStoryId = storyId ?? chapter.storyId;
    const attempts: ChapterProductionAttempt[] = skipped
      ? productionExercises.map((exercise) => ({
          exerciseId: exercise.exerciseId,
          assessment: 'skipped' satisfies ProductionSelfAssessment,
        }))
      : productionExercises.map((exercise) => ({
          exerciseId: exercise.exerciseId,
          assessment: (assessments[exercise.exerciseId] ?? 'skipped') satisfies ProductionSelfAssessment,
        }));
    const progressService = getProgressService(resolvedStoryId);
    await progressService.recordProduction(chapter.id, { skipped, attempts });
    if (skipped) return;
    const vocab = getVocabularyService();
    const bundle = getContentBundle(resolvedStoryId);
    for (const exercise of productionExercises) {
      const assessment = assessments[exercise.exerciseId];
      if (!assessment || assessment === 'skipped') continue;
      const source = chapter.paragraphs
        .flatMap((paragraph) => paragraph.sentences)
        .find((sentence) => sentence.id === exercise.sourceSentenceId);
      if (!source) continue;
      const lemmaIds = resolveProductionFocusLemmas(
        exercise,
        source,
        bundle.lexiconById,
      );
      if (lemmaIds.length === 0) continue;
      await vocab.recordSelfAssessmentForLemmaIds(
        lemmaIds,
        assessment,
        {
          source: 'production',
          storyId: resolvedStoryId,
          chapterId: chapter.id,
          sentenceId: source.id,
          exerciseId: exercise.exerciseId,
        },
        {
          sourceSentence: source,
          bumpEncounterOnGotIt: assessment === 'got_it',
        },
      );
    }
  };

  const finish = async (production?: {
    skipped: boolean;
    assessments?: Record<string, SelfAssessment | null>;
  }) => {
    if (finishing) return;
    setFinishing(true);
    try {
      const answers: ComprehensionAnswerRecord[] = questions.map((q, i) => ({
        questionId: q.id,
        correct: Boolean(states[i]?.correct),
        attempts: Math.max(1, states[i]?.attempts ?? 1),
      }));
      if (productionExercises.length > 0 && production) {
        await persistProduction(production.skipped, production.assessments);
      }
      await getProgressService(storyId ?? chapter.storyId).finishComprehensionAndComplete(
        chapter.id,
        answers,
      );
      setPhase('complete');
      setFinishing(false);
    } catch (e) {
      setFinishing(false);
      console.error(e);
    }
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

  const skipProductionAndFinish = () => {
    skipProduction();
    void finish({ skipped: true });
  };

  const continueFromProduction = () => {
    const next = advanceProduction(productionIndex, productionExercises.length);
    if (next.done) {
      void finish({ skipped: false, assessments: productionAssessments });
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
            <Text style={[type.chapterEyebrow, { color: colors.tint }]}>
              Check your understanding
            </Text>
            <Text style={[type.heroTitle, { color: colors.text, marginTop: Spacing.sm }]}>
              {chapter.titleIt}
            </Text>
            <Text
              style={[type.body, { color: colors.textSecondary, marginTop: Spacing.md }]}>
              A few short questions about what happened — not grammar, not flashcards.
            </Text>
            <Pressable
              onPress={() => {
                shuffleCurrent(0);
                setPhase('question');
              }}
              style={({ pressed }) => [
                styles.primaryBtn,
                { backgroundColor: colors.buttonPrimary, opacity: pressed ? 0.88 : 1, minHeight: minTouchTarget, marginTop: Spacing.xl },
              ]}>
              <Text style={[type.button, { color: colors.onButtonPrimary }]}>Begin</Text>
            </Pressable>
            <Pressable
              accessibilityRole="link"
              accessibilityLabel="Listen to this chapter again"
              onPress={openListenAgain}
              style={({ pressed }) => [
                styles.secondaryLink,
                { opacity: pressed ? 0.7 : 1, marginTop: Spacing.md, minHeight: minTouchTarget },
              ]}>
              <Text style={[type.label, { color: colors.tint }]}>Listen again</Text>
            </Pressable>
          </View>
        ) : null}

        {phase === 'question' && current ? (
          <View>
            <Text style={[type.caption, { color: colors.textMuted }]}>
              Question {index + 1} of {questions.length}
            </Text>
            <Text style={[type.heroTitle, { color: colors.text, marginTop: Spacing.md }]}>
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
                  <Text style={[type.body, { color: colors.text }]}>{choice}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        {phase === 'feedback' && lastFeedback && current ? (
          <View>
            <Text
              style={[
                type.heroTitle,
                {
                  color: lastFeedback.correct ? colors.tint : colors.danger,
                  marginTop: Spacing.sm,
                },
              ]}>
              {lastFeedback.correct ? '✓ Esatto!' : 'Not quite.'}
            </Text>
            {!lastFeedback.correct ? (
              <Text
                style={[type.body, { color: colors.textSecondary, marginTop: Spacing.md }]}>
                Correct answer: {lastFeedback.correctLabel}
              </Text>
            ) : null}
            <Text style={[type.body, { color: colors.text, marginTop: Spacing.md }]}>
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
                  <Text style={[type.button, { color: colors.text }]}>Try again</Text>
                </Pressable>
              ) : null}
              <Pressable
                onPress={goNextFromFeedback}
                style={({ pressed }) => [
                  styles.primaryBtn,
                  {
                    flex: 1,
                    backgroundColor: colors.buttonPrimary,
                    opacity: pressed ? 0.88 : 1,
                  },
                ]}>
                <Text style={[type.button, { color: colors.onButtonPrimary }]}>
                  {index + 1 < questions.length ? 'Continue' : 'See results'}
                </Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {phase === 'complete' ? (
          <View
            style={[
              styles.completeCard,
              {
                backgroundColor: colors.backgroundElevated,
                borderColor: colors.border,
              },
            ]}>
            <Text style={[type.chapterEyebrow, { color: colors.tint }]}>Nice work</Text>
            <Text style={[type.heroTitle, { color: colors.text, marginTop: Spacing.sm }]}>
              {completeCopy.headline}
            </Text>
            <Text style={[type.body, { color: colors.textSecondary, marginTop: Spacing.md }]}>
              {completeCopy.detail}
            </Text>
            <Pressable
              onPress={() => continueAfterComplete(chapter.number)}
              style={({ pressed }) => [
                styles.primaryBtn,
                {
                  backgroundColor: colors.buttonPrimary,
                  opacity: pressed ? 0.88 : 1,
                  marginTop: Spacing.xl,
                },
              ]}>
              <Text style={[type.button, { color: colors.onButtonPrimary }]}>{completeCopy.button}</Text>
            </Pressable>
          </View>
        ) : null}

        {phase === 'results' ? (
          <View>
            <Text style={[type.chapterEyebrow, { color: colors.tint }]}>Results</Text>
            <Text style={[type.heroTitle, { color: colors.text, marginTop: Spacing.sm }]}>
              {summary.correct} of {summary.total} understood
            </Text>
            <Text
              style={[type.body, { color: colors.textSecondary, marginTop: Spacing.md }]}>
              You can keep reading either way — this just checks the story, not your worth as a
              learner.
            </Text>
            {chapterReview && !isLessonBatchEnd(chapter.number) ? (
              <View style={{ marginTop: Spacing.xl }}>
                <ReviewNudge copy={chapterReview} />
              </View>
            ) : null}
            <Pressable
              disabled={finishing}
              onPress={continueFromResults}
              style={({ pressed, focused }) => [
                styles.primaryBtn,
                {
                  backgroundColor: colors.buttonPrimary,
                  opacity: pressed || finishing ? 0.88 : 1,
                  marginTop: Spacing.xl,
                  borderWidth: focused ? 2 : 0,
                  borderColor: colors.accent,
                },
              ]}>
              <Text style={[type.button, { color: colors.onButtonPrimary }]}>
                {comprehensionResultsContinueLabel(
                  chapter.number,
                  nextChapterNumber,
                  productionExercises.length > 0,
                  storyId ?? chapter.storyId,
                )}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="link"
              accessibilityLabel="Listen to this chapter again"
              onPress={openListenAgain}
              style={({ pressed }) => [
                styles.secondaryLink,
                { opacity: pressed ? 0.7 : 1, marginTop: Spacing.md, minHeight: minTouchTarget },
              ]}>
              <Text style={[type.label, { color: colors.tint }]}>Listen again</Text>
            </Pressable>
          </View>
        ) : null}

        {phase === 'production' && productionExercises[productionIndex] ? (
          <View>
            <ProductionExerciseCard
              key={productionExercises[productionIndex].exerciseId}
              exercise={productionExercises[productionIndex]}
              index={productionIndex}
              total={productionExercises.length}
              sourceSentence={chapter.paragraphs
                .flatMap((paragraph) => paragraph.sentences)
                .find((sentence) => sentence.id === productionExercises[productionIndex].sourceSentenceId)}
              lexiconById={getContentBundle(storyId ?? chapter.storyId).lexiconById}
              onAssessed={(assessment) => {
                const exerciseId = productionExercises[productionIndex]?.exerciseId;
                if (!exerciseId) return;
                setProductionAssessments((prev) => ({ ...prev, [exerciseId]: assessment }));
              }}
              onContinue={continueFromProduction}
            />
            <Pressable
              disabled={finishing}
              onPress={skipProductionAndFinish}
              style={({ pressed }) => [
                styles.secondaryBtn,
                {
                  borderColor: colors.border,
                  opacity: pressed || finishing ? 0.88 : 1,
                  marginTop: Spacing.md,
                },
              ]}>
              <Text style={[type.button, { color: colors.text }]}>Skip for now</Text>
            </Pressable>
          </View>
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
    minHeight: 52,
  },
  primaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radii.md,
    minHeight: 52,
  },
  secondaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radii.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  secondaryLink: {
    alignSelf: 'flex-start',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xl,
  },
  completeCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    marginTop: Spacing.md,
  },
});
