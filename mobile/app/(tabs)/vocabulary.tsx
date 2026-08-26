import { router, useFocusEffect, type Href } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AtmosphereBackground } from '@/src/components/AtmosphereBackground';
import { GlobalLanguageHeader } from '@/src/components/GlobalLanguageHeader';
import { ProgressBar } from '@/src/components/ProgressBar';
import { ScreenContent } from '@/src/components/ScreenContent';
import { navLog } from '@/src/navigation/diagnostics';
import { usePeekProgress } from '@/src/progress/usePeekProgress';
import { Radii, Spacing, Typography } from '@/src/theme/tokens';
import { useLayout } from '@/src/theme/useLayout';
import { useTheme } from '@/src/theme/useTheme';
import { useYourItalian } from '@/src/vocabulary/useYourItalian';

export default function VocabularyScreen() {
  const { colors, type, minTouchTarget } = useTheme();
  const insets = useSafeAreaInsets();
  const layout = useLayout();
  const { progress, refresh: refreshProgress } = usePeekProgress();
  const { summary, reinforcingWords, practiceItems, activity, loading, refresh } =
    useYourItalian(progress);

  useFocusEffect(
    useCallback(() => {
      navLog('vocabulary focus');
      void refreshProgress();
      void refresh();
    }, [refresh, refreshProgress]),
  );

  useEffect(() => {
    navLog('vocabulary mount');
    return () => navLog('vocabulary unmount');
  }, []);

  const encountered = summary?.encountered ?? 0;
  const practiceCount = practiceItems.length;
  const familiar = summary?.familiar ?? 0;
  const mastered = summary?.mastered ?? 0;
  const progressRatio = encountered > 0 ? (familiar + mastered) / encountered : 0;

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
          <GlobalLanguageHeader breadcrumb="Quaderno" />

          <View style={styles.header}>
            <Text
              style={[
                type.heroTitle,
                {
                  color: colors.text,
                  fontSize: layout.isPhone ? 28 : 34,
                  lineHeight: layout.isPhone ? 34 : 42,
                },
              ]}>
              Il tuo quaderno
            </Text>
            <Text style={[type.body, { color: colors.textSecondary, marginTop: Spacing.xs, fontSize: 15 }]}>
              Parole incontrate nelle tue storie.
            </Text>
          </View>

          {loading ? (
            <Text style={[type.caption, { color: colors.textMuted, marginTop: Spacing.xl }]}>
              Caricamento…
            </Text>
          ) : encountered === 0 ? (
            <View style={[styles.emptyBox, { backgroundColor: colors.backgroundElevated }]}>
              <Text style={[type.body, { color: colors.textSecondary }]}>
                Inizia a leggere: le parole incontrate nel racconto appariranno qui nel tuo quaderno.
              </Text>
            </View>
          ) : (
            <>
              {/* DA RIVEDERE */}
              <View style={[styles.notebookSection, { borderLeftColor: colors.tint }]}>
                <Text style={[Typography.chapterEyebrow, { color: colors.tint, letterSpacing: 1.4 }]}>
                  Da rivedere
                </Text>
                {practiceCount > 0 ? (
                  <>
                    <Text style={[type.heroTitle, { color: colors.text, marginTop: Spacing.xs, fontSize: 20, lineHeight: 26 }]}>
                      {practiceCount} {practiceCount === 1 ? 'parola da ripassare' : 'parole da ripassare'}
                    </Text>
                    <View style={{ marginTop: Spacing.sm, gap: Spacing.xs }}>
                      {practiceItems.slice(0, 5).map((item) => (
                        <View key={`${item.kind}:${item.id}`} style={styles.reviewItem}>
                          <Text style={[type.body, { color: colors.text, fontFamily: 'Literata_600SemiBold' }]}>
                            {item.italian}
                          </Text>
                          {item.english ? (
                            <Text style={[type.caption, { color: colors.textSecondary }]}>
                              {item.english}
                            </Text>
                          ) : null}
                          {item.assessmentLabel ? (
                            <Text style={[type.caption, { color: colors.textMuted }]}>
                              {item.assessmentLabel}
                            </Text>
                          ) : null}
                        </View>
                      ))}
                    </View>
                    <Pressable
                      onPress={() => router.push('/practice' as Href)}
                      accessibilityRole="button"
                      accessibilityLabel="Ripassa ora"
                      style={({ pressed }) => [
                        styles.practiceBtn,
                        {
                          backgroundColor: colors.buttonPrimary,
                          opacity: pressed ? 0.88 : 1,
                          marginTop: Spacing.md,
                          minHeight: minTouchTarget,
                        },
                      ]}>
                      <Text style={[type.button, { color: colors.onButtonPrimary }]}>
                        Ripassa le parole →
                      </Text>
                    </Pressable>
                  </>
                ) : (
                  <Text style={[type.body, { color: colors.textSecondary, marginTop: Spacing.xs }]}>
                    Sei in pari! Nessuna parola in attesa di ripasso.
                  </Text>
                )}
              </View>

              {/* PAROLE CHE CONOSCI */}
              <View style={[styles.progressSection, { backgroundColor: colors.backgroundElevated }]}>
                <Text style={[Typography.chapterEyebrow, { color: colors.textMuted, letterSpacing: 1.4 }]}>
                  Parole che conosci
                </Text>
                <View style={styles.statsOverview}>
                  <Text style={[styles.totalNum, { color: colors.text }]}>{encountered}</Text>
                  <Text style={[type.caption, { color: colors.textSecondary, marginLeft: Spacing.sm }]}>
                    parole scoperte
                  </Text>
                </View>
                <View style={{ marginTop: Spacing.sm, marginBottom: Spacing.md }}>
                  <ProgressBar progress={progressRatio} />
                </View>
                <View style={styles.stagesRow}>
                  <View style={styles.stageItem}>
                    <Text style={[styles.stageNum, { color: colors.statusNew }]}>{summary?.new ?? 0}</Text>
                    <Text style={[type.caption, { color: colors.textMuted }]}>Nuove</Text>
                  </View>
                  <View style={styles.stageItem}>
                    <Text style={[styles.stageNum, { color: colors.statusLearning }]}>
                      {summary?.learning ?? 0}
                    </Text>
                    <Text style={[type.caption, { color: colors.textMuted }]}>In pratica</Text>
                  </View>
                  <View style={styles.stageItem}>
                    <Text style={[styles.stageNum, { color: colors.statusFamiliar }]}>
                      {summary?.familiar ?? 0}
                    </Text>
                    <Text style={[type.caption, { color: colors.textMuted }]}>Familiari</Text>
                  </View>
                  <View style={styles.stageItem}>
                    <Text style={[styles.stageNum, { color: colors.statusMastered }]}>
                      {summary?.mastered ?? 0}
                    </Text>
                    <Text style={[type.caption, { color: colors.textMuted }]}>Conosciute</Text>
                  </View>
                </View>
              </View>

              {/* KEEP SEEING */}
              {reinforcingWords.length > 0 ? (
                <View style={styles.reinforcingSection}>
                  <Text style={[Typography.chapterEyebrow, { color: colors.textMuted, letterSpacing: 1.4 }]}>
                    Parole recenti
                  </Text>
                  <Text style={[type.caption, { color: colors.textSecondary, marginTop: Spacing.xs }]}>
                    Parole che ritrovi continuando la lettura
                  </Text>
                  <View style={{ marginTop: Spacing.sm, gap: Spacing.xs }}>
                    {reinforcingWords.map((word) => (
                      <View key={word.italian} style={[styles.reinforcingRow, { backgroundColor: colors.backgroundElevated }]}>
                        <Text style={[type.body, { color: colors.text, fontFamily: 'Literata_500Medium' }]}>
                          {word.italian}
                        </Text>
                        {word.chapterNumber ? (
                          <Text style={[type.caption, { color: colors.textMuted }]}>
                            Capitolo {word.chapterNumber}
                          </Text>
                        ) : null}
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}

              {/* ACTIVITY */}
              {activity &&
              (activity.gotIt > 0 || activity.almost > 0 || activity.notYet > 0) ? (
                <View style={styles.activitySection}>
                  <Text style={[Typography.chapterEyebrow, { color: colors.textMuted, letterSpacing: 1.4 }]}>
                    Attività recente
                  </Text>
                  <Text style={[type.body, { color: colors.textSecondary, marginTop: Spacing.xs }]}>
                    {activity.gotIt} Conosciute · {activity.almost} Quasi · {activity.notYet} Da rivedere
                  </Text>
                </View>
              ) : null}
            </>
          )}
        </ScreenContent>
      </ScrollView>
    </AtmosphereBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  emptyBox: {
    padding: Spacing.lg,
    borderRadius: Radii.md,
    marginTop: Spacing.md,
  },
  notebookSection: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radii.md,
    backgroundColor: 'transparent',
    borderLeftWidth: 3.5,
    marginBottom: Spacing.lg,
  },
  reviewItem: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.sm,
    paddingVertical: 2,
  },
  practiceBtn: {
    borderRadius: Radii.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressSection: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radii.md,
    marginBottom: Spacing.lg,
  },
  statsOverview: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: Spacing.xs,
  },
  totalNum: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 28,
    lineHeight: 32,
  },
  stagesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  stageItem: {
    alignItems: 'center',
    flex: 1,
  },
  stageNum: {
    fontFamily: 'Literata_600SemiBold',
    fontSize: 15,
  },
  reinforcingSection: {
    marginBottom: Spacing.lg,
  },
  reinforcingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.sm,
  },
  activitySection: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
  },
});

