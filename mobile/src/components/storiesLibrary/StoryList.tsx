import { useEffect, useMemo, useRef, useState } from 'react';
import { Text, View } from 'react-native';

import { buildStoryRowsForTab } from '@/src/components/storiesLibrary/buildStoryRows';
import { LevelTabs } from '@/src/components/storiesLibrary/LevelTabs';
import { LockedLevelsAccordion } from '@/src/components/storiesLibrary/LockedLevelsAccordion';
import { StoryPathPanel } from '@/src/components/storiesLibrary/StoryPathPanel';
import { StoryRow } from '@/src/components/storiesLibrary/StoryRow';
import type { LibraryTab } from '@/src/components/storiesLibrary/types';
import { unlockHintForLockedStory } from '@/src/components/storiesLibrary/unlockHints';
import type { ExtraStoryRow } from '@/src/components/storiesLevelInsert';
import { LUCA_STORY_ID } from '@/src/content/catalog';
import type { ChapterListItem } from '@/src/progress/useReadingProgress';
import type { ReadingProgressRecord } from '@/src/progress/types';
import { useTheme } from '@/src/theme/useTheme';

type Props = {
  lucaTitleIt: string;
  chapterStatuses: ChapterListItem[];
  currentChapterId: string;
  progress?: ReadingProgressRecord | null;
  beforeRomeRows: ExtraStoryRow[];
  a2PlusRows: ExtraStoryRow[];
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
      }),
    [activeTab, lucaTitleIt, chapterStatuses, beforeRomeRows, a2PlusRows],
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

  const handleRowPress = (rowId: string, locked: boolean, chapters: ChapterListItem[]) => {
    if (locked) {
      showHint(unlockHintForLockedStory(chapters));
      return;
    }
    setExpandedRowId((prev) => (prev === rowId ? null : rowId));
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
                onPress={() => handleRowPress(row.id, row.locked, row.chapters)}
              />
              {expanded && !row.locked ? (
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
