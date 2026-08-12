import { Stack, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AtmosphereBackground } from '@/src/components/AtmosphereBackground';
import { getReviewService } from '@/src/review';
import type { ReviewPrompt } from '@/src/review/ReviewService';
import { getProgressService } from '@/src/progress';
import { getVocabularyService } from '@/src/vocabulary';
import { Radii, Spacing, Typography } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

type Phase = 'prompt' | 'feedback' | 'done';

export default function ReviewScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<ReviewPrompt[]>([]);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('prompt');
  const [selected, setSelected] = useState<number | null>(null);
  const [correct, setCorrect] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      const progress = await getProgressService().getOrCreate();
      const vocab = getVocabularyService();
      const state = await vocab.getState();
      const session = getReviewService().createSession(state, {
        currentChapterId: progress.currentChapterId,
        completedChapterIds: progress.completedChapterIds,
      });
      if (!cancelled) {
        setItems(session.items);
        setLoading(false);
      }
    }
    void boot();
    return () => {
      cancelled = true;
    };
  }, []);

  const current = items[index];

  const onSelect = async (choiceIndex: number) => {
    if (!current || phase !== 'prompt') return;
    const isCorrect = choiceIndex === current.correctIndex;
    setSelected(choiceIndex);
    setCorrect(isCorrect);
    setPhase('feedback');
    await getVocabularyService().recordReview(current.kind, current.id, isCorrect);
  };

  const onContinue = () => {
    if (index + 1 < items.length) {
      setIndex(index + 1);
      setSelected(null);
      setPhase('prompt');
      return;
    }
    setPhase('done');
  };

  return (
    <AtmosphereBackground>
      <Stack.Screen options={{ title: 'A little review' }} />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}>
        {loading ? (
          <Text style={[Typography.body, { color: colors.textSecondary }]}>Preparing…</Text>
        ) : !loading && (items.length === 0 || phase === 'done') ? (
          <View>
            <Text style={[Typography.heroTitle, { color: colors.text }]}>
              {items.length === 0 ? "You're all caught up." : 'Nice work.'}
            </Text>
            <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.md }]}>
              The story is waiting whenever you are.
            </Text>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.cta,
                { backgroundColor: colors.tint, opacity: pressed ? 0.88 : 1 },
              ]}>
              <Text style={[Typography.button, { color: '#F7FAF9' }]}>Back to reading</Text>
            </Pressable>
          </View>
        ) : current ? (
          <View>
            <Text style={[Typography.caption, { color: colors.textMuted }]}>
              {index + 1} of {items.length}
            </Text>
            <Text style={[Typography.chapterEyebrow, { color: colors.tint, marginTop: Spacing.lg }]}>
              {current.question}
            </Text>
            <Text
              style={[
                current.promptType === 'cloze' ? Typography.body : Typography.heroTitle,
                { color: colors.text, marginTop: Spacing.md },
              ]}>
              {current.stem}
            </Text>

            <View style={{ marginTop: Spacing.xl, gap: Spacing.sm }}>
              {current.choices.map((choice, i) => {
                const letter = String.fromCharCode(65 + i);
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
                    <Text style={[Typography.label, { color: colors.textMuted }]}>{letter}.</Text>
                    <Text style={[Typography.body, { color: colors.text, flex: 1 }]}>{choice}</Text>
                  </Pressable>
                );
              })}
            </View>

            {phase === 'feedback' ? (
              <View style={{ marginTop: Spacing.xl }}>
                <Text style={[Typography.label, { color: correct ? colors.tint : colors.danger }]}>
                  {correct ? '✓ Esatto!' : 'Not quite — you’ll see it again.'}
                </Text>
                {current.exampleAfter ? (
                  <Text
                    style={[
                      Typography.body,
                      { color: colors.textSecondary, marginTop: Spacing.md, fontStyle: 'italic' },
                    ]}>
                    “{current.exampleAfter}”
                  </Text>
                ) : null}
                <Pressable
                  onPress={onContinue}
                  style={({ pressed }) => [
                    styles.cta,
                    { backgroundColor: colors.tint, opacity: pressed ? 0.88 : 1 },
                  ]}>
                  <Text style={[Typography.button, { color: '#F7FAF9' }]}>
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
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-start',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radii.md,
    padding: Spacing.md,
  },
  cta: {
    alignSelf: 'flex-start',
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 10,
  },
});
