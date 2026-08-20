import { Stack, router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AtmosphereBackground } from '@/src/components/AtmosphereBackground';
import { ScreenContent } from '@/src/components/ScreenContent';
import { LUCA_STORY_ID } from '@/src/content';
import {
  batchRangeForChapter,
  grammarNoteForChapter,
  isLessonBatchEnd,
  type GrammarNote,
  type GrammarPracticeQuestion,
  type GrammarStep,
} from '@/src/content/lessonBatches';
import { getSpeakSceneForBatch } from '@/src/content/speakScenes';
import { grammarCheckpointId } from '@/src/content/storyPath';
import { getProgressService } from '@/src/progress';
import { Radii, Spacing } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

type Phase = 'intro' | 'step' | 'practice' | 'summary';

export default function GrammarNoteScreen() {
  const { story, chapter, returnTo } = useLocalSearchParams<{
    story?: string;
    chapter?: string;
    returnTo?: string;
  }>();
  const storyId = typeof story === 'string' ? story : LUCA_STORY_ID;
  const chapterNumber = chapter ? Number(chapter) : 0;
  const { colors, type, minTouchTarget } = useTheme();
  const insets = useSafeAreaInsets();

  const note = isLessonBatchEnd(chapterNumber)
    ? grammarNoteForChapter(chapterNumber, storyId)
    : null;
  const { start, end } = batchRangeForChapter(chapterNumber);

  const [phase, setPhase] = useState<Phase>('intro');
  const [stepIndex, setStepIndex] = useState(0);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  const finishGrammar = async () => {
    await getProgressService(storyId).completeCheckpoint(
      grammarCheckpointId(storyId, chapterNumber),
    );
    const recapHref =
      `/batch-recap?story=${encodeURIComponent(storyId)}&chapter=${chapterNumber}` +
      (returnTo === 'stories' ? '&returnTo=stories' : '');
    router.replace(recapHref as Href);
  };

  useEffect(() => {
    if (!note && chapterNumber > 0) {
      void finishGrammar();
    }
  }, [note, chapterNumber, storyId]);

  if (!note) {
    return (
      <AtmosphereBackground>
        <Stack.Screen options={{ title: 'Grammar', headerBackVisible: false }} />
        <View style={styles.center}>
          <Text style={[type.body, { color: colors.textSecondary }]}>Continuing…</Text>
        </View>
      </AtmosphereBackground>
    );
  }

  const totalSteps = note.steps.length;
  const totalPractice = note.practice.length;
  const currentStep = note.steps[stepIndex];
  const currentQuestion = note.practice[practiceIndex];
  const progressLabel = progressText(phase, stepIndex, totalSteps, practiceIndex, totalPractice);

  const goNextFromStep = () => {
    if (stepIndex + 1 < totalSteps) {
      setStepIndex(stepIndex + 1);
      return;
    }
    if (totalPractice > 0) {
      setPhase('practice');
      return;
    }
    setPhase('summary');
  };

  const onSelectAnswer = (choiceIndex: number) => {
    if (answered || !currentQuestion) return;
    setSelected(choiceIndex);
    setAnswered(true);
  };

  const onNextPractice = () => {
    if (practiceIndex + 1 < totalPractice) {
      setPracticeIndex(practiceIndex + 1);
      setSelected(null);
      setAnswered(false);
      return;
    }
    setPhase('summary');
  };

  return (
    <AtmosphereBackground>
      <Stack.Screen options={{ title: 'Grammar', headerBackVisible: false }} />
      <ScrollView
        contentContainerStyle={{
          paddingTop: Spacing.lg,
          paddingBottom: insets.bottom + Spacing.xl,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}>
        <ScreenContent maxWidth={680}>
          <Text style={[type.caption, { color: colors.textMuted }]}>{progressLabel}</Text>
          <Text style={[type.chapterEyebrow, { color: colors.tint, marginTop: Spacing.sm }]}>
            After chapters {start}–{end}
          </Text>

          {phase === 'intro' ? (
            <IntroSection note={note} colors={colors} type={type} />
          ) : null}

          {phase === 'step' && currentStep ? (
            <StepSection step={currentStep} index={stepIndex} total={totalSteps} colors={colors} type={type} />
          ) : null}

          {phase === 'practice' && currentQuestion ? (
            <PracticeSection
              question={currentQuestion}
              index={practiceIndex}
              total={totalPractice}
              selected={selected}
              answered={answered}
              colors={colors}
              type={type}
              minTouchTarget={minTouchTarget}
              onSelect={onSelectAnswer}
            />
          ) : null}

          {phase === 'summary' ? (
            <SummarySection
              note={note}
              hasSpeakScene={Boolean(getSpeakSceneForBatch(storyId, chapterNumber))}
              colors={colors}
              type={type}
            />
          ) : null}

          <View style={styles.actions}>
            {phase === 'intro' ? (
              <>
                <PrimaryButton
                  label="Start lesson"
                  colors={colors}
                  type={type}
                  minTouchTarget={minTouchTarget}
                  onPress={() => setPhase('step')}
                />
                <SecondaryButton
                  label="Skip"
                  colors={colors}
                  type={type}
                  onPress={() => void finishGrammar()}
                />
              </>
            ) : null}

            {phase === 'step' ? (
              <>
                <PrimaryButton
                  label={stepIndex + 1 < totalSteps ? 'Next step' : totalPractice > 0 ? 'Try it' : 'Continue'}
                  colors={colors}
                  type={type}
                  minTouchTarget={minTouchTarget}
                  onPress={goNextFromStep}
                />
                {stepIndex > 0 ? (
                  <SecondaryButton
                    label="Back"
                    colors={colors}
                    type={type}
                    onPress={() => setStepIndex(stepIndex - 1)}
                  />
                ) : null}
              </>
            ) : null}

            {phase === 'practice' && answered ? (
              <PrimaryButton
                label={practiceIndex + 1 < totalPractice ? 'Next question' : 'Finish'}
                colors={colors}
                type={type}
                minTouchTarget={minTouchTarget}
                onPress={onNextPractice}
              />
            ) : null}

            {phase === 'summary' ? (
              <PrimaryButton
                label="Continue to words"
                colors={colors}
                type={type}
                minTouchTarget={minTouchTarget}
                onPress={() => void finishGrammar()}
              />
            ) : null}
          </View>
        </ScreenContent>
      </ScrollView>
    </AtmosphereBackground>
  );
}

function IntroSection({
  note,
  colors,
  type,
}: {
  note: GrammarNote;
  colors: ReturnType<typeof useTheme>['colors'];
  type: ReturnType<typeof useTheme>['type'];
}) {
  return (
    <View>
      <Text style={[type.heroTitle, { color: colors.text, marginTop: Spacing.sm }]}>{note.title}</Text>
      <Text style={[type.body, { color: colors.textSecondary, marginTop: Spacing.md, lineHeight: 24 }]}>
        {note.intro}
      </Text>
      <Text style={[type.caption, { color: colors.textMuted, marginTop: Spacing.lg }]}>
        {note.steps.length} steps · {note.practice.length} practice questions
      </Text>
    </View>
  );
}

function StepSection({
  step,
  index,
  total,
  colors,
  type,
}: {
  step: GrammarStep;
  index: number;
  total: number;
  colors: ReturnType<typeof useTheme>['colors'];
  type: ReturnType<typeof useTheme>['type'];
}) {
  return (
    <View>
      <Text style={[type.caption, { color: colors.tint, marginTop: Spacing.md }]}>
        Step {index + 1} of {total}
      </Text>
      <Text style={[type.heroTitle, { color: colors.text, marginTop: Spacing.sm, fontSize: 24, lineHeight: 32 }]}>
        {step.title}
      </Text>
      <Text style={[type.body, { color: colors.text, marginTop: Spacing.md, lineHeight: 24 }]}>
        {step.explanation}
      </Text>
      <View style={[styles.ruleBox, { backgroundColor: colors.readerSurface, borderColor: 'rgba(120,182,163,0.25)' }]}>
        <Text style={[type.caption, { color: colors.tint }]}>Remember</Text>
        <Text style={[type.label, { color: colors.text, marginTop: Spacing.xs }]}>{step.rule}</Text>
      </View>
      <View style={{ marginTop: Spacing.lg, gap: Spacing.sm }}>
        {step.examples.map((example) => (
          <View
            key={example.italian}
            style={[styles.exampleRow, { backgroundColor: 'rgba(255,255,255,0.04)' }]}>
            <Text style={[type.reader, { color: colors.text }]}>{example.italian}</Text>
            <Text style={[type.caption, { color: colors.textMuted, marginTop: 4 }]}>{example.english}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function PracticeSection({
  question,
  index,
  total,
  selected,
  answered,
  colors,
  type,
  minTouchTarget,
  onSelect,
}: {
  question: GrammarPracticeQuestion;
  index: number;
  total: number;
  selected: number | null;
  answered: boolean;
  colors: ReturnType<typeof useTheme>['colors'];
  type: ReturnType<typeof useTheme>['type'];
  minTouchTarget: number;
  onSelect: (index: number) => void;
}) {
  const correct = selected === question.correctIndex;

  return (
    <View>
      <Text style={[type.caption, { color: colors.tint, marginTop: Spacing.md }]}>
        Practice {index + 1} of {total}
      </Text>
      <Text style={[type.heroTitle, { color: colors.text, marginTop: Spacing.sm, fontSize: 22, lineHeight: 30 }]}>
        {question.prompt}
      </Text>
      <View style={{ marginTop: Spacing.lg, gap: Spacing.sm }}>
        {question.choices.map((choice, i) => {
          const show = answered;
          const isAnswer = i === question.correctIndex;
          const isPick = i === selected;
          const border = show
            ? isAnswer
              ? colors.tint
              : isPick
                ? colors.danger
                : colors.border
            : colors.border;
          return (
            <Pressable
              key={choice}
              disabled={answered}
              onPress={() => onSelect(i)}
              style={({ pressed }) => [
                styles.choice,
                {
                  backgroundColor: colors.backgroundElevated,
                  borderColor: border,
                  opacity: !answered && pressed ? 0.9 : 1,
                  minHeight: minTouchTarget,
                },
              ]}>
              <Text style={[type.body, { color: colors.text }]}>{choice}</Text>
            </Pressable>
          );
        })}
      </View>
      {answered ? (
        <View style={[styles.feedback, { borderColor: correct ? colors.tint : colors.danger }]}>
          <Text style={[type.label, { color: correct ? colors.tint : colors.danger }]}>
            {correct ? 'Correct!' : 'Not quite.'}
          </Text>
          <Text style={[type.body, { color: colors.textSecondary, marginTop: Spacing.sm, lineHeight: 22 }]}>
            {question.explanation}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function SummarySection({
  note,
  hasSpeakScene,
  colors,
  type,
}: {
  note: GrammarNote;
  hasSpeakScene: boolean;
  colors: ReturnType<typeof useTheme>['colors'];
  type: ReturnType<typeof useTheme>['type'];
}) {
  return (
    <View>
      <Text style={[type.heroTitle, { color: colors.text, marginTop: Spacing.md }]}>Nice work</Text>
      <Text style={[type.body, { color: colors.textSecondary, marginTop: Spacing.md, lineHeight: 24 }]}>
        You covered {note.steps.length} patterns from {note.title}. Next: a short word recap
        {hasSpeakScene ? ', then you can retell the scene' : ''}.
      </Text>
      <View style={{ marginTop: Spacing.lg, gap: Spacing.sm }}>
        {note.steps.map((step) => (
          <Text key={step.title} style={[type.caption, { color: colors.textMuted }]}>
            · {step.rule}
          </Text>
        ))}
      </View>
    </View>
  );
}

function PrimaryButton({
  label,
  colors,
  type,
  minTouchTarget,
  onPress,
}: {
  label: string;
  colors: ReturnType<typeof useTheme>['colors'];
  type: ReturnType<typeof useTheme>['type'];
  minTouchTarget: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryBtn,
        {
          backgroundColor: colors.buttonPrimary,
          opacity: pressed ? 0.88 : 1,
          minHeight: minTouchTarget,
        },
      ]}>
      <Text style={[type.button, { color: colors.onButtonPrimary }]}>{label}</Text>
    </Pressable>
  );
}

function SecondaryButton({
  label,
  colors,
  type,
  onPress,
}: {
  label: string;
  colors: ReturnType<typeof useTheme>['colors'];
  type: ReturnType<typeof useTheme>['type'];
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.secondaryBtn,
        { borderColor: colors.border, opacity: pressed ? 0.88 : 1 },
      ]}>
      <Text style={[type.button, { color: colors.text }]}>{label}</Text>
    </Pressable>
  );
}

function progressText(
  phase: Phase,
  stepIndex: number,
  totalSteps: number,
  practiceIndex: number,
  totalPractice: number,
): string {
  if (phase === 'intro') return 'Introduction';
  if (phase === 'step') return `Step ${stepIndex + 1} of ${totalSteps}`;
  if (phase === 'practice') return `Question ${practiceIndex + 1} of ${totalPractice}`;
  return 'Complete';
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  ruleBox: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1,
  },
  exampleRow: {
    padding: Spacing.md,
    borderRadius: Radii.sm,
  },
  choice: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radii.md,
    padding: Spacing.md,
    justifyContent: 'center',
  },
  feedback: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
    borderRadius: Radii.md,
    borderLeftWidth: 3,
  },
  actions: {
    marginTop: Spacing.xl,
    gap: Spacing.sm,
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
