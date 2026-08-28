import { router, type Href } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { getLevelGate, type LevelGate } from '@/src/cefr/levelGates';
import { LevelGateModal } from '@/src/components/levelGate/LevelGateModal';
import { A2PlusPathwayPanel } from '@/src/components/pathway/A2PlusPathwayPanel';
import { buildStoryRowsForTab } from '@/src/components/storiesLibrary/buildStoryRows';
import { LevelTabs } from '@/src/components/storiesLibrary/LevelTabs';
import { LockedLevelsAccordion } from '@/src/components/storiesLibrary/LockedLevelsAccordion';
import { StoryPathPanel } from '@/src/components/storiesLibrary/StoryPathPanel';
import { StoryRow } from '@/src/components/storiesLibrary/StoryRow';
import type { LibraryStoryRow, LibraryTab } from '@/src/components/storiesLibrary/types';
import { unlockHintForLockedStory } from '@/src/components/storiesLibrary/unlockHints';
import type { ExtraStoryRow } from '@/src/components/storiesLevelInsert';
import { storyUsesLessonPath } from '@/src/content/storyPath';
import type { PathwayDefinition } from '@/src/pathway/paths';
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
  a2PlusAccess: boolean;
  a2PlusLockedHint: string;
  primaryPathwayStoryId: string | null;
  initialTab?: LibraryTab;
  onOpenChapter: (chapterId: string, listen?: boolean) => void;
  onOpenStoryChapter: (storyId: string, chapterId: string) => void;
  onOpenGrammar: (storyId: string, batchEnd: number) => void;
  onOpenRecap: (storyId: string, batchEnd: number) => void;
  onOpenSpeak: (storyId: string, sceneId: string) => void;
  onSelectPathway: (pathway: PathwayDefinition) => void;
  onA2PlusTabFocus?: () => void;
};

function tabForChapterNumber(number: number): LibraryTab {
  if (number <= 20) return 'A1';
  if (number <= 24) return 'A1+';
  if (number <= 40) return 'A2';
  if (number <= 55) return 'B1';
  return 'B1+';
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
  a2PlusAccess,
  a2PlusLockedHint,
  primaryPathwayStoryId,
  initialTab,
  onOpenChapter,
  onOpenStoryChapter,
  onOpenGrammar,
  onOpenRecap,
  onOpenSpeak,
  onSelectPathway,
  onA2PlusTabFocus,
}: Props) {
  const { colors } = useTheme();
  const currentChapter = chapterStatuses.find((chapter) => chapter.id === currentChapterId);
  const [activeTab, setActiveTab] = useState<LibraryTab>(
    () => initialTab ?? (currentChapter ? tabForChapterNumber(currentChapter.number) : 'A1'),
  );
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [expandedChildId, setExpandedChildId] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [selectedGateForModal, setSelectedGateForModal] = useState<LevelGate | null>(null);
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
    if (activeTab === 'A2+') {
      onA2PlusTabFocus?.();
    }
  }, [activeTab, onA2PlusTabFocus]);

  useEffect(() => {
    setExpandedRowId(defaultExpandedRowId(rows, currentChapterId));
    const childMatch = beforeRomeRows.find((row) =>
      row.chapters.some((chapter) => chapter.id === currentChapterId),
    );
    setExpandedChildId(childMatch?.storyId ?? null);
  }, [activeTab, currentChapterId, rows, beforeRomeRows]);

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
      const gate = getLevelGate(activeTab as any);
      if (gate) {
        setSelectedGateForModal(gate);
        return;
      }
      showHint(unlockHintForLockedStory(chapters));
      return;
    }
    setExpandedRowId((prev) => (prev === rowId ? null : rowId));
  };

  const handleTabChange = (tab: LibraryTab) => {
    setActiveTab(tab);
  };

  return (
    <View>
      <LevelGateModal
        visible={Boolean(selectedGateForModal)}
        gate={selectedGateForModal}
        onClose={() => setSelectedGateForModal(null)}
        onContinueJourney={() => {
          setSelectedGateForModal(null);
          if (selectedGateForModal?.previousLevel) {
            setActiveTab(selectedGateForModal.previousLevel as LibraryTab);
          }
        }}
        onTakeReadinessTest={(gate) => {
          setSelectedGateForModal(null);
          router.push(`/readiness-test?level=${gate.level}` as Href);
        }}
      />

      <LevelTabs active={activeTab} onChange={handleTabChange} />

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

      {activeTab === 'A2+' ? (
        <A2PlusPathwayPanel
          a2PlusAccess={a2PlusAccess}
          lockedHint={a2PlusLockedHint}
          primaryPathwayStoryId={primaryPathwayStoryId}
          a2PlusRows={a2PlusRows}
          onSelectAvailable={onSelectPathway}
          onOpenStoryChapter={onOpenStoryChapter}
          onShowHint={showHint}
        />
      ) : (
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
              {expanded && !row.locked && row.kind === 'group' && row.childRows
                ? row.childRows.map((child) => {
                    const childExpanded = expandedChildId === child.id;
                    const source = beforeRomeRows.find((item) => item.storyId === child.storyId);
                    return (
                      <View key={child.id}>
                        <ChildStoryRow
                          row={child}
                          expanded={childExpanded}
                          currentChapterId={currentChapterId}
                          onPress={() =>
                            setExpandedChildId((prev) => (prev === child.id ? null : child.id))
                          }
                        />
                        {childExpanded && !child.locked ? (
                          <StoryPathPanel
                            chapters={child.chapters}
                            currentChapterId={currentChapterId}
                            storyId={child.storyId}
                            progress={source?.progress ?? null}
                            useStoryPath={storyUsesLessonPath(child.storyId)}
                            onOpenChapter={(chapterId) =>
                              onOpenStoryChapter(child.storyId, chapterId)
                            }
                            onOpenStoryChapter={onOpenStoryChapter}
                            onOpenGrammar={onOpenGrammar}
                            onOpenRecap={onOpenRecap}
                            onOpenSpeak={onOpenSpeak}
                            onShowHint={showHint}
                          />
                        ) : null}
                      </View>
                    );
                  })
                : null}
              {expanded && !row.locked && row.kind !== 'group' ? (
                <StoryPathPanel
                  chapters={row.chapters}
                  currentChapterId={currentChapterId}
                  storyId={row.storyId}
                  progress={row.storyId === 'luca-a-roma' ? progress : null}
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
      )}

      <LockedLevelsAccordion
        onSelectLevel={(level) => {
          const gate = getLevelGate(level as any);
          if (gate) {
            setSelectedGateForModal(gate);
          } else {
            router.push(`/readiness-test?level=${level}` as Href);
          }
        }}
      />
    </View>
  );
}

function ChildStoryRow({
  row,
  expanded,
  currentChapterId,
  onPress,
}: {
  row: LibraryStoryRow;
  expanded: boolean;
  currentChapterId: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const isCurrent = row.chapters.some((ch) => ch.id === currentChapterId);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        childStyles.row,
        {
          backgroundColor: isCurrent || expanded
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
          {expanded ? ' · path open' : ''}
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
