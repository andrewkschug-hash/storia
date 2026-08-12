import { router, useFocusEffect, type Href } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getAccount } from '@/src/account/storage';
import { AtmosphereBackground } from '@/src/components/AtmosphereBackground';
import { ContinueReadingCard } from '@/src/components/ContinueReadingCard';
import { ReviewNudge } from '@/src/components/ReviewNudge';
import { getChapter } from '@/src/content';
import { useReadingProgress } from '@/src/progress/useReadingProgress';
import { hasCompletedOnboarding } from '@/src/onboarding/storage';
import { useVocabulary } from '@/src/vocabulary/useVocabulary';
import { Radii, Spacing, Typography } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

export default function HomeScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { story, progress, loading, error, service, refresh } = useReadingProgress();
  const { home, refresh: refreshVocab, summary } = useVocabulary(progress);
  const [gateReady, setGateReady] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void refresh();
      void refreshVocab();
    }, [refresh, refreshVocab]),
  );

  useEffect(() => {
    // Gate order: local account → learner onboarding → tabs.
    void (async () => {
      const local = await getAccount();
      if (!local) {
        router.replace('/account' as Href);
        return;
      }
      const onboarded = await hasCompletedOnboarding();
      if (!onboarded) {
        router.replace('/onboarding' as Href);
        return;
      }
      setGateReady(true);
    })();
  }, []);

  if (!gateReady || loading || !progress) {
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
  const completed = service.getCompletedCount(progress);
  const percent = service.getReadingPercentComplete(progress);
  const chapterPercent = service.getChapterReadingPercent(continueChapter, progress.lastSentenceId);

  return (
    <AtmosphereBackground>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Spacing.lg, paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}>
        <Text style={[Typography.brand, { color: colors.text }]}>Storia</Text>
        <Text style={[Typography.heroTitle, { color: colors.text, marginTop: Spacing.sm }]}>
          {story.titleIt}
        </Text>
        <Text
          style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.sm }]}
          numberOfLines={1}>
          {story.synopsis}
        </Text>

        <View style={styles.section}>
          <ContinueReadingCard
            chapterTitleIt={continueChapter.titleIt}
            progress={{
              storyId: story.id,
              chapterId: continueChapter.id,
              chapterNumber: continueChapter.number,
              totalChapters: story.chapters.length,
              percentComplete: percent,
              chapterPercentComplete: chapterPercent,
              chaptersCompleted: completed,
              storiesCompleted: completed === story.chapters.length ? 1 : 0,
              wordsEncountered: summary?.encountered ?? 0,
              wordsFamiliar: summary?.familiar ?? 0,
              readingStreakDays: progress.streakDays,
            }}
            onContinue={async () => {
              await service.openChapter(continueChapter.id);
              router.push(`/reader/${continueChapter.id}`);
            }}
          />
          <Pressable
            accessibilityRole="link"
            accessibilityLabel="Browse all chapters"
            onPress={() => router.push('/(tabs)/stories')}
            style={({ pressed }) => [
              styles.browseLink,
              { opacity: pressed ? 0.7 : 1 },
            ]}>
            <Text style={[Typography.label, { color: colors.tint }]}>Browse all chapters</Text>
          </Pressable>
        </View>

        <View style={[styles.statsRow, styles.section]}>
          <StatChip label="Words" value={String(summary?.encountered ?? 0)} colors={colors} />
          <StatChip
            label="Streak"
            value={progress.streakDays > 0 ? `${progress.streakDays}d` : '—'}
            colors={colors}
            showFlame
          />
          <StatChip label="Chapters" value={`${completed}/${story.chapters.length}`} colors={colors} />
        </View>

        {home ? (
          <View style={styles.section}>
            <ReviewNudge copy={home} />
          </View>
        ) : null}

        {typeof __DEV__ !== 'undefined' && __DEV__ ? (
          <View style={[styles.devSection, { borderColor: colors.border }]}>
            <Text style={[Typography.caption, { color: colors.textMuted }]}>Developer</Text>
            <DevLink label="Voice Lab" href="/voice-lab" colors={colors} />
            <DevLink label="Audio studio" href="/audio-studio" colors={colors} />
            <DevLink label="CEFR audit" href="/cefr-audit" colors={colors} />
            <DevLink label="Adaptive debug" href="/adaptive-debug" colors={colors} />
          </View>
        ) : null}
      </ScrollView>
    </AtmosphereBackground>
  );
}

function StatChip({
  label,
  value,
  colors,
  showFlame,
}: {
  label: string;
  value: string;
  colors: {
    backgroundElevated: string;
    border: string;
    text: string;
    textMuted: string;
    accent: string;
  };
  showFlame?: boolean;
}) {
  return (
    <View
      style={[
        styles.statChip,
        { backgroundColor: colors.backgroundElevated, borderColor: colors.border },
      ]}>
      <View style={styles.statValueRow}>
        {showFlame ? (
          <SymbolView
            name={{
              ios: 'flame.fill',
              android: 'local_fire_department',
              web: 'local_fire_department',
            }}
            tintColor={colors.accent}
            size={18}
          />
        ) : null}
        <Text style={[Typography.heroTitle, { color: colors.text, fontSize: 22 }]}>{value}</Text>
      </View>
      <Text style={[Typography.caption, { color: colors.textMuted, marginTop: 2 }]}>{label}</Text>
    </View>
  );
}

function DevLink({
  label,
  href,
  colors,
}: {
  label: string;
  href: Href;
  colors: { textMuted: string };
}) {
  return (
    <Pressable onPress={() => router.push(href)} style={{ marginTop: Spacing.xs }}>
      <Text style={[Typography.caption, { color: colors.textMuted }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.lg,
  },
  section: {
    marginTop: Spacing.xl,
  },
  browseLink: {
    alignSelf: 'flex-start',
    marginTop: Spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statChip: {
    flex: 1,
    borderRadius: Radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  devSection: {
    marginTop: Spacing.xxl,
    paddingTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
