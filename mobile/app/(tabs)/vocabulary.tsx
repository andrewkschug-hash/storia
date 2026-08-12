import { useFocusEffect, router, type Href } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AtmosphereBackground } from '@/src/components/AtmosphereBackground';
import { useReadingProgress } from '@/src/progress/useReadingProgress';
import { useVocabulary } from '@/src/vocabulary/useVocabulary';
import type { VocabBrowseItem } from '@/src/vocabulary/catalog';
import { Radii, Spacing, Typography } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

export default function VocabularyScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
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
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Spacing.lg, paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}>
        <Text style={[Typography.heroTitle, { color: colors.text }]}>Your Italian</Text>
        <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
          Familiarity grows from reading — not from drills.
        </Text>

        <View style={styles.statsRow}>
          <Stat label="Words encountered" value={summary?.encountered ?? 0} />
          <Stat label="Words you're learning" value={summary?.learning ?? 0} />
        </View>
        <View style={styles.statsRow}>
          <Stat label="Familiar" value={summary?.familiar ?? 0} />
          <Stat label="Mastered" value={summary?.mastered ?? 0} />
        </View>

        {loading ? (
          <Text style={[Typography.caption, { color: colors.textMuted, marginTop: Spacing.xl }]}>
            Loading your words…
          </Text>
        ) : null}

        <Section title="Saved" items={lists?.saved ?? []} empty={null} />
        <Section title="Learning" items={lists?.learning ?? []} empty={null} />
        <Section title="Familiar" items={lists?.familiar ?? []} empty={null} />
        <Section title="Mastered" items={lists?.mastered ?? []} empty={null} />

        {!loading && (summary?.encountered ?? 0) === 0 ? (
          <Text style={[Typography.caption, { color: colors.textMuted, marginTop: Spacing.xl }]}>
            Tap any word while reading to see its meaning. Saved words will return here, gently.
          </Text>
        ) : null}
      </ScrollView>
    </AtmosphereBackground>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.stat,
        { backgroundColor: colors.backgroundElevated, borderColor: colors.border },
      ]}>
      <Text style={[Typography.stat, { color: colors.text }]}>{value}</Text>
      <Text style={[Typography.caption, { color: colors.textMuted, marginTop: 4 }]}>{label}</Text>
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
  const { colors } = useTheme();
  if (items.length === 0) {
    return empty ? (
      <Text style={[Typography.caption, { color: colors.textMuted, marginTop: Spacing.lg }]}>
        {empty}
      </Text>
    ) : null;
  }

  return (
    <View style={{ marginTop: Spacing.xl }}>
      <Text style={[Typography.chapterEyebrow, { color: colors.textMuted }]}>{title}</Text>
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
            <Text style={[Typography.label, { color: colors.text }]}>{item.italian}</Text>
            <Text style={[Typography.caption, { color: colors.textSecondary }]}>{item.english}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
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
  },
});
