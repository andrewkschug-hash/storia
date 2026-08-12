import type { AdaptiveStateRepository } from '@/src/adaptive/MemoryAdaptiveStateRepository';
import { buildAdaptiveProfile } from '@/src/adaptive/profile';
import { selectAdaptiveChapter } from '@/src/adaptive/select';
import type { AdaptiveLearnerProfile, AdaptivePersistedState } from '@/src/adaptive/types';
import type { Chapter, ContentBundle } from '@/src/content/schemas';
import type { ReadingProgressRecord } from '@/src/progress/types';
import { createLemmaEncounter, refreshFamiliarity } from '@/src/vocabulary/normalize';
import type { UserVocabularyState } from '@/src/vocabulary/types';
import type { VocabularyService } from '@/src/vocabulary/VocabularyService';

export class AdaptiveVocabularyService {
  private cached: AdaptivePersistedState | null = null;

  constructor(
    private readonly repo: AdaptiveStateRepository,
    private readonly bundle: ContentBundle,
    private readonly vocab: VocabularyService,
  ) {}

  async getState(): Promise<AdaptivePersistedState> {
    if (!this.cached) this.cached = await this.repo.get();
    return this.cached;
  }

  async buildProfile(progress: ReadingProgressRecord, now?: Date): Promise<AdaptiveLearnerProfile> {
    const vocab = await this.vocab.getState();
    const adaptive = await this.getState();
    const profile = buildAdaptiveProfile(this.bundle, vocab, progress, {
      currentChapterId: progress.currentChapterId,
      completedChapterIds: progress.completedChapterIds,
      recentHits: adaptive.recentHits,
      now,
    });
    adaptive.lastProfile = profile;
    adaptive.lastUpdatedAt = profile.lastUpdatedAt;
    await this.persist(adaptive);
    return profile;
  }

  async resolveChapter(
    authored: Chapter,
    progress: ReadingProgressRecord,
    now?: Date,
  ): Promise<Chapter> {
    try {
      const profile = await this.buildProfile(
        { ...progress, currentChapterId: authored.id },
        now,
      );
      const adaptive = await this.getState();
      const result = selectAdaptiveChapter(
        authored,
        this.bundle,
        profile.adaptiveItems,
        adaptive.recentHits,
        now ?? new Date(),
      );
      adaptive.logs = [...adaptive.logs, ...result.logs].slice(-120);
      adaptive.recentHits = [...adaptive.recentHits, ...result.hits].slice(-80);
      adaptive.lastUpdatedAt = (now ?? new Date()).toISOString();
      await this.persist(adaptive);
      return result.chapter;
    } catch {
      return authored;
    }
  }

  async seedManualTestLearner(): Promise<UserVocabularyState> {
    const now = new Date().toISOString();
    const aspettare = refreshFamiliarity({
      ...createLemmaEncounter('aspettare'),
      encounterCount: 12,
      tapCount: 8,
      chaptersEncountered: ['luca-a-roma-08', 'luca-a-roma-11'],
      firstChapterId: 'luca-a-roma-08',
      lastChapterId: 'luca-a-roma-08',
      firstEncounteredAt: now,
      lastEncounteredAt: now,
      recentEncounters: [
        { tapped: true, at: now, chapterId: 'luca-a-roma-08' },
        { tapped: true, at: now, chapterId: 'luca-a-roma-08' },
        { tapped: false, at: now, chapterId: 'luca-a-roma-08' },
        { tapped: false, at: now, chapterId: 'luca-a-roma-08' },
        { tapped: false, at: now, chapterId: 'luca-a-roma-08' },
      ],
    });
    const casa = refreshFamiliarity({
      ...createLemmaEncounter('casa'),
      encounterCount: 20,
      tapCount: 1,
      chaptersEncountered: ['luca-a-roma-03', 'luca-a-roma-07', 'luca-a-roma-20'],
      firstChapterId: 'luca-a-roma-03',
      lastChapterId: 'luca-a-roma-07',
      firstEncounteredAt: now,
      lastEncounteredAt: now,
      recentEncounters: [
        { tapped: false, at: now, chapterId: 'luca-a-roma-07' },
        { tapped: false, at: now, chapterId: 'luca-a-roma-07' },
        { tapped: false, at: now, chapterId: 'luca-a-roma-07' },
        { tapped: false, at: now, chapterId: 'luca-a-roma-07' },
        { tapped: false, at: now, chapterId: 'luca-a-roma-07' },
      ],
    });
    const state: UserVocabularyState = {
      lemmas: { aspettare, casa },
      phrases: {},
    };
    await this.vocab.__replaceState(state);
    return state;
  }

  async __replaceState(state: AdaptivePersistedState) {
    this.cached = state;
    await this.repo.save(state);
  }

  private async persist(state: AdaptivePersistedState) {
    this.cached = state;
    await this.repo.save(state);
  }
}
