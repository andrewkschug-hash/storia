import type { AdaptiveLearnerProfile } from '@/src/adaptive/types';
import { DEFAULT_LUCA_ARCS } from '@/src/cefr/arcs';
import type { CEFRLevel } from '@/src/cefr/levels';
import { parseCEFRLevel } from '@/src/cefr/levels';
import {
  chooseLevel,
  evaluateLevelReadiness,
  levelChapterRange,
  readinessFromLearner,
  type LevelReadiness,
} from '@/src/cefr/readiness';
import type { ContentBundle } from '@/src/content/schemas';
import type { ProgressService } from '@/src/progress/ProgressService';
import type { ReadingProgressRecord } from '@/src/progress/types';

export class LevelReadinessService {
  constructor(
    private readonly bundle: ContentBundle,
    private readonly progress: ProgressService,
  ) {}

  currentLevel(record: ReadingProgressRecord): CEFRLevel {
    return parseCEFRLevel(record.currentCEFRLevel ?? 'A1');
  }

  evaluate(profile: AdaptiveLearnerProfile, record: ReadingProgressRecord): LevelReadiness {
    const current = this.currentLevel(record);
    const arcs = this.bundle.story.arcs ?? DEFAULT_LUCA_ARCS;
    const range = levelChapterRange(current, arcs);
    const numbers = new Map(
      [...this.bundle.chapters.values()].map((c) => [c.id, c.number] as const),
    );
    return readinessFromLearner(current, profile, record, numbers, range.start, range.end);
  }

  async chooseNext(profile: AdaptiveLearnerProfile): Promise<{ progress: ReadingProgressRecord; readiness: LevelReadiness }> {
    const record = await this.progress.getOrCreate();
    const readiness = this.evaluate(profile, record);
    if (!readiness.canChooseNext || !readiness.nextLevel) {
      return { progress: record, readiness };
    }
    const next = chooseLevel(readiness.currentLevel, readiness.nextLevel);
    const progress = await this.progress.setCEFRLevel(next);
    return { progress, readiness: this.evaluate(profile, progress) };
  }
}

export { evaluateLevelReadiness };
