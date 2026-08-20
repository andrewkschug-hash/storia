import { router, useFocusEffect, type Href } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AtmosphereBackground } from '@/src/components/AtmosphereBackground';
import { ScreenContent } from '@/src/components/ScreenContent';
import { navLog } from '@/src/navigation/diagnostics';
import { useReadingProgress } from '@/src/progress/useReadingProgress';
import { Radii, Spacing } from '@/src/theme/tokens';
import { useLayout } from '@/src/theme/useLayout';
import { useTheme } from '@/src/theme/useTheme';
import { useYourItalian } from '@/src/vocabulary/useYourItalian';

const STATUS_ROWS = [
  { key: 'new', label: 'New', colorKey: 'statusNew' as const },
  { key: 'learning', label: 'Learning', colorKey: 'statusLearning' as const },
  { key: 'familiar', label: 'Familiar', colorKey: 'statusFamiliar' as const },
  { key: 'mastered', label: 'Mastered', colorKey: 'statusMastered' as const },
] as const;

export default function VocabularyScreen() {
  const { colors, type } = useTheme();
  const insets = useSafeAreaInsets();
  const layout = useLayout();
  const { progress } = useReadingProgress();
  const { summary, reinforcingWords, practiceItems, activity, loading, refresh } =
    useYourItalian(progress);

  useFocusEffect(
    useCallback(() => {
      navLog('vocabulary focus');
      void refresh();
    }, [refresh]),
  );

  useEffect(() => {
    navLog('vocabulary mount');
    return () => navLog('vocabulary unmount');
  }, []);

  const encountered = summary?.encountered ?? 0;
  const practiceCount = practiceItems.length;

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
            Your Italian
          </Text>

          {loading ? (
            <Text style={[type.caption, { color: colors.textMuted, marginTop: Spacing.xl }]}>
              Loading…
            </Text>
          ) : encountered === 0 ? (
            <Text style={[type.body, { color: colors.textSecondary, marginTop: Spacing.lg }]}>
              Start reading — words you meet in the story will show up here.
            </Text>
          ) : (
            <>
              <Text style={[type.chapterEyebrow, { color: colors.textMuted, marginTop: Spacing.xl }]}>
                Your progress
              </Text>
              <Text style={[type.stat, { color: colors.text, marginTop: Spacing.sm }]}>
                {encountered}
              </Text>
              <Text style={[type.body, { color: colors.textSecondary, marginTop: Spacing.xs }]}>
                words encountered
              </Text>

              <View
                style={[
                  styles.statusCard,
                  {
                    backgroundColor: colors.backgroundElevated,
                    borderColor: colors.border,
                  },
                ]}>
                {STATUS_ROWS.map((row) => (
                  <View key={row.key} style={styles.statusRow}>
                    <View style={styles.statusLabel}>
                      <View style={[styles.statusDot, { backgroundColor: colors[row.colorKey] }]} />
                      <Text style={[type.label, { color: colors.textSecondary }]}>{row.label}</Text>
                    </View>
                    <Text style={[type.label, { color: colors.text }]}>
                      {summary?.[row.key] ?? 0}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={{ marginTop: Spacing.xxl }}>
                <Text style={[type.chapterEyebrow, { color: colors.textMuted }]}>Practice</Text>
                <Text style={[type.label, { color: colors.text, marginTop: Spacing.sm }]}>
                  {practiceCount > 0
                    ? `${practiceCount} thing${practiceCount === 1 ? '' : 's'} to work on`
                    : "You're caught up for now"}
                </Text>
                {practiceItems.length > 0 ? (
                  <View style={{ marginTop: Spacing.md, gap: Spacing.sm }}>
                    {practiceItems.map((item) => (
                      <View key={`${item.kind}:${item.id}`} style={styles.practiceRow}>
                        <Text style={[type.body, { color: colors.text }]}>{item.italian}</Text>
                        {item.assessmentLabel ? (
                          <Text style={[type.caption, { color: colors.textMuted }]}>
                            {item.assessmentLabel}
                          </Text>
                        ) : null}
                      </View>
                    ))}
                  </View>
                ) : null}
                {practiceCount > 0 ? (
                  <Pressable
                    onPress={() => router.push('/practice' as Href)}
                    style={({ pressed }) => [
                      styles.practiceBtn,
                      {
                        backgroundColor: colors.tint,
                        opacity: pressed ? 0.88 : 1,
                        marginTop: Spacing.lg,
                      },
                    ]}>
                    <Text style={[type.button, { color: colors.onTint }]}>Practice now →</Text>
                  </Pressable>
                ) : null}
              </View>

              {reinforcingWords.length > 0 ? (
                <View style={{ marginTop: Spacing.xxl }}>
                  <Text style={[type.chapterEyebrow, { color: colors.textMuted }]}>
                    Keep seeing
                  </Text>
                  <Text style={[type.caption, { color: colors.textSecondary, marginTop: Spacing.xs }]}>
                    Words you&apos;re seeing again
                  </Text>
                  <View style={{ marginTop: Spacing.md, gap: Spacing.sm }}>
                    {reinforcingWords.map((word) => (
                      <View key={word.italian} style={styles.reinforcingRow}>
                        <Text style={[type.body, { color: colors.text }]}>{word.italian}</Text>
                        {word.chapterNumber ? (
                          <Text style={[type.caption, { color: colors.textMuted }]}>
                            Chapter {word.chapterNumber}
                          </Text>
                        ) : null}
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}

              {activity &&
              (activity.gotIt > 0 || activity.almost > 0 || activity.notYet > 0) ? (
                <View style={{ marginTop: Spacing.xxl }}>
                  <Text style={[type.chapterEyebrow, { color: colors.textMuted }]}>
                    Your activity
                  </Text>
                  <Text style={[type.body, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
                    {activity.gotIt} Got it · {activity.almost} Almost · {activity.notYet} Not yet
                    this week
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
  statusCard: {
    marginTop: Spacing.lg,
    borderRadius: Radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  statusLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: Radii.pill,
  },
  practiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: Spacing.md,
  },
  practiceBtn: {
    borderRadius: Radii.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },
  reinforcingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: Spacing.md,
  },
});
