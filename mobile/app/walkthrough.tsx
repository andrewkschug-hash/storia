import { router, type Href } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
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

export default function WalkthroughScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const layout = useLayout();
  const [state, setState] = useState<WalkthroughState>(createWalkthroughState);
  const [speaking, setSpeaking] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const gloss = state.tappedToken ? getWalkthroughGloss(state.tappedToken) : null;

  useEffect(() => () => stopSpeakingItalian(), []);

  const title = useMemo(() => {
    switch (state.step) {
      case 'intro':
        return 'Meet Luca';
      case 'reading':
      case 'dictionary':
        return 'Read';
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
            <Text style={[Typography.label, { color: colors.tint }]}>← Storia</Text>
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
                <Text style={[Typography.reader, { color: colors.text }]}>Luca arriva a Roma.</Text>
              </View>
            </View>
          ) : null}

          {state.step === 'reading' || state.step === 'dictionary' ? (
            <View style={styles.block}>
              <Text style={[Typography.body, { color: colors.textSecondary }]}>
                Read a little Italian. Tap a word when you need it.
              </Text>
              <View
                style={[
                  styles.readerCard,
                  { backgroundColor: colors.readerSurface, borderColor: colors.border },
                ]}>
                {WALKTHROUGH_READING.map((sentence) => (
                  <View key={sentence.id} style={styles.sentence}>
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
                ))}
              </View>
              {state.step === 'dictionary' && gloss ? (
                <View
                  style={[
                    styles.gloss,
                    { backgroundColor: colors.backgroundElevated, borderColor: colors.border },
                  ]}>
                  <Text style={[Typography.label, { color: colors.text }]}>{gloss.surface}</Text>
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
                        void speakItalian(WALKTHROUGH_PRODUCTION.expectedIt)
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
                <Text style={[Typography.button, { color: colors.onButtonPrimary }]}>Continue</Text>
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
  sentence: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: Spacing.sm,
  },
  token: {
    borderRadius: Radii.sm,
    paddingHorizontal: 2,
  },
  gloss: {
    marginTop: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radii.md,
    padding: Spacing.md,
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
