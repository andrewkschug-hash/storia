import { router, useFocusEffect, type Href } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getAccount, type LocalAccount } from '@/src/account/storage';
import { AtmosphereBackground } from '@/src/components/AtmosphereBackground';
import { AvatarBadge } from '@/src/components/AvatarBadge';
import { ContinueReadingCard } from '@/src/components/ContinueReadingCard';
import { ReviewNudge } from '@/src/components/ReviewNudge';
import { ScreenContent } from '@/src/components/ScreenContent';
import { readerHref } from '@/src/content/storyHrefs';
import { useContinueReading } from '@/src/progress/useContinueReading';
import { hasCompletedOnboarding } from '@/src/onboarding/storage';
import { useVocabulary } from '@/src/vocabulary/useVocabulary';
import { useLayout } from '@/src/theme/useLayout';
import { Radii, Spacing } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

export default function HomeScreen() {
  const { colors, type } = useTheme();
  const insets = useSafeAreaInsets();
  const layout = useLayout();
  const {
    target,
    chapter,
    story,
    progress,
    completed,
    percent,
    chapterPercent,
    loading,
    error,
    refresh,
    service,
  } = useContinueReading();
  const { home, refresh: refreshVocab, summary } = useVocabulary(progress);
  const [gateReady, setGateReady] = useState(false);
  const [account, setAccount] = useState<LocalAccount | null>(null);

  useFocusEffect(
    useCallback(() => {
      void refresh();
      void refreshVocab();
      void getAccount().then((next) => {
        if (next) setAccount(next);
      });
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
      setAccount(local);
      const onboarded = await hasCompletedOnboarding();
      if (!onboarded) {
        router.replace('/onboarding' as Href);
        return;
      }
      setGateReady(true);
    })();
  }, []);

  if (!gateReady || loading || !target || !chapter || !story) {
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

  const brandSize = layout.isPhone ? (layout.width < 360 ? 34 : 38) : 42;

  return (
    <AtmosphereBackground>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + Spacing.lg,
          paddingBottom: insets.bottom + Spacing.xl,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}>
        <ScreenContent maxWidth={680}>
          <View style={styles.topRow}>
            <Text
              style={[
                type.brand,
                { color: colors.text, fontSize: brandSize, lineHeight: brandSize + 6 },
              ]}>
              Storia
            </Text>
            {account ? (
              <Pressable
                onPress={() => router.push('/(tabs)/profile')}
                accessibilityRole="button"
                accessibilityLabel="Open profile"
                style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}>
                <AvatarBadge avatarId={account.avatarId} size="sm" />
              </Pressable>
            ) : null}
          </View>

          <View style={styles.section}>
            <ContinueReadingCard
              chapterTitleIt={chapter.titleIt}
              storyTitleIt={target.storyTitleIt}
              isStart={target.isStart}
              progress={{
                storyId: story.id,
                chapterId: chapter.id,
                chapterNumber: chapter.number,
                totalChapters: story.chapters.length,
                percentComplete: percent,
                chapterPercentComplete: chapterPercent,
                chaptersCompleted: completed,
                storiesCompleted: completed === story.chapters.length ? 1 : 0,
                wordsEncountered: summary?.encountered ?? 0,
                wordsFamiliar: summary?.familiar ?? 0,
                readingStreakDays: progress?.streakDays ?? 0,
              }}
              onContinue={async () => {
                if (!service) return;
                await service.openChapter(chapter.id);
                router.push(readerHref(story.id, chapter.id));
              }}
            />
            <Pressable
              accessibilityRole="link"
              accessibilityLabel="Browse stories"
              onPress={() => router.push('/(tabs)/stories')}
              style={({ pressed }) => [
                styles.browseLink,
                { opacity: pressed ? 0.7 : 1 },
              ]}>
              <Text style={[type.label, { color: colors.tint }]}>Browse stories</Text>
            </Pressable>
          </View>

          <View
            style={[
              styles.statsRow,
              styles.section,
              layout.width < 360 && styles.statsRowCompact,
            ]}>
            <StatChip label="Words" value={String(summary?.encountered ?? 0)} colors={colors} />
            <StatChip
              label="Streak"
              value={(progress?.streakDays ?? 0) > 0 ? `${progress?.streakDays}d` : '—'}
              colors={colors}
              showFlame
            />
            <StatChip
              label="Chapters"
              value={`${completed}/${story.chapters.length}`}
              colors={colors}
            />
          </View>

          {home ? (
            <View style={styles.section}>
              <ReviewNudge copy={home} />
            </View>
          ) : null}

          {typeof __DEV__ !== 'undefined' && __DEV__ ? (
            <View style={[styles.devSection, { borderColor: colors.border }]}>
              <Text style={[type.caption, { color: colors.textMuted }]}>Developer</Text>
              <DevLink label="Voice Lab" href="/voice-lab" colors={colors} />
              <DevLink label="Audio studio" href="/audio-studio" colors={colors} />
              <DevLink label="CEFR audit" href="/cefr-audit" colors={colors} />
              <DevLink label="Adaptive debug" href="/adaptive-debug" colors={colors} />
            </View>
          ) : null}
        </ScreenContent>
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
  const { type } = useTheme();
  return (
    <View
      style={[
        styles.statChip,
        { backgroundColor: colors.readerSurface, borderColor: colors.border },
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
        <Text style={[type.heroTitle, { color: colors.text, fontSize: 22 }]}>{value}</Text>
      </View>
      <Text style={[type.caption, { color: colors.textMuted, marginTop: 2 }]}>{label}</Text>
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
  const { type } = useTheme();
  return (
    <Pressable onPress={() => router.push(href)} style={{ marginTop: Spacing.xs }}>
      <Text style={[type.caption, { color: colors.textMuted }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  section: {
    marginTop: Spacing.lg,
  },
  browseLink: {
    alignSelf: 'flex-start',
    marginTop: Spacing.md,
    minHeight: 44,
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statsRowCompact: {
    flexWrap: 'wrap',
  },
  statChip: {
    flex: 1,
    minWidth: 96,
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
