import { Stack, router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AtmosphereBackground } from '@/src/components/AtmosphereBackground';
import { ScreenContent } from '@/src/components/ScreenContent';
import { SelfAssessmentVoteButtons } from '@/src/components/SelfAssessmentVoteButtons';
import { LUCA_STORY_ID, getContentBundle } from '@/src/content';
import { batchRangeForChapter } from '@/src/content/lessonBatches';
import { recapCheckpointId } from '@/src/content/storyPath';
import { getProgressService } from '@/src/progress';
import { routeAfterRecap } from '@/src/progress/batchMilestoneRoute';
import { getReviewService } from '@/src/review';
import type { ReviewPrompt } from '@/src/review/ReviewService';
import { getVocabularyService } from '@/src/vocabulary';
import { Radii, Spacing } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

type Phase = 'intro' | 'prompt' | 'feedback' | 'done';
type Vote = 'got_it' | 'almost' | 'not_yet';

function continueAfterBatch(
  storyId: string,
  chapterNumber: number,
  returnTo?: string,
) {
  void getProgressService(storyId)
    .completeCheckpoint(recapCheckpointId(storyId, chapterNumber))
    .then(() => {
      router.replace(routeAfterRecap(storyId, chapterNumber, returnTo));
    });
}

export default function BatchRecapScreen() {
  const { story, chapter, returnTo } = useLocalSearchParams<{
    story?: string;
    chapter?: string;
    returnTo?: string;
  }>();
  const storyId = typeof story === 'string' ? story : LUCA_STORY_ID;
  const chapterNumber = chapter ? Number(chapter) : 0;
  const { start, end } = batchRangeForChapter(chapterNumber);
  const { colors, type, minTouchTarget } = useTheme();
  const insets = useSafeAreaInsets();

  const [items, setItems] = useState<ReviewPrompt[]>([]);
  const [copy, setCopy] = useState<{ headline: string; detail: string } | null>(null);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('intro');
  const [selected, setSelected] = useState<number | null>(null);
  const [correct, setCorrect] = useState(false);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const bundle = getContentBundle(storyId);
      const state = await getVocabularyService().getState();
      const session = getReviewService().createBatchSession(state, bundle, start, end);
      const recapCopy = getReviewService().batchRecapCopy(start, end, session);
      if (!cancelled) {
        setItems(session.items);
        setCopy({ headline: recapCopy.headline, detail: recapCopy.detail });
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [storyId, start, end]);

  const current = items[index];

  const onSelect = (choiceIndex: number) => {
    if (!current || phase !== 'prompt') return;
    setSelected(choiceIndex);
    setCorrect(choiceIndex === current.correctIndex);
    setPhase('feedback');
  };

  const goNext = () => {
    if (index + 1 < items.length) {
      setIndex(index + 1);
      setSelected(null);
      setCorrect(false);
      setPhase('prompt');
      return;
    }
    setPhase('done');
  };

  const onVote = async (vote: Vote) => {
    if (!current || voting) return;
    setVoting(true);
    try {
      await getVocabularyService().recordSelfAssessment(
        current.kind,
        current.id,
        vote,
        { source: 'batch_recap', storyId },
      );
      goNext();
    } finally {
      setVoting(false);
    }
  };

  useEffect(() => {
    if (!loading && phase === 'done') {
      continueAfterBatch(storyId, chapterNumber, returnTo);
    }
  }, [loading, phase, storyId, chapterNumber, returnTo]);

  return (
    <AtmosphereBackground>
      <Stack.Screen options={{ title: 'Word recap', headerBackVisible: false }} />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}>
        <ScreenContent maxWidth={680}>
          {loading ? (
            <Text style={[type.body, { color: colors.textSecondary }]}>Preparing…</Text>
          ) : phase === 'intro' && copy ? (
            <View>
              <Text style={[type.chapterEyebrow, { color: colors.tint }]}>After the grammar</Text>
              <Text style={[type.heroTitle, { color: colors.text, marginTop: Spacing.sm }]}>
                {copy.headline}
              </Text>
              <Text style={[type.body, { color: colors.textSecondary, marginTop: Spacing.md }]}>
                {copy.detail}
              </Text>
              <Pressable
                onPress={() => setPhase('prompt')}
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
            </View>
          ) : current ? (
            <View>
              <Text style={[type.caption, { color: colors.textMuted }]}>
                {index + 1} of {items.length}
              </Text>
              <Text style={[type.chapterEyebrow, { color: colors.tint, marginTop: Spacing.lg }]}>
                {current.question}
              </Text>
              <Text
                style={[
                  current.promptType === 'cloze' ? type.body : type.heroTitle,
                  { color: colors.text, marginTop: Spacing.md },
                ]}>
                {current.stem}
              </Text>
              <View style={{ marginTop: Spacing.xl, gap: Spacing.sm }}>
                {current.choices.map((choice, i) => {
                  const show = phase === 'feedback';
                  const isAnswer = i === current.correctIndex;
                  const isPick = i === selected;
                  const border = show
                    ? isAnswer
                      ? colors.statusMastered
                      : isPick
                        ? colors.danger
                        : colors.border
                    : isPick
                      ? colors.tint
                      : colors.border;
                  return (
                    <Pressable
                      key={`${choice}-${i}`}
                      disabled={phase !== 'prompt'}
                      onPress={() => onSelect(i)}
                      style={({ pressed }) => [
                        styles.choice,
                        {
                          backgroundColor: colors.backgroundElevated,
                          borderColor: border,
                          opacity: pressed && phase === 'prompt' ? 0.9 : 1,
                        },
                      ]}>
                      <Text style={[type.body, { color: colors.text }]}>{choice}</Text>
                    </Pressable>
                  );
                })}
              </View>
              {phase === 'feedback' ? (
                <View style={{ marginTop: Spacing.xl }}>
                  <Text style={[type.label, { color: correct ? colors.tint : colors.danger }]}>
                    {correct ? 'That’s the answer.' : `Answer: ${current.choices[current.correctIndex]}`}
                  </Text>
                  <Text style={[type.body, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
                    {current.italian} · {current.english}
                  </Text>
                  <Text style={[type.caption, { color: colors.textMuted, marginTop: Spacing.lg }]}>
                    How did you do?
                  </Text>
                  <SelfAssessmentVoteButtons
                    disabled={voting}
                    onVote={(vote) => void onVote(vote)}
                  />
                </View>
              ) : null}
            </View>
          ) : null}
        </ScreenContent>
      </ScrollView>
    </AtmosphereBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: Spacing.lg,
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
});
