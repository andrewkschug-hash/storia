import type { ChapterPassPhase, ReadingProgressRecord } from '@/src/progress/types';

export type ReaderPassMode = 'read' | 'listen';

export type ReaderPassGuidance = 'guided' | 'free';

export type ResolvedReaderPass = {
  pass: ReaderPassMode;
  guidance: ReaderPassGuidance;
  passes: ChapterPassPhase;
};

export const DETAILED_PASS_INSTRUCTIONS_THRESHOLD = 3;

export function getChapterPasses(
  progress: ReadingProgressRecord,
  chapterId: string,
): ChapterPassPhase {
  return progress.passesByChapter?.[chapterId] ?? {};
}

export function isReadPassComplete(passes: ChapterPassPhase): boolean {
  return Boolean(passes.read?.completedAt);
}

export function isListenPassComplete(passes: ChapterPassPhase): boolean {
  return Boolean(passes.listen?.completedAt);
}

export function isGuidedSequenceComplete(passes: ChapterPassPhase): boolean {
  return isReadPassComplete(passes) && isListenPassComplete(passes);
}

/** Chapters where the learner finished both guided passes. */
export function countGuidedChaptersCompleted(progress: ReadingProgressRecord): number {
  const passes = progress.passesByChapter ?? {};
  return Object.values(passes).filter(isGuidedSequenceComplete).length;
}

export function shouldUseDetailedPassInstructions(progress: ReadingProgressRecord): boolean {
  return countGuidedChaptersCompleted(progress) < DETAILED_PASS_INSTRUCTIONS_THRESHOLD;
}

/**
 * Resolve which reader pass to show.
 * Guided sequence applies until both read and listen are complete for this chapter.
 * Revisits and explicit replay (listen=1 after sequence done) are free mode.
 */
export function resolveReaderPass(
  progress: ReadingProgressRecord,
  chapterId: string,
  options: { listenRequested?: boolean; replay?: boolean } = {},
): ResolvedReaderPass {
  const passes = getChapterPasses(progress, chapterId);
  const listenRequested = options.listenRequested ?? false;
  const replay = options.replay ?? false;

  if (isGuidedSequenceComplete(passes) || replay) {
    return {
      pass: listenRequested ? 'listen' : 'read',
      guidance: 'free',
      passes,
    };
  }

  if (!isReadPassComplete(passes)) {
    return { pass: 'read', guidance: 'guided', passes };
  }

  return { pass: 'listen', guidance: 'guided', passes };
}

/** Backfill pass completion for learners who finished comprehension before passes existed. */
export function migrateLegacyChapterPasses(
  record: ReadingProgressRecord,
): ReadingProgressRecord {
  const passes: Record<string, ChapterPassPhase> = { ...(record.passesByChapter ?? {}) };
  let changed = false;

  for (const [chapterId, comprehension] of Object.entries(record.comprehensionByChapter ?? {})) {
    if (!comprehension.completedAt) continue;
    const existing = passes[chapterId] ?? {};
    if (isGuidedSequenceComplete(existing)) continue;
    const stamp = comprehension.completedAt;
    passes[chapterId] = {
      read: existing.read ?? { completedAt: stamp },
      listen: existing.listen ?? { completedAt: stamp },
    };
    changed = true;
  }

  if (!changed && record.passesByChapter) return record;
  return { ...record, passesByChapter: passes };
}

export function withPassComplete(
  record: ReadingProgressRecord,
  chapterId: string,
  pass: ReaderPassMode,
  completedAt: string = new Date().toISOString(),
): ReadingProgressRecord {
  const current = getChapterPasses(record, chapterId);
  const nextPass: ChapterPassPhase = {
    ...current,
    [pass]: { completedAt },
  };
  return {
    ...record,
    passesByChapter: {
      ...(record.passesByChapter ?? {}),
      [chapterId]: nextPass,
    },
  };
}
