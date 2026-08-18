import { SymbolView } from 'expo-symbols';
import { useMemo, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  unlockHintForChapter,
  unlockHintForPathItem,
} from '@/src/components/storiesLibrary/unlockHints';
import { buildStoryPath, type StoryPathItem } from '@/src/content/storyPath';
import { LUCA_STORY_ID } from '@/src/content/catalog';
import type { ChapterStatus } from '@/src/progress/types';
import type { ChapterListItem } from '@/src/progress/useReadingProgress';
import type { ReadingProgressRecord } from '@/src/progress/types';
import { Typography } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

type Props = {
  chapters: ChapterListItem[];
  currentChapterId: string;
  storyId: string;
  progress?: ReadingProgressRecord | null;
  useStoryPath: boolean;
  onOpenChapter: (chapterId: string, listen?: boolean) => void;
  onOpenStoryChapter?: (storyId: string, chapterId: string) => void;
  onOpenGrammar?: (batchEnd: number) => void;
  onOpenRecap?: (batchEnd: number) => void;
  onShowHint: (message: string) => void;
};

export function StoryPathPanel({
  chapters,
  currentChapterId,
  storyId,
  progress,
  useStoryPath,
  onOpenChapter,
  onOpenStoryChapter,
  onOpenGrammar,
  onOpenRecap,
  onShowHint,
}: Props) {
  const pathItems = useMemo(() => {
    if (!useStoryPath || storyId !== LUCA_STORY_ID) return null;
    return buildStoryPath(chapters, progress ?? null, storyId);
  }, [useStoryPath, storyId, chapters, progress]);

  return (
    <View style={styles.wrap}>
      {pathItems
        ? pathItems.map((item) => (
            <PathItemRow
              key={item.kind === 'chapter' ? item.chapter.id : item.id}
              item={item}
              currentChapterId={currentChapterId}
              allChapters={chapters}
              storyId={storyId}
              progress={progress}
              onOpenChapter={onOpenChapter}
              onOpenStoryChapter={onOpenStoryChapter}
              onOpenGrammar={onOpenGrammar}
              onOpenRecap={onOpenRecap}
              onShowHint={onShowHint}
            />
          ))
        : chapters.map((chapter) => (
            <ChapterPathRow
              key={chapter.id}
              chapter={chapter}
              isCurrent={chapter.id === currentChapterId}
              allChapters={chapters}
              storyId={storyId}
              progress={progress}
              hideListen={storyId !== LUCA_STORY_ID}
              onOpenChapter={onOpenChapter}
              onOpenStoryChapter={onOpenStoryChapter}
              onShowHint={onShowHint}
            />
          ))}
    </View>
  );
}

function PathItemRow({
  item,
  currentChapterId,
  allChapters,
  storyId,
  progress,
  onOpenChapter,
  onOpenGrammar,
  onOpenRecap,
  onShowHint,
}: {
  item: StoryPathItem;
  currentChapterId: string;
  allChapters: ChapterListItem[];
  storyId: string;
  progress?: ReadingProgressRecord | null;
  onOpenChapter: (chapterId: string, listen?: boolean) => void;
  onOpenStoryChapter?: (storyId: string, chapterId: string) => void;
  onOpenGrammar?: (batchEnd: number) => void;
  onOpenRecap?: (batchEnd: number) => void;
  onShowHint: (message: string) => void;
}) {
  if (item.kind === 'chapter') {
    return (
      <ChapterPathRow
        chapter={item.chapter}
        isCurrent={item.chapter.id === currentChapterId}
        allChapters={allChapters}
        storyId={storyId}
        progress={progress}
        onOpenChapter={onOpenChapter}
        onShowHint={onShowHint}
      />
    );
  }

  const locked = item.status === 'locked';
  const eyebrow = item.kind === 'grammar' ? 'Grammar' : 'Review';
  const title =
    item.kind === 'grammar'
      ? item.title
      : `Chapters ${item.batchStart}–${item.batchEnd}`;
  const subtitle =
    item.kind === 'grammar'
      ? `After chapters ${item.batchStart}–${item.batchEnd}`
      : 'Practice words from this batch';

  return (
    <CheckpointPathRow
      eyebrow={eyebrow}
      title={title}
      subtitle={subtitle}
      status={item.status}
      icon={item.kind === 'grammar' ? 'book' : 'review'}
      locked={locked}
      onPress={() => {
        if (locked) {
          onShowHint(unlockHintForPathItem(item));
          return;
        }
        if (item.kind === 'grammar') onOpenGrammar?.(item.batchEnd);
        if (item.kind === 'recap') onOpenRecap?.(item.batchEnd);
      }}
    />
  );
}

function ChapterPathRow({
  chapter,
  isCurrent,
  allChapters,
  storyId,
  progress,
  hideListen = false,
  onOpenChapter,
  onOpenStoryChapter,
  onShowHint,
}: {
  chapter: ChapterListItem;
  isCurrent: boolean;
  allChapters: ChapterListItem[];
  storyId: string;
  progress?: ReadingProgressRecord | null;
  hideListen?: boolean;
  onOpenChapter: (chapterId: string, listen?: boolean) => void;
  onOpenStoryChapter?: (storyId: string, chapterId: string) => void;
  onShowHint: (message: string) => void;
}) {
  const { colors, minTouchTarget } = useTheme();
  const locked = chapter.status === 'locked';
  const shake = useRef(new Animated.Value(0)).current;

  const triggerShake = () => {
    shake.setValue(0);
    Animated.sequence([
      Animated.timing(shake, { toValue: 4, duration: 35, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -4, duration: 35, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 35, useNativeDriver: true }),
    ]).start();
  };

  return (
    <Animated.View style={{ transform: [{ translateX: shake }] }}>
      <Pressable
        onPress={() => {
          if (locked) {
            triggerShake();
            onShowHint(unlockHintForChapter(chapter, allChapters, storyId, progress));
            return;
          }
          if (onOpenStoryChapter && storyId !== LUCA_STORY_ID) {
            onOpenStoryChapter(storyId, chapter.id);
            return;
          }
          onOpenChapter(chapter.id);
        }}
        style={({ pressed }) => [
          styles.pathRow,
          {
            backgroundColor: isCurrent ? 'rgba(120,182,163,0.08)' : 'transparent',
            opacity: locked ? 0.55 : pressed ? 0.88 : 1,
            minHeight: minTouchTarget,
          },
        ]}>
        <View style={styles.pathMain}>
          <Text style={[styles.pathEyebrow, { color: colors.tint }]}>
            Capitolo {chapter.number}
          </Text>
          <Text style={[styles.pathTitle, { color: colors.text }]}>{chapter.titleIt}</Text>
        </View>
        <View style={styles.pathActions}>
          {!locked && !hideListen ? (
            <Pressable
              onPress={(event) => {
                event.stopPropagation();
                onOpenChapter(chapter.id, true);
              }}
              hitSlop={8}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1, marginRight: 8 }]}>
              <Text style={[styles.listen, { color: colors.tint }]}>Listen</Text>
            </Pressable>
          ) : null}
          <StatusIcon status={chapter.status} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

function CheckpointPathRow({
  eyebrow,
  title,
  subtitle,
  status,
  icon,
  locked,
  onPress,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  status: ChapterStatus;
  icon: 'book' | 'review';
  locked: boolean;
  onPress: () => void;
}) {
  const { colors, minTouchTarget } = useTheme();
  const shake = useRef(new Animated.Value(0)).current;

  const triggerShake = () => {
    shake.setValue(0);
    Animated.sequence([
      Animated.timing(shake, { toValue: 4, duration: 35, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -4, duration: 35, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 35, useNativeDriver: true }),
    ]).start();
  };

  const symbolName =
    icon === 'book'
      ? ({ ios: 'text.book.closed.fill', android: 'menu_book', web: 'menu_book' } as const)
      : ({ ios: 'arrow.triangle.2.circlepath', android: 'sync', web: 'sync' } as const);

  return (
    <Animated.View style={{ transform: [{ translateX: shake }] }}>
      <Pressable
        onPress={() => {
          if (locked) triggerShake();
          onPress();
        }}
        style={({ pressed }) => [
          styles.pathRow,
          {
            backgroundColor: 'rgba(120,182,163,0.06)',
            opacity: locked ? 0.55 : pressed ? 0.88 : 1,
            minHeight: minTouchTarget,
          },
        ]}>
        <SymbolView name={symbolName} tintColor={colors.accent} size={18} />
        <View style={[styles.pathMain, { marginLeft: 10 }]}>
          <Text style={[styles.pathEyebrow, { color: colors.accent }]}>{eyebrow}</Text>
          <Text style={[styles.pathTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.pathMeta, { color: colors.textMuted }]}>{subtitle}</Text>
        </View>
        <StatusIcon status={status} />
      </Pressable>
    </Animated.View>
  );
}

function StatusIcon({ status }: { status: ChapterStatus }) {
  const { colors } = useTheme();
  if (status === 'available') return <View style={styles.iconSlot} />;

  const color =
    status === 'completed' ? colors.tint : status === 'in_progress' ? colors.tintSoft : colors.textMuted;
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

const styles = StyleSheet.create({
  wrap: {
    marginTop: 4,
    marginBottom: 10,
    paddingLeft: 8,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(120,182,163,0.18)',
  },
  pathRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  pathMain: {
    flex: 1,
    paddingRight: 8,
  },
  pathEyebrow: {
    ...Typography.caption,
    fontSize: 13,
  },
  pathTitle: {
    fontFamily: 'Literata_500Medium',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 2,
  },
  pathMeta: {
    ...Typography.caption,
    fontSize: 13,
    marginTop: 2,
    opacity: 0.6,
  },
  pathActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listen: {
    ...Typography.caption,
    fontSize: 13,
  },
  iconSlot: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
