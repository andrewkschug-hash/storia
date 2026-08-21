import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SelfAssessmentVoteButtons } from '@/src/components/SelfAssessmentVoteButtons';
import { AtmosphereBackground } from '@/src/components/AtmosphereBackground';
import { ScreenContent } from '@/src/components/ScreenContent';
import { LUCA_STORY_ID, getContentBundle } from '@/src/content';
import { getSpeakSceneById, speakLineToExercise } from '@/src/content/speakScenes';
import { getProgressService } from '@/src/progress';
import { routeAfterSpeakScene } from '@/src/progress/batchMilestoneRoute';
import type { SpeakSceneLineAttempt, SpeakSceneVote } from '@/src/progress/types';
import {
  scoreProductionAnswer,
  type ProductionScoreResult,
  type ProductionScoreStatus,
} from '@/src/production/score';
import { useItalianSpeechInput } from '@/src/production/useItalianSpeechInput';
import { trackReadingEvent } from '@/src/telemetry/ReadingEventStore';
import { resolveSentenceFocusLemmas } from '@/src/vocabulary/productionFocusLemmas';
import { findSentenceById } from '@/src/vocabulary/storyExamples';
import { getVocabularyService } from '@/src/vocabulary';
import { Radii, Spacing } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

type Phase = 'intro' | 'line' | 'feedback' | 'summary';
type InputMode = 'type' | 'speak';

function continueAfterScene(storyId: string, batchEnd: number, returnTo?: string) {
  router.replace(routeAfterSpeakScene(storyId, batchEnd, returnTo));
}

function feedbackCopy(status: ProductionScoreStatus, inputMode: InputMode): { title: string; hint: string } {
  switch (status) {
    case 'correct':
      return { title: 'Correct', hint: 'Nice — that works in Italian.' };
    case 'almost':
      return {
        title: 'Almost',
        hint:
          inputMode === 'speak'
            ? 'Close — check the wording, then remember this form.'
            : 'Close — check the spelling, then remember this form.',
      };
    case 'unrecognized':
      return {
        title: 'Try again',
        hint: 'Say or type a short Italian answer, then compare with the correct line.',
      };
    default:
      return { title: 'Not quite', hint: 'Here’s the Italian to learn from.' };
  }
}

function feedbackAccent(status: ProductionScoreStatus, colors: ReturnType<typeof useTheme>['colors']) {
  switch (status) {
    case 'correct':
      return colors.assessmentGotItIndicator;
    case 'almost':
      return colors.assessmentAlmostIndicator;
    default:
      return colors.assessmentNotYetIndicator;
  }
}

export default function SpeakSceneScreen() {
  const { story, scene: sceneParam, returnTo } = useLocalSearchParams<{
    story?: string;
    scene?: string;
    returnTo?: string;
  }>();
  const storyId = typeof story === 'string' ? story : LUCA_STORY_ID;
  const sceneId = typeof sceneParam === 'string' ? sceneParam : '';
  const scene = getSpeakSceneById(sceneId);
  const { colors, type, minTouchTarget } = useTheme();
  const insets = useSafeAreaInsets();

  const [phase, setPhase] = useState<Phase>('intro');
  const [lineIndex, setLineIndex] = useState(0);
  const [draft, setDraft] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [lineScore, setLineScore] = useState<ProductionScoreResult | null>(null);
  const [lineRecords, setLineRecords] = useState<SpeakSceneLineAttempt[]>([]);
  const [saving, setSaving] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode>('type');
  const [speechError, setSpeechError] = useState<string | null>(null);

  const current = scene?.lines[lineIndex];
  const exercise = useMemo(() => {
    if (!scene || !current) return null;
    return speakLineToExercise(scene, current);
  }, [scene, current]);

  const contextualStrings = useMemo(() => {
    if (!current) return [] as string[];
    return [current.it, ...(current.acceptableAnswers ?? [])].filter(Boolean);
  }, [current]);

  const submitLearnerText = useCallback(
    (text: string, mode: InputMode) => {
      if (!exercise) return;
      const trimmed = text.trim();
      setInputMode(mode);
      setDraft(trimmed);
      setSpeechError(null);
      const scored = scoreProductionAnswer(exercise, trimmed);
      setLineScore(scored);
      setAttempts((n) => n + 1);
      setPhase('feedback');
      trackReadingEvent({
        type: 'speak_scene_line',
        storyId,
        meta: {
          sceneId: scene?.id ?? null,
          lineId: current?.id ?? null,
          stage: 'scored',
          inputMode: mode,
          score: scored.result,
          reason: scored.reason,
        },
      });
    },
    [current?.id, exercise, scene?.id, storyId],
  );

  const speech = useItalianSpeechInput({
    enabled: Boolean(scene) && phase === 'line',
    contextualStrings,
    onFinalTranscript: (transcript) => {
      if (transcript) {
        submitLearnerText(transcript, 'speak');
        return;
      }
      setSpeechError('Didn’t catch that — try again, or type your answer.');
    },
    onError: (message) => setSpeechError(message),
  });

  const persist = async (skipped: boolean, lines: SpeakSceneLineAttempt[], done: boolean) => {
    if (!scene) return;
    setSaving(true);
    try {
      await getProgressService(storyId).recordSpeakScene({
        sceneId: scene.id,
        skipped,
        completedAt: done ? new Date().toISOString() : null,
        lines,
      });
      if (!done) return;
      trackReadingEvent({
        type: skipped ? 'speak_scene_skipped' : 'speak_scene_completed',
        storyId,
        meta: {
          sceneId: scene.id,
          skipped,
          lineCount: lines.length,
          gotIt: lines.filter((line) => line.vote === 'got_it').length,
          almost: lines.filter((line) => line.vote === 'almost').length,
          notYet: lines.filter((line) => line.vote === 'not_yet').length,
        },
      });
    } finally {
      setSaving(false);
    }
  };

  const finishAndContinue = async (skipped: boolean, lines: SpeakSceneLineAttempt[]) => {
    await persist(skipped, lines, true);
    continueAfterScene(storyId, scene?.batchEnd ?? 15, returnTo);
  };

  if (!scene || (phase !== 'summary' && !current)) {
    return (
      <AtmosphereBackground>
        <Stack.Screen options={{ title: 'Speak the scene', headerBackVisible: false }} />
        <View style={styles.center}>
          <Text style={[type.body, { color: colors.textSecondary }]}>Scene not found.</Text>
        </View>
      </AtmosphereBackground>
    );
  }

  const onCheck = () => {
    if (!draft.trim() || speech.isListening) return;
    submitLearnerText(draft, 'type');
  };

  const onSpeakPress = () => {
    setSpeechError(null);
    if (speech.isListening) {
      speech.stopListening();
      return;
    }
    if (speech.availability && !speech.availability.available) {
      setSpeechError(speech.availability.message);
      return;
    }
    void speech.startListening();
  };

  const onVote = async (vote: SpeakSceneVote) => {
    if (!exercise || !current || saving) return;
    const scored = lineScore ?? scoreProductionAnswer(exercise, draft);
    const record: SpeakSceneLineAttempt = {
      lineId: current.id,
      vote,
      score: scored.result,
      attempts: Math.max(1, attempts),
      learnerText: draft.trim(),
      timestamp: new Date().toISOString(),
    };
    trackReadingEvent({
      type: 'speak_scene_line',
      storyId,
      meta: {
        sceneId: scene.id,
        lineId: current.id,
        vote,
        score: scored.result,
        reason: scored.reason,
        inputMode,
        attempts: record.attempts,
      },
    });
    const bundle = getContentBundle(storyId);
    const located = current.sourceSentenceId
      ? findSentenceById(bundle, current.sourceSentenceId, current.sourceChapterId ?? undefined)
      : null;
    if (located) {
      const lemmaIds = resolveSentenceFocusLemmas(located.sentence, bundle.lexiconById);
      if (lemmaIds.length > 0) {
        await getVocabularyService().recordSelfAssessmentForLemmaIds(
          lemmaIds,
          vote,
          {
            source: 'speak_scene',
            storyId,
            chapterId: located.chapter.id,
            sentenceId: located.sentence.id,
            sceneId: scene.id,
            lineId: current.id,
          },
          {
            sourceSentence: located.sentence,
            bumpEncounterOnGotIt: vote === 'got_it',
          },
        );
      }
    }
    const nextLines = [...lineRecords, record];
    setLineRecords(nextLines);
    setDraft('');
    setAttempts(0);
    setLineScore(null);
    setSpeechError(null);
    const done = lineIndex + 1 >= scene.lines.length;
    await persist(false, nextLines, done);
    if (!done) {
      setLineIndex(lineIndex + 1);
      setPhase('line');
      return;
    }
    setPhase('summary');
  };

  const copy = lineScore ? feedbackCopy(lineScore.result, inputMode) : null;
  const correction = lineScore?.matchedIt ?? current?.it ?? '';
  const inputValue = speech.isListening && speech.interim ? speech.interim : draft;
  const speakDisabled = phase !== 'line' || saving;
  const speakLabel = speech.isListening ? 'Listening…' : 'Speak';

  return (
    <AtmosphereBackground>
      <Stack.Screen options={{ title: 'Speak the scene', headerBackVisible: false }} />
      <ScrollView
        contentContainerStyle={{
          paddingTop: Spacing.lg,
          paddingBottom: insets.bottom + Spacing.xl,
          flexGrow: 1,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <ScreenContent maxWidth={680}>
          {phase === 'intro' ? (
            <View>
              <Text style={[type.chapterEyebrow, { color: colors.tint }]}>Speak the scene</Text>
              <Text style={[type.heroTitle, { color: colors.text, marginTop: Spacing.sm }]}>
                {scene.title}
              </Text>
              <Text style={[type.body, { color: colors.textSecondary, marginTop: Spacing.md, lineHeight: 24 }]}>
                {scene.summaryEn}
              </Text>
              <Text style={[type.label, { color: colors.text, marginTop: Spacing.lg }]}>
                Say it in Italian — speak or type.
              </Text>
              <Pressable
                onPress={() => {
                  trackReadingEvent({
                    type: 'speak_scene_started',
                    storyId,
                    meta: { sceneId: scene.id, lineCount: scene.lines.length },
                  });
                  setPhase('line');
                }}
                style={({ pressed }) => [
                  styles.primaryBtn,
                  {
                    backgroundColor: colors.buttonPrimary,
                    opacity: pressed ? 0.88 : 1,
                    minHeight: minTouchTarget,
                    marginTop: Spacing.xl,
                  },
                ]}>
                <Text style={[type.button, { color: colors.onButtonPrimary }]}>Start</Text>
              </Pressable>
              <Pressable
                onPress={() => void finishAndContinue(true, [])}
                disabled={saving}
                style={({ pressed }) => [
                  styles.secondaryBtn,
                  { borderColor: colors.border, opacity: pressed || saving ? 0.88 : 1, marginTop: Spacing.sm },
                ]}>
                <Text style={[type.button, { color: colors.text }]}>Skip</Text>
              </Pressable>
            </View>
          ) : null}

          {phase === 'line' || phase === 'feedback' ? (
            <View>
              <Text style={[type.caption, { color: colors.textMuted }]}>
                {lineIndex + 1} of {scene.lines.length}
              </Text>
              <Text style={[type.heroTitle, { color: colors.text, marginTop: Spacing.sm }]}>
                {scene.title}
              </Text>
              <Text style={[type.body, { color: colors.textMuted, marginTop: Spacing.md, lineHeight: 24 }]}>
                {scene.summaryEn}
              </Text>
              <Text style={[type.chapterEyebrow, { color: colors.tint, marginTop: Spacing.xl }]}>
                Say it in Italian
              </Text>
              <Text style={[type.heroTitle, { color: colors.text, marginTop: Spacing.sm, fontSize: 24, lineHeight: 32 }]}>
                {current?.en}
              </Text>

              <TextInput
                value={inputValue}
                onChangeText={(value) => {
                  setSpeechError(null);
                  setDraft(value);
                }}
                editable={phase === 'line' && !speech.isListening}
                placeholder={speech.isListening ? 'Listening…' : 'Type it in Italian'}
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="off"
                style={[
                  styles.input,
                  {
                    color: colors.text,
                    borderColor: speech.isListening
                      ? colors.tint
                      : phase === 'feedback' && lineScore
                        ? feedbackAccent(lineScore.result, colors)
                        : colors.border,
                    backgroundColor: colors.backgroundElevated,
                    minHeight: minTouchTarget,
                  },
                ]}
              />

              {speechError ? (
                <Text style={[type.caption, { color: colors.assessmentNotYetIndicator, marginTop: Spacing.sm }]}>
                  {speechError}
                </Text>
              ) : null}

              <View style={styles.actionRow}>
                <Pressable
                  onPress={onSpeakPress}
                  disabled={speakDisabled}
                  accessibilityState={{ disabled: speakDisabled, busy: speech.isListening }}
                  style={({ pressed }) => [
                    styles.secondaryBtn,
                    styles.flexBtn,
                    {
                      borderColor: speech.isListening ? colors.tint : colors.border,
                      opacity: speakDisabled ? 0.45 : pressed ? 0.88 : 1,
                      minHeight: minTouchTarget,
                    },
                  ]}>
                  <Text
                    style={[
                      type.button,
                      { color: speech.isListening ? colors.tint : colors.text },
                    ]}>
                    {speakLabel}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={onCheck}
                  disabled={phase !== 'line' || !draft.trim() || speech.isListening}
                  style={({ pressed }) => [
                    styles.primaryBtn,
                    styles.flexBtn,
                    {
                      backgroundColor: colors.buttonPrimary,
                      opacity:
                        phase !== 'line' || !draft.trim() || speech.isListening
                          ? 0.5
                          : pressed
                            ? 0.88
                            : 1,
                      minHeight: minTouchTarget,
                    },
                  ]}>
                  <Text style={[type.button, { color: colors.onButtonPrimary }]}>Check</Text>
                </Pressable>
              </View>

              {phase === 'feedback' && lineScore && copy ? (
                <View style={{ marginTop: Spacing.xl }}>
                  <Text style={[type.label, { color: feedbackAccent(lineScore.result, colors) }]}>
                    {copy.title}
                  </Text>
                  <Text style={[type.caption, { color: colors.textMuted, marginTop: Spacing.xs }]}>
                    {copy.hint}
                  </Text>

                  {lineScore.result !== 'correct' ? (
                    <View style={{ marginTop: Spacing.lg, gap: Spacing.sm }}>
                      <Text style={[type.caption, { color: colors.textMuted }]}>
                        {inputMode === 'speak' ? 'You said' : 'You wrote'}
                      </Text>
                      <Text style={[type.body, { color: colors.text }]}>{draft.trim() || '—'}</Text>
                      <Text style={[type.caption, { color: colors.textMuted, marginTop: Spacing.sm }]}>
                        Correct Italian
                      </Text>
                      <Text style={[type.label, { color: colors.text }]}>{correction}</Text>
                    </View>
                  ) : (
                    <Text style={[type.label, { color: colors.text, marginTop: Spacing.lg }]}>
                      {correction}
                    </Text>
                  )}

                  <Text style={[type.caption, { color: colors.textMuted, marginTop: Spacing.lg }]}>
                    How did that feel?
                  </Text>
                  <SelfAssessmentVoteButtons disabled={saving} onVote={(vote) => void onVote(vote)} />
                </View>
              ) : null}

              <Pressable
                onPress={() => void finishAndContinue(true, lineRecords)}
                disabled={saving || speech.isListening}
                style={({ pressed }) => [
                  styles.secondaryBtn,
                  {
                    borderColor: colors.border,
                    opacity: pressed || saving || speech.isListening ? 0.88 : 1,
                    marginTop: Spacing.lg,
                  },
                ]}>
                <Text style={[type.button, { color: colors.textMuted }]}>Skip</Text>
              </Pressable>
            </View>
          ) : null}

          {phase === 'summary' ? (
            <View>
              <Text style={[type.heroTitle, { color: colors.text }]}>
                You retold &ldquo;{scene.title}&rdquo;.
              </Text>
              <Text style={[type.body, { color: colors.textSecondary, marginTop: Spacing.md }]}>
                {lineRecords.length}/{scene.lines.length} ideas expressed.
              </Text>
              <Pressable
                onPress={() => continueAfterScene(storyId, scene.batchEnd, returnTo)}
                disabled={saving}
                style={({ pressed }) => [
                  styles.primaryBtn,
                  {
                    backgroundColor: colors.buttonPrimary,
                    opacity: pressed || saving ? 0.88 : 1,
                    minHeight: minTouchTarget,
                    marginTop: Spacing.xl,
                  },
                ]}>
                <Text style={[type.button, { color: colors.onButtonPrimary }]}>Continue</Text>
              </Pressable>
            </View>
          ) : null}
        </ScreenContent>
      </ScrollView>
    </AtmosphereBackground>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  input: {
    marginTop: Spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontFamily: 'Literata_400Regular',
    fontSize: 18,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  flexBtn: {
    flex: 1,
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
