import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { CatalogStory } from '@/src/content/schemas';
import { getCatalogStory } from '@/src/content';
import { loadStoryProgressView, type ChapterListItem } from '@/src/progress/useReadingProgress';
import { Radii, Spacing, type ThemeColors } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

type Props = {
  eyebrow: string;
  title: string;
  caption: string;
  stories: CatalogStory[];
  colors: ThemeColors;
  onOpenChapter: (storyId: string, chapterId: string) => void;
};

type StoryRow = {
  story: CatalogStory;
  chapters: ChapterListItem[];
  completed: number;
};

export function A1StoryList({ eyebrow, title, caption, stories, colors, onOpenChapter }: Props) {
  const { type, minTouchTarget } = useTheme();
  const [rows, setRows] = useState<StoryRow[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(stories[0]?.id ?? null);
  const [focusTick, setFocusTick] = useState(0);
  const storyKey = stories.map((story) => story.id).join('|');

  useFocusEffect(
    useCallback(() => {
      setFocusTick((tick) => tick + 1);
    }, []),
  );

  useEffect(() => {
    let cancelled = false;
    const ids = storyKey ? storyKey.split('|') : [];
    void (async () => {
      const next: StoryRow[] = [];
      for (const id of ids) {
        const story = getCatalogStory(id);
        if (!story) continue;
        const view = await loadStoryProgressView(story.id);
        const chapters = view.chapters;
        next.push({
          story,
          chapters,
          completed: chapters.filter((chapter) => chapter.status === 'completed').length,
        });
      }
      if (cancelled) return;
      setRows(next);
      const inProgress = next.find((row) =>
        row.chapters.some((chapter) => chapter.status === 'in_progress'),
      );
      if (inProgress) setExpandedId(inProgress.story.id);
    })();
    return () => {
      cancelled = true;
    };
  }, [storyKey, focusTick]);

  return (
    <View style={{ marginTop: Spacing.xl }}>
      <Text style={[type.chapterEyebrow, { color: colors.tint }]}>{eyebrow}</Text>
      <Text style={[type.label, { color: colors.text, marginTop: Spacing.xs }]}>{title}</Text>
      <Text style={[type.caption, { color: colors.textMuted, marginTop: Spacing.xs }]}>
        {caption}
      </Text>

      {rows.map((row, index) => {
        const expanded = expandedId === row.story.id;
        return (
          <View key={row.story.id} style={{ marginTop: Spacing.sm }}>
            <Pressable
              onPress={() => setExpandedId((prev) => (prev === row.story.id ? null : row.story.id))}
              style={({ pressed }) => [
                styles.storyRow,
                {
                  backgroundColor: colors.backgroundElevated,
                  borderColor: expanded ? colors.tint : colors.border,
                  opacity: pressed ? 0.88 : 1,
                  minHeight: minTouchTarget,
                },
              ]}>
              <View style={styles.storyMeta}>
                <Text style={[type.caption, { color: colors.tint }]}>
                  {index + 1} of {rows.length} · suggested
                </Text>
                <Text style={[type.label, { color: colors.text, marginTop: 2 }]}>
                  {row.story.titleIt}
                </Text>
                <Text style={[type.caption, { color: colors.textMuted, marginTop: 2 }]}>
                  {row.completed}/{row.story.chapterCount} chapters
                </Text>
              </View>
            </Pressable>
            {expanded
              ? row.chapters.map((chapter) => {
                  const locked = chapter.status === 'locked';
                  return (
                    <Pressable
                      key={chapter.id}
                      onPress={() => {
                        if (!locked) onOpenChapter(row.story.id, chapter.id);
                      }}
                      style={({ pressed }) => [
                        styles.chapterRow,
                        {
                          backgroundColor: colors.backgroundElevated,
                          borderColor: colors.border,
                          opacity: locked ? 0.55 : pressed ? 0.88 : 1,
                          minHeight: minTouchTarget,
                        },
                      ]}>
                      <View style={{ flex: 1 }}>
                        <Text style={[type.caption, { color: colors.tint }]}>
                          Capitolo {chapter.number}
                        </Text>
                        <Text style={[type.label, { color: colors.text, marginTop: 2 }]}>
                          {chapter.titleIt}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })
              : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  storyRow: {
    borderRadius: Radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  storyMeta: {
    flex: 1,
  },
  chapterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    marginLeft: Spacing.sm,
  },
});
