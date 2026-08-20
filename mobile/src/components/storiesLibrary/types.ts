import type { ExtraStoryRow } from '@/src/components/storiesLevelInsert';
import type { ChapterListItem } from '@/src/progress/useReadingProgress';

export type LibraryTab = 'A1' | 'A1+' | 'A2' | 'A2+';

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
  /** When false, hometown stories and group stay locked until A1 mastery test passed. */
  hometownUnlocked?: boolean;
};
