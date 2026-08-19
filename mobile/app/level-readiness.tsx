import { Stack, router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AtmosphereBackground } from '@/src/components/AtmosphereBackground';
import { getAdaptiveService } from '@/src/adaptive';
import {
  evaluateLearnerCrossStoryA1,
  getLevelReadinessService,
  type CrossStoryA1Readiness,
  type LevelReadiness,
} from '@/src/cefr';
import { LUCA_STORY_ID, getChapterByNumber } from '@/src/content';
import { readerHref } from '@/src/content/storyHrefs';
import { getProgressService } from '@/src/progress';
import { routeAfterLevelReadiness } from '@/src/progress/batchMilestoneRoute';
import { getVocabularyService } from '@/src/vocabulary';
import { Radii, Spacing, Typography } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

function a1StatusTitle(status: CrossStoryA1Readiness['status']): string {
  if (status === 'CONFIDENT') return 'Very ready';
  if (status === 'READY') return 'Ready';
  if (status === 'APPROACHING') return 'Almost there';
  return 'Keep going';
}

export default function LevelReadinessScreen() {
  const { fromChapter } = useLocalSearchParams<{ fromChapter?: string }>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [busy, setBusy] = useState(false);
  const [readiness, setReadiness] = useState<LevelReadiness | null>(null);
  const [crossA1, setCrossA1] = useState<CrossStoryA1Readiness | null>(null);
  const chapterNumber = fromChapter ? Number(fromChapter) : 20;
  const a1Mode = chapterNumber < 24;

  useEffect(() => {
    void (async () => {
      const progress = await getProgressService().getOrCreate();
      const profile = await getAdaptiveService().buildProfile(progress);
      setReadiness(getLevelReadinessService().evaluate(profile, progress));
      if (chapterNumber < 24) {
        const vocabulary = await getVocabularyService().getState();
        setCrossA1(await evaluateLearnerCrossStoryA1({ vocabulary }));
      } else {
        setCrossA1(null);
      }
    })();
  }, [chapterNumber]);

  const copy =
    chapterNumber >= 24
      ? {
          eyebrow: 'Continue reading',
          title: 'Luca\'s story opens up.',
          body: 'The next chapters are a little longer, with more past tense — the same story, told with more Italian.',
          tryLabel: 'Continue',
          stayLabel: 'Browse other stories',
          nextChapter: 25,
        }
      : {
          eyebrow: 'Continue reading',
          title: crossA1 ? a1StatusTitle(crossA1.status) : 'Ready for more',
          body: crossA1?.message ?? 'The next chapters ask a little more of you — same story, richer language.',
          tryLabel: 'Continue',
          stayLabel: 'Browse other stories',
          nextChapter: 21,
        };

  const onTry = async () => {
    if (busy) return;
    if (a1Mode && crossA1 && !crossA1.canChooseNext) return;
    setBusy(true);
    try {
      const progress = await getProgressService().getOrCreate();
      const profile = await getAdaptiveService().buildProfile(progress);
      await getLevelReadinessService().chooseNext(profile);
      const speakRoute = routeAfterLevelReadiness(LUCA_STORY_ID, chapterNumber);
      if (speakRoute) {
        router.replace(speakRoute);
        return;
      }
      const next = getChapterByNumber(copy.nextChapter);
      if (next) {
        await getProgressService().openChapter(next.id);
        router.replace(readerHref(LUCA_STORY_ID, next.id));
      } else {
        router.replace('/(tabs)/stories' as Href);
      }
    } finally {
      setBusy(false);
    }
  };

  const onStay = () => {
    router.replace('/(tabs)/stories' as Href);
  };

  const showA1Try = !a1Mode || Boolean(crossA1?.canChooseNext);

  return (
    <AtmosphereBackground>
      <Stack.Screen options={{ title: 'Next stories', headerBackVisible: false }} />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: Spacing.lg, paddingBottom: insets.bottom + Spacing.xl },
        ]}>
        {!readiness || (a1Mode && !crossA1) ? (
          <ActivityIndicator color={colors.tint} />
        ) : (
          <>
            <Text style={[Typography.chapterEyebrow, { color: colors.tint }]}>{copy.eyebrow}</Text>
            <Text style={[Typography.heroTitle, { color: colors.text, marginTop: Spacing.sm }]}>
              {copy.title}
            </Text>
            <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.md }]}>
              {copy.body}
            </Text>
            {!a1Mode ? (
              <Text style={[Typography.caption, { color: colors.textMuted, marginTop: Spacing.md }]}>
                {readiness.message}
              </Text>
            ) : null}

            {a1Mode && crossA1 ? (
              <View style={{ marginTop: Spacing.xl, gap: Spacing.sm }}>
                {crossA1.groups.map((group) => (
                  <Text key={group.id} style={[Typography.body, { color: colors.text }]}>
                    {group.met ? '✓' : '○'}  {group.label}
                  </Text>
                ))}
                {crossA1.reasons[0] ? (
                  <Text style={[Typography.caption, { color: colors.textMuted, marginTop: Spacing.sm }]}>
                    {crossA1.reasons[0]}
                  </Text>
                ) : null}
              </View>
            ) : null}

            <View style={{ marginTop: Spacing.xl, gap: Spacing.sm }}>
              {showA1Try ? (
                <Pressable
                  disabled={busy}
                  onPress={() => void onTry()}
                  style={({ pressed }) => [
                    styles.primaryBtn,
                    { backgroundColor: colors.buttonPrimary, opacity: pressed || busy ? 0.88 : 1 },
                  ]}>
                  <Text style={[Typography.button, { color: colors.onButtonPrimary }]}>{copy.tryLabel}</Text>
                </Pressable>
              ) : null}
              <Pressable
                onPress={onStay}
                style={({ pressed }) => [
                  styles.secondaryBtn,
                  { borderColor: colors.border, opacity: pressed ? 0.88 : 1 },
                ]}>
                <Text style={[Typography.button, { color: colors.text }]}>{copy.stayLabel}</Text>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>
    </AtmosphereBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.lg,
  },
  primaryBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radii.md,
  },
  secondaryBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
