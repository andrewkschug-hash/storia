import { Stack, router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AtmosphereBackground } from '@/src/components/AtmosphereBackground';
import { ScreenContent } from '@/src/components/ScreenContent';
import { SelfAssessmentVoteButtons } from '@/src/components/SelfAssessmentVoteButtons';
import { getAdaptiveService } from '@/src/adaptive';
import { getContentBundle, LUCA_STORY_ID } from '@/src/content';
import {
  advancePracticeSession,
  createPracticeSession,
  type PracticePrompt,
} from '@/src/practice';
import { useReadingProgress } from '@/src/progress/useReadingProgress';
import { Radii, Spacing } from '@/src/theme/tokens';
import { isPressableFocused } from '@/src/theme/pressableState';
import { useTheme } from '@/src/theme/useTheme';
import { getVocabularyService } from '@/src/vocabulary';
import type { SelfAssessment } from '@/src/vocabulary/selfAssessment';

type Phase = 'loading' | 'prompt' | 'reveal' | 'done';

export default function PracticeScreen() {
  const { colors, type, minTouchTarget } = useTheme();
  const insets = useSafeAreaInsets();
  const { progress } = useReadingProgress(LUCA_STORY_ID, { autoRefresh: true });
  const storyId = progress?.storyId ?? LUCA_STORY_ID;

  const [phase, setPhase] = useState<Phase>('loading');
  const [items, setItems] = useState<PracticePrompt[]>([]);
  const [index, setIndex] = useState(0);
  const [voting, setVoting] = useState(false);
  const [repeatCounts, setRepeatCounts] = useState<Record<string, number>>({});

  const boot = useCallback(async () => {
    const vocab = getVocabularyService();
    const state = await vocab.getState();
    const bundle = getContentBundle(storyId);
    const profile = progress ? await getAdaptiveService().buildProfile(progress) : null;
    const session = createPracticeSession(state, bundle, profile, { limit: 5 });
    setItems(session.items);
    setIndex(0);
    setRepeatCounts({});
    setPhase(session.items.length > 0 ? 'prompt' : 'done');
  }, [progress, storyId]);

  useEffect(() => {
    void boot();
  }, [boot]);

  const current = items[index] ?? null;
  const progressLabel = useMemo(() => {
    if (items.length === 0) return '';
    return `${Math.min(index + 1, items.length)} of ${items.length}`;
  }, [index, items.length]);

  const onReveal = () => setPhase('reveal');

  const onVote = async (assessment: SelfAssessment) => {
    if (!current || voting) return;
    setVoting(true);
    try {
      await getVocabularyService().recordSelfAssessment(current.kind, current.id, assessment, {
        source: 'practice_hub',
        storyId,
      });
      const key = `${current.kind}:${current.id}`;
      const nextRepeats = { ...repeatCounts, [key]: (repeatCounts[key] ?? 0) + 1 };
      const advanced = advancePracticeSession(items, index, assessment, repeatCounts);
      setRepeatCounts(nextRepeats);
      setItems(advanced.remaining);
      if (advanced.remaining.length === 0) {
        setPhase('done');
      } else {
        setIndex(Math.min(index, advanced.remaining.length - 1));
        setPhase('prompt');
      }
    } finally {
      setVoting(false);
    }
  };

  return (
    <AtmosphereBackground>
      <Stack.Screen options={{ title: 'Practice', headerBackTitle: 'Italian' }} />
      <ScrollView
        contentContainerStyle={{
          paddingTop: Spacing.lg,
          paddingBottom: insets.bottom + Spacing.xl,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}>
        <ScreenContent maxWidth={680}>
          {phase === 'loading' ? (
            <Text style={[type.body, { color: colors.textSecondary }]}>Preparing…</Text>
          ) : phase === 'done' ? (
            <View>
              <Text style={[type.heroTitle, { color: colors.text }]}>Nice work.</Text>
              <Text style={[type.body, { color: colors.textSecondary, marginTop: Spacing.md }]}>
                {items.length === 0
                  ? 'Nothing to practice right now. Keep reading — new words will show up here.'
                  : 'That session is done. Your Italian tab will reflect what you worked on.'}
              </Text>
              <Pressable
                onPress={() => router.back()}
                style={(state) => [
                  styles.primaryBtn,
                  {
                    backgroundColor: colors.buttonPrimary,
                    opacity: state.pressed ? 0.88 : 1,
                    minHeight: minTouchTarget,
                    marginTop: Spacing.xl,
                    borderWidth: isPressableFocused(state) ? 2 : 0,
                    borderColor: colors.accent,
                  },
                ]}>
                <Text style={[type.button, { color: colors.onButtonPrimary }]}>Back to Italian</Text>
              </Pressable>
            </View>
          ) : current ? (
            <View>
              <Text style={[type.caption, { color: colors.textMuted }]}>{progressLabel}</Text>
              <Text style={[type.chapterEyebrow, { color: colors.tint, marginTop: Spacing.lg }]}>
                Practice
              </Text>

              {current.contextPrompt ? (
                <>
                  <Text style={[type.body, { color: colors.textSecondary, marginTop: Spacing.md }]}>
                    Complete the sentence from memory.
                  </Text>
                  <Text style={[type.heroTitle, { color: colors.text, marginTop: Spacing.md }]}>
                    {current.contextPrompt}
                  </Text>
                </>
              ) : (
                <>
                  <Text style={[type.body, { color: colors.textSecondary, marginTop: Spacing.md }]}>
                    Do you know this word?
                  </Text>
                  <Text style={[type.heroTitle, { color: colors.text, marginTop: Spacing.md }]}>
                    {current.italian}
                  </Text>
                </>
              )}

              {phase === 'reveal' ? (
                <View
                  style={[
                    styles.revealCard,
                    { backgroundColor: colors.backgroundElevated, borderColor: colors.border },
                  ]}>
                  {current.contextPrompt ? (
                    <>
                      <Text style={[type.caption, { color: colors.textMuted }]}>Answer</Text>
                      <Text style={[type.heroTitle, { color: colors.text, marginTop: Spacing.sm }]}>
                        {current.contextAnswer ?? current.italian}
                      </Text>
                      {current.contextAnswer &&
                      current.contextAnswer.toLowerCase() !== current.italian.toLowerCase() ? (
                        <Text style={[type.caption, { color: colors.textSecondary, marginTop: Spacing.xs }]}>
                          from {current.italian}
                        </Text>
                      ) : null}
                    </>
                  ) : null}
                  <Text style={[type.caption, { color: colors.textMuted, marginTop: Spacing.md }]}>
                    Meaning
                  </Text>
                  <Text style={[type.body, { color: colors.text, marginTop: Spacing.xs }]}>
                    {current.english}
                  </Text>
                  {current.exampleSentence && !current.contextPrompt ? (
                    <Text style={[type.caption, { color: colors.textSecondary, marginTop: Spacing.md }]}>
                      {current.exampleSentence}
                    </Text>
                  ) : null}
                  <Text style={[type.caption, { color: colors.textMuted, marginTop: Spacing.lg }]}>
                    How did you do?
                  </Text>
                  <SelfAssessmentVoteButtons disabled={voting} onVote={(vote) => void onVote(vote)} />
                </View>
              ) : (
                <Pressable
                  onPress={onReveal}
                  style={(state) => [
                    styles.primaryBtn,
                    {
                      backgroundColor: colors.buttonPrimary,
                      opacity: state.pressed ? 0.88 : 1,
                      minHeight: minTouchTarget,
                      marginTop: Spacing.xl,
                      borderWidth: isPressableFocused(state) ? 2 : 0,
                      borderColor: colors.accent,
                    },
                  ]}>
                  <Text style={[type.button, { color: colors.onButtonPrimary }]}>
                    {current.contextPrompt ? 'Show answer' : 'Reveal meaning'}
                  </Text>
                </Pressable>
              )}
            </View>
          ) : null}
        </ScreenContent>
      </ScrollView>
    </AtmosphereBackground>
  );
}

const styles = StyleSheet.create({
  primaryBtn: {
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  revealCard: {
    marginTop: Spacing.xl,
    borderRadius: Radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.lg,
  },
});
