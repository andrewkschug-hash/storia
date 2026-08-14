import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AtmosphereBackground } from '@/src/components/AtmosphereBackground';
import { ProgressBar } from '@/src/components/ProgressBar';
import { ScreenContent } from '@/src/components/ScreenContent';
import { StoriesLevelList, type ExtraStoryRow } from '@/src/components/StoriesLevelList';
import { LUCA_STORY_ID, buildLearnerJourney, getChapter } from '@/src/content';
import { readerHref } from '@/src/content/storyHrefs';
import { getProgressService } from '@/src/progress';
import { loadStoryProgressView, useReadingProgress } from '@/src/progress/useReadingProgress';
import { useLayout } from '@/src/theme/useLayout';
import { Radii, Spacing } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

export default function StoriesScreen() {
  const { colors, type, minTouchTarget } = useTheme();
  const insets = useSafeAreaInsets();
  const layout = useLayout();
  const journey = buildLearnerJourney();
  const a1 = journey.find((band) => band.cefrLevel === 'A1');
  const a2plus = journey.find((band) => band.cefrLevel === 'A2+');
  const preRomeStories = a1?.groups.find((group) => !group.chapterRange)?.stories ?? [];
  const a2PlusStories = a2plus?.groups.flatMap((group) => group.stories) ?? [];
  const { story, progress, chapterStatuses, loading, error, refresh, service } =
    useReadingProgress(LUCA_STORY_ID);
  const [beforeRomeRows, setBeforeRomeRows] = useState<ExtraStoryRow[]>([]);
  const [a2PlusRows, setA2PlusRows] = useState<ExtraStoryRow[]>([]);

  const loadBeforeRome = useCallback(async () => {
    const next: ExtraStoryRow[] = [];
    for (const item of preRomeStories) {
      const view = await loadStoryProgressView(item.id);
      next.push({
        storyId: item.id,
        titleIt: item.titleIt,
        completed: view.chapters.filter((chapter) => chapter.status === 'completed').length,
        total: item.chapterCount,
        chapters: view.chapters,
      });
    }
    setBeforeRomeRows(next);
  }, [preRomeStories.map((item) => item.id).join('|')]);

  const loadA2Plus = useCallback(async () => {
    const next: ExtraStoryRow[] = [];
    for (const item of a2PlusStories) {
      const view = await loadStoryProgressView(item.id);
      next.push({
        storyId: item.id,
        titleIt: item.titleIt,
        completed: view.chapters.filter((chapter) => chapter.status === 'completed').length,
        total: item.chapterCount,
        chapters: view.chapters,
      });
    }
    setA2PlusRows(next);
  }, [a2PlusStories.map((item) => item.id).join('|')]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
      void loadBeforeRome();
      void loadA2Plus();
    }, [refresh, loadBeforeRome, loadA2Plus]),
  );

  if (loading) {
    return (
      <AtmosphereBackground>
        <View style={styles.center}>
          <ActivityIndicator color={colors.tint} />
        </View>
      </AtmosphereBackground>
    );
  }

  if (error) {
    return (
      <AtmosphereBackground>
        <View style={[styles.center, { padding: Spacing.lg }]}>
          <Text style={[type.label, { color: colors.danger }]}>{error}</Text>
        </View>
      </AtmosphereBackground>
    );
  }

  const continueChapter =
    getChapter(progress?.currentChapterId ?? story.chapters[0].id, LUCA_STORY_ID) ??
    getChapter(story.chapters[0].id, LUCA_STORY_ID)!;
  const percent = progress ? service.getReadingPercentComplete(progress) : 0;
  const chapterPercent = progress
    ? service.getChapterReadingPercent(continueChapter, progress.lastSentenceId)
    : 0;
  const completed = progress ? service.getCompletedCount(progress) : 0;

  const openLucaChapter = async (chapterId: string, listen = false) => {
    await service.openChapter(chapterId);
    router.push(readerHref(LUCA_STORY_ID, chapterId, listen));
  };

  const openStoryChapter = async (storyId: string, chapterId: string) => {
    await getProgressService(storyId).openChapter(chapterId);
    router.push(readerHref(storyId, chapterId));
  };

  return (
    <AtmosphereBackground>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + Spacing.lg,
          paddingBottom: insets.bottom + Spacing.xl,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}>
        <ScreenContent>
          <Text
            style={[
              type.heroTitle,
              {
                color: colors.text,
                fontSize: layout.isPhone ? 26 : 32,
                lineHeight: layout.isPhone ? 32 : 40,
              },
            ]}>
            Stories
          </Text>
          <Text style={[type.body, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
            Start with Luca a Roma. Luca Before Rome is hometown background.
          </Text>

          <Text style={[type.chapterEyebrow, { color: colors.tint, marginTop: Spacing.xl }]}>
            Start here
          </Text>
          <Text style={[type.label, { color: colors.text, marginTop: Spacing.xs }]}>
            {story.titleIt}
          </Text>
          <Text style={[type.caption, { color: colors.textMuted, marginTop: Spacing.xs }]}>
            {completed} of {story.chapters.length} chapters finished · {percent}% through the story
          </Text>
          <View style={{ marginTop: Spacing.md }}>
            <ProgressBar progress={percent / 100} height={8} />
          </View>

          <View
            style={[
              styles.continueCard,
              {
                backgroundColor: colors.backgroundElevated,
                borderColor: colors.border,
              },
            ]}>
            <Text style={[type.chapterEyebrow, { color: colors.tint }]}>
              {progress ? 'Continue Luca a Roma' : 'Start Luca a Roma'}
            </Text>
            <Text style={[type.label, { color: colors.text, marginTop: Spacing.sm }]}>
              Capitolo {continueChapter.number} · {continueChapter.titleIt}
            </Text>
            {chapterPercent > 0 && chapterPercent < 100 ? (
              <Text style={[type.caption, { color: colors.textMuted, marginTop: 4 }]}>
                {chapterPercent}% through this chapter
              </Text>
            ) : null}
            <View style={[styles.actionRow, layout.width < 360 && styles.actionRowCompact]}>
              <Pressable
                onPress={() => void openLucaChapter(continueChapter.id)}
                style={({ pressed }) => [
                  styles.primaryBtn,
                { backgroundColor: colors.tint, opacity: pressed ? 0.88 : 1, minHeight: minTouchTarget },
                ]}>
                <Text style={[type.button, { color: colors.onTint, fontSize: 14 }]}>Read</Text>
              </Pressable>
              <Pressable
                onPress={() => void openLucaChapter(continueChapter.id, true)}
                style={({ pressed }) => [
                  styles.secondaryBtn,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                    opacity: pressed ? 0.88 : 1,
                  },
                ]}>
                <Text style={[type.label, { color: colors.text }]}>Listen</Text>
              </Pressable>
            </View>
          </View>

          <StoriesLevelList
            arcs={story.arcs}
            chapters={chapterStatuses}
            currentChapterId={progress?.currentChapterId ?? continueChapter.id}
            colors={colors}
            extraSections={[
              ...(beforeRomeRows.length
                ? [
                    {
                      afterArcId: 'luca-a-roma-a1',
                      id: 'luca-prima-di-roma',
                      cefrLevel: 'A1',
                      title: 'Luca Before Rome',
                      stories: beforeRomeRows,
                    },
                  ]
                : []),
              ...(a2PlusRows.length
                ? [
                    {
                      afterArcId: 'luca-a-roma-a2',
                      id: 'a2-plus-genre-paths',
                      cefrLevel: 'A2+',
                      title: 'La casa delle finestre',
                      stories: a2PlusRows,
                    },
                  ]
                : []),
            ]}
            onOpenChapter={(chapterId, listen) => void openLucaChapter(chapterId, listen)}
            onOpenStoryChapter={(storyId, chapterId) => void openStoryChapter(storyId, chapterId)}
          />
        </ScreenContent>
      </ScrollView>
    </AtmosphereBackground>
  );
}

const styles = StyleSheet.create({
  continueCard: {
    marginTop: Spacing.lg,
    borderRadius: Radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.lg,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  actionRowCompact: {
    flexWrap: 'wrap',
  },
  primaryBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 10,
    minWidth: 88,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    minWidth: 88,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
