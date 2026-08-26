import { router, useFocusEffect, type Href } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getAccount, type LocalAccount } from '@/src/account/storage';
import { AtmosphereBackground } from '@/src/components/AtmosphereBackground';
import { ContinueReadingCard } from '@/src/components/ContinueReadingCard';
import { GlobalLanguageHeader } from '@/src/components/GlobalLanguageHeader';
import { ReviewNudge } from '@/src/components/ReviewNudge';
import { ScreenContent } from '@/src/components/ScreenContent';
import { navLog } from '@/src/navigation/diagnostics';
import { navigateToContinueTarget } from '@/src/progress/continueNavigation';
import { homeContinuePresentation } from '@/src/progress/continueReading';
import { useContinueReading } from '@/src/progress/useContinueReading';
import { hasCompletedOnboarding } from '@/src/onboarding/storage';
import { useVocabulary } from '@/src/vocabulary/useVocabulary';
import { useLayout } from '@/src/theme/useLayout';
import { Radii, Spacing } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

/** Avoid re-running account/onboarding gate on every Home tab remount. */
let homeGateComplete = false;

function getItalianGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buongiorno';
  if (hour < 18) return 'Buon pomeriggio';
  return 'Buonasera';
}

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
  } = useContinueReading();
  const { home, refresh: refreshVocab, summary } = useVocabulary(progress);
  const [gateReady, setGateReady] = useState(homeGateComplete);
  const [account, setAccount] = useState<LocalAccount | null>(null);
  const [continueError, setContinueError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      navLog('home focus');
      void refresh();
      void refreshVocab();
      void getAccount().then((next) => {
        if (next) setAccount(next);
      });
    }, [refresh, refreshVocab]),
  );

  useEffect(() => {
    navLog('home mount');
    return () => navLog('home unmount');
  }, []);

  useEffect(() => {
    if (homeGateComplete) {
      setGateReady(true);
      return;
    }
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
      homeGateComplete = true;
      setGateReady(true);
    })();
  }, []);

  const showBlockingSpinner = !gateReady || (loading && !target && !error);
  if (showBlockingSpinner) {
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

  if (!target || !chapter || !story) {
    return (
      <AtmosphereBackground>
        <View style={[styles.center, { padding: Spacing.lg, gap: Spacing.md }]}>
          <Text style={[type.body, { color: colors.textSecondary, textAlign: 'center' }]}>
            {error ??
              'Non siamo riusciti a caricare la tua storia. Sfoglia la biblioteca per continuare.'}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/(tabs)/stories')}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, minHeight: 44, justifyContent: 'center' })}>
            <Text style={[type.label, { color: colors.tint }]}>Sfoglia la biblioteca →</Text>
          </Pressable>
        </View>
      </AtmosphereBackground>
    );
  }

  const continuePresentation = homeContinuePresentation(
    target,
    chapter,
    story.chapters.length,
    completed,
  );
  const greeting = getItalianGreeting();

  return (
    <AtmosphereBackground>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + Spacing.md,
          paddingBottom: insets.bottom + Spacing.xl,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}>
        <ScreenContent maxWidth={680}>
          <GlobalLanguageHeader avatarId={account?.avatarId} />

          <View style={styles.greetingHeader}>
            <Text style={[type.chapterEyebrow, { color: colors.tint, letterSpacing: 1.6 }]}>
              {greeting.toUpperCase()}
            </Text>
            <Text
              style={[
                type.heroTitle,
                {
                  color: colors.text,
                  marginTop: Spacing.xs,
                  fontSize: layout.isPhone ? 28 : 34,
                  lineHeight: layout.isPhone ? 34 : 42,
                },
              ]}>
              Continua la tua storia
            </Text>
          </View>

          <View style={styles.section}>
            {continueError ? (
              <Text style={[type.caption, { color: colors.danger, marginBottom: Spacing.sm }]}>
                {continueError}
              </Text>
            ) : null}
            <ContinueReadingCard
              chapterTitleIt={continuePresentation.title}
              storyTitleIt={target.storyTitleIt}
              isStart={target.isStart}
              eyebrow={continuePresentation.eyebrow}
              subtitle={continuePresentation.subtitle}
              buttonLabel={continuePresentation.buttonLabel}
              progress={{
                storyId: story.id,
                chapterId: chapter.id,
                chapterNumber: continuePresentation.progressChapterNumber,
                totalChapters: story.chapters.length,
                percentComplete: percent,
                chapterPercentComplete: chapterPercent,
                chaptersCompleted: completed,
                storiesCompleted: completed === story.chapters.length ? 1 : 0,
                wordsEncountered: summary?.encountered ?? 0,
                wordsFamiliar: summary?.familiar ?? 0,
                readingStreakDays: progress?.streakDays ?? 0,
              }}
              onContinue={() => {
                setContinueError(null);
                void (async () => {
                  try {
                    await navigateToContinueTarget(target);
                  } catch (e) {
                    setContinueError(e instanceof Error ? e.message : String(e));
                  }
                })();
              }}
            />
          </View>

          <View style={[styles.editorialStatsBox, { backgroundColor: colors.backgroundElevated }]}>
            <Text style={[type.chapterEyebrow, { color: colors.textMuted, letterSpacing: 1.4 }]}>
              La tua lettura
            </Text>
            <View style={styles.editorialStatsLine}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: colors.text }]}>
                  {summary?.encountered ?? 0}
                </Text>
                <Text style={[type.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                  parole
                </Text>
              </View>
              <View style={[styles.verticalDivider, { backgroundColor: colors.divider }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: colors.text }]}>
                  {(progress?.streakDays ?? 0) > 0 ? `${progress?.streakDays}` : '0'}
                </Text>
                <Text style={[type.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                  giorni
                </Text>
              </View>
              <View style={[styles.verticalDivider, { backgroundColor: colors.divider }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: colors.text }]}>
                  {completed}
                </Text>
                <Text style={[type.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                  capitoli
                </Text>
              </View>
            </View>
          </View>

          {home ? (
            <View style={styles.section}>
              <ReviewNudge copy={home} />
            </View>
          ) : null}

          <View style={styles.browseSection}>
            <Pressable
              accessibilityRole="link"
              accessibilityLabel="Sfoglia la biblioteca"
              onPress={() => router.push('/(tabs)/stories')}
              style={({ pressed }) => [
                styles.browseLink,
                { opacity: pressed ? 0.7 : 1 },
              ]}>
              <Text style={[type.label, { color: colors.tint, fontFamily: 'Literata_600SemiBold' }]}>
                La biblioteca · Tutte le storie →
              </Text>
            </Pressable>
          </View>

          {typeof __DEV__ !== 'undefined' && __DEV__ ? (
            <View style={[styles.devSection, { borderTopColor: colors.divider }]}>
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
  greetingHeader: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  section: {
    marginTop: Spacing.lg,
  },
  editorialStatsBox: {
    marginTop: Spacing.lg,
    borderRadius: Radii.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  editorialStatsLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: Spacing.sm,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 24,
    lineHeight: 28,
  },
  verticalDivider: {
    width: StyleSheet.hairlineWidth,
    height: 28,
  },
  browseSection: {
    marginTop: Spacing.lg,
    alignItems: 'flex-start',
  },
  browseLink: {
    minHeight: 44,
    justifyContent: 'center',
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

