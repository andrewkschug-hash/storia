import type { CEFRLevel } from '@/src/cefr/levels';
import { cefrFromScore, cefrRank } from '@/src/cefr/levels';
import { profileFor } from '@/src/cefr/profiles';

export type DifficultyBreakdown = {
  vocabulary: number;
  sentence: number;
  grammar: number;
  novelty: number;
  inference: number;
  overall: number;
  estimatedLevel: CEFRLevel;
  weights: {
    vocabulary: number;
    sentence: number;
    grammar: number;
    novelty: number;
    inference: number;
  };
};

export const DIFFICULTY_WEIGHTS = {
  vocabulary: 0.35,
  sentence: 0.25,
  grammar: 0.15,
  novelty: 0.15,
  inference: 0.1,
} as const;

/** Explainable weighted score. Not a black-box model. */
export function combineDifficulty(parts: {
  vocabulary: number;
  sentence: number;
  grammar: number;
  novelty: number;
  inference: number;
}): DifficultyBreakdown {
  const weights = DIFFICULTY_WEIGHTS;
  const overall =
    parts.vocabulary * weights.vocabulary +
    parts.sentence * weights.sentence +
    parts.grammar * weights.grammar +
    parts.novelty * weights.novelty +
    parts.inference * weights.inference;
  return {
    ...parts,
    overall: round1(overall),
    estimatedLevel: cefrFromScore(overall),
    weights,
  };
}

export type TargetFit = 'TOO EASY' | 'ON TARGET' | 'TOO HARD';

export function fitAgainstTarget(estimated: CEFRLevel, target: CEFRLevel): TargetFit {
  const delta = cefrRank(estimated) - cefrRank(target);
  if (delta <= -2) return 'TOO EASY';
  if (delta >= 2) return 'TOO HARD';
  return 'ON TARGET';
}

export function noveltyScore(newPercent: number, target: CEFRLevel): number {
  const expected = profileFor(target).vocabularyNoveltyPercentage * 100;
  if (newPercent <= expected) return Math.min(40, newPercent * 1.2);
  return Math.min(100, 40 + (newPercent - expected) * 2.2);
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
