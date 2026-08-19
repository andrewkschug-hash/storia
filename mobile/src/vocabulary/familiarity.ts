import type { FamiliaritySignals, VocabularyStatus } from '@/src/vocabulary/types';

/** Deterministic, explainable familiarity. Easy to tune. */
export const FAMILIARITY_CONFIG = {
  learningMinEncounters: 3,
  learningMinChapters: 2,
  familiarMinEncounters: 8,
  familiarMinChapters: 3,
  masteredMinEncounters: 12,
  masteredMinSuccessfulReviews: 3,
  masteredMinScore: 0.75,
  familiarMinScore: 0.45,
  recencyHalfLifeDays: 21,
  tapHelpWeight: 0.12,
  saveBoost: 0.1,
  reviewBoost: 0.18,
  incorrectReviewPenalty: 0.04,
  almostReviewPenalty: 0.02,
} as const;

export const REVIEW_INTERVAL_DAYS = [1, 3, 7, 14, 30] as const;

export function computeFamiliarity(
  signals: FamiliaritySignals,
  now: Date = new Date(),
): { score: number; status: VocabularyStatus } {
  const encounters = Math.max(0, signals.encounterCount);
  const chapters = Math.max(0, signals.chaptersEncountered);
  const encounterPart = clamp(encounters / 12);
  const chapterPart = clamp(chapters / 4);
  const recencyPart = recencyScore(signals.lastEncounteredAt ?? signals.lastReviewedAt, now);

  const tapRatio = encounters === 0 ? 0 : signals.tapCount / encounters;
  const tapDrag = Math.min(FAMILIARITY_CONFIG.tapHelpWeight, tapRatio * FAMILIARITY_CONFIG.tapHelpWeight);

  const savePart = signals.saved || signals.saveCount > 0 ? FAMILIARITY_CONFIG.saveBoost : 0;

  const reviews = signals.correctReviewCount + signals.incorrectReviewCount;
  const reviewPart =
    reviews === 0
      ? 0
      : (signals.correctReviewCount / reviews) * FAMILIARITY_CONFIG.reviewBoost;
  const missDrag = Math.min(
    0.12,
    signals.incorrectReviewCount * FAMILIARITY_CONFIG.incorrectReviewPenalty,
  );
  const almostDrag = Math.min(
    0.06,
    (signals.almostReviewCount ?? 0) * FAMILIARITY_CONFIG.almostReviewPenalty,
  );

  const score = clamp(
    encounterPart * 0.45 +
      chapterPart * 0.2 +
      recencyPart * 0.15 +
      reviewPart +
      savePart -
      tapDrag -
      missDrag -
      almostDrag,
  );

  const status = statusFromScore(score, signals);
  return { score: round2(score), status };
}

function statusFromScore(score: number, signals: FamiliaritySignals): VocabularyStatus {
  if (
    score >= FAMILIARITY_CONFIG.masteredMinScore &&
    signals.encounterCount >= FAMILIARITY_CONFIG.masteredMinEncounters &&
    signals.correctReviewCount >= FAMILIARITY_CONFIG.masteredMinSuccessfulReviews
  ) {
    return 'mastered';
  }
  if (
    score >= FAMILIARITY_CONFIG.familiarMinScore &&
    signals.encounterCount >= FAMILIARITY_CONFIG.familiarMinEncounters &&
    signals.chaptersEncountered >= FAMILIARITY_CONFIG.familiarMinChapters
  ) {
    return 'familiar';
  }
  if (
    signals.encounterCount >= FAMILIARITY_CONFIG.learningMinEncounters ||
    signals.chaptersEncountered >= FAMILIARITY_CONFIG.learningMinChapters ||
    signals.saved
  ) {
    return 'learning';
  }
  return 'new';
}

function recencyScore(iso: string | null, now: Date): number {
  if (!iso) return 0.35;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return 0.35;
  const days = Math.max(0, (now.getTime() - then) / (1000 * 60 * 60 * 24));
  const half = FAMILIARITY_CONFIG.recencyHalfLifeDays;
  return clamp(Math.pow(0.5, days / half));
}

export function nextDueAt(
  intervalIndex: number,
  from: Date = new Date(),
  correct: boolean,
): { intervalIndex: number; dueAt: string } {
  const last = REVIEW_INTERVAL_DAYS.length - 1;
  const next = correct
    ? intervalIndex < 0
      ? 0
      : Math.min(last, intervalIndex + 1)
    : Math.max(0, intervalIndex <= 0 ? 0 : intervalIndex - 1);
  const days = REVIEW_INTERVAL_DAYS[next];
  const due = new Date(from.getTime() + days * 24 * 60 * 60 * 1000);
  return { intervalIndex: next, dueAt: due.toISOString() };
}

export function isDue(dueAt: string | null, now: Date = new Date()): boolean {
  if (!dueAt) return true;
  return new Date(dueAt).getTime() <= now.getTime();
}

function clamp(n: number): number {
  return Math.max(0, Math.min(1, n));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
