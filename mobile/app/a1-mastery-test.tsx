import { Stack, router, type Href } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AtmosphereBackground } from '@/src/components/AtmosphereBackground';
import { ScreenContent } from '@/src/components/ScreenContent';
import { shuffleQuestionChoices } from '@/src/comprehension/shuffle';
import {
  evaluateMasteryAnswer,
  getA1MasteryAssessment,
  scoreMasteryResults,
} from '@/src/content/a1MasteryTest';
import type { MasteryQuestion } from '@/src/content/schemas';
import { LUCA_STORY_ID, getChapterByNumber, getContentBundle } from '@/src/content';
import { readerHref } from '@/src/content/storyHrefs';
import {
  a1MasteryCheckpointId,
  canTakeA1MasteryTest,
  hasPassedA1Mastery,
} from '@/src/progress/a1Gate';
import { getProgressService } from '@/src/progress';
import { Radii, Spacing } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

type Phase = 'intro' | 'question' | 'feedback' | 'results';

type AnswerRecord = {
  questionId: string;
  correct: boolean;
  attempts: number;
};

export default function A1MasteryTestScreen() {
  const assessment = getA1MasteryAssessment();
  const questions = useMemo(
    () =>
      [...assessment.questions].map((question) => {
        const shuffled = shuffleQuestionChoices(question.choices, question.correctChoice);
        return { ...question, choices: shuffled.choices, correctChoice: shuffled.correctChoice };
      }),
    [assessment.questions],
  );
  const { colors, type, minTouchTarget } = useTheme();
  const insets = useSafeAreaInsets();
  const lucaBundle = getContentBundle(LUCA_STORY_ID);

  const [phase, setPhase] = useState<Phase>('intro');
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [lastFeedback, setLastFeedback] = useState<{
    correct: boolean;
    explanation: string;
    correctLabel: string;
  } | null>(null);
  const [finishing, setFinishing] = useState(false);
  const [eligible, setEligible] = useState<boolean | null>(null);
  const [alreadyPassed, setAlreadyPassed] = useState(false);

  useEffect(() => {
    void (async () => {
      const progress = await getProgressService(LUCA_STORY_ID).getOrCreate();
      if (hasPassedA1Mastery(progress, lucaBundle.chapters)) {
        setAlreadyPassed(true);
        setEligible(false);
        return;
      }
      setEligible(canTakeA1MasteryTest(progress, lucaBundle.chapters));
    })();
  }, [lucaBundle.chapters]);

  const current = questions[index];
  const results = scoreMasteryResults(answers);

  const onStart = () => {
    if (!eligible) return;
    setPhase('question');
    setIndex(0);
    setAnswers([]);
    setSelectedIndex(null);
    setLastFeedback(null);
  };

  const onSelect = (choiceIndex: number) => {
    if (!current || phase !== 'question') return;
    const evaluation = evaluateMasteryAnswer(current, choiceIndex);
    setSelectedIndex(choiceIndex);
    setAnswers((prev) => [
      ...prev,
      {
        questionId: current.id,
        correct: evaluation.correct,
        attempts: 1,
      },
    ]);
    setLastFeedback({
      correct: evaluation.correct,
      explanation: evaluation.explanation,
      correctLabel: current.choices[evaluation.correctChoice],
    });
    setPhase('feedback');
  };

  const goNextFromFeedback = () => {
    if (index + 1 < questions.length) {
      setIndex(index + 1);
      setSelectedIndex(null);
      setLastFeedback(null);
      setPhase('question');
      return;
    }
    setPhase('results');
  };

  const finishPassed = async () => {
    if (finishing) return;
    setFinishing(true);
    try {
      const service = getProgressService(LUCA_STORY_ID);
      await service.completeCheckpoint(a1MasteryCheckpointId(LUCA_STORY_ID));
      await service.setCEFRLevel('A1+');
      const next = getChapterByNumber(21, LUCA_STORY_ID);
      if (next) {
        await service.openChapter(next.id);
        router.replace(readerHref(LUCA_STORY_ID, next.id));
      } else {
        router.replace('/(tabs)/stories' as Href);
      }
    } finally {
      setFinishing(false);
    }
  };

  const retry = () => {
    setPhase('intro');
    setIndex(0);
    setAnswers([]);
    setSelectedIndex(null);
    setLastFeedback(null);
  };

  if (eligible === null && !alreadyPassed) {
    return (
      <AtmosphereBackground>
        <Stack.Screen options={{ title: assessment.title, headerBackVisible: false }} />
        <View style={styles.center}>
          <Text style={[type.body, { color: colors.textSecondary }]}>Loading…</Text>
        </View>
      </AtmosphereBackground>
    );
  }

  return (
    <AtmosphereBackground>
      <Stack.Screen options={{ title: assessment.title, headerBackVisible: false }} />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: Spacing.lg, paddingBottom: insets.bottom + Spacing.xl },
        ]}>
        <ScreenContent>
          {phase === 'intro' ? (
            <View>
              <Text style={[type.chapterEyebrow, { color: colors.tint }]}>A1 → A1+</Text>
              <Text style={[type.heroTitle, { color: colors.text, marginTop: Spacing.sm }]}>
                {assessment.title}
              </Text>
              <Text style={[type.body, { color: colors.textSecondary, marginTop: Spacing.md }]}>
                {assessment.intro}
              </Text>
              <Text style={[type.caption, { color: colors.textMuted, marginTop: Spacing.md }]}>
                {questions.length} domande · minimo {Math.round(assessment.passThreshold * 100)}% per
                passare
              </Text>
              {alreadyPassed ? (
                <Pressable
                  onPress={() => router.replace('/(tabs)/stories' as Href)}
                  style={({ pressed }) => [
                    styles.primaryBtn,
                    {
                      backgroundColor: colors.buttonPrimary,
                      opacity: pressed ? 0.88 : 1,
                      marginTop: Spacing.xl,
                      minHeight: minTouchTarget,
                    },
                  ]}>
                  <Text style={[type.button, { color: colors.onButtonPrimary }]}>
                    Hai già passato — vai alle storie
                  </Text>
                </Pressable>
              ) : (
                <>
                  {!eligible ? (
                    <Text style={[type.body, { color: colors.danger, marginTop: Spacing.lg }]}>
                      Finisci prima i capitoli 1–20 di Luca a Roma (comprensione inclusa).
                    </Text>
                  ) : null}
                  <Pressable
                    disabled={!eligible}
                    onPress={onStart}
                    style={({ pressed }) => [
                      styles.primaryBtn,
                      {
                        backgroundColor: colors.buttonPrimary,
                        opacity: !eligible || pressed ? 0.88 : 1,
                        marginTop: Spacing.xl,
                        minHeight: minTouchTarget,
                      },
                    ]}>
                    <Text style={[type.button, { color: colors.onButtonPrimary }]}>
                      Inizia la verifica
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => router.replace('/(tabs)/stories' as Href)}
                    style={({ pressed }) => [
                      styles.secondaryBtn,
                      {
                        borderColor: colors.border,
                        opacity: pressed ? 0.88 : 1,
                        marginTop: Spacing.sm,
                      },
                    ]}>
                    <Text style={[type.button, { color: colors.text }]}>Più tardi</Text>
                  </Pressable>
                </>
              )}
            </View>
          ) : null}

          {phase === 'question' && current ? (
            <QuestionCard
              question={current}
              index={index}
              total={questions.length}
              onSelect={onSelect}
            />
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
                {lastFeedback.correct ? 'Esatto!' : 'Non proprio.'}
              </Text>
              {!lastFeedback.correct ? (
                <Text style={[type.body, { color: colors.textSecondary, marginTop: Spacing.md }]}>
                  Risposta corretta: {lastFeedback.correctLabel}
                </Text>
              ) : null}
              <Text style={[type.body, { color: colors.text, marginTop: Spacing.md }]}>
                {lastFeedback.explanation}
              </Text>
              <Pressable
                onPress={goNextFromFeedback}
                style={({ pressed }) => [
                  styles.primaryBtn,
                  {
                    backgroundColor: colors.buttonPrimary,
                    opacity: pressed ? 0.88 : 1,
                    marginTop: Spacing.xl,
                  },
                ]}>
                <Text style={[type.button, { color: colors.onButtonPrimary }]}>
                  {index + 1 < questions.length ? 'Continua' : 'Vedi risultato'}
                </Text>
              </Pressable>
            </View>
          ) : null}

          {phase === 'results' ? (
            <View>
              <Text style={[type.chapterEyebrow, { color: colors.tint }]}>Risultato</Text>
              <Text style={[type.heroTitle, { color: colors.text, marginTop: Spacing.sm }]}>
                {results.passed ? 'Promosso!' : 'Non ancora'}
              </Text>
              <Text style={[type.body, { color: colors.textSecondary, marginTop: Spacing.md }]}>
                {results.correct} su {results.total} corrette ({Math.round(results.score * 100)}%).
                {results.passed
                  ? ' Puoi passare al livello A1+ e sbloccare le storie di Pietralba.'
                  : ` Servono almeno ${Math.round(assessment.passThreshold * 100)}%. Ripassa grammatica e vocabolario, poi riprova.`}
              </Text>
              {results.passed ? (
                <Pressable
                  disabled={finishing}
                  onPress={() => void finishPassed()}
                  style={({ pressed }) => [
                    styles.primaryBtn,
                    {
                      backgroundColor: colors.buttonPrimary,
                      opacity: pressed || finishing ? 0.88 : 1,
                      marginTop: Spacing.xl,
                      minHeight: minTouchTarget,
                    },
                  ]}>
                  <Text style={[type.button, { color: colors.onButtonPrimary }]}>
                    Continua al capitolo 21
                  </Text>
                </Pressable>
              ) : (
                <>
                  <Pressable
                    onPress={retry}
                    style={({ pressed }) => [
                      styles.primaryBtn,
                      {
                        backgroundColor: colors.buttonPrimary,
                        opacity: pressed ? 0.88 : 1,
                        marginTop: Spacing.xl,
                      },
                    ]}>
                    <Text style={[type.button, { color: colors.onButtonPrimary }]}>Riprova</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => router.replace('/(tabs)/stories' as Href)}
                    style={({ pressed }) => [
                      styles.secondaryBtn,
                      {
                        borderColor: colors.border,
                        opacity: pressed ? 0.88 : 1,
                        marginTop: Spacing.sm,
                      },
                    ]}>
                    <Text style={[type.button, { color: colors.text }]}>
                      Ripassa e torna dopo
                    </Text>
                  </Pressable>
                </>
              )}
            </View>
          ) : null}
        </ScreenContent>
      </ScrollView>
    </AtmosphereBackground>
  );
}

function QuestionCard({
  question,
  index,
  total,
  onSelect,
}: {
  question: MasteryQuestion;
  index: number;
  total: number;
  onSelect: (choiceIndex: number) => void;
}) {
  const { colors, type } = useTheme();
  const sectionLabel =
    question.section === 'grammar'
      ? 'Grammatica'
      : question.section === 'vocabulary'
        ? 'Vocabolario'
        : 'Storia';

  return (
    <View>
      <Text style={[type.caption, { color: colors.textMuted }]}>
        {sectionLabel} · {index + 1} di {total}
      </Text>
      <Text style={[type.heroTitle, { color: colors.text, marginTop: Spacing.md }]}>
        {question.question}
      </Text>
      <View style={{ marginTop: Spacing.lg, gap: Spacing.sm }}>
        {question.choices.map((choice, choiceIndex) => (
          <Pressable
            key={`${question.id}-${choiceIndex}`}
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
    padding: Spacing.md,
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
    borderRadius: Radii.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
