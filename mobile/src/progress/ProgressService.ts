import type { Chapter, Story } from '@/src/content/schemas';
import { LUCA_STORY_ID } from '@/src/content/catalog';
import {
  isFirstChapterAfterBatch,
  legacyBatchEndsForProgress,
  recapBlocksChapter,
} from '@/src/content/storyPath';
import { unlockAllChapters } from '@/src/progress/unlockAll';
import {
  createInitialProgress,
  normalizeProgress,
  type ChapterComprehensionRecord,
  type ChapterProductionRecord,
  type ChapterStatus,
  type ComprehensionAnswerRecord,
  type ReadingProgressRecord,
  type ReadingProgressRepository,
} from '@/src/progress/types';

function todayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function yesterdayKey(date = new Date()): string {
  const d = new Date(date);
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export class ProgressService {
  constructor(
    private readonly repo: ReadingProgressRepository,
    private readonly story: Story,
    private readonly chaptersById: Map<string, Chapter>,
    private readonly narrativeArc?: string,
  ) {}

  get storyId(): string {
    return this.story.id;
  }

  async getOrCreate(): Promise<ReadingProgressRecord> {
    const existing = await this.repo.get(this.story.id);
    if (existing) {
      const normalized = normalizeProgress(existing, this.narrativeArc);
      if (!existing.comprehensionByChapter || (!existing.narrativeArc && this.narrativeArc)) {
        await this.repo.save(normalized);
      }
      return normalized;
    }
    const first = this.story.chapters[0];
    const initial = createInitialProgress(this.story.id, first.id, this.narrativeArc);
    await this.repo.save(initial);
    return initial;
  }

  async getChapterStatus(chapterId: string): Promise<ChapterStatus> {
    const progress = await this.getOrCreate();
    const chapter = this.chaptersById.get(chapterId);
    if (!chapter) return 'locked';

    if (progress.completedChapterIds.includes(chapterId)) {
      return 'completed';
    }

    if (unlockAllChapters()) {
      return progress.currentChapterId === chapterId ? 'in_progress' : 'available';
    }

    if (chapter.number === 1) {
      return progress.currentChapterId === chapterId ? 'in_progress' : 'available';
    }

    const previous = this.story.chapters.find((c) => c.number === chapter.number - 1);
    if (!previous || !progress.completedChapterIds.includes(previous.id)) {
      return 'locked';
    }

    const chapterNumberById = new Map(
      [...this.chaptersById.values()].map((c) => [c.id, c.number] as const),
    );
    if (
      this.story.id === LUCA_STORY_ID &&
      isFirstChapterAfterBatch(chapter.number) &&
      recapBlocksChapter(progress, this.story.id, chapter.number, chapterNumberById)
    ) {
      return 'locked';
    }

    if (progress.currentChapterId === chapterId) {
      return 'in_progress';
    }

    return 'available';
  }

  async openChapter(chapterId: string): Promise<ReadingProgressRecord> {
    const status = await this.getChapterStatus(chapterId);
    if (status === 'locked') {
      throw new Error(`Chapter ${chapterId} is locked`);
    }

    const progress = await this.getOrCreate();
    const next: ReadingProgressRecord = {
      ...progress,
      currentChapterId: chapterId,
      lastOpenedAt: new Date().toISOString(),
      streakDays: this.nextStreak(progress),
      lastStreakDate: todayKey(),
    };
    await this.repo.save(next);
    return next;
  }

  async savePosition(chapterId: string, sentenceId: string | null): Promise<ReadingProgressRecord> {
    const progress = await this.getOrCreate();
    const next: ReadingProgressRecord = {
      ...progress,
      currentChapterId: chapterId,
      lastSentenceId: sentenceId,
      lastOpenedAt: new Date().toISOString(),
    };
    await this.repo.save(next);
    return next;
  }

  async addReadingTime(ms: number): Promise<ReadingProgressRecord> {
    const progress = await this.getOrCreate();
    const next = { ...progress, readingTimeMs: progress.readingTimeMs + Math.max(0, ms) };
    await this.repo.save(next);
    return next;
  }

  hasFinishedComprehension(progress: ReadingProgressRecord, chapterId: string): boolean {
    return Boolean(progress.comprehensionByChapter[chapterId]?.completedAt);
  }

  /**
   * Persist comprehension results for a chapter. Does not unlock the next chapter by itself.
   */
  async recordComprehension(
    chapterId: string,
    answers: ComprehensionAnswerRecord[],
  ): Promise<ReadingProgressRecord> {
    const progress = await this.getOrCreate();
    const chapter = this.chaptersById.get(chapterId);
    if (!chapter) throw new Error(`Unknown chapter ${chapterId}`);
    if (answers.length === 0) {
      throw new Error('Comprehension requires at least one answered question');
    }

    const correct = answers.filter((a) => a.correct).length;
    const incorrect = answers.length - correct;
    const record: ChapterComprehensionRecord = {
      attempted: answers.reduce((sum, a) => sum + a.attempts, 0),
      correct,
      incorrect,
      score: answers.length === 0 ? 0 : correct / answers.length,
      completedAt: new Date().toISOString(),
      answers,
    };

    const next: ReadingProgressRecord = {
      ...progress,
      comprehensionByChapter: {
        ...progress.comprehensionByChapter,
        [chapterId]: record,
      },
      lastOpenedAt: new Date().toISOString(),
    };
    await this.repo.save(next);
    return next;
  }

  /**
   * Persist optional production self-assessment. Does not complete or lock the chapter.
   */
  async recordProduction(
    chapterId: string,
    record: Omit<ChapterProductionRecord, 'completedAt'> & { completedAt?: string | null },
  ): Promise<ReadingProgressRecord> {
    const progress = await this.getOrCreate();
    const chapter = this.chaptersById.get(chapterId);
    if (!chapter) throw new Error(`Unknown chapter ${chapterId}`);

    const next: ReadingProgressRecord = {
      ...progress,
      productionByChapter: {
        ...(progress.productionByChapter ?? {}),
        [chapterId]: {
          skipped: record.skipped,
          attempts: [...record.attempts],
          completedAt: record.completedAt ?? new Date().toISOString(),
        },
      },
      lastOpenedAt: new Date().toISOString(),
    };
    await this.repo.save(next);
    return next;
  }

  /**
   * Mark chapter complete and unlock next. Requires comprehension section finished.
   */
  async completeChapter(chapterId: string): Promise<ReadingProgressRecord> {
    const progress = await this.getOrCreate();
    const chapter = this.chaptersById.get(chapterId);
    if (!chapter) throw new Error(`Unknown chapter ${chapterId}`);

    const status = await this.getChapterStatus(chapterId);
    if (status === 'locked') throw new Error(`Chapter ${chapterId} is locked`);

    if (!this.hasFinishedComprehension(progress, chapterId)) {
      throw new Error(
        `Chapter ${chapterId} cannot be completed before the comprehension section`,
      );
    }

    const completed = new Set(progress.completedChapterIds);
    completed.add(chapterId);

    const nextChapter = this.story.chapters.find((c) => c.number === chapter.number + 1);
    const next: ReadingProgressRecord = {
      ...progress,
      completedChapterIds: [...completed],
      currentChapterId: nextChapter?.id ?? chapterId,
      lastSentenceId: null,
      lastOpenedAt: new Date().toISOString(),
      streakDays: this.nextStreak(progress),
      lastStreakDate: todayKey(),
    };
    await this.repo.save(next);
    return next;
  }

  /**
   * Finish comprehension + complete chapter in one step (results → Continue).
   */
  async finishComprehensionAndComplete(
    chapterId: string,
    answers: ComprehensionAnswerRecord[],
  ): Promise<ReadingProgressRecord> {
    await this.recordComprehension(chapterId, answers);
    return this.completeChapter(chapterId);
  }

  getContinueChapterId(progress: ReadingProgressRecord): string {
    return progress.currentChapterId;
  }

  getCompletedCount(progress: ReadingProgressRecord): number {
    return progress.completedChapterIds.length;
  }

  getPercentComplete(progress: ReadingProgressRecord): number {
    const total = this.story.chapters.length;
    if (total === 0) return 0;
    return Math.round((progress.completedChapterIds.length / total) * 100);
  }

  /** Includes partial credit for the current chapter based on last sentence read. */
  getReadingPercentComplete(progress: ReadingProgressRecord): number {
    const total = this.story.chapters.length;
    if (total === 0) return 0;

    let units = progress.completedChapterIds.length;
    const current = this.chaptersById.get(progress.currentChapterId);
    if (current && !progress.completedChapterIds.includes(current.id)) {
      units += this.getChapterSentenceFraction(current, progress.lastSentenceId);
    }

    const raw = (units / total) * 100;
    if (raw > 0 && raw < 1) return 1;
    return Math.min(100, Math.round(raw));
  }

  getChapterSentenceFraction(chapter: Chapter, lastSentenceId: string | null): number {
    const sentences = chapter.paragraphs.flatMap((p) => p.sentences);
    if (sentences.length === 0) return 0;
    if (!lastSentenceId) return 0.05;
    const index = sentences.findIndex((s) => s.id === lastSentenceId);
    if (index < 0) return 0.05;
    return (index + 1) / sentences.length;
  }

  getChapterReadingPercent(chapter: Chapter, lastSentenceId: string | null): number {
    return Math.round(this.getChapterSentenceFraction(chapter, lastSentenceId) * 100);
  }

  async setCEFRLevel(level: string): Promise<ReadingProgressRecord> {
    const progress = await this.getOrCreate();
    const next: ReadingProgressRecord = {
      ...progress,
      currentCEFRLevel: level,
      lastOpenedAt: new Date().toISOString(),
    };
    await this.repo.save(next);
    return next;
  }

  async completeCheckpoint(checkpointId: string): Promise<ReadingProgressRecord> {
    const progress = await this.getOrCreate();
    const completed = new Set(progress.completedCheckpointIds ?? []);
    completed.add(checkpointId);
    const next: ReadingProgressRecord = {
      ...progress,
      completedCheckpointIds: [...completed],
      lastOpenedAt: new Date().toISOString(),
    };
    await this.repo.save(next);
    return next;
  }

  legacyBatchEnds(progress: ReadingProgressRecord): number[] {
    const chapterNumberById = new Map(
      [...this.chaptersById.values()].map((c) => [c.id, c.number] as const),
    );
    return legacyBatchEndsForProgress(progress, chapterNumberById);
  }

  isRecapCheckpointComplete(progress: ReadingProgressRecord, batchEnd: number): boolean {
    const chapterNumberById = new Map(
      [...this.chaptersById.values()].map((c) => [c.id, c.number] as const),
    );
    return !recapBlocksChapter(progress, this.story.id, batchEnd + 1, chapterNumberById);
  }

  private nextStreak(progress: ReadingProgressRecord): number {
    const today = todayKey();
    if (progress.lastStreakDate === today) return progress.streakDays || 1;
    if (progress.lastStreakDate === yesterdayKey()) return (progress.streakDays || 0) + 1;
    return 1;
  }
}
