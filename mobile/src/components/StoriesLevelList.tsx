import { SymbolView } from 'expo-symbols';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import type { ChapterStatus } from '@/src/progress/types';
import type { ChapterListItem } from '@/src/progress/useReadingProgress';
import { Radii, Spacing, Typography, type ThemeColors } from '@/src/theme/tokens';

export type StoryArcSummary = {
  id: string;
  cefrLevel: string;
  title: string;
  chapterStart: number;
  chapterEnd: number;
  status: 'available' | 'planned';
};

type Props = {
  arcs: StoryArcSummary[];
  chapters: ChapterListItem[];
  currentChapterId: string;
  colors: ThemeColors;
  onOpenChapter: (chapterId: string, listen?: boolean) => void;
};

type LevelGroup = {
  arc: StoryArcSummary;
  chapters: ChapterListItem[];
  completed: number;
  total: number;
  locked: boolean;
  containsCurrent: boolean;
};

export function StoriesLevelList({
  arcs,
  chapters,
  currentChapterId,
  colors,
  onOpenChapter,
}: Props) {
  const groups = useMemo(
    () => buildLevelGroups(arcs, chapters, currentChapterId),
    [arcs, chapters, currentChapterId],
  );

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
            Typography.caption,
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
                showHint(unlockHintForChapter(chapter, chapters));
                return;
              }
              onOpenChapter(chapter.id);
            }}
            onListen={(chapterId) => onOpenChapter(chapterId, true)}
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
  onToggle,
  onChapterPress,
  onListen,
}: {
  group: LevelGroup;
  expanded: boolean;
  currentChapterId: string;
  colors: ThemeColors;
  onToggle: () => void;
  onChapterPress: (chapter: ChapterListItem) => void;
  onListen: (chapterId: string) => void;
}) {
  const shake = useRef(new Animated.Value(0)).current;

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
            },
          ]}>
          <View style={styles.levelMeta}>
            <Text style={[Typography.chapterEyebrow, { color: colors.tint }]}>
              {group.arc.cefrLevel}
            </Text>
            <Text style={[Typography.label, { color: colors.text, marginTop: 2 }]}>
              {group.arc.title}
            </Text>
            <Text style={[Typography.caption, { color: colors.textMuted, marginTop: 2 }]}>
              {summary}
            </Text>
          </View>
          <View style={styles.levelTrailing}>
            {group.locked ? (
              <StatusIcon status="locked" color={colors.textMuted} />
            ) : (
              <SymbolView
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
        ? group.chapters.map((chapter) => (
            <ChapterRow
              key={chapter.id}
              chapter={chapter}
              isCurrent={chapter.id === currentChapterId}
              colors={colors}
              onPress={() => onChapterPress(chapter)}
              onListen={() => onListen(chapter.id)}
              onLockedPress={() => onChapterPress(chapter)}
            />
          ))
        : null}
    </View>
  );
}

function ChapterRow({
  chapter,
  isCurrent,
  colors,
  onPress,
  onListen,
  onLockedPress,
}: {
  chapter: ChapterListItem;
  isCurrent: boolean;
  colors: ThemeColors;
  onPress: () => void;
  onListen: () => void;
  onLockedPress: () => void;
}) {
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
          },
        ]}>
        <View style={styles.chapterMeta}>
          <Text style={[Typography.caption, { color: colors.tint }]}>
            Capitolo {chapter.number}
          </Text>
          <Text style={[Typography.label, { color: colors.text, marginTop: 2 }]}>
            {chapter.titleIt}
          </Text>
        </View>
        <View style={styles.chapterActions}>
          {!locked ? (
            <Pressable
              onPress={(event) => {
                event.stopPropagation();
                onListen();
              }}
              hitSlop={8}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1, marginRight: Spacing.sm }]}>
              <Text style={[Typography.caption, { color: colors.tint }]}>Listen</Text>
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
      <SymbolView name={name} tintColor={color} size={18} />
    </View>
  );
}

function statusIconColor(status: ChapterStatus, colors: ThemeColors): string {
  if (status === 'completed') return colors.tint;
  if (status === 'in_progress') return colors.tintSoft;
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

function unlockHintForChapter(chapter: ChapterListItem, chapters: ChapterListItem[]): string {
  const previous = chapters.find((c) => c.number === chapter.number - 1);
  return previous ? `Finish Ch. ${previous.number} comprehension to unlock` : 'Locked';
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
