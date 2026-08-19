import { migrateLegacyChapterPasses } from '@/src/progress/chapterPass';

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

/** Self-assessment from optional production. Never gates chapter completion. */
export type ProductionSelfAssessment = 'got_it' | 'almost' | 'not_yet' | 'skipped';

export type ChapterProductionAttempt = {
  exerciseId: string;
  assessment: ProductionSelfAssessment;
};

export type ChapterProductionRecord = {
  skipped: boolean;
  completedAt: string | null;
  attempts: ChapterProductionAttempt[];
};

export type SpeakSceneVote = 'got_it' | 'almost' | 'not_yet';

export type SpeakSceneLineAttempt = {
  lineId: string;
  vote: SpeakSceneVote;
  score: 'correct' | 'almost' | 'incorrect' | 'unrecognized';
  attempts: number;
  learnerText: string;
  timestamp: string;
};

export type SpeakSceneRecord = {
  sceneId: string;
  skipped: boolean;
  completedAt: string | null;
  lines: SpeakSceneLineAttempt[];
};

/** Guided read→listen pass completion for a chapter. */
export type ChapterPassPhase = {
  read?: { completedAt: string };
  listen?: { completedAt: string };
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
  /** Optional production reinforcement. Missing/empty does not block completion. */
  productionByChapter?: Record<string, ChapterProductionRecord>;
  /** Grammar and batch-recap nodes on the story path (e.g. luca-a-roma:grammar:5). */
  completedCheckpointIds?: string[];
  /** Speak-scene attempts keyed by sceneId. Never gates the next chapter. */
  speakScenes?: Record<string, SpeakSceneRecord[]>;
  /** Learner-chosen CEFR band. Never auto-promoted from one good chapter. */
  currentCEFRLevel: string;
  /** Read/listen pass timestamps keyed by chapterId. */
  passesByChapter?: Record<string, ChapterPassPhase>;
};

export interface ReadingProgressRepository {
  get(storyId: string): Promise<ReadingProgressRecord | null>;
  save(progress: ReadingProgressRecord): Promise<void>;
  clear(storyId: string): Promise<void>;
  listAll?(): Promise<ReadingProgressRecord[]>;
  clearAll?(): Promise<void>;
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
    productionByChapter: {},
    completedCheckpointIds: [],
    speakScenes: {},
    currentCEFRLevel: 'A1',
    passesByChapter: {},
  };
}

export function normalizeProgress(
  record: ReadingProgressRecord,
  narrativeArc?: string,
): ReadingProgressRecord {
  const base = {
    ...record,
    comprehensionByChapter: record.comprehensionByChapter ?? {},
    productionByChapter: record.productionByChapter ?? {},
    completedCheckpointIds: record.completedCheckpointIds ?? [],
    speakScenes: record.speakScenes ?? {},
    currentCEFRLevel: record.currentCEFRLevel ?? 'A1',
    narrativeArc: record.narrativeArc ?? narrativeArc,
    passesByChapter: record.passesByChapter ?? {},
  };
  return migrateLegacyChapterPasses(base);
}
