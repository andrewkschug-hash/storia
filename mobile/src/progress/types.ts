/**
 * Reading progress — UI talks to ProgressService only.
 */

export type ChapterStatus = 'locked' | 'available' | 'in_progress' | 'completed';

export type ComprehensionAnswerRecord = {
  questionId: string;
  correct: boolean;
  attempts: number;
};

export type ChapterComprehensionRecord = {
  attempted: number;
  correct: number;
  incorrect: number;
  /** 0–1 ratio of questions eventually answered correctly */
  score: number;
  completedAt: string | null;
  answers: ComprehensionAnswerRecord[];
};

export type ReadingProgressRecord = {
  storyId: string;
  /** Catalog narrative arc. Independent of chapter numbers. */
  narrativeArc?: string;
  currentChapterId: string;
  lastSentenceId: string | null;
  /** chapter ids completed (requires comprehension section finished) */
  completedChapterIds: string[];
  readingTimeMs: number;
  lastOpenedAt: string | null;
  streakDays: number;
  lastStreakDate: string | null; // YYYY-MM-DD
  comprehensionByChapter: Record<string, ChapterComprehensionRecord>;
  /** Learner-chosen CEFR band. Never auto-promoted from one good chapter. */
  currentCEFRLevel: string;
};

export interface ReadingProgressRepository {
  get(storyId: string): Promise<ReadingProgressRecord | null>;
  save(progress: ReadingProgressRecord): Promise<void>;
  clear(storyId: string): Promise<void>;
}

export function createInitialProgress(
  storyId: string,
  firstChapterId: string,
  narrativeArc?: string,
): ReadingProgressRecord {
  return {
    storyId,
    ...(narrativeArc ? { narrativeArc } : {}),
    currentChapterId: firstChapterId,
    lastSentenceId: null,
    completedChapterIds: [],
    readingTimeMs: 0,
    lastOpenedAt: null,
    streakDays: 0,
    lastStreakDate: null,
    comprehensionByChapter: {},
    currentCEFRLevel: 'A1',
  };
}

export function normalizeProgress(
  record: ReadingProgressRecord,
  narrativeArc?: string,
): ReadingProgressRecord {
  return {
    ...record,
    comprehensionByChapter: record.comprehensionByChapter ?? {},
    currentCEFRLevel: record.currentCEFRLevel ?? 'A1',
    narrativeArc: record.narrativeArc ?? narrativeArc,
  };
}
