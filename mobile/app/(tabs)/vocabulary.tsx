import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AtmosphereBackground } from '@/src/components/AtmosphereBackground';
import { ScreenContent } from '@/src/components/ScreenContent';
import { useReadingProgress } from '@/src/progress/useReadingProgress';
import { Radii, Spacing } from '@/src/theme/tokens';
import { useLayout } from '@/src/theme/useLayout';
import { useTheme } from '@/src/theme/useTheme';
import { useYourItalian } from '@/src/vocabulary/useYourItalian';

const STATUS_ROWS = [
  { key: 'new', label: 'New' },
  { key: 'learning', label: 'Learning' },
  { key: 'familiar', label: 'Familiar' },
  { key: 'mastered', label: 'Mastered' },
] as const;

export default function VocabularyScreen() {
  const { colors, type } = useTheme();
  const insets = useSafeAreaInsets();
  const layout = useLayout();
  const { progress } = useReadingProgress();
  const { summary, reinforcingWords, loading, refresh } = useYourItalian(progress);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const encountered = summary?.encountered ?? 0;

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
              <Text style={[type.stat, { color: colors.text, marginTop: Spacing.xl }]}>
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
                    <Text style={[type.label, { color: colors.textSecondary }]}>{row.label}</Text>
                    <Text style={[type.label, { color: colors.text }]}>
                      {summary?.[row.key] ?? 0}
                    </Text>
                  </View>
                ))}
              </View>

              {reinforcingWords.length > 0 ? (
                <View style={{ marginTop: Spacing.xxl }}>
                  <Text style={[type.chapterEyebrow, { color: colors.textMuted }]}>
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
            </>
          )}
        </ScreenContent>
      </ScrollView>
    </AtmosphereBackground>
  );
}

const styles = StyleSheet.create({
  statusCard: {
    marginTop: Spacing.xl,
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
  reinforcingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: Spacing.md,
  },
});
