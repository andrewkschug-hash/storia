import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { buildStoryRowsForTab } from '@/src/components/storiesLibrary/buildStoryRows';
import { LevelTabs } from '@/src/components/storiesLibrary/LevelTabs';
import { LockedLevelsAccordion } from '@/src/components/storiesLibrary/LockedLevelsAccordion';
import { StoryPathPanel } from '@/src/components/storiesLibrary/StoryPathPanel';
import { StoryRow } from '@/src/components/storiesLibrary/StoryRow';
import type { LibraryStoryRow, LibraryTab } from '@/src/components/storiesLibrary/types';
import { unlockHintForHometownGroup, unlockHintForLockedStory } from '@/src/components/storiesLibrary/unlockHints';
import type { ExtraStoryRow } from '@/src/components/storiesLevelInsert';
import { LUCA_STORY_ID } from '@/src/content/catalog';
import type { ChapterListItem } from '@/src/progress/useReadingProgress';
import type { ReadingProgressRecord } from '@/src/progress/types';
import { Typography } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

type Props = {
  lucaTitleIt: string;
  chapterStatuses: ChapterListItem[];
  currentChapterId: string;
  progress?: ReadingProgressRecord | null;
  beforeRomeRows: ExtraStoryRow[];
  a2PlusRows: ExtraStoryRow[];
  /** Hometown stories unlock after the A1 mastery test. */
  hometownUnlocked?: boolean;
  onOpenChapter: (chapterId: string, listen?: boolean) => void;
  onOpenStoryChapter: (storyId: string, chapterId: string) => void;
  onOpenGrammar: (batchEnd: number) => void;
  onOpenRecap: (batchEnd: number) => void;
  onOpenSpeak: (sceneId: string) => void;
};

function tabForChapterNumber(number: number): LibraryTab {
  if (number <= 20) return 'A1';
  if (number <= 24) return 'A1+';
  return 'A2';
}

function defaultExpandedRowId(
  rows: ReturnType<typeof buildStoryRowsForTab>,
  currentChapterId: string,
): string | null {
  const match = rows.find((row) => row.chapters.some((chapter) => chapter.id === currentChapterId));
  return match?.id ?? rows[0]?.id ?? null;
}

export function StoryList({
  lucaTitleIt,
  chapterStatuses,
  currentChapterId,
  progress,
  beforeRomeRows,
  a2PlusRows,
  hometownUnlocked = true,
  onOpenChapter,
  onOpenStoryChapter,
  onOpenGrammar,
  onOpenRecap,
  onOpenSpeak,
}: Props) {
  const { colors } = useTheme();
  const currentChapter = chapterStatuses.find((chapter) => chapter.id === currentChapterId);
  const [activeTab, setActiveTab] = useState<LibraryTab>(() =>
    currentChapter ? tabForChapterNumber(currentChapter.number) : 'A1',
  );
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const rows = useMemo(
    () =>
      buildStoryRowsForTab({
        tab: activeTab,
        lucaTitleIt,
        chapterStatuses,
        beforeRomeRows,
        a2PlusRows,
        hometownUnlocked,
      }),
    [activeTab, lucaTitleIt, chapterStatuses, beforeRomeRows, a2PlusRows, hometownUnlocked],
  );

  useEffect(() => {
    setExpandedRowId(defaultExpandedRowId(rows, currentChapterId));
  }, [activeTab, currentChapterId, rows]);

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

  const handleRowPress = (row: LibraryStoryRow) => {
    if (row.locked) {
      if (row.id === 'luca-before-rome') {
        showHint(unlockHintForHometownGroup());
        return;
      }
      showHint(
        unlockHintForLockedStory(row.chapters, {
          a1PlusLocked: row.kind === 'luca-segment' && row.chapterStart === 21,
        }),
      );
      return;
    }
    setExpandedRowId((prev) => (prev === row.id ? null : row.id));
  };

  return (
    <View>
      <LevelTabs active={activeTab} onChange={setActiveTab} />

      {hint ? (
        <Text
          style={{
            color: colors.textSecondary,
            marginBottom: 12,
            textAlign: 'center',
            fontSize: 14,
            lineHeight: 20,
            opacity: 0.75,
          }}>
          {hint}
        </Text>
      ) : null}

      <View style={{ gap: 10 }}>
        {rows.map((row) => {
          const expanded = expandedRowId === row.id;
          return (
            <View key={row.id}>
              <StoryRow
                row={row}
                expanded={expanded}
                onPress={() => handleRowPress(row)}
              />
              {expanded && !row.locked && row.kind === 'group' && row.childRows
                ? row.childRows.map((child) => (
                    <ChildStoryRow
                      key={child.id}
                      row={child}
                      currentChapterId={currentChapterId}
                      onOpenChapter={onOpenStoryChapter}
                    />
                  ))
                : null}
              {expanded && !row.locked && row.kind !== 'group' ? (
                <StoryPathPanel
                  chapters={row.chapters}
                  currentChapterId={currentChapterId}
                  storyId={row.storyId}
                  progress={row.storyId === LUCA_STORY_ID ? progress : null}
                  useStoryPath={row.kind === 'luca-segment'}
                  onOpenChapter={onOpenChapter}
                  onOpenStoryChapter={onOpenStoryChapter}
                  onOpenGrammar={onOpenGrammar}
                  onOpenRecap={onOpenRecap}
                  onOpenSpeak={onOpenSpeak}
                  onShowHint={showHint}
                />
              ) : null}
            </View>
          );
        })}
      </View>

      <LockedLevelsAccordion />
    </View>
  );
}

function ChildStoryRow({
  row,
  currentChapterId,
  onOpenChapter,
}: {
  row: LibraryStoryRow;
  currentChapterId: string;
  onOpenChapter: (storyId: string, chapterId: string) => void;
}) {
  const { colors } = useTheme();
  const firstAvailable = row.chapters.find(
    (ch) => ch.status === 'available' || ch.status === 'in_progress',
  );
  const isCurrent = row.chapters.some((ch) => ch.id === currentChapterId);

  return (
    <Pressable
      onPress={() => {
        const target = firstAvailable ?? row.chapters[0];
        if (target) onOpenChapter(row.storyId, target.id);
      }}
      style={({ pressed }) => [
        childStyles.row,
        {
          backgroundColor: isCurrent
            ? 'rgba(120,182,163,0.07)'
            : pressed
              ? 'rgba(255,255,255,0.04)'
              : 'transparent',
        },
      ]}>
      <View style={childStyles.main}>
        <Text style={[childStyles.title, { color: colors.text }]}>{row.titleIt}</Text>
        <Text style={[childStyles.meta, { color: colors.textMuted }]}>
          {row.completed} / {row.total} chapters
        </Text>
      </View>
    </Pressable>
  );
}

const childStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 2,
    marginLeft: 8,
  },
  main: {
    flex: 1,
  },
  title: {
    fontFamily: 'Literata_500Medium',
    fontSize: 16,
    lineHeight: 22,
  },
  meta: {
    ...Typography.caption,
    fontSize: 13,
    marginTop: 2,
    opacity: 0.7,
  },
});
