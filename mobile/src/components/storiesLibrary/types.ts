import type { ExtraStoryRow } from '@/src/components/storiesLevelInsert';
import type { CefrLevel } from '@/src/content/schemas';
import type { ChapterListItem } from '@/src/progress/useReadingProgress';

export type LibraryTab = CefrLevel;

export type LibraryStoryRow = {
  id: string;
  titleIt: string;
  completed: number;
  total: number;
  locked: boolean;
  kind: 'luca-segment' | 'extra' | 'group';
  storyId: string;
  eyebrow?: string;
  chapterStart?: number;
  chapterEnd?: number;
  chapters: ChapterListItem[];
  /** Child story rows — only populated for kind === 'group' */
  childRows?: LibraryStoryRow[];
};

export type LockedLevelPreview = {
  level: string;
  title: string;
  chapterCount: number;
};

export type BuildStoryRowsInput = {
  tab: LibraryTab;
  lucaTitleIt: string;
  chapterStatuses: ChapterListItem[];
  beforeRomeRows: ExtraStoryRow[];
  a2PlusRows: ExtraStoryRow[];
};
