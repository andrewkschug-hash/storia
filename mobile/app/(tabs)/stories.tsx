import { router, useFocusEffect, type Href } from 'expo-router';
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

import { AtmosphereBackground } from '@/src/components/AtmosphereBackground';
import { ProgressBar } from '@/src/components/ProgressBar';
import { ScreenContent } from '@/src/components/ScreenContent';
import { StoriesLevelList } from '@/src/components/StoriesLevelList';
import { getChapter, getContentBundle } from '@/src/content';
import { useReadingProgress } from '@/src/progress/useReadingProgress';
import { useLayout } from '@/src/theme/layout';
import { Radii, Spacing, Typography } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

export default function StoriesScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const layout = useLayout();
  const { story, progress, chapterStatuses, loading, error, refresh, service } = useReadingProgress();

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  if (loading || !progress) {
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
    getChapter(progress.currentChapterId) ?? getChapter(story.chapters[0].id)!;
  const percent = service.getReadingPercentComplete(progress);
  const chapterPercent = service.getChapterReadingPercent(continueChapter, progress.lastSentenceId);
  const completed = service.getCompletedCount(progress);

  const openChapter = async (chapterId: string, listen = false) => {
    await service.openChapter(chapterId);
    router.push((listen ? `/reader/${chapterId}?listen=1` : `/reader/${chapterId}`) as Href);
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
            {story.titleIt}
          </Text>
          <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
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
            <Text style={[Typography.chapterEyebrow, { color: colors.tint }]}>Continue</Text>
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
                onPress={() => void openChapter(continueChapter.id)}
                style={({ pressed }) => [
                  styles.primaryBtn,
                  { backgroundColor: colors.tint, opacity: pressed ? 0.88 : 1 },
                ]}>
                <Text style={[Typography.button, { color: '#F7FAF9', fontSize: 14 }]}>Read</Text>
              </Pressable>
              <Pressable
                onPress={() => void openChapter(continueChapter.id, true)}
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
            arcs={getContentBundle().story.arcs}
            chapters={chapterStatuses}
            currentChapterId={progress.currentChapterId}
            colors={colors}
            onOpenChapter={(chapterId, listen) => void openChapter(chapterId, listen)}
          />
        </ScreenContent>
      </ScrollView>
    </AtmosphereBackground>
  );
}

const styles = StyleSheet.create({
  continueCard: {
    marginTop: Spacing.xl,
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
