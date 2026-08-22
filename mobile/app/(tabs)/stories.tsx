import { router, useFocusEffect, type Href } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AtmosphereBackground } from '@/src/components/AtmosphereBackground';
import { PathwayGate } from '@/src/components/pathway/PathwayGate';
import { ScreenContent } from '@/src/components/ScreenContent';
import { navLog } from '@/src/navigation/diagnostics';
import { deferAfterNavigation } from '@/src/navigation/deferAfterNavigation';
import {
  StoriesContinueHero,
  StoriesHeader,
  StoryList,
} from '@/src/components/storiesLibrary';
import type { ExtraStoryRow } from '@/src/components/storiesLevelInsert';
import { extraRowsFromCatalogStories } from '@/src/components/storiesLevelInsert';
import { LUCA_STORY_ID, buildLearnerJourney, getChapter, getContentBundle } from '@/src/content';
import { readerHref, speakSceneHref } from '@/src/content/storyHrefs';
import {
  a2PlusLockedHint,
  canAccessA2Plus,
  choosePathway,
  loadPathwayPrefs,
  markPathwayGateSeen,
  shouldShowPathwayGate,
  type PathwayPrefs,
} from '@/src/pathway';
import type { PathwayDefinition } from '@/src/pathway/paths';
import {
  getContinueReadingTarget,
  homeContinuePresentation,
  type ContinueReadingTarget,
} from '@/src/progress/continueReading';
import { getProgressService } from '@/src/progress';
import { loadStoryProgressView, useReadingProgress } from '@/src/progress/useReadingProgress';
import { useLayout } from '@/src/theme/useLayout';
import { Spacing } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

export default function StoriesScreen() {
  const { colors, type } = useTheme();
  const insets = useSafeAreaInsets();
  const layout = useLayout();
  const journey = useMemo(() => buildLearnerJourney(), []);
  const a1 = journey.find((band) => band.cefrLevel === 'A1');
  const a2plus = journey.find((band) => band.cefrLevel === 'A2+');
  const preRomeStories = a1?.groups.find((group) => !group.chapterRange)?.stories ?? [];
  const a2PlusStories = a2plus?.groups.flatMap((group) => group.stories) ?? [];
  const { story, progress, chapterStatuses, loading, error, refresh, service } =
    useReadingProgress(LUCA_STORY_ID);
  const [continueTarget, setContinueTarget] = useState<ContinueReadingTarget | null>(null);
  const [beforeRomeRows, setBeforeRomeRows] = useState<ExtraStoryRow[]>([]);
  const [a2PlusRows, setA2PlusRows] = useState<ExtraStoryRow[]>([]);
  const [a2PlusAccess, setA2PlusAccess] = useState(false);
  const [pathwayPrefs, setPathwayPrefs] = useState<PathwayPrefs>({
    pathwayGateSeen: false,
    primaryPathwayStoryId: null,
  });
  const [showPathwayGate, setShowPathwayGate] = useState(false);
  const secondaryLoadedRef = useRef(false);

  const refreshPathwayState = useCallback(async () => {
    const [access, prefs] = await Promise.all([canAccessA2Plus(), loadPathwayPrefs()]);
    setA2PlusAccess(access);
    setPathwayPrefs(prefs);
  }, []);

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
        progress: view.progress,
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
      navLog('stories focus');
      void refresh();
      void getContinueReadingTarget().then(setContinueTarget);
      void refreshPathwayState();
      if (secondaryLoadedRef.current) {
        void loadBeforeRome();
        void loadA2Plus();
        return;
      }
      const cancel = deferAfterNavigation(() => {
        secondaryLoadedRef.current = true;
        navLog('stories secondary load started');
        void loadBeforeRome().then(() => navLog('stories before-rome load completed'));
        void loadA2Plus().then(() => navLog('stories a2plus load completed'));
      });
      return cancel;
    }, [refresh, loadBeforeRome, loadA2Plus, refreshPathwayState]),
  );

  useEffect(() => {
    navLog('stories mount');
    return () => navLog('stories unmount');
  }, []);

  const showInitialSpinner = loading && chapterStatuses.length === 0;

  if (error) {
    return (
      <AtmosphereBackground>
        <View style={[styles.center, { padding: Spacing.lg }]}>
          <Text style={[type.label, { color: colors.danger }]}>{error}</Text>
        </View>
      </AtmosphereBackground>
    );
  }

  const fallbackChapter =
    getChapter(progress?.currentChapterId ?? story.chapters[0].id, LUCA_STORY_ID) ??
    getChapter(story.chapters[0].id, LUCA_STORY_ID)!;
  const lucaTarget =
    continueTarget?.storyId === LUCA_STORY_ID ? continueTarget : null;
  const heroChapter = lucaTarget
    ? getChapter(lucaTarget.chapterId, LUCA_STORY_ID) ?? fallbackChapter
    : fallbackChapter;
  const completed = progress ? service.getCompletedCount(progress) : 0;
  const heroPresentation =
    lucaTarget && heroChapter
      ? homeContinuePresentation(lucaTarget, heroChapter, story.chapters.length, completed)
      : null;
  const percent = progress ? service.getReadingPercentComplete(progress) : 0;
  const chapterPercent = progress
    ? service.getChapterReadingPercent(heroChapter, progress.lastSentenceId)
    : 0;

  const openLucaChapter = async (chapterId: string, listen = false) => {
    await service.openChapter(chapterId);
    router.push(readerHref(LUCA_STORY_ID, chapterId, listen, listen));
  };

  const continueLuca = async (listen = false) => {
    if (!lucaTarget) {
      await openLucaChapter(fallbackChapter.id, listen);
      return;
    }
    if (lucaTarget.nextAction.kind === 'grammar') {
      router.push(
        `/grammar-note?story=${encodeURIComponent(LUCA_STORY_ID)}&chapter=${lucaTarget.nextAction.batchEnd}&returnTo=stories` as Href,
      );
      return;
    }
    if (lucaTarget.nextAction.kind === 'recap') {
      router.push(
        `/batch-recap?story=${encodeURIComponent(LUCA_STORY_ID)}&chapter=${lucaTarget.nextAction.batchEnd}&returnTo=stories` as Href,
      );
      return;
    }
    await openLucaChapter(lucaTarget.nextAction.chapterId, listen);
  };

  const openStoryChapter = async (storyId: string, chapterId: string) => {
    await getProgressService(storyId).openChapter(chapterId);
    router.push(readerHref(storyId, chapterId));
  };

  const openPathwayStory = async (pathway: PathwayDefinition, openReader: boolean) => {
    if (pathway.status !== 'available' || !pathway.storyId) return;
    const prefs = await choosePathway(pathway.id, pathway.storyId);
    setPathwayPrefs(prefs);
    setShowPathwayGate(false);
    if (!openReader) return;
    const bundle = getContentBundle(pathway.storyId);
    const firstChapterId = bundle.story.chapters[0]?.id;
    if (!firstChapterId) return;
    await openStoryChapter(pathway.storyId, firstChapterId);
  };

  const onPathwayNotNow = async () => {
    const prefs = await markPathwayGateSeen();
    setPathwayPrefs(prefs);
    setShowPathwayGate(false);
  };

  const onA2PlusTabFocus = useCallback(() => {
    void shouldShowPathwayGate().then((show) => {
      if (show) setShowPathwayGate(true);
    });
  }, []);

  const resolvedA2PlusRows =
    a2PlusStories.length > 0 && a2PlusRows.length > 0
      ? a2PlusRows
      : a2PlusStories.length > 0
        ? extraRowsFromCatalogStories(a2PlusStories, 'A2+')
        : [];

  return (
    <AtmosphereBackground>
      <PathwayGate
        visible={showPathwayGate}
        onBeginPathway={(pathway) => void openPathwayStory(pathway, true)}
        onNotNow={() => void onPathwayNotNow()}
      />
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

          {showInitialSpinner ? (
            <View style={[styles.center, { minHeight: 240 }]}>
              <ActivityIndicator color={colors.tint} />
            </View>
          ) : (
            <>
          <StoriesContinueHero
            chapterNumber={heroPresentation?.progressChapterNumber ?? heroChapter.number}
            chapterTitleIt={heroPresentation?.title ?? heroChapter.titleIt}
            storyTitleIt={story.titleIt}
            percentComplete={percent}
            chapterPercent={chapterPercent}
            hasProgress={Boolean(progress)}
            eyebrow={heroPresentation?.eyebrow}
            subtitle={
              heroPresentation && heroPresentation.title !== heroChapter.titleIt
                ? heroPresentation.subtitle
                : undefined
            }
            onRead={() => void continueLuca()}
            onListen={() => void continueLuca(true)}
          />

          <StoryList
            lucaTitleIt={story.titleIt}
            chapterStatuses={chapterStatuses}
            currentChapterId={lucaTarget?.nextAction.kind === 'chapter'
              ? lucaTarget.nextAction.chapterId
              : progress?.currentChapterId ?? heroChapter.id}
            progress={progress}
            beforeRomeRows={beforeRomeRows}
            a2PlusRows={resolvedA2PlusRows}
            a2PlusAccess={a2PlusAccess}
            a2PlusLockedHint={a2PlusLockedHint()}
            primaryPathwayStoryId={pathwayPrefs.primaryPathwayStoryId}
            onOpenChapter={(chapterId, listen) => void openLucaChapter(chapterId, listen)}
            onOpenStoryChapter={(storyId, chapterId) => void openStoryChapter(storyId, chapterId)}
            onOpenGrammar={(storyId, batchEnd) => {
              router.push(
                `/grammar-note?story=${encodeURIComponent(storyId)}&chapter=${batchEnd}&returnTo=stories` as Href,
              );
            }}
            onOpenRecap={(storyId, batchEnd) => {
              router.push(
                `/batch-recap?story=${encodeURIComponent(storyId)}&chapter=${batchEnd}&returnTo=stories` as Href,
              );
            }}
            onOpenSpeak={(storyId, sceneId) => {
              router.push(speakSceneHref(storyId, sceneId, 'stories'));
            }}
            onSelectPathway={(pathway) => void openPathwayStory(pathway, false)}
            onA2PlusTabFocus={onA2PlusTabFocus}
          />
            </>
          )}
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
