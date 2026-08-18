import type { BuildStoryRowsInput, LibraryStoryRow, LibraryTab } from '@/src/components/storiesLibrary/types';
import { LUCA_STORY_ID } from '@/src/content/catalog';
import type { ChapterListItem } from '@/src/progress/useReadingProgress';

const LUCA_RANGES: Record<Exclude<LibraryTab, 'A2+'>, { start: number; end: number }> = {
  A1: { start: 1, end: 20 },
  'A1+': { start: 21, end: 24 },
  A2: { start: 25, end: 40 },
};

function chaptersInRange(chapters: ChapterListItem[], start: number, end: number): ChapterListItem[] {
  return chapters.filter((chapter) => chapter.number >= start && chapter.number <= end);
}

function lucaSegmentRow(
  tab: Exclude<LibraryTab, 'A2+'>,
  lucaTitleIt: string,
  chapterStatuses: ChapterListItem[],
): LibraryStoryRow {
  const { start, end } = LUCA_RANGES[tab];
  const inRange = chaptersInRange(chapterStatuses, start, end);
  const completed = inRange.filter((chapter) => chapter.status === 'completed').length;
  const locked = inRange.length > 0 && inRange.every((chapter) => chapter.status === 'locked');

  return {
    id: `luca-${tab}`,
    titleIt: lucaTitleIt,
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

  if (tab === 'A1') {
    for (const story of beforeRomeRows) {
      rows.push({
        id: story.storyId,
        titleIt: story.titleIt,
        completed: story.completed,
        total: story.total,
        locked: story.chapters.length > 0 && story.chapters.every((chapter) => chapter.status === 'locked'),
        kind: 'extra',
        storyId: story.storyId,
        eyebrow: story.eyebrow,
        chapters: story.chapters as ChapterListItem[],
      });
    }
  }

  return rows;
}

export const LIBRARY_TABS: LibraryTab[] = ['A1', 'A1+', 'A2', 'A2+'];

export const LOCKED_LEVEL_PREVIEWS = [
  { level: 'B1', title: 'Independent reading', chapterCount: 0 },
  { level: 'B1+', title: 'Extended narratives', chapterCount: 0 },
  { level: 'B2', title: 'Bigger decisions', chapterCount: 0 },
  { level: 'C1', title: 'Advanced fluency', chapterCount: 0 },
] as const;
