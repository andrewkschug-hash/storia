import { useFocusEffect, router, type Href } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AtmosphereBackground } from '@/src/components/AtmosphereBackground';
import { ReadingIndependenceCard } from '@/src/components/ReadingIndependenceCard';
import { ScreenContent } from '@/src/components/ScreenContent';
import { useReadingProgress } from '@/src/progress/useReadingProgress';
import { useVocabulary } from '@/src/vocabulary/useVocabulary';
import type { VocabBrowseItem } from '@/src/vocabulary/catalog';
import { useLayout } from '@/src/theme/useLayout';
import { Radii, Spacing } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

export default function VocabularyScreen() {
  const { colors, type } = useTheme();
  const insets = useSafeAreaInsets();
  const layout = useLayout();
  const { progress } = useReadingProgress();
  const { summary, lists, refresh, loading } = useVocabulary(progress);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

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
          <Text style={[type.body, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
            Familiarity grows from reading — not from drills.
          </Text>

          <ReadingIndependenceCard />

          <View style={[styles.statsRow, layout.width < 420 && styles.statsRowCompact]}>
            <Stat label="Words encountered" value={summary?.encountered ?? 0} />
            <Stat label="Words you're learning" value={summary?.learning ?? 0} />
          </View>
          <View style={[styles.statsRow, layout.width < 420 && styles.statsRowCompact]}>
            <Stat label="Familiar" value={summary?.familiar ?? 0} />
            <Stat label="Mastered" value={summary?.mastered ?? 0} />
          </View>

          {loading ? (
            <Text style={[type.caption, { color: colors.textMuted, marginTop: Spacing.xl }]}>
              Loading your words…
            </Text>
          ) : null}

          <Section title="Saved" items={lists?.saved ?? []} empty={null} />
          <Section title="Learning" items={lists?.learning ?? []} empty={null} />
          <Section title="Familiar" items={lists?.familiar ?? []} empty={null} />
          <Section title="Mastered" items={lists?.mastered ?? []} empty={null} />

          {!loading && (summary?.encountered ?? 0) === 0 ? (
            <Text style={[type.caption, { color: colors.textMuted, marginTop: Spacing.xl }]}>
              Tap any word while reading to see its meaning. Saved words will return here, gently.
            </Text>
          ) : null}
        </ScreenContent>
      </ScrollView>
    </AtmosphereBackground>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  const { colors, type } = useTheme();
  return (
    <View
      style={[
        styles.stat,
        { backgroundColor: colors.backgroundElevated, borderColor: colors.border },
      ]}>
      <Text style={[type.stat, { color: colors.text }]}>{value}</Text>
      <Text style={[type.caption, { color: colors.textMuted, marginTop: 4 }]}>{label}</Text>
    </View>
  );
}

function Section({
  title,
  items,
  empty,
}: {
  title: string;
  items: VocabBrowseItem[];
  empty: string | null;
}) {
  const { colors, type } = useTheme();
  if (items.length === 0) {
    return empty ? (
      <Text style={[type.caption, { color: colors.textMuted, marginTop: Spacing.lg }]}>
        {empty}
      </Text>
    ) : null;
  }

  return (
    <View style={{ marginTop: Spacing.xl }}>
      <Text style={[type.chapterEyebrow, { color: colors.textMuted }]}>{title}</Text>
      <View style={{ marginTop: Spacing.md, gap: Spacing.sm }}>
        {items.map((item) => (
          <Pressable
            key={`${item.kind}:${item.id}`}
            onPress={() =>
              router.push(`/vocab/${item.kind}/${encodeURIComponent(item.id)}` as Href)
            }
            style={({ pressed }) => [
              styles.row,
              {
                backgroundColor: colors.backgroundElevated,
                borderColor: colors.border,
                opacity: pressed ? 0.9 : 1,
              },
            ]}>
            <Text style={[type.label, { color: colors.text }]}>{item.italian}</Text>
            <Text style={[type.caption, { color: colors.textSecondary }]}>{item.english}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  statsRowCompact: {
    flexDirection: 'column',
  },
  stat: {
    flex: 1,
    borderRadius: Radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  row: {
    borderRadius: Radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    minHeight: 52,
    justifyContent: 'center',
  },
});
