import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AvatarBadge } from '@/src/components/AvatarBadge';
import { AtmosphereBackground } from '@/src/components/AtmosphereBackground';
import { ScreenContent } from '@/src/components/ScreenContent';
import { SelfAssessmentVoteButtons } from '@/src/components/SelfAssessmentVoteButtons';
import { LUCA_STORY_ID, getContentBundle } from '@/src/content';
import { getSpeakSceneById, speakTurnToExercise } from '@/src/content/speakScenes';
import { getProgressService } from '@/src/progress';
import { routeAfterSpeakScene } from '@/src/progress/batchMilestoneRoute';
import type { SpeakSceneLineAttempt, SpeakSceneVote } from '@/src/progress/types';
import type { AvatarId } from '@/src/account/avatars';
import {
  type ProductionScoreResult,
  type ProductionScoreStatus,
} from '@/src/production/score';
import { useItalianSpeechInput } from '@/src/production/useItalianSpeechInput';
import {
  createDialogueState,
  incrementHintLevel,
  recordVoteAndAdvance,
  setPartnerAudioPlaying,
  startScene,
  submitLearnerResponse,
  togglePartnerEnglish,
} from '@/src/speakScene/dialogueMachine';
import type { DialogueState } from '@/src/speakScene/types';
import { trackReadingEvent } from '@/src/telemetry/ReadingEventStore';
import { speakItalian, stopSpeakingItalian } from '@/src/walkthrough/speakItalian';
import { resolveSentenceFocusLemmas } from '@/src/vocabulary/productionFocusLemmas';
import { findSentenceById } from '@/src/vocabulary/storyExamples';
import { getVocabularyService } from '@/src/vocabulary';
import { Radii, Spacing } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

function continueAfterScene(storyId: string, batchEnd: number, returnTo?: string) {
  router.replace(routeAfterSpeakScene(storyId, batchEnd, returnTo));
}

function getCharacterAvatarId(speakerId?: string): AvatarId {
  const normalized = (speakerId ?? '').toLowerCase();
  if (normalized.includes('sofia')) return 'mare';
  if (normalized.includes('marco')) return 'libro';
  if (normalized.includes('marta') || normalized.includes('mamma')) return 'arancia';
  if (normalized.includes('giulia')) return 'limone';
  if (normalized.includes('rosa') || normalized.includes('nonna')) return 'sole';
  if (normalized.includes('padrone')) return 'caffe';
  if (normalized.includes('davide')) return 'roma';
  return 'olivo';
}

function formatIntentLabel(intent?: string): string {
  switch (intent) {
    case 'ask_for_information':
      return 'Ask for information';
    case 'offer_help':
      return 'Offer help';
    case 'propose':
      return 'Propose an idea';
    case 'agree':
      return 'Agree';
    case 'disagree':
      return 'Disagree';
    case 'explain_problem':
      return 'Explain the situation';
    case 'express_concern':
      return 'Express concern';
    case 'express_feeling':
      return 'Share how you feel';
    case 'invite':
      return 'Invite';
    case 'say_goodbye':
      return 'Say goodbye';
    case 'greeting':
      return 'Greet';
    default:
      return 'Respond';
  }
}

function feedbackCopy(
  status: ProductionScoreStatus,
  inputMode: 'type' | 'speak',
): { title: string; hint: string } {
  switch (status) {
    case 'correct':
      return { title: 'Great response!', hint: 'Natural and clear Italian.' };
    case 'almost':
      return {
        title: 'Almost there!',
        hint:
          inputMode === 'speak'
            ? 'Very close — check the wording below.'
            : 'Very close — check the phrasing below.',
      };
    default:
      return { title: 'Keep practicing!', hint: 'Here is the target Italian to learn from.' };
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
  const scrollRef = useRef<ScrollView>(null);

  const [dialogue, setDialogue] = useState<DialogueState>(() => createDialogueState(scene));
  const [typedInput, setTypedInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [lineRecords, setLineRecords] = useState<SpeakSceneLineAttempt[]>([]);

  const turns = scene?.turns ?? [];
  const currentTurn = turns[dialogue.turnIndex];
  const learnerTurn = currentTurn?.learnerTurn;

  const exercise = useMemo(() => {
    if (!scene || !currentTurn) return null;
    return speakTurnToExercise(scene, currentTurn);
  }, [scene, currentTurn]);

  const contextualStrings = useMemo(() => {
    if (!learnerTurn) return [] as string[];
    return [learnerTurn.targetIt, ...(learnerTurn.acceptableAnswers ?? [])].filter(Boolean);
  }, [learnerTurn]);

  // Speech Input setup
  const speech = useItalianSpeechInput({
    enabled: Boolean(scene) && (dialogue.stage === 'learner_prompt' || dialogue.stage === 'evaluating'),
    contextualStrings,
    onFinalTranscript: (transcript) => {
      if (transcript && exercise) {
        setTypedInput(transcript);
        setSpeechError(null);
        handleLearnerSubmit(transcript, 'speak');
        return;
      }
      setSpeechError('Didn’t catch that — try again or type below.');
    },
    onError: (message) => setSpeechError(message),
  });

  // Auto-scroll on new dialogue events
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 120);
    return () => clearTimeout(timer);
  }, [dialogue.stage, dialogue.turnIndex, dialogue.hintLevel, dialogue.history.length]);

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      stopSpeakingItalian();
    };
  }, []);

  const handlePartnerAudio = useCallback(
    async (text: string) => {
      stopSpeakingItalian();
      setDialogue((s) => setPartnerAudioPlaying(s, true));
      try {
        await speakItalian(text, 0.95);
      } finally {
        setDialogue((s) => setPartnerAudioPlaying(s, false));
      }
    },
    [],
  );

  const handleStartScene = () => {
    if (!scene) return;
    trackReadingEvent({
      type: 'speak_scene_started',
      storyId,
      meta: { sceneId: scene.id, turnCount: turns.length },
    });
    const started = startScene(dialogue, scene);
    setDialogue(started);
    const firstTurn = turns[0];
    if (firstTurn) {
      void handlePartnerAudio(firstTurn.it);
    }
  };

  const handleLearnerSubmit = (text: string, mode: 'type' | 'speak') => {
    if (!exercise) return;
    const scored = submitLearnerResponse(dialogue, text, mode, exercise);
    setDialogue(scored);
    trackReadingEvent({
      type: 'speak_scene_line',
      storyId,
      meta: {
        sceneId: scene?.id ?? null,
        turnId: currentTurn?.id ?? null,
        stage: 'feedback',
        inputMode: mode,
        score: scored.score?.result ?? null,
        reason: scored.score?.reason ?? null,
      },
    });
  };

  const handleVote = async (vote: SpeakSceneVote) => {
    if (!scene || !currentTurn || !exercise || saving) return;
    setSaving(true);
    try {
      const scored = dialogue.score?.result ?? 'correct';
      const record: SpeakSceneLineAttempt = {
        lineId: currentTurn.id,
        vote,
        score: scored,
        attempts: dialogue.hintLevel > 0 ? 2 : 1,
        learnerText: dialogue.draft,
        timestamp: new Date().toISOString(),
      };

      const nextRecords = [...lineRecords, record];
      setLineRecords(nextRecords);

      // Record vocabulary familiarity
      const bundle = getContentBundle(storyId);
      const located = findSentenceById(bundle, currentTurn.id);
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
              lineId: currentTurn.id,
            },
            {
              sourceSentence: located.sentence,
              bumpEncounterOnGotIt: vote === 'got_it',
            },
          );
        }
      }

      const nextState = recordVoteAndAdvance(dialogue, vote, scene);
      setDialogue(nextState);
      setTypedInput('');
      setSpeechError(null);

      const isDone = nextState.stage === 'summary';
      await getProgressService(storyId).recordSpeakScene({
        sceneId: scene.id,
        skipped: false,
        completedAt: isDone ? new Date().toISOString() : null,
        lines: nextRecords,
      });

      if (isDone) {
        trackReadingEvent({
          type: 'speak_scene_completed',
          storyId,
          meta: {
            sceneId: scene.id,
            skipped: false,
            turnCount: nextRecords.length,
            gotIt: nextRecords.filter((r) => r.vote === 'got_it').length,
            almost: nextRecords.filter((r) => r.vote === 'almost').length,
            notYet: nextRecords.filter((r) => r.vote === 'not_yet').length,
          },
        });
      } else {
        // Auto-play the next partner turn audio
        const nextTurn = turns[nextState.turnIndex];
        if (nextTurn) {
          void handlePartnerAudio(nextTurn.it);
        }
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    if (!scene) return;
    setSaving(true);
    try {
      await getProgressService(storyId).recordSpeakScene({
        sceneId: scene.id,
        skipped: true,
        completedAt: null,
        lines: [],
      });
      trackReadingEvent({
        type: 'speak_scene_skipped',
        storyId,
        meta: { sceneId: scene.id, skipped: true },
      });
    } finally {
      setSaving(false);
      continueAfterScene(storyId, scene.batchEnd, returnTo);
    }
  };

  if (!scene) {
    return (
      <AtmosphereBackground>
        <Stack.Screen options={{ title: 'Conversation Roleplay', headerBackVisible: false }} />
        <View style={styles.center}>
          <Text style={[type.body, { color: colors.textSecondary }]}>Scene not found.</Text>
        </View>
      </AtmosphereBackground>
    );
  }

  const inputValue = speech.isListening && speech.interim ? speech.interim : typedInput;

  return (
    <AtmosphereBackground>
      <Stack.Screen options={{ title: 'Conversation Roleplay', headerBackVisible: false }} />
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: Spacing.md,
              paddingBottom: insets.bottom + Spacing.xl,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <ScreenContent maxWidth={680}>
            {/* INTRO STAGE */}
            {dialogue.stage === 'intro' ? (
              <View style={styles.introContainer}>
                <View style={[styles.badgePill, { backgroundColor: colors.backgroundElevated, borderColor: colors.border }]}>
                  <Text style={[type.caption, { color: colors.tint, fontWeight: '700' }]}>
                    CONVERSATION ROLEPLAY
                  </Text>
                </View>

                <Text style={[type.heroTitle, { color: colors.text, marginTop: Spacing.md }]}>
                  {scene.title}
                </Text>

                <Text style={[type.body, { color: colors.textSecondary, marginTop: Spacing.md, lineHeight: 24 }]}>
                  {scene.summaryEn}
                </Text>

                <View style={[styles.settingCard, { backgroundColor: colors.backgroundElevated, borderColor: colors.border }]}>
                  <Text style={[type.caption, { color: colors.textMuted, fontWeight: '600' }]}>
                    SCENE CHARACTERS & SETTING
                  </Text>
                  <View style={styles.charactersRow}>
                    {(scene.characterIds ?? ['sofia', 'luca']).map((charId) => (
                      <View key={charId} style={styles.characterChip}>
                        <AvatarBadge avatarId={getCharacterAvatarId(charId)} size="sm" />
                        <Text style={[type.label, { color: colors.text, textTransform: 'capitalize' }]}>
                          {charId === 'luca' ? 'Luca (You)' : charId}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                <Pressable
                  onPress={handleStartScene}
                  style={({ pressed }) => [
                    styles.primaryBtn,
                    {
                      backgroundColor: colors.buttonPrimary,
                      opacity: pressed ? 0.88 : 1,
                      minHeight: minTouchTarget,
                      marginTop: Spacing.xl,
                    },
                  ]}>
                  <Text style={[type.button, { color: colors.onButtonPrimary }]}>
                    Start Dialogue
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleSkip}
                  disabled={saving}
                  style={({ pressed }) => [
                    styles.secondaryBtn,
                    {
                      borderColor: colors.border,
                      opacity: pressed || saving ? 0.7 : 1,
                      minHeight: minTouchTarget,
                      marginTop: Spacing.sm,
                    },
                  ]}>
                  <Text style={[type.button, { color: colors.textSecondary }]}>Skip for now</Text>
                </Pressable>
              </View>
            ) : null}

            {/* TIMELINE THREAD (HISTORY & ACTIVE DIALOGUE) */}
            {dialogue.stage !== 'intro' && dialogue.stage !== 'summary' ? (
              <View style={styles.timelineContainer}>
                {/* Scene Header */}
                <View style={styles.sceneHeaderRow}>
                  <Text style={[type.caption, { color: colors.textMuted, fontWeight: '600' }]}>
                    {scene.title}
                  </Text>
                  <Text style={[type.caption, { color: colors.tint, fontWeight: '700' }]}>
                    Turn {dialogue.turnIndex + 1} of {turns.length}
                  </Text>
                </View>

                {/* Conversation History Timeline */}
                {dialogue.history.map((item, idx) => {
                  if (item.kind === 'partner') {
                    const isLatest = idx === dialogue.history.length - 1;
                    return (
                      <View key={item.id} style={styles.partnerBubbleContainer}>
                        <AvatarBadge avatarId={getCharacterAvatarId(item.speakerId)} size="md" />
                        <View style={styles.partnerBubbleContent}>
                          <Text style={[type.caption, { color: colors.textMuted, marginBottom: 4 }]}>
                            {item.speakerName}
                          </Text>
                          <View
                            style={[
                              styles.partnerBubble,
                              {
                                backgroundColor: colors.backgroundElevated,
                                borderColor: isLatest ? colors.tint : colors.border,
                              },
                            ]}>
                            <Text style={[type.body, { color: colors.text, fontSize: 18, lineHeight: 26 }]}>
                              {item.it}
                            </Text>

                            {/* Audio & Translate controls */}
                            <View style={styles.partnerControlsRow}>
                              <Pressable
                                onPress={() => handlePartnerAudio(item.it)}
                                style={({ pressed }) => [
                                  styles.audioMiniBtn,
                                  {
                                    borderColor: colors.border,
                                    backgroundColor: dialogue.partnerAudioPlaying ? colors.accentSoft : 'transparent',
                                    opacity: pressed ? 0.8 : 1,
                                  },
                                ]}>
                                <Text style={[type.caption, { color: colors.tint, fontWeight: '600' }]}>
                                  🔊 {dialogue.partnerAudioPlaying ? 'Playing…' : 'Listen'}
                                </Text>
                              </Pressable>

                              <Pressable
                                onPress={() => setDialogue(togglePartnerEnglish)}
                                style={({ pressed }) => [
                                  styles.translateMiniBtn,
                                  { opacity: pressed ? 0.8 : 1 },
                                ]}>
                                <Text style={[type.caption, { color: colors.textSecondary }]}>
                                  {dialogue.partnerEnglishVisible ? 'Hide English ▴' : 'Translate ▾'}
                                </Text>
                              </Pressable>
                            </View>

                            {dialogue.partnerEnglishVisible ? (
                              <View style={[styles.translationDrawer, { borderTopColor: colors.border }]}>
                                <Text style={[type.body, { color: colors.textSecondary, fontSize: 15 }]}>
                                  {item.en}
                                </Text>
                              </View>
                            ) : null}
                          </View>
                        </View>
                      </View>
                    );
                  }

                  // Learner Turn History Item
                  return (
                    <View key={item.id} style={styles.learnerBubbleContainer}>
                      <View
                        style={[
                          styles.learnerBubble,
                          {
                            backgroundColor: colors.accentSoft,
                            borderColor: item.score === 'correct' ? colors.assessmentGotItIndicator : colors.border,
                          },
                        ]}>
                        <Text style={[type.caption, { color: colors.tint, fontWeight: '700', marginBottom: 2 }]}>
                          You · {item.role}
                        </Text>
                        <Text style={[type.body, { color: colors.text, fontSize: 17, lineHeight: 24 }]}>
                          {item.learnerText || item.targetIt}
                        </Text>
                      </View>
                    </View>
                  );
                })}

                {/* ACTIVE LEARNER TURN CARD */}
                {dialogue.stage === 'learner_prompt' ? (
                  <View style={[styles.activeTurnCard, { backgroundColor: colors.backgroundElevated, borderColor: colors.border }]}>
                    <View style={styles.intentHeaderRow}>
                      <Text style={[type.caption, { color: colors.tint, fontWeight: '800', letterSpacing: 0.5 }]}>
                        YOUR ROLEPLAY TURN · {learnerTurn?.role?.toUpperCase() ?? 'LUCA'}
                      </Text>
                      <View style={[styles.intentPill, { backgroundColor: colors.accentSoft }]}>
                        <Text style={[type.caption, { color: colors.tint, fontWeight: '600' }]}>
                          {formatIntentLabel(learnerTurn?.intent)}
                        </Text>
                      </View>
                    </View>

                    {/* English Objective & Instruction Prompt */}
                    <View style={[styles.promptInstructionBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
                      <Text style={[type.caption, { color: colors.tint, fontWeight: '700', letterSpacing: 0.5 }]}>
                        SAY THIS IN ITALIAN:
                      </Text>
                      <Text style={[type.heroTitle, { color: colors.text, fontSize: 19, lineHeight: 26, marginTop: 4 }]}>
                        "{learnerTurn?.objectiveEn}"
                      </Text>
                    </View>

                    {/* 3-LEVEL SCAFFOLDING LADDER */}
                    {dialogue.hintLevel > 0 ? (
                      <View style={[styles.hintContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
                        {/* Level 1: Keywords */}
                        {dialogue.hintLevel >= 1 && learnerTurn?.hintKeywords?.length ? (
                          <View style={styles.hintSection}>
                            <Text style={[type.caption, { color: colors.textMuted, fontWeight: '700' }]}>
                              KEY WORDS:
                            </Text>
                            <View style={styles.keywordRow}>
                              {learnerTurn.hintKeywords.map((kw, i) => (
                                <View key={i} style={[styles.keywordChip, { backgroundColor: colors.backgroundElevated, borderColor: colors.border }]}>
                                  <Text style={[type.label, { color: colors.text }]}>{kw}</Text>
                                </View>
                              ))}
                            </View>
                          </View>
                        ) : null}

                        {/* Level 2: Cloze Scaffold */}
                        {dialogue.hintLevel >= 2 && learnerTurn?.hintScaffold ? (
                          <View style={[styles.hintSection, { marginTop: Spacing.sm }]}>
                            <Text style={[type.caption, { color: colors.textMuted, fontWeight: '700' }]}>
                              SENTENCE STRUCTURE:
                            </Text>
                            <Text style={[type.body, { color: colors.tint, fontWeight: '600', fontSize: 16 }]}>
                              {learnerTurn.hintScaffold}
                            </Text>
                          </View>
                        ) : null}

                        {/* Level 3: Full Model Response + Audio */}
                        {dialogue.hintLevel >= 3 && learnerTurn?.targetIt ? (
                          <View style={[styles.hintSection, { marginTop: Spacing.sm }]}>
                            <Text style={[type.caption, { color: colors.textMuted, fontWeight: '700' }]}>
                              TARGET ITALIAN MODEL:
                            </Text>
                            <Text style={[type.body, { color: colors.text, fontWeight: '700', fontSize: 17 }]}>
                              {learnerTurn.targetIt}
                            </Text>
                            <Pressable
                              onPress={() => handlePartnerAudio(learnerTurn.targetIt)}
                              style={({ pressed }) => [
                                styles.audioMiniBtn,
                                {
                                  borderColor: colors.tint,
                                  backgroundColor: colors.accentSoft,
                                  marginTop: Spacing.xs,
                                  alignSelf: 'flex-start',
                                  opacity: pressed ? 0.8 : 1,
                                },
                              ]}>
                              <Text style={[type.caption, { color: colors.tint, fontWeight: '700' }]}>
                                🔊 Hear Italian Model
                              </Text>
                            </Pressable>
                          </View>
                        ) : null}
                      </View>
                    ) : null}

                    {/* Hint Step Button */}
                    {dialogue.hintLevel < 3 ? (
                      <Pressable
                        onPress={() => setDialogue(incrementHintLevel)}
                        style={({ pressed }) => [
                          styles.hintBtn,
                          { opacity: pressed ? 0.7 : 1 },
                        ]}>
                        <Text style={[type.caption, { color: colors.tint, fontWeight: '600' }]}>
                          {dialogue.hintLevel === 0
                            ? '💡 Need word hints?'
                            : dialogue.hintLevel === 1
                              ? '🧩 Show sentence structure'
                              : '👀 Show target Italian answer'}
                        </Text>
                      </Pressable>
                    ) : null}

                    {/* UNIFIED INPUT AREA */}
                    <View style={styles.inputSection}>
                      <TextInput
                        value={inputValue}
                        onChangeText={(val) => {
                          setSpeechError(null);
                          setTypedInput(val);
                        }}
                        placeholder={speech.isListening ? 'Listening… speak now' : 'Type your response in Italian…'}
                        placeholderTextColor={colors.textMuted}
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoComplete="off"
                        style={[
                          styles.textInput,
                          {
                            color: colors.text,
                            borderColor: speech.isListening ? colors.tint : colors.border,
                            backgroundColor: colors.backgroundElevated,
                            minHeight: minTouchTarget,
                          },
                        ]}
                      />

                      {speechError ? (
                        <Text style={[type.caption, { color: colors.assessmentNotYetIndicator, marginTop: 4 }]}>
                          {speechError}
                        </Text>
                      ) : null}

                      {/* Actions: Speak & Check Buttons */}
                      <View style={styles.inputActionsRow}>
                        <Pressable
                          onPress={() => {
                            stopSpeakingItalian();
                            setSpeechError(null);
                            if (speech.isListening) {
                              speech.stopListening();
                            } else {
                              void speech.startListening();
                            }
                          }}
                          style={({ pressed }) => [
                            styles.speakBtn,
                            {
                              backgroundColor: speech.isListening ? colors.tint : colors.backgroundElevated,
                              borderColor: speech.isListening ? colors.tint : colors.border,
                              minHeight: minTouchTarget,
                              opacity: pressed ? 0.88 : 1,
                            },
                          ]}>
                          <Text
                            style={[
                              type.button,
                              { color: speech.isListening ? colors.onButtonPrimary : colors.tint, fontWeight: '700' },
                            ]}>
                            {speech.isListening ? '● Listening…' : '🎙 Speak'}
                          </Text>
                        </Pressable>

                        <Pressable
                          onPress={() => {
                            if (typedInput.trim()) {
                              handleLearnerSubmit(typedInput, 'type');
                            }
                          }}
                          disabled={!typedInput.trim() || speech.isListening}
                          style={({ pressed }) => [
                            styles.checkBtn,
                            {
                              backgroundColor: colors.buttonPrimary,
                              minHeight: minTouchTarget,
                              opacity: !typedInput.trim() || speech.isListening ? 0.45 : pressed ? 0.88 : 1,
                            },
                          ]}>
                          <Text style={[type.button, { color: colors.onButtonPrimary }]}>
                            Submit
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                ) : null}

                {/* FEEDBACK & SELF-ASSESSMENT STAGE */}
                {dialogue.stage === 'feedback' ? (
                  <View style={[styles.feedbackCard, { backgroundColor: colors.backgroundElevated, borderColor: colors.border }]}>
                    <View style={styles.feedbackHeaderRow}>
                      <Text
                        style={[
                          type.heroTitle,
                          {
                            fontSize: 18,
                            color:
                              dialogue.score?.result === 'correct'
                                ? colors.assessmentGotItIndicator
                                : dialogue.score?.result === 'almost'
                                  ? colors.assessmentAlmostIndicator
                                  : colors.text,
                          },
                        ]}>
                        {feedbackCopy(dialogue.score?.result ?? 'correct', dialogue.inputMode).title}
                      </Text>
                      <Text style={[type.caption, { color: colors.textSecondary }]}>
                        {feedbackCopy(dialogue.score?.result ?? 'correct', dialogue.inputMode).hint}
                      </Text>
                    </View>

                    {/* Matched target response */}
                    <View style={[styles.targetDisplay, { backgroundColor: colors.background, borderColor: colors.border }]}>
                      <Text style={[type.caption, { color: colors.textMuted, fontWeight: '700' }]}>
                        TARGET ITALIAN:
                      </Text>
                      <Text style={[type.body, { color: colors.text, fontWeight: '700', fontSize: 17, marginTop: 2 }]}>
                        {dialogue.score?.matchedIt ?? learnerTurn?.targetIt}
                      </Text>

                      <Pressable
                        onPress={() =>
                          handlePartnerAudio(dialogue.score?.matchedIt ?? learnerTurn?.targetIt ?? '')
                        }
                        style={({ pressed }) => [
                          styles.audioMiniBtn,
                          {
                            borderColor: colors.tint,
                            backgroundColor: colors.accentSoft,
                            marginTop: Spacing.sm,
                            alignSelf: 'flex-start',
                            opacity: pressed ? 0.8 : 1,
                          },
                        ]}>
                        <Text style={[type.caption, { color: colors.tint, fontWeight: '700' }]}>
                          🔊 Hear pronunciation
                        </Text>
                      </Pressable>
                    </View>

                    {/* Self Assessment Question */}
                    <Text style={[type.label, { color: colors.text, marginTop: Spacing.md, textAlign: 'center' }]}>
                      How comfortable did that feel?
                    </Text>

                    <View style={{ marginTop: Spacing.sm }}>
                      <SelfAssessmentVoteButtons onVote={(v) => void handleVote(v)} disabled={saving} />
                    </View>
                  </View>
                ) : null}
              </View>
            ) : null}

            {/* SUMMARY STAGE */}
            {dialogue.stage === 'summary' ? (
              <View style={styles.summaryContainer}>
                <View style={[styles.badgePill, { backgroundColor: colors.accentSoft, borderColor: colors.tint }]}>
                  <Text style={[type.caption, { color: colors.tint, fontWeight: '800' }]}>
                    DIALOGUE COMPLETE
                  </Text>
                </View>

                <Text style={[type.heroTitle, { color: colors.text, marginTop: Spacing.md }]}>
                  Ottimo lavoro!
                </Text>

                <Text style={[type.body, { color: colors.textSecondary, marginTop: Spacing.sm, lineHeight: 24 }]}>
                  You participated in the entire conversation with {turns.map((t) => t.speakerName).filter((v, i, a) => a.indexOf(v) === i).join(' & ')}.
                </Text>

                {/* Recap of Conversation */}
                <View style={[styles.recapCard, { backgroundColor: colors.backgroundElevated, borderColor: colors.border }]}>
                  <Text style={[type.caption, { color: colors.textMuted, fontWeight: '700', marginBottom: Spacing.sm }]}>
                    CONVERSATION SCRIPT RECAP
                  </Text>
                  {dialogue.history.map((item) => (
                    <View key={item.id} style={styles.recapItem}>
                      <Text style={[type.caption, { color: item.kind === 'partner' ? colors.tint : colors.textMuted, fontWeight: '700' }]}>
                        {item.kind === 'partner' ? item.speakerName : `You (${item.role})`}:
                      </Text>
                      <Text style={[type.body, { color: colors.text, fontSize: 15, marginTop: 2 }]}>
                        {item.kind === 'partner' ? item.it : item.learnerText || item.targetIt}
                      </Text>
                    </View>
                  ))}
                </View>

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
                  <Text style={[type.button, { color: colors.onButtonPrimary }]}>
                    Continue Reading
                  </Text>
                </Pressable>
              </View>
            ) : null}
          </ScreenContent>
        </ScrollView>
      </KeyboardAvoidingView>
    </AtmosphereBackground>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  introContainer: {
    paddingVertical: Spacing.lg,
  },
  badgePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radii.pill,
    borderWidth: 1,
  },
  settingCard: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1,
  },
  charactersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  characterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingRight: 8,
  },
  primaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radii.pill,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  secondaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radii.pill,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  timelineContainer: {
    paddingVertical: Spacing.xs,
  },
  sceneHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingBottom: Spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(150, 150, 150, 0.2)',
  },
  partnerBubbleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    marginRight: 40,
  },
  partnerBubbleContent: {
    flex: 1,
  },
  partnerBubble: {
    borderRadius: Radii.lg,
    borderTopLeftRadius: 4,
    padding: Spacing.md,
    borderWidth: 1,
  },
  partnerControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  audioMiniBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radii.pill,
    borderWidth: 1,
  },
  translateMiniBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  translationDrawer: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
  },
  learnerBubbleContainer: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.md,
    marginLeft: 40,
  },
  learnerBubble: {
    borderRadius: Radii.lg,
    borderTopRightRadius: 4,
    padding: Spacing.md,
    borderWidth: 1,
  },
  activeTurnCard: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: Radii.lg,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  intentHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  intentPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.pill,
  },
  promptInstructionBox: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1,
  },
  hintContainer: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1,
  },
  hintSection: {
    gap: 4,
  },
  keywordRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  keywordChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radii.sm,
  },
  hintBtn: {
    marginTop: Spacing.sm,
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  inputSection: {
    marginTop: Spacing.md,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 16,
  },
  inputActionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  speakBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radii.pill,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
  },
  checkBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radii.pill,
    paddingHorizontal: Spacing.md,
  },
  feedbackCard: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: Radii.lg,
    borderWidth: 1.5,
  },
  feedbackHeaderRow: {
    gap: 4,
  },
  targetDisplay: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1,
  },
  summaryContainer: {
    paddingVertical: Spacing.lg,
  },
  recapCard: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1,
    gap: Spacing.md,
  },
  recapItem: {
    gap: 2,
  },
});
