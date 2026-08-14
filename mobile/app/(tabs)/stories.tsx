import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { A1StoryList } from '@/src/components/A1StoryList';
import { AtmosphereBackground } from '@/src/components/AtmosphereBackground';
import { ProgressBar } from '@/src/components/ProgressBar';
import { ScreenContent } from '@/src/components/ScreenContent';
import { StoriesLevelList } from '@/src/components/StoriesLevelList';
import { LUCA_STORY_ID, buildLearnerJourney, getChapter } from '@/src/content';
import { readerHref } from '@/src/content/storyHrefs';
import { getProgressService } from '@/src/progress';
import { useReadingProgress } from '@/src/progress/useReadingProgress';
import { useLayout } from '@/src/theme/useLayout';
import { Radii, Spacing, Typography } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

export default function StoriesScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const layout = useLayout();
  const journey = buildLearnerJourney();
  const a1 = journey.find((band) => band.cefrLevel === 'A1');
  const preRomeGroups = a1?.groups.filter((group) => !group.chapterRange) ?? [];
  const { story, progress, chapterStatuses, loading, error, refresh, service } =
    useReadingProgress(LUCA_STORY_ID);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
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
          <Text style={[Typography.label, { color: colors.danger }]}>{error}</Text>
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
              Typography.heroTitle,
              {
                color: colors.text,
                fontSize: layout.isPhone ? 26 : 32,
                lineHeight: layout.isPhone ? 32 : 40,
              },
            ]}>
            Stories
          </Text>
          <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
            A1 breadth first, then Luca a Roma. Completing one story is not A1 mastery.
          </Text>

          {preRomeGroups.map((group) => (
            <A1StoryList
              key={group.narrativeArc.id}
              eyebrow="A1 · Before Rome"
              title={group.narrativeArc.titleIt}
              caption="Suggested order. Start any story — they are not five levels."
              stories={group.stories.filter((item) => item.status === 'available')}
              colors={colors}
              onOpenChapter={(storyId, chapterId) => void openStoryChapter(storyId, chapterId)}
            />
          ))}

          <Text style={[Typography.chapterEyebrow, { color: colors.tint, marginTop: Spacing.xl }]}>
            Next in Luca&apos;s journey
          </Text>
          <Text style={[Typography.label, { color: colors.text, marginTop: Spacing.xs }]}>
            {story.titleIt}
          </Text>
          <Text style={[Typography.caption, { color: colors.textMuted, marginTop: Spacing.xs }]}>
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
            <Text style={[Typography.chapterEyebrow, { color: colors.tint }]}>Continue Luca a Roma</Text>
            <Text style={[Typography.label, { color: colors.text, marginTop: Spacing.sm }]}>
              Capitolo {continueChapter.number} · {continueChapter.titleIt}
            </Text>
            {chapterPercent > 0 && chapterPercent < 100 ? (
              <Text style={[Typography.caption, { color: colors.textMuted, marginTop: 4 }]}>
                {chapterPercent}% through this chapter
              </Text>
            ) : null}
            <View style={[styles.actionRow, layout.width < 360 && styles.actionRowCompact]}>
              <Pressable
                onPress={() => void openLucaChapter(continueChapter.id)}
                style={({ pressed }) => [
                  styles.primaryBtn,
                  { backgroundColor: colors.tint, opacity: pressed ? 0.88 : 1 },
                ]}>
                <Text style={[Typography.button, { color: '#F7FAF9', fontSize: 14 }]}>Read</Text>
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
                <Text style={[Typography.label, { color: colors.text }]}>Listen</Text>
              </Pressable>
            </View>
          </View>

          <StoriesLevelList
            arcs={story.arcs}
            chapters={chapterStatuses}
            currentChapterId={progress?.currentChapterId ?? continueChapter.id}
            colors={colors}
            onOpenChapter={(chapterId, listen) => void openLucaChapter(chapterId, listen)}
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
