import { router, useFocusEffect, type Href } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AtmosphereBackground } from '@/src/components/AtmosphereBackground';
import { ScreenContent } from '@/src/components/ScreenContent';
import {
  StoriesContinueHero,
  StoriesHeader,
  StoryList,
} from '@/src/components/storiesLibrary';
import type { ExtraStoryRow } from '@/src/components/storiesLevelInsert';
import { extraRowsFromCatalogStories } from '@/src/components/storiesLevelInsert';
import { LUCA_STORY_ID, buildLearnerJourney, getChapter } from '@/src/content';
import { readerHref, speakSceneHref } from '@/src/content/storyHrefs';
import { getProgressService } from '@/src/progress';
import { loadStoryProgressView, useReadingProgress } from '@/src/progress/useReadingProgress';
import { useLayout } from '@/src/theme/useLayout';
import { Spacing } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

export default function StoriesScreen() {
  const { colors, type } = useTheme();
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
        eyebrow: 'Hometown',
        chapters: view.chapters,
      });
    }
    setBeforeRomeRows(next);
  }, [preRomeStories.map((item) => item.id).join('|')]);

  const loadA2Plus = useCallback(async () => {
    const next: ExtraStoryRow[] = [];
    try {
      for (const item of a2PlusStories) {
        const view = await loadStoryProgressView(item.id);
        next.push({
          storyId: item.id,
          titleIt: item.titleIt,
          completed: view.chapters.filter((chapter) => chapter.status === 'completed').length,
          total: item.chapterCount,
          eyebrow: 'A2+',
          chapters: view.chapters,
        });
      }
      setA2PlusRows(next);
    } catch {
      setA2PlusRows(extraRowsFromCatalogStories(a2PlusStories, 'A2+'));
    }
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

  const openLucaChapter = async (chapterId: string, listen = false) => {
    await service.openChapter(chapterId);
    router.push(readerHref(LUCA_STORY_ID, chapterId, listen));
  };

  const openStoryChapter = async (storyId: string, chapterId: string) => {
    await getProgressService(storyId).openChapter(chapterId);
    router.push(readerHref(storyId, chapterId));
  };

  const resolvedA2PlusRows =
    a2PlusStories.length > 0 && a2PlusRows.length > 0
      ? a2PlusRows
      : a2PlusStories.length > 0
        ? extraRowsFromCatalogStories(a2PlusStories, 'A2+')
        : [];

  return (
    <AtmosphereBackground>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + Spacing.lg,
          paddingBottom: insets.bottom + Spacing.xl,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}>
        <ScreenContent
          maxWidth={680}
          style={{ paddingHorizontal: layout.isPhone ? 20 : 24 }}>
          <StoriesHeader />

          <StoriesContinueHero
            chapterNumber={continueChapter.number}
            chapterTitleIt={continueChapter.titleIt}
            storyTitleIt={story.titleIt}
            percentComplete={percent}
            chapterPercent={chapterPercent}
            hasProgress={Boolean(progress)}
            onRead={() => void openLucaChapter(continueChapter.id)}
            onListen={() => void openLucaChapter(continueChapter.id, true)}
          />

          <StoryList
            lucaTitleIt={story.titleIt}
            chapterStatuses={chapterStatuses}
            currentChapterId={progress?.currentChapterId ?? continueChapter.id}
            progress={progress}
            beforeRomeRows={beforeRomeRows}
            a2PlusRows={resolvedA2PlusRows}
            onOpenChapter={(chapterId, listen) => void openLucaChapter(chapterId, listen)}
            onOpenStoryChapter={(storyId, chapterId) => void openStoryChapter(storyId, chapterId)}
            onOpenGrammar={(batchEnd) => {
              router.push(
                `/grammar-note?story=${encodeURIComponent(LUCA_STORY_ID)}&chapter=${batchEnd}&returnTo=stories` as Href,
              );
            }}
            onOpenRecap={(batchEnd) => {
              router.push(
                `/batch-recap?story=${encodeURIComponent(LUCA_STORY_ID)}&chapter=${batchEnd}&returnTo=stories` as Href,
              );
            }}
            onOpenSpeak={(sceneId) => {
              router.push(speakSceneHref(LUCA_STORY_ID, sceneId, 'stories'));
            }}
          />
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
  },
});
