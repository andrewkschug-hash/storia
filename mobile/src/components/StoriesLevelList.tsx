import { AppSymbol } from '@/src/components/AppSymbol';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import type { ChapterStatus } from '@/src/progress/types';
import type { ChapterListItem } from '@/src/progress/useReadingProgress';
import type { ReadingProgressRecord } from '@/src/progress/types';
import { buildStoryPath, type StoryPathItem } from '@/src/content/storyPath';
import {
  insertExtraStoryGroups,
  type ExtraStoryRow,
  type ExtraStorySection,
  type LevelGroup,
  type StoryArcSummary,
} from '@/src/components/storiesLevelInsert';
import { Radii, Spacing, type ThemeColors } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

export type { ExtraStoryRow, ExtraStorySection, StoryArcSummary };

type Props = {
  arcs: StoryArcSummary[];
  chapters: ChapterListItem[];
  currentChapterId: string;
  colors: ThemeColors;
  storyId?: string;
  progress?: ReadingProgressRecord | null;
  extraSections?: ExtraStorySection[];
  onOpenChapter: (chapterId: string, listen?: boolean) => void;
  onOpenStoryChapter?: (storyId: string, chapterId: string) => void;
  onOpenGrammar?: (batchEnd: number) => void;
  onOpenRecap?: (batchEnd: number) => void;
};

export function StoriesLevelList({
  arcs,
  chapters,
  currentChapterId,
  colors,
  storyId,
  progress,
  extraSections,
  onOpenChapter,
  onOpenStoryChapter,
  onOpenGrammar,
  onOpenRecap,
}: Props) {
  const { type } = useTheme();
  const groups = useMemo(() => {
    const base = buildLevelGroups(arcs, chapters, currentChapterId);
    return insertExtraStoryGroups(base, extraSections);
  }, [arcs, chapters, currentChapterId, extraSections]);

  const currentArcId = groups.find((g) => g.containsCurrent)?.arc.id ?? null;
  const [expandedId, setExpandedId] = useState<string | null>(currentArcId);
  const [hint, setHint] = useState<string | null>(null);
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setExpandedId(currentArcId);
  }, [currentArcId]);

  useEffect(() => {
    return () => {
      if (hintTimer.current) clearTimeout(hintTimer.current);
    };
  }, []);

  const showHint = (message: string) => {
    setHint(message);
    if (hintTimer.current) clearTimeout(hintTimer.current);
    hintTimer.current = setTimeout(() => setHint(null), 2200);
  };

  return (
    <View style={{ marginTop: Spacing.xl }}>
      {hint ? (
        <Text
          style={[
            type.caption,
            { color: colors.textSecondary, marginBottom: Spacing.sm, textAlign: 'center' },
          ]}>
          {hint}
        </Text>
      ) : null}

      {groups.map((group) => {
        const expanded = expandedId === group.arc.id && !group.locked;
        return (
          <LevelSection
            key={group.arc.id}
            group={group}
            expanded={expanded}
            currentChapterId={currentChapterId}
            colors={colors}
            onToggle={() => {
              if (group.locked) {
                showHint(unlockHintForLevel(group, chapters));
                return;
              }
              setExpandedId((prev) => (prev === group.arc.id ? null : group.arc.id));
            }}
            onChapterPress={(chapter) => {
              if (chapter.status === 'locked') {
                showHint(unlockHintForChapter(chapter, chapters, storyId, progress));
                return;
              }
              const extraStory = group.stories?.find((story) =>
                story.chapters.some((item) => item.id === chapter.id),
              );
              if (extraStory && onOpenStoryChapter) {
                onOpenStoryChapter(extraStory.storyId, chapter.id);
                return;
              }
              onOpenChapter(chapter.id);
            }}
            onPathPress={(item) => {
              if (item.kind === 'chapter') {
                if (item.chapter.status === 'locked') {
                  showHint(unlockHintForChapter(item.chapter, chapters, storyId, progress));
                  return;
                }
                onOpenChapter(item.chapter.id);
                return;
              }
              if (item.status === 'locked') {
                if (item.kind === 'speak') {
                  showHint(`Complete the batch review after Ch. ${item.batchEnd} first`);
                  return;
                }
                showHint(unlockHintForPathItem(item));
                return;
              }
              if (item.kind === 'grammar') {
                onOpenGrammar?.(item.batchEnd);
                return;
              }
              if (item.kind === 'recap') {
                onOpenRecap?.(item.batchEnd);
                return;
              }
              if (item.kind === 'speak') {
                showHint(`Complete the batch review after Ch. ${item.batchEnd} first`);
                return;
              }
            }}
            onListen={(chapterId) => onOpenChapter(chapterId, true)}
            storyId={storyId}
            progress={progress}
          />
        );
      })}
    </View>
  );
}

function LevelSection({
  group,
  expanded,
  currentChapterId,
  colors,
  storyId,
  progress,
  onToggle,
  onChapterPress,
  onPathPress,
  onListen,
}: {
  group: LevelGroup;
  expanded: boolean;
  currentChapterId: string;
  colors: ThemeColors;
  storyId?: string;
  progress?: ReadingProgressRecord | null;
  onToggle: () => void;
  onChapterPress: (chapter: ChapterListItem) => void;
  onPathPress: (item: StoryPathItem) => void;
  onListen: (chapterId: string) => void;
}) {
  const { type, minTouchTarget } = useTheme();
  const shake = useRef(new Animated.Value(0)).current;
  const pathItems = useMemo(() => {
    if (!storyId || group.stories) return null;
    return buildStoryPath(group.chapters as ChapterListItem[], progress ?? null, storyId);
  }, [storyId, group.stories, group.chapters, progress]);

  const triggerShake = () => {
    shake.setValue(0);
    Animated.sequence([
      Animated.timing(shake, { toValue: 6, duration: 40, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -6, duration: 40, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 4, duration: 40, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -4, duration: 40, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 40, useNativeDriver: true }),
    ]).start();
  };

  const summary = group.locked
    ? `Locked · ${group.total} chapters`
    : `${group.completed}/${group.total} chapters done`;

  return (
    <View style={{ marginBottom: Spacing.sm }}>
      <Animated.View style={{ transform: [{ translateX: shake }] }}>
        <Pressable
          onPress={() => {
            if (group.locked) triggerShake();
            onToggle();
          }}
          style={({ pressed }) => [
            styles.levelRow,
            {
              backgroundColor: colors.backgroundElevated,
              borderColor: group.containsCurrent ? colors.tint : colors.border,
              opacity: pressed ? 0.88 : 1,
              minHeight: minTouchTarget,
            },
          ]}>
          <View style={styles.levelMeta}>
            <Text style={[type.chapterEyebrow, { color: colors.tint }]}>
              {group.arc.cefrLevel}
            </Text>
            <Text style={[type.label, { color: colors.text, marginTop: 2 }]}>
              {group.arc.title}
            </Text>
            <Text style={[type.caption, { color: colors.textMuted, marginTop: 2 }]}>
              {summary}
            </Text>
          </View>
          <View style={styles.levelTrailing}>
            {group.locked ? (
              <StatusIcon status="locked" color={colors.textMuted} />
            ) : (
              <AppSymbol
                name={{
                  ios: expanded ? 'chevron.up' : 'chevron.down',
                  android: expanded ? 'expand_less' : 'expand_more',
                  web: expanded ? 'expand_less' : 'expand_more',
                }}
                tintColor={colors.textMuted}
                size={18}
              />
            )}
          </View>
        </Pressable>
      </Animated.View>

      {expanded
        ? group.stories
          ? group.stories.map((story) => (
              <ExtraStoryBlock
                key={story.storyId}
                story={story}
                colors={colors}
                onOpenChapter={(chapter) => onChapterPress(chapter)}
              />
            ))
          : pathItems
            ? pathItems.map((item) => {
                if (item.kind === 'chapter') {
                  return (
                    <ChapterRow
                      key={item.chapter.id}
                      chapter={item.chapter}
                      isCurrent={item.chapter.id === currentChapterId}
                      colors={colors}
                      onPress={() => onPathPress(item)}
                      onListen={() => onListen(item.chapter.id)}
                      onLockedPress={() => onPathPress(item)}
                    />
                  );
                }
                if (item.kind === 'grammar') {
                  return (
                    <CheckpointRow
                      key={item.id}
                      eyebrow="Grammar"
                      title={item.title}
                      subtitle={`After chapters ${item.batchStart}–${item.batchEnd}`}
                      status={item.status}
                      colors={colors}
                      icon="book"
                      onPress={() => onPathPress(item)}
                    />
                  );
                }
                if (item.kind === 'speak') {
                  return (
                    <CheckpointRow
                      key={item.id}
                      eyebrow="Speak the scene"
                      title={item.title}
                      subtitle="Retell what happened"
                      status={item.status}
                      colors={colors}
                      icon="speak"
                      onPress={() => onPathPress(item)}
                    />
                  );
                }
                if (item.kind === 'recap') {
                  return (
                    <CheckpointRow
                      key={item.id}
                      eyebrow="Words"
                      title={`Chapters ${item.batchStart}–${item.batchEnd}`}
                      subtitle="Word recap from this batch"
                      status={item.status}
                      colors={colors}
                      icon="review"
                      onPress={() => onPathPress(item)}
                    />
                  );
                }
                return null;
              })
            : group.chapters.map((chapter) => (
                <ChapterRow
                  key={chapter.id}
                  chapter={chapter as ChapterListItem}
                  isCurrent={chapter.id === currentChapterId}
                  colors={colors}
                  onPress={() => onChapterPress(chapter as ChapterListItem)}
                  onListen={() => onListen(chapter.id)}
                  onLockedPress={() => onChapterPress(chapter as ChapterListItem)}
                />
              ))
        : null}
    </View>
  );
}

function ExtraStoryBlock({
  story,
  colors,
  onOpenChapter,
}: {
  story: ExtraStoryRow;
  colors: ThemeColors;
  onOpenChapter: (chapter: ChapterListItem) => void;
}) {
  const { type, minTouchTarget } = useTheme();
  const [open, setOpen] = useState(
    story.chapters.some((chapter) => chapter.status === 'in_progress'),
  );

  return (
    <View>
      <Pressable
        onPress={() => setOpen((prev) => !prev)}
        style={({ pressed }) => [
          styles.chapterRow,
          {
            backgroundColor: colors.backgroundElevated,
            borderColor: open ? colors.tint : colors.border,
            opacity: pressed ? 0.88 : 1,
            minHeight: minTouchTarget,
          },
        ]}>
        <View style={styles.chapterMeta}>
          <Text style={[type.caption, { color: colors.tint }]}>{story.eyebrow ?? 'Story'}</Text>
          <Text style={[type.label, { color: colors.text, marginTop: 2 }]}>{story.titleIt}</Text>
          <Text style={[type.caption, { color: colors.textMuted, marginTop: 2 }]}>
            {story.completed}/{story.total} chapters
          </Text>
        </View>
      </Pressable>
      {open
        ? story.chapters.map((chapter) => (
            <ChapterRow
              key={chapter.id}
              chapter={chapter}
              isCurrent={chapter.status === 'in_progress'}
              colors={colors}
              hideListen
              onPress={() => onOpenChapter(chapter as ChapterListItem)}
              onListen={() => onOpenChapter(chapter as ChapterListItem)}
              onLockedPress={() => onOpenChapter(chapter as ChapterListItem)}
            />
          ))
        : null}
    </View>
  );
}

function CheckpointRow({
  eyebrow,
  title,
  subtitle,
  status,
  colors,
  icon,
  onPress,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  status: ChapterStatus;
  colors: ThemeColors;
  icon: 'book' | 'review' | 'speak';
  onPress: () => void;
}) {
  const { type, minTouchTarget } = useTheme();
  const locked = status === 'locked';
  const shake = useRef(new Animated.Value(0)).current;

  const triggerShake = () => {
    shake.setValue(0);
    Animated.sequence([
      Animated.timing(shake, { toValue: 5, duration: 35, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -5, duration: 35, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 35, useNativeDriver: true }),
    ]).start();
  };

  const symbolName =
    icon === 'book'
      ? ({ ios: 'text.book.closed.fill', android: 'menu_book', web: 'menu_book' } as const)
      : icon === 'speak'
        ? ({ ios: 'quote.bubble.fill', android: 'chat_bubble', web: 'chat_bubble' } as const)
        : ({ ios: 'arrow.triangle.2.circlepath', android: 'sync', web: 'sync' } as const);

  return (
    <Animated.View style={{ transform: [{ translateX: shake }] }}>
      <Pressable
        onPress={() => {
          if (locked) {
            triggerShake();
          }
          onPress();
        }}
        style={({ pressed }) => [
          styles.checkpointRow,
          {
            backgroundColor: colors.readerSurface,
            borderColor: status === 'completed' ? colors.tint : colors.accent,
            opacity: locked ? 0.55 : pressed ? 0.88 : 1,
            minHeight: minTouchTarget,
          },
        ]}>
        <View style={styles.checkpointIcon}>
          <AppSymbol name={symbolName} tintColor={colors.accent} size={20} />
        </View>
        <View style={styles.chapterMeta}>
          <Text style={[type.caption, { color: colors.accent }]}>{eyebrow}</Text>
          <Text style={[type.label, { color: colors.text, marginTop: 2 }]}>{title}</Text>
          <Text style={[type.caption, { color: colors.textMuted, marginTop: 2 }]}>{subtitle}</Text>
        </View>
        <StatusIcon status={status} color={statusIconColor(status, colors)} />
      </Pressable>
    </Animated.View>
  );
}

function ChapterRow({
  chapter,
  isCurrent,
  colors,
  hideListen = false,
  onPress,
  onListen,
  onLockedPress,
}: {
  chapter: ChapterListItem;
  isCurrent: boolean;
  colors: ThemeColors;
  hideListen?: boolean;
  onPress: () => void;
  onListen: () => void;
  onLockedPress: () => void;
}) {
  const { type, minTouchTarget } = useTheme();
  const locked = chapter.status === 'locked';
  const shake = useRef(new Animated.Value(0)).current;

  const triggerShake = () => {
    shake.setValue(0);
    Animated.sequence([
      Animated.timing(shake, { toValue: 5, duration: 35, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -5, duration: 35, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 3, duration: 35, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 35, useNativeDriver: true }),
    ]).start();
  };

  return (
    <Animated.View style={{ transform: [{ translateX: shake }] }}>
      <Pressable
        onPress={() => {
          if (locked) {
            triggerShake();
            onLockedPress();
            return;
          }
          onPress();
        }}
        style={({ pressed }) => [
          styles.chapterRow,
          {
            backgroundColor: colors.backgroundElevated,
            borderColor: isCurrent ? colors.tint : colors.border,
            opacity: locked ? 0.55 : pressed ? 0.88 : 1,
            minHeight: minTouchTarget,
          },
        ]}>
        <View style={styles.chapterMeta}>
          <Text style={[type.caption, { color: colors.tint }]}>
            Capitolo {chapter.number}
          </Text>
          <Text style={[type.label, { color: colors.text, marginTop: 2 }]}>
            {chapter.titleIt}
          </Text>
        </View>
        <View style={styles.chapterActions}>
          {!locked && !hideListen ? (
            <Pressable
              onPress={(event) => {
                event.stopPropagation();
                onListen();
              }}
              hitSlop={8}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1, marginRight: Spacing.sm }]}>
              <Text style={[type.caption, { color: colors.tint }]}>Listen</Text>
            </Pressable>
          ) : null}
          <StatusIcon status={chapter.status} color={statusIconColor(chapter.status, colors)} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

function StatusIcon({ status, color }: { status: ChapterStatus; color: string }) {
  if (status === 'available') {
    return <View style={styles.iconSlot} />;
  }

  const name =
    status === 'completed'
      ? ({ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' } as const)
      : status === 'in_progress'
        ? ({ ios: 'play.circle.fill', android: 'play_circle', web: 'play_circle' } as const)
        : ({ ios: 'lock.fill', android: 'lock', web: 'lock' } as const);

  return (
    <View style={styles.iconSlot}>
      <AppSymbol name={name} tintColor={color} size={18} />
    </View>
  );
}

function statusIconColor(status: ChapterStatus, colors: ThemeColors): string {
  if (status === 'completed') return colors.statusMastered;
  if (status === 'in_progress') return colors.statusLearning;
  return colors.textMuted;
}

function buildLevelGroups(
  arcs: StoryArcSummary[],
  chapters: ChapterListItem[],
  currentChapterId: string,
): LevelGroup[] {
  const current = chapters.find((c) => c.id === currentChapterId);

  return arcs
    .filter((arc) => arc.chapterEnd >= arc.chapterStart)
    .map((arc) => {
      const inArc = chapters.filter(
        (c) => c.number >= arc.chapterStart && c.number <= arc.chapterEnd,
      );
      const plannedTotal = arc.chapterEnd - arc.chapterStart + 1;
      const total = inArc.length > 0 ? inArc.length : plannedTotal;
      const completed = inArc.filter((c) => c.status === 'completed').length;
      const locked =
        arc.status === 'planned' ||
        inArc.length === 0 ||
        inArc.every((c) => c.status === 'locked');
      const containsCurrent = Boolean(
        current && current.number >= arc.chapterStart && current.number <= arc.chapterEnd,
      );
      return { arc, chapters: inArc, completed, total, locked, containsCurrent };
    });
}

function unlockHintForChapter(
  chapter: ChapterListItem,
  chapters: ChapterListItem[],
  storyId?: string,
  progress?: ReadingProgressRecord | null,
): string {
  if (storyId && progress && chapter.number > 1 && (chapter.number - 1) % 5 === 0) {
    const batchEnd = chapter.number - 1;
    const grammarId = `${storyId}:grammar:${batchEnd}`;
    const recapId = `${storyId}:recap:${batchEnd}`;
    const done = new Set(progress.completedCheckpointIds ?? []);
    if (!done.has(grammarId)) {
      return `Complete the Grammar review after Ch. ${batchEnd} first`;
    }
    if (!done.has(recapId)) {
      return `Complete the batch Review after Ch. ${batchEnd} first`;
    }
  }
  const previous = chapters.find((c) => c.number === chapter.number - 1);
  return previous ? `Finish Ch. ${previous.number} comprehension to unlock` : 'Locked';
}

function unlockHintForPathItem(item: Extract<StoryPathItem, { kind: 'grammar' | 'recap' }>): string {
  if (item.kind === 'grammar') {
    return `Finish Ch. ${item.batchEnd} comprehension to unlock`;
  }
  return `Complete the Grammar step for chapters ${item.batchStart}–${item.batchEnd} first`;
}

function unlockHintForLevel(group: LevelGroup, chapters: ChapterListItem[]): string {
  if (group.chapters.length > 0) {
    return unlockHintForChapter(group.chapters[0], chapters);
  }
  const lastUnlocked = [...chapters].reverse().find((c) => c.status !== 'locked');
  return lastUnlocked ? `Finish Ch. ${lastUnlocked.number} first` : 'Coming soon';
}

const styles = StyleSheet.create({
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  levelMeta: {
    flex: 1,
    paddingRight: Spacing.md,
  },
  levelTrailing: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  chapterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.sm,
  },
  chapterMeta: {
    flex: 1,
    paddingRight: Spacing.md,
  },
  checkpointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radii.md,
    borderWidth: 1.5,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.sm,
    gap: Spacing.sm,
  },
  checkpointIcon: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chapterActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconSlot: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
