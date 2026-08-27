import { router, type Href } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AtmosphereBackground } from '@/src/components/AtmosphereBackground';
import { ScreenContent } from '@/src/components/ScreenContent';
import { useLayout } from '@/src/theme/useLayout';
import { Radii, Spacing, Typography } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';
import {
  WALKTHROUGH_CHAPTERS,
  WALKTHROUGH_PRODUCTION,
  WALKTHROUGH_QUESTION,
  WALKTHROUGH_READING,
  getWalkthroughGloss,
} from '@/src/walkthrough/content';
import { speakItalian, stopSpeakingItalian } from '@/src/walkthrough/speakItalian';
import {
  advanceWalkthrough,
  assessProduction,
  canAdvanceWalkthrough,
  chooseComprehension,
  continueFromReading,
  createWalkthroughState,
  revealProduction,
  skipToComprehension,
  tapWalkthroughToken,
  walkthroughProgressLabel,
  type WalkthroughAssessment,
  type WalkthroughState,
} from '@/src/walkthrough/state';

const ASSESSMENTS: { id: WalkthroughAssessment; label: string }[] = [
  { id: 'got_it', label: 'I got it' },
  { id: 'almost', label: 'Almost' },
  { id: 'not_yet', label: 'Not yet' },
];

const PLAYBACK_SPEEDS = [0.8, 1.0, 1.15] as const;

export default function WalkthroughScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const layout = useLayout();
  const [state, setState] = useState<WalkthroughState>(createWalkthroughState);
  const [speaking, setSpeaking] = useState(false);
  const [playingSentenceId, setPlayingSentenceId] = useState<string | null>(null);
  const [isPlayingPassage, setIsPlayingPassage] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const playbackRunIdRef = useRef(0);

  const gloss = state.tappedToken ? getWalkthroughGloss(state.tappedToken) : null;

  const stopPlayback = useCallback(() => {
    playbackRunIdRef.current += 1;
    stopSpeakingItalian();
    setIsPlayingPassage(false);
    setPlayingSentenceId(null);
    setSpeaking(false);
  }, []);

  // Stop audio whenever step changes or unmounts
  useEffect(() => {
    stopPlayback();
    return () => {
      stopPlayback();
    };
  }, [state.step, stopPlayback]);

  const playSingleSentence = useCallback(
    async (sentenceId: string, text: string) => {
      stopPlayback();
      const currentRunId = playbackRunIdRef.current;
      setSpeechError(null);
      setPlayingSentenceId(sentenceId);
      try {
        await speakItalian(text, playbackRate);
      } catch {
        setSpeechError('Pronunciation isn’t available on this device.');
      } finally {
        if (playbackRunIdRef.current === currentRunId) {
          setPlayingSentenceId(null);
        }
      }
    },
    [playbackRate, stopPlayback],
  );

  const playPassage = useCallback(async () => {
    stopPlayback();
    const currentRunId = playbackRunIdRef.current;
    setSpeechError(null);
    setIsPlayingPassage(true);
    try {
      for (const sentence of WALKTHROUGH_READING) {
        if (playbackRunIdRef.current !== currentRunId) break;
        setPlayingSentenceId(sentence.id);
        await speakItalian(sentence.text, playbackRate);
        if (playbackRunIdRef.current !== currentRunId) break;
        await new Promise((r) => setTimeout(r, 220));
      }
    } catch {
      setSpeechError('Pronunciation isn’t available on this device.');
    } finally {
      if (playbackRunIdRef.current === currentRunId) {
        setIsPlayingPassage(false);
        setPlayingSentenceId(null);
      }
    }
  }, [playbackRate, stopPlayback]);

  const title = useMemo(() => {
    switch (state.step) {
      case 'intro':
        return 'Meet Luca';
      case 'reading':
      case 'dictionary':
        return 'Read';
      case 'listening':
        return 'Listen';
      case 'comprehension':
        return 'Understand';
      case 'production':
        return 'Say it in Italian';
      case 'complete':
        return "That's the idea.";
    }
  }, [state.step]);

  return (
    <AtmosphereBackground>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + Spacing.md,
          paddingBottom: insets.bottom + Spacing.xxl,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}>
        <ScreenContent>
          <Pressable
            accessibilityRole="link"
            accessibilityLabel="Back to homepage"
            onPress={() => router.replace('/')}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, minHeight: 44, justifyContent: 'center' })}>
            <Text style={[Typography.label, { color: colors.tint }]}>← Storibase</Text>
          </Pressable>
          <Text style={[Typography.chapterEyebrow, { color: colors.tint, marginTop: Spacing.md }]}>
            Walkthrough · {walkthroughProgressLabel(state.step)}
          </Text>
          <Text
            style={[
              Typography.heroTitle,
              {
                color: colors.text,
                marginTop: Spacing.sm,
                fontSize: layout.isPhone ? 28 : 34,
              },
            ]}>
            {title}
          </Text>

          {state.step === 'intro' ? (
            <View style={styles.block}>
              <Text style={[Typography.body, { color: colors.textSecondary }]}>
                Meet Luca. He&apos;s just arrived in Rome.
              </Text>
              <View
                style={[
                  styles.readerCard,
                  { backgroundColor: colors.readerSurface, borderColor: colors.border },
                ]}>
                <View style={styles.sentenceRow}>
                  <Text style={[Typography.reader, { color: colors.text, flex: 1 }]}>
                    Luca arriva a Roma.
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Listen to sentence"
                    onPress={() => void playSingleSentence('intro', 'Luca arriva a Roma.')}
                    hitSlop={8}
                    style={({ pressed }) => [
                      styles.inlineAudioBtn,
                      {
                        backgroundColor:
                          playingSentenceId === 'intro' ? colors.tint : colors.backgroundElevated,
                        borderColor: colors.border,
                        opacity: pressed ? 0.7 : 1,
                      },
                    ]}>
                    <Text
                      style={{
                        fontSize: 12,
                        color: playingSentenceId === 'intro' ? colors.onButtonPrimary : colors.tint,
                      }}>
                      {playingSentenceId === 'intro' ? '❚❚' : '▶'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ) : null}

          {state.step === 'reading' || state.step === 'dictionary' ? (
            <View style={styles.block}>
              <Text style={[Typography.body, { color: colors.textSecondary }]}>
                Read a little Italian. Tap a word when you need it, or listen to a sentence.
              </Text>
              <View
                style={[
                  styles.readerCard,
                  { backgroundColor: colors.readerSurface, borderColor: colors.border },
                ]}>
                {WALKTHROUGH_READING.map((sentence) => {
                  const isPlayingThis = playingSentenceId === sentence.id;
                  return (
                    <View key={sentence.id} style={styles.sentenceRow}>
                      <View style={styles.tokensWrapper}>
                        {sentence.tokens.map((token) => {
                          const surface = token.replace(/[.,!?]+$/g, '');
                          const selected = state.tappedToken === surface.toLowerCase();
                          return (
                            <Pressable
                              key={`${sentence.id}-${token}`}
                              accessibilityRole="button"
                              accessibilityLabel={`Word: ${surface}`}
                              onPress={() => setState((current) => tapWalkthroughToken(current, token))}
                              style={({ pressed }) => [
                                styles.token,
                                selected && { backgroundColor: colors.sentenceHighlight },
                                { opacity: pressed ? 0.85 : 1 },
                              ]}>
                              <Text style={[Typography.reader, { color: colors.text }]}>{token}</Text>
                            </Pressable>
                          );
                        })}
                      </View>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Listen to sentence: ${sentence.text}`}
                        onPress={() => {
                          if (isPlayingThis) {
                            stopPlayback();
                          } else {
                            void playSingleSentence(sentence.id, sentence.text);
                          }
                        }}
                        hitSlop={8}
                        style={({ pressed }) => [
                          styles.inlineAudioBtn,
                          {
                            backgroundColor: isPlayingThis ? colors.tint : colors.backgroundElevated,
                            borderColor: isPlayingThis ? colors.tint : colors.border,
                            opacity: pressed ? 0.7 : 1,
                          },
                        ]}>
                        <Text
                          style={{
                            fontSize: 12,
                            color: isPlayingThis ? colors.onButtonPrimary : colors.tint,
                          }}>
                          {isPlayingThis ? '❚❚' : '▶'}
                        </Text>
                      </Pressable>
                    </View>
                  );
                })}
              </View>
              {state.step === 'dictionary' && gloss ? (
                <View
                  style={[
                    styles.gloss,
                    { backgroundColor: colors.backgroundElevated, borderColor: colors.border },
                  ]}>
                  <View style={styles.glossHeader}>
                    <Text style={[Typography.label, { color: colors.text }]}>{gloss.surface}</Text>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Pronounce ${gloss.surface}`}
                      onPress={() => void speakItalian(gloss.surface, playbackRate)}
                      hitSlop={8}
                      style={({ pressed }) => ({
                        opacity: pressed ? 0.6 : 1,
                        paddingVertical: 2,
                        paddingHorizontal: 6,
                      })}>
                      <Text style={[Typography.caption, { color: colors.tint }]}>🔊 Pronounce</Text>
                    </Pressable>
                  </View>
                  <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.xs }]}>
                    {gloss.gloss}
                  </Text>
                </View>
              ) : (
                <Text style={[Typography.caption, { color: colors.textMuted, marginTop: Spacing.md }]}>
                  Tap any word to see what it means.
                </Text>
              )}
            </View>
          ) : null}

          {state.step === 'listening' ? (
            <View style={styles.block}>
              <Text style={[Typography.caption, { color: colors.tint }]}>Pass 2 · Listen</Text>
              <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.xs }]}>
                Hearing the story connects the sound of Italian to its meaning. Listen as each sentence
                flows naturally.
              </Text>
              <View
                style={[
                  styles.readerCard,
                  { backgroundColor: colors.readerSurface, borderColor: colors.border },
                ]}>
                {WALKTHROUGH_READING.map((sentence) => {
                  const isPlayingThis = playingSentenceId === sentence.id;
                  return (
                    <View
                      key={sentence.id}
                      style={[
                        styles.listenSentenceRow,
                        isPlayingThis && {
                          backgroundColor: colors.sentenceHighlight,
                          borderColor: colors.tint,
                        },
                      ]}>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Play sentence: ${sentence.text}`}
                        onPress={() => {
                          if (isPlayingThis) {
                            stopPlayback();
                          } else {
                            void playSingleSentence(sentence.id, sentence.text);
                          }
                        }}
                        hitSlop={8}
                        style={({ pressed }) => [
                          styles.listenRowAudioBtn,
                          {
                            backgroundColor: isPlayingThis ? colors.tint : colors.backgroundElevated,
                            borderColor: isPlayingThis ? colors.tint : colors.border,
                            opacity: pressed ? 0.75 : 1,
                          },
                        ]}>
                        <Text
                          style={{
                            fontSize: 13,
                            color: isPlayingThis ? colors.onButtonPrimary : colors.tint,
                          }}>
                          {isPlayingThis ? '❚❚' : '▶'}
                        </Text>
                      </Pressable>
                      <Text
                        style={[
                          Typography.reader,
                          {
                            color: colors.text,
                            flex: 1,
                            fontWeight: isPlayingThis ? '600' : '400',
                          },
                        ]}>
                        {sentence.text}
                      </Text>
                    </View>
                  );
                })}
              </View>

              {/* Audio Deck Controls */}
              <View
                style={[
                  styles.deckCard,
                  { backgroundColor: colors.backgroundElevated, borderColor: colors.border },
                ]}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={isPlayingPassage ? 'Pause passage' : 'Play passage'}
                  onPress={() => {
                    if (isPlayingPassage) {
                      stopPlayback();
                    } else {
                      void playPassage();
                    }
                  }}
                  style={({ pressed }) => [
                    styles.passagePlayBtn,
                    {
                      backgroundColor: colors.buttonPrimary,
                      opacity: pressed ? 0.88 : 1,
                    },
                  ]}>
                  <Text style={[Typography.button, { color: colors.onButtonPrimary }]}>
                    {isPlayingPassage ? '❚❚ Pause passage' : '▶ Play whole passage'}
                  </Text>
                </Pressable>

                <View style={styles.speedSelectorRow}>
                  <Text style={[Typography.caption, { color: colors.textMuted }]}>Speed</Text>
                  <View style={styles.speedButtons}>
                    {PLAYBACK_SPEEDS.map((speed) => {
                      const active = playbackRate === speed;
                      return (
                        <Pressable
                          key={speed}
                          accessibilityRole="button"
                          accessibilityLabel={`${speed}x speed`}
                          accessibilityState={{ selected: active }}
                          onPress={() => {
                            setPlaybackRate(speed);
                            if (isPlayingPassage) {
                              setTimeout(() => void playPassage(), 50);
                            }
                          }}
                          style={({ pressed }) => [
                            styles.speedBtn,
                            {
                              backgroundColor: active ? colors.accentSoft : 'transparent',
                              borderColor: active ? colors.tint : colors.border,
                              opacity: pressed ? 0.8 : 1,
                            },
                          ]}>
                          <Text
                            style={[
                              Typography.caption,
                              {
                                color: active ? colors.tint : colors.textSecondary,
                                fontWeight: active ? '600' : '400',
                              },
                            ]}>
                            {speed}x
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              </View>

              {speechError ? (
                <Text style={[Typography.caption, { color: colors.textMuted, marginTop: Spacing.sm }]}>
                  {speechError}
                </Text>
              ) : null}
            </View>
          ) : null}

          {state.step === 'comprehension' ? (
            <View style={styles.block}>
              <Text style={[Typography.body, { color: colors.textSecondary }]}>
                {WALKTHROUGH_QUESTION.promptEn}
              </Text>
              <Text style={[Typography.chapterTitle, { color: colors.text, marginTop: Spacing.sm }]}>
                {WALKTHROUGH_QUESTION.promptIt}
              </Text>
              {WALKTHROUGH_QUESTION.options.map((option, index) => {
                const chosen = state.comprehensionChoice === index;
                const correct = index === WALKTHROUGH_QUESTION.correctIndex;
                const revealed = state.comprehensionChoice !== null;
                const borderColor =
                  revealed && chosen && correct
                    ? colors.tint
                    : revealed && chosen && !correct
                      ? colors.danger
                      : colors.border;
                return (
                  <Pressable
                    key={option}
                    accessibilityRole="button"
                    accessibilityLabel={option}
                    accessibilityState={{ selected: chosen }}
                    onPress={() => setState((current) => chooseComprehension(current, index))}
                    style={({ pressed }) => [
                      styles.option,
                      {
                        borderColor,
                        backgroundColor: colors.backgroundElevated,
                        opacity: pressed ? 0.88 : 1,
                      },
                    ]}>
                    <Text style={[Typography.body, { color: colors.text }]}>{option}</Text>
                  </Pressable>
                );
              })}
              {state.comprehensionChoice !== null ? (
                <Text style={[Typography.caption, { color: colors.textMuted, marginTop: Spacing.md }]}>
                  {state.comprehensionChoice === WALKTHROUGH_QUESTION.correctIndex
                    ? 'Yes — he goes into the bar. Reading becomes understanding.'
                    : 'Not quite. Luca entra nel bar.'}
                </Text>
              ) : null}
            </View>
          ) : null}

          {state.step === 'production' ? (
            <View style={styles.block}>
              <Text style={[Typography.caption, { color: colors.tint }]}>Say it in Italian</Text>
              <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
                Once you understand something, you can try saying it. No microphone — just try it out
                loud, then check.
              </Text>
              <View
                style={[
                  styles.readerCard,
                  { backgroundColor: colors.backgroundElevated, borderColor: colors.border },
                ]}>
                <Text style={[Typography.caption, { color: colors.textMuted }]}>English</Text>
                <Text style={[Typography.heroTitle, { color: colors.text, marginTop: Spacing.sm }]}>
                  {WALKTHROUGH_PRODUCTION.promptEn}
                </Text>
              </View>
              {!state.productionRevealed ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Show answer"
                  onPress={() => setState((current) => revealProduction(current))}
                  style={({ pressed }) => [
                    styles.primaryBtn,
                    { backgroundColor: colors.buttonPrimary, opacity: pressed ? 0.88 : 1, marginTop: Spacing.lg },
                  ]}>
                  <Text style={[Typography.button, { color: colors.onButtonPrimary }]}>Show answer</Text>
                </Pressable>
              ) : (
                <>
                  <View
                    style={[
                      styles.readerCard,
                      { backgroundColor: colors.readerSurface, borderColor: colors.tint, marginTop: Spacing.lg },
                    ]}>
                    <Text style={[Typography.caption, { color: colors.textMuted }]}>Expected answer</Text>
                    <Text style={[Typography.reader, { color: colors.text, marginTop: Spacing.sm }]}>
                      {WALKTHROUGH_PRODUCTION.expectedIt}
                    </Text>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Listen to pronunciation of Ho fame"
                      onPress={() => {
                        setSpeechError(null);
                        setSpeaking(true);
                        void speakItalian(WALKTHROUGH_PRODUCTION.expectedIt, playbackRate)
                          .catch(() => {
                            setSpeechError('Pronunciation isn’t available on this device.');
                          })
                          .finally(() => setSpeaking(false));
                      }}
                      style={({ pressed }) => [
                        styles.listenBtn,
                        {
                          borderColor: colors.border,
                          backgroundColor: colors.backgroundElevated,
                          opacity: pressed ? 0.88 : 1,
                        },
                      ]}>
                      <Text style={[Typography.label, { color: colors.tint }]}>
                        {speaking ? 'Playing…' : 'Listen to pronunciation'}
                      </Text>
                    </Pressable>
                    {speechError ? (
                      <Text style={[Typography.caption, { color: colors.textMuted, marginTop: Spacing.sm }]}>
                        {speechError}
                      </Text>
                    ) : null}
                  </View>
                  <Text style={[Typography.label, { color: colors.text, marginTop: Spacing.lg }]}>
                    How did you do?
                  </Text>
                  <View style={styles.assessRow}>
                    {ASSESSMENTS.map((option) => {
                      const selected = state.productionAssessment === option.id;
                      return (
                        <Pressable
                          key={option.id}
                          accessibilityRole="button"
                          accessibilityLabel={option.label}
                          accessibilityState={{ selected }}
                          onPress={() => setState((current) => assessProduction(current, option.id))}
                          style={({ pressed }) => [
                            styles.assessBtn,
                            {
                              backgroundColor: selected ? colors.accentSoft : colors.backgroundElevated,
                              borderColor: selected ? colors.tint : colors.border,
                              opacity: pressed ? 0.88 : 1,
                            },
                          ]}>
                          <Text
                            style={[
                              Typography.caption,
                              { color: selected ? colors.tint : colors.text, textAlign: 'center' },
                            ]}>
                            {option.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </>
              )}
            </View>
          ) : null}

          {state.step === 'complete' ? (
            <View style={styles.block}>
              <Text style={[Typography.body, { color: colors.textSecondary }]}>
                Read a little. Understand more. Meet the same characters again. Say what you&apos;ve
                learned. Keep going.
              </Text>
              <Text style={[Typography.label, { color: colors.tint, marginTop: Spacing.lg }]}>
                The story continues
              </Text>
              {WALKTHROUGH_CHAPTERS.map((chapter, index) => (
                <View key={chapter.number} style={{ marginTop: Spacing.sm }}>
                  <Text style={[Typography.body, { color: colors.text }]}>
                    Chapter {chapter.number} · {chapter.title}
                  </Text>
                  {index < WALKTHROUGH_CHAPTERS.length - 1 ? (
                    <Text style={[Typography.caption, { color: colors.textMuted }]}>↓</Text>
                  ) : (
                    <Text style={[Typography.caption, { color: colors.textMuted }]}>…</Text>
                  )}
                </View>
              ))}
              <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.md }]}>
                Vocabulary isn&apos;t discarded after one lesson. Words return because the story
                continues.
              </Text>
            </View>
          ) : null}

          <View style={styles.footer}>
            {state.step === 'reading' ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Continue without tapping"
                onPress={() => setState((current) => skipToComprehension(current))}
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, minHeight: 44, justifyContent: 'center' })}>
                <Text style={[Typography.caption, { color: colors.textMuted }]}>Continue without tapping</Text>
              </Pressable>
            ) : null}
            {state.step !== 'complete' && (state.step === 'dictionary' || canAdvanceWalkthrough(state)) ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Continue"
                onPress={() =>
                  setState((current) =>
                    current.step === 'dictionary' ? continueFromReading(current) : advanceWalkthrough(current),
                  )
                }
                style={({ pressed }) => [
                  styles.primaryBtn,
                  { backgroundColor: colors.buttonPrimary, opacity: pressed ? 0.88 : 1 },
                ]}>
                <Text style={[Typography.button, { color: colors.onButtonPrimary }]}>
                  {state.step === 'dictionary'
                    ? 'Continue to Listen →'
                    : state.step === 'listening'
                      ? 'Continue to Understand →'
                      : 'Continue'}
                </Text>
              </Pressable>
            ) : null}
            {state.step === 'complete' ? (
              <>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Start learning Italian"
                  onPress={() => router.push('/account?mode=signup' as Href)}
                  style={({ pressed }) => [
                    styles.primaryBtn,
                    { backgroundColor: colors.buttonPrimary, opacity: pressed ? 0.88 : 1 },
                  ]}>
                  <Text style={[Typography.button, { color: colors.onButtonPrimary }]}>Start learning Italian →</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="link"
                  accessibilityLabel="Back to homepage"
                  onPress={() => router.replace('/')}
                  style={({ pressed }) => ({ marginTop: Spacing.md, opacity: pressed ? 0.7 : 1, minHeight: 44, justifyContent: 'center' })}>
                  <Text style={[Typography.label, { color: colors.tint }]}>Back to homepage</Text>
                </Pressable>
              </>
            ) : null}
          </View>
        </ScreenContent>
      </ScrollView>
    </AtmosphereBackground>
  );
}

const styles = StyleSheet.create({
  block: {
    marginTop: Spacing.lg,
  },
  readerCard: {
    marginTop: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
  },
  sentenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  tokensWrapper: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    alignItems: 'center',
  },
  token: {
    borderRadius: Radii.sm,
    paddingHorizontal: 2,
  },
  inlineAudioBtn: {
    width: 28,
    height: 28,
    borderRadius: Radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listenSentenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.xs,
    borderRadius: Radii.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
    gap: Spacing.sm,
  },
  listenRowAudioBtn: {
    width: 32,
    height: 32,
    borderRadius: Radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deckCard: {
    marginTop: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radii.md,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  passagePlayBtn: {
    minHeight: 44,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  speedSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  speedButtons: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  speedBtn: {
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radii.sm,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gloss: {
    marginTop: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radii.md,
    padding: Spacing.md,
  },
  glossHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  option: {
    marginTop: Spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radii.md,
    padding: Spacing.md,
    minHeight: 48,
    justifyContent: 'center',
  },
  primaryBtn: {
    minHeight: 48,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  assessRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  assessBtn: {
    flex: 1,
    minHeight: 44,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xs,
  },
  listenBtn: {
    marginTop: Spacing.md,
    minHeight: 44,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  footer: {
    marginTop: Spacing.xl,
    gap: Spacing.sm,
  },
});
