import type { ReadingProgressRecord, ReadingProgressRepository } from '@/src/progress/types';

/** In-memory repository for unit tests */
export class MemoryReadingProgressRepository implements ReadingProgressRepository {
  private store = new Map<string, ReadingProgressRecord>();

  async get(storyId: string): Promise<ReadingProgressRecord | null> {
    return this.store.get(storyId) ?? null;
  }

  async save(progress: ReadingProgressRecord): Promise<void> {
    this.store.set(progress.storyId, { ...progress, completedChapterIds: [...progress.completedChapterIds] });
  }

  async clear(storyId: string): Promise<void> {
    this.store.delete(storyId);
  }

  async listAll(): Promise<ReadingProgressRecord[]> {
    return [...this.store.values()].map((row) => ({
      ...row,
      completedChapterIds: [...row.completedChapterIds],
    }));
  }

  async clearAll(): Promise<void> {
    this.store.clear();
  }
}
