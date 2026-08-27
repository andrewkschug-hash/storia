import type { BuildStoryRowsInput, LibraryStoryRow, LibraryTab } from '@/src/components/storiesLibrary/types';
import { LUCA_STORY_ID } from '@/src/content/catalog';
import type { ChapterListItem } from '@/src/progress/useReadingProgress';

const LUCA_RANGES: Record<Exclude<LibraryTab, 'A2+'>, { start: number; end: number; act: string }> = {
  A1: { start: 1, end: 20, act: 'Atto I · Arrivo' },
  'A1+': { start: 21, end: 24, act: 'Atto II · Appartenenza' },
  A2: { start: 25, end: 40, act: 'Atto III · Responsabilità' },
  B1: { start: 41, end: 55, act: 'Atto IV · Due vite possibili' },
  'B1+': { start: 56, end: 70, act: 'Atto V · La scelta rinnovata' },
};

function chaptersInRange(chapters: ChapterListItem[], start: number, end: number): ChapterListItem[] {
  return chapters.filter((chapter) => chapter.number >= start && chapter.number <= end);
}

function lucaSegmentRow(
  tab: Exclude<LibraryTab, 'A2+'>,
  lucaTitleIt: string,
  chapterStatuses: ChapterListItem[],
): LibraryStoryRow {
  const { start, end, act } = LUCA_RANGES[tab];
  const inRange = chaptersInRange(chapterStatuses, start, end);
  const completed = inRange.filter((chapter) => chapter.status === 'completed').length;
  const locked = inRange.length > 0 && inRange.every((chapter) => chapter.status === 'locked');

  return {
    id: `luca-${tab}`,
    titleIt: lucaTitleIt,
    eyebrow: act,
    completed,
    total: inRange.length || end - start + 1,
    locked,
    kind: 'luca-segment',
    storyId: LUCA_STORY_ID,
    chapterStart: start,
    chapterEnd: end,
    chapters: inRange,
  };
}

export function buildStoryRowsForTab(input: BuildStoryRowsInput): LibraryStoryRow[] {
  const { tab, lucaTitleIt, chapterStatuses, beforeRomeRows, a2PlusRows } = input;

  if (tab === 'A2+') {
    return a2PlusRows.map((story) => ({
      id: story.storyId,
      titleIt: story.titleIt,
      completed: story.completed,
      total: story.total,
      locked: story.chapters.length > 0 && story.chapters.every((chapter) => chapter.status === 'locked'),
      kind: 'extra' as const,
      storyId: story.storyId,
      eyebrow: story.eyebrow,
      chapters: story.chapters as ChapterListItem[],
    }));
  }

  const rows: LibraryStoryRow[] = [lucaSegmentRow(tab, lucaTitleIt, chapterStatuses)];

  if (tab === 'A1' && beforeRomeRows.length > 0) {
    const childRows: LibraryStoryRow[] = beforeRomeRows.map((story) => ({
      id: story.storyId,
      titleIt: story.titleIt,
      completed: story.completed,
      total: story.total,
      locked:
        story.chapters.length > 0 && story.chapters.every((chapter) => chapter.status === 'locked'),
      kind: 'extra' as const,
      storyId: story.storyId,
      chapters: story.chapters as ChapterListItem[],
    }));
    const totalCompleted = childRows.reduce((sum, row) => sum + row.completed, 0);
    const totalChapters = childRows.reduce((sum, row) => sum + row.total, 0);
    rows.push({
      id: 'luca-before-rome',
      titleIt: 'Luca before Rome',
      eyebrow: 'Hometown stories',
      completed: totalCompleted,
      total: totalChapters,
      locked: false,
      kind: 'group',
      storyId: '',
      chapters: childRows.flatMap((row) => row.chapters),
      childRows,
    });
  }

  return rows;
}

export const LIBRARY_TABS: LibraryTab[] = ['A1', 'A1+', 'A2', 'A2+', 'B1', 'B1+'];

export const LOCKED_LEVEL_PREVIEWS = [
  { level: 'B2', title: 'Nuovi orizzonti', chapterCount: 0 },
  { level: 'C1', title: 'Padronanza autentica', chapterCount: 0 },
] as const;

