import { Stack, router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AtmosphereBackground } from '@/src/components/AtmosphereBackground';
import { LUCA_STORY_ID, getChapterByNumber, getContentBundle } from '@/src/content';
import { batchRangeForChapter } from '@/src/content/lessonBatches';
import { readerHref } from '@/src/content/storyHrefs';
import { getReviewService } from '@/src/review';
import type { ReviewPrompt } from '@/src/review/ReviewService';
import { getVocabularyService } from '@/src/vocabulary';
import { Radii, Spacing } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

type Phase = 'intro' | 'prompt' | 'feedback' | 'done';

function continueAfterBatch(storyId: string, chapterNumber: number) {
  if (storyId === LUCA_STORY_ID && (chapterNumber === 20 || chapterNumber === 24)) {
    router.replace(`/level-readiness?fromChapter=${chapterNumber}` as Href);
    return;
  }
  const next = getChapterByNumber(chapterNumber + 1, storyId);
  if (next) {
    router.replace(readerHref(storyId, next.id));
    return;
  }
  router.replace('/(tabs)/home' as Href);
}

export default function BatchRecapScreen() {
  const { story, chapter } = useLocalSearchParams<{ story?: string; chapter?: string }>();
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
        if (session.items.length === 0) setPhase('done');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [storyId, start, end]);

  const current = items[index];

  const onSelect = async (choiceIndex: number) => {
    if (!current || phase !== 'prompt') return;
    const isCorrect = choiceIndex === current.correctIndex;
    setSelected(choiceIndex);
    setCorrect(isCorrect);
    setPhase('feedback');
    await getVocabularyService().recordReview(current.kind, current.id, isCorrect);
  };

  const onContinueReview = () => {
    if (index + 1 < items.length) {
      setIndex(index + 1);
      setSelected(null);
      setPhase('prompt');
      return;
    }
    setPhase('done');
  };

  useEffect(() => {
    if (!loading && phase === 'done') {
      continueAfterBatch(storyId, chapterNumber);
    }
  }, [loading, phase, storyId, chapterNumber]);

  return (
    <AtmosphereBackground>
      <Stack.Screen options={{ title: 'Batch recap', headerBackVisible: false }} />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}>
        {loading ? (
          <Text style={[type.body, { color: colors.textSecondary }]}>Preparing…</Text>
        ) : phase === 'intro' && copy ? (
          <View>
            <Text style={[type.chapterEyebrow, { color: colors.tint }]}>Before the next batch</Text>
            <Text style={[type.heroTitle, { color: colors.text, marginTop: Spacing.sm }]}>
              {copy.headline}
            </Text>
            <Text style={[type.body, { color: colors.textSecondary, marginTop: Spacing.md }]}>
              {copy.detail}
            </Text>
            <View style={styles.row}>
              <Pressable
                onPress={() => continueAfterBatch(storyId, chapterNumber)}
                style={({ pressed }) => [
                  styles.secondaryBtn,
                  { borderColor: colors.border, opacity: pressed ? 0.88 : 1, flex: 1 },
                ]}>
                <Text style={[type.button, { color: colors.text }]}>Skip</Text>
              </Pressable>
              <Pressable
                onPress={() => setPhase(items.length > 0 ? 'prompt' : 'done')}
                style={({ pressed }) => [
                  styles.primaryBtn,
                  {
                    backgroundColor: colors.tint,
                    opacity: pressed ? 0.88 : 1,
                    flex: 1,
                    minHeight: minTouchTarget,
                  },
                ]}>
                <Text style={[type.button, { color: colors.onTint }]}>
                  {items.length > 0 ? 'Review' : 'Continue'}
                </Text>
              </Pressable>
            </View>
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
                    ? colors.tint
                    : isPick
                      ? colors.danger
                      : colors.border
                  : colors.border;
                return (
                  <Pressable
                    key={`${choice}-${i}`}
                    disabled={phase !== 'prompt'}
                    onPress={() => void onSelect(i)}
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
                  {correct ? '✓ Esatto!' : 'Not quite — you’ll see it again.'}
                </Text>
                <Pressable
                  onPress={onContinueReview}
                  style={({ pressed }) => [
                    styles.primaryBtn,
                    {
                      backgroundColor: colors.tint,
                      opacity: pressed ? 0.88 : 1,
                      minHeight: minTouchTarget,
                      marginTop: Spacing.lg,
                    },
                  ]}>
                  <Text style={[type.button, { color: colors.onTint }]}>
                    {index + 1 < items.length ? 'Continue' : 'Done'}
                  </Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        ) : null}
      </ScrollView>
    </AtmosphereBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  choice: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radii.md,
    padding: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xl,
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
