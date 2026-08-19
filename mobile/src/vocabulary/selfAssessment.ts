import {
  FAMILIARITY_CONFIG,
  REVIEW_INTERVAL_DAYS,
  nextDueAt,
} from '@/src/vocabulary/familiarity';
import { refreshFamiliarity } from '@/src/vocabulary/normalize';
import type { LemmaEncounter, PhraseEncounter } from '@/src/vocabulary/types';

export type SelfAssessment = 'got_it' | 'almost' | 'not_yet';

export type SelfAssessmentSource =
  | 'production'
  | 'batch_recap'
  | 'speak_scene'
  | 'practice_hub'
  | 'review_mcq'
  | 'migration';

export type SelfAssessmentContext = {
  source: SelfAssessmentSource;
  storyId?: string;
  chapterId?: string;
  sentenceId?: string;
  exerciseId?: string;
  sceneId?: string;
  lineId?: string;
};

export const SELF_ASSESSMENT_CONFIG = {
  almostPenalty: 0.02,
  almostPenaltyCap: 0.06,
  recentAssessmentBoostDays: 7,
} as const;

/** Spaced repetition for three-way self-assessment. */
export function nextDueAtForAssessment(
  assessment: SelfAssessment,
  intervalIndex: number,
  from: Date = new Date(),
): { intervalIndex: number; dueAt: string } {
  if (assessment === 'got_it') return nextDueAt(intervalIndex, from, true);
  if (assessment === 'not_yet') return nextDueAt(intervalIndex, from, false);

  const idx = intervalIndex < 0 ? 0 : intervalIndex;
  const days = REVIEW_INTERVAL_DAYS[idx] ?? REVIEW_INTERVAL_DAYS[0];
  const due = new Date(from.getTime() + days * 24 * 60 * 60 * 1000);
  return {
    intervalIndex,
    dueAt: due.toISOString(),
  };
}

export function applySelfAssessment(
  row: LemmaEncounter | PhraseEncounter,
  assessment: SelfAssessment,
  now: Date = new Date(),
): LemmaEncounter | PhraseEncounter {
  const iso = now.toISOString();
  row.reviewCount += 1;
  row.lastReviewedAt = iso;
  row.lastSelfAssessment = assessment;
  row.lastSelfAssessmentAt = iso;

  if (assessment === 'got_it') {
    row.correctReviewCount += 1;
  } else if (assessment === 'almost') {
    row.almostReviewCount += 1;
  } else {
    row.incorrectReviewCount += 1;
  }

  const spaced = nextDueAtForAssessment(assessment, row.intervalIndex, now);
  row.intervalIndex = spaced.intervalIndex;
  row.dueAt = spaced.dueAt;

  refreshFamiliarity(row, now);
  return row;
}

export function almostDrag(almostReviewCount: number): number {
  return Math.min(
    SELF_ASSESSMENT_CONFIG.almostPenaltyCap,
    almostReviewCount * FAMILIARITY_CONFIG.almostReviewPenalty,
  );
}

export function daysSince(iso: string | null, now: Date = new Date()): number | null {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  return Math.max(0, (now.getTime() - then) / (1000 * 60 * 60 * 24));
}

export function recentAssessmentBoost(
  assessment: SelfAssessment | null,
  lastSelfAssessmentAt: string | null,
  now: Date = new Date(),
): number {
  if (!assessment || !lastSelfAssessmentAt) return 0;
  const days = daysSince(lastSelfAssessmentAt, now);
  if (days === null || days > SELF_ASSESSMENT_CONFIG.recentAssessmentBoostDays) return 0;
  if (assessment === 'not_yet') return 60;
  if (assessment === 'almost') return 30;
  return 0;
}
