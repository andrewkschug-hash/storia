import type { AdaptiveLearnerProfile } from '@/src/adaptive/types';
import type { CEFRLevel } from '@/src/cefr/levels';
import { canTransition, nextCEFRLevel } from '@/src/cefr/levels';
import { profileFor } from '@/src/cefr/profiles';
import type { ReadingProgressRecord } from '@/src/progress/types';
import type { UserVocabularyState } from '@/src/vocabulary/types';

export type ReadinessStatus = 'NOT_READY' | 'APPROACHING' | 'READY' | 'CONFIDENT';

export type LevelReadiness = {
  currentLevel: CEFRLevel;
  status: ReadinessStatus;
  nextLevel: CEFRLevel | null;
  message: string;
  reasons: string[];
  canChooseNext: boolean;
  metrics: {
    completedAtLevel: number;
    targetChapters: number;
    vocabularyStrength: number;
    phraseStrength: number;
    comprehensionStrength: number;
    recentTapRate: number;
    recentComprehensionScore: number;
    readingCompletionRate: number;
    recentSampleSize: number;
  };
};

export type ReadinessInput = {
  currentLevel: CEFRLevel;
  completedChapterNumbers: number[];
  levelChapterStart: number;
  levelChapterEnd: number;
  vocabularyStrength: number;
  phraseStrength: number;
  comprehensionStrength: number;
  recentTapRate: number;
  recentComprehensionScores: number[];
  averageSentenceDifficulty: number;
};

const MIN_CHAPTERS_FOR_READY = 3;

export function evaluateLevelReadiness(input: ReadinessInput): LevelReadiness {
  const currentLevel = input.currentLevel;
  const nextLevel = nextCEFRLevel(currentLevel);
  const targetChapters = Math.max(1, input.levelChapterEnd - input.levelChapterStart + 1);
  const completedAtLevel = input.completedChapterNumbers.filter(
    (n) => n >= input.levelChapterStart && n <= input.levelChapterEnd,
  ).length;
  const readingCompletionRate = completedAtLevel / targetChapters;
  const recent = input.recentComprehensionScores.slice(-5);
  const recentComprehensionScore =
    recent.length === 0 ? 0 : recent.reduce((s, n) => s + n, 0) / recent.length;

  const reasons: string[] = [];
  let status: ReadinessStatus = 'NOT_READY';

  const isolatedGoodChapter =
    recent.length === 1 && recent[0] >= 0.9 && completedAtLevel < MIN_CHAPTERS_FOR_READY;
  if (isolatedGoodChapter) {
    reasons.push('One strong chapter is not enough to change level.');
  }

  if (completedAtLevel < MIN_CHAPTERS_FOR_READY || isolatedGoodChapter) {
    status = 'NOT_READY';
    reasons.push('Keep reading this part of the story.');
  } else if (
    readingCompletionRate >= 0.75 &&
    input.comprehensionStrength >= 0.85 &&
    input.recentTapRate <= 0.15 &&
    input.vocabularyStrength >= 0.45 &&
    recent.length >= MIN_CHAPTERS_FOR_READY &&
    recent.every((s) => s >= 0.8)
  ) {
    status = 'CONFIDENT';
    reasons.push('Recent chapters are consistently comfortable.');
  } else if (
    readingCompletionRate >= 0.5 &&
    input.comprehensionStrength >= 0.75 &&
    input.recentTapRate <= 0.25 &&
    recent.length >= MIN_CHAPTERS_FOR_READY &&
    recent.filter((s) => s >= 0.7).length >= MIN_CHAPTERS_FOR_READY
  ) {
    status = 'READY';
    reasons.push('Vocabulary, comprehension, and tap behavior look steady.');
  } else if (readingCompletionRate >= 0.25 && input.comprehensionStrength >= 0.55) {
    status = 'APPROACHING';
    reasons.push('You are getting comfortable at this level.');
  } else {
    status = 'NOT_READY';
    reasons.push('The current stories are still the right stretch.');
  }

  const canChooseNext = (status === 'READY' || status === 'CONFIDENT') && !!nextLevel;
  const message = readinessMessage(status, nextLevel);

  return {
    currentLevel,
    status,
    nextLevel: canChooseNext ? nextLevel : nextLevel,
    message,
    reasons,
    canChooseNext,
    metrics: {
      completedAtLevel,
      targetChapters,
      vocabularyStrength: input.vocabularyStrength,
      phraseStrength: input.phraseStrength,
      comprehensionStrength: input.comprehensionStrength,
      recentTapRate: input.recentTapRate,
      recentComprehensionScore,
      readingCompletionRate,
      recentSampleSize: recent.length,
    },
  };
}

export function readinessFromLearner(
  currentLevel: CEFRLevel,
  profile: AdaptiveLearnerProfile,
  progress: ReadingProgressRecord,
  chapterNumberById: Map<string, number>,
  levelChapterStart: number,
  levelChapterEnd: number,
): LevelReadiness {
  const completedChapterNumbers = progress.completedChapterIds
    .map((id) => chapterNumberById.get(id))
    .filter((n): n is number => typeof n === 'number');
  const recentComprehensionScores = progress.completedChapterIds
    .slice(-5)
    .map((id) => progress.comprehensionByChapter[id]?.score ?? 0);

  return evaluateLevelReadiness({
    currentLevel,
    completedChapterNumbers,
    levelChapterStart,
    levelChapterEnd,
    vocabularyStrength: profile.vocabularyStrength,
    phraseStrength: profile.phraseStrength,
    comprehensionStrength: profile.comprehensionStrength,
    recentTapRate: profile.recentTapRate,
    recentComprehensionScores,
    averageSentenceDifficulty: profile.averageSentenceDifficulty ?? profile.averageSentenceLength,
  });
}

export function chooseLevel(from: CEFRLevel, to: CEFRLevel): CEFRLevel {
  if (!canTransition(from, to)) {
    throw new Error(`Level change ${from} → ${to} is not a gradual step`);
  }
  return to;
}

export function familiaritySurvivesTransition(
  before: UserVocabularyState,
  after: UserVocabularyState,
): boolean {
  return JSON.stringify(before) === JSON.stringify(after);
}

function readinessMessage(status: ReadinessStatus, next: CEFRLevel | null): string {
  if (status === 'READY' || status === 'CONFIDENT') {
    return next
      ? 'You seem ready for slightly more challenging stories.'
      : 'You are reading comfortably at the current level.';
  }
  if (status === 'APPROACHING') {
    return 'You are getting comfortable. A little more of this story will help.';
  }
  return 'Keep reading. The story will get richer when you are ready.';
}

export function levelChapterRange(
  currentLevel: CEFRLevel,
  arcs: { cefrLevel: CEFRLevel; chapterStart: number; chapterEnd: number; status: string }[],
): { start: number; end: number } {
  const arc = arcs.find((a) => a.cefrLevel === currentLevel && a.chapterEnd >= a.chapterStart);
  if (arc) return { start: arc.chapterStart, end: arc.chapterEnd };
  const profile = profileFor(currentLevel);
  void profile;
  return { start: 1, end: 20 };
}
