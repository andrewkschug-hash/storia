/**
 * Cross-story A1 readiness.
 *
 * Content completion ≠ CEFR readiness.
 * A1 complete ≠ Luca a Roma chapter 20.
 * Future available A1 stories join the same pool automatically.
 */

import type { CatalogStory, Chapter } from '@/src/content/schemas';
import type { ChapterComprehensionRecord, ReadingProgressRecord } from '@/src/progress/types';
import type { ReadinessStatus } from '@/src/cefr/readiness';
import type { UserVocabularyState } from '@/src/vocabulary/types';

export type ChapterDomainMeta = {
  primaryDomain?: string;
  secondaryDomains?: string[];
};

export const COMPREHENSION_PASS_SCORE = 2 / 3;

export const A1_CROSS_STORY_THRESHOLDS = {
  minPassedForApproaching: 3,
  minDomainCoverageForApproaching: 0.2,
  minComprehensionForApproaching: 0.55,
  minPassedForReady: 8,
  minDomainCoverageForReady: 0.6,
  minComprehensionForReady: 0.7,
  minStoriesForReady: 2,
  minContentCompletionForReady: 0.25,
  minPassedForConfident: 16,
  minDomainCoverageForConfident: 0.85,
  minComprehensionForConfident: 0.8,
  minStoriesForConfident: 3,
  minRepeatedDomainRateForConfident: 0.35,
  minContentCompletionForConfident: 0.45,
} as const;

export const A1_DOMAIN_GROUPS: { id: string; label: string; domains: string[] }[] = [
  {
    id: 'everyday',
    label: 'Everyday situations',
    domains: ['introductions', 'age', 'family', 'numbers', 'descriptions', 'social'],
  },
  {
    id: 'time',
    label: 'Time & dates',
    domains: ['clock', 'dates', 'days', 'daily_routine', 'schedules'],
  },
  {
    id: 'shopping',
    label: 'Shopping & prices',
    domains: ['food', 'ordering', 'prices', 'quantities', 'shopping'],
  },
  {
    id: 'town',
    label: 'Directions & transport',
    domains: ['places', 'directions', 'weather', 'seasons', 'transportation'],
  },
  {
    id: 'social',
    label: 'Social conversations',
    domains: ['birthdays', 'invitations', 'likes', 'social'],
  },
];

const DOMAIN_ALIASES: Record<string, string> = {
  routine: 'daily_routine',
  social_interaction: 'social',
  'social interaction': 'social',
};

export function normalizeA1Domain(raw: string | undefined): string | null {
  if (!raw) return null;
  const key = raw.trim().toLowerCase().replace(/\s+/g, '_');
  if (!key) return null;
  return DOMAIN_ALIASES[key] ?? DOMAIN_ALIASES[raw.trim().toLowerCase()] ?? key;
}

export function domainsFromMeta(meta: ChapterDomainMeta | undefined): string[] {
  if (!meta) return [];
  const values = [meta.primaryDomain, ...(meta.secondaryDomains ?? [])]
    .map(normalizeA1Domain)
    .filter((value): value is string => Boolean(value));
  return [...new Set(values)];
}

export function isComprehensionPassed(record: ChapterComprehensionRecord | undefined): boolean {
  if (!record?.completedAt) return false;
  return record.score >= COMPREHENSION_PASS_SCORE;
}

export type A1ReadinessSignal = {
  storyId: string;
  narrativeArc: string;
  cefrLevel: string;
  status: string;
  completedChapterIds: string[];
  domainsSeen: string[];
  a1ChapterIds: string[];
  encounteredChapterIds: string[];
  comprehensionAttemptedIds: string[];
  comprehensionPassedIds: string[];
  comprehensionScores: Record<string, number>;
  domainsAvailable: string[];
  domainsPassed: string[];
  /** Domains on each comprehension-passed chapter, for repeated-evidence. */
  passedDomainsByChapter: Record<string, string[]>;
};

export type A1DomainGroupEvidence = {
  id: string;
  label: string;
  met: boolean;
};

export type CrossStoryA1Metrics = {
  totalA1Chapters: number;
  completedChapters: number;
  encounteredChapters: number;
  passedChapters: number;
  attemptedComprehension: number;
  domainCoverage: number;
  domainsAvailable: number;
  domainsPassed: number;
  storiesInPool: number;
  storiesWithPassed: number;
  meanComprehension: number;
  repeatedDomainRate: number;
  contentCompletion: number;
  vocabularySupport: number | null;
};

export type CrossStoryA1Readiness = {
  implemented: true;
  status: ReadinessStatus;
  nextLevel: 'A1+';
  canChooseNext: boolean;
  message: string;
  reasons: string[];
  contentCompletion: number;
  groups: A1DomainGroupEvidence[];
  metrics: CrossStoryA1Metrics;
  signals: A1ReadinessSignal[];
};

export function collectA1ReadinessSignals(input: {
  stories: CatalogStory[];
  progressByStoryId: Record<string, ReadingProgressRecord | undefined>;
  domainsByStoryAndChapter?: Record<string, Record<string, ChapterDomainMeta>>;
  a1ChapterIdsByStory?: Record<string, string[]>;
}): A1ReadinessSignal[] {
  return input.stories
    .filter((story) => story.cefrLevel === 'A1' || story.cefrLevels?.includes('A1'))
    .map((story) => {
      const progress = input.progressByStoryId[story.id];
      const byChapter = input.domainsByStoryAndChapter?.[story.id] ?? {};
      const explicitA1 = input.a1ChapterIdsByStory?.[story.id];
      const a1ChapterIds = explicitA1 ?? Object.keys(byChapter);
      const a1Set = new Set(a1ChapterIds);
      const inA1 = (chapterId: string) => explicitA1 === undefined || a1Set.has(chapterId);
      const completed = (progress?.completedChapterIds ?? []).filter(inA1);
      const currentId = progress?.currentChapterId && inA1(progress.currentChapterId)
        ? progress.currentChapterId
        : undefined;
      const encountered = new Set<string>([
        ...completed,
        ...(currentId ? [currentId] : []),
        ...Object.keys(progress?.comprehensionByChapter ?? {}).filter(inA1),
      ]);

      const comprehensionScores: Record<string, number> = {};
      const attempted: string[] = [];
      const passed: string[] = [];
      for (const [chapterId, record] of Object.entries(progress?.comprehensionByChapter ?? {})) {
        if (!inA1(chapterId)) continue;
        comprehensionScores[chapterId] = record.score;
        attempted.push(chapterId);
        if (isComprehensionPassed(record)) passed.push(chapterId);
      }

      const domainsAvailable = new Set<string>();
      for (const chapterId of a1ChapterIds) {
        for (const domain of domainsFromMeta(byChapter[chapterId])) domainsAvailable.add(domain);
      }

      const domainsPassed = new Set<string>();
      const passedDomainsByChapter: Record<string, string[]> = {};
      for (const chapterId of passed) {
        const chapterDomains = domainsFromMeta(byChapter[chapterId]);
        passedDomainsByChapter[chapterId] = chapterDomains;
        for (const domain of chapterDomains) domainsPassed.add(domain);
      }

      const domainsSeen = new Set<string>();
      for (const chapterId of completed) {
        for (const domain of domainsFromMeta(byChapter[chapterId])) domainsSeen.add(domain);
      }

      return {
        storyId: story.id,
        narrativeArc: story.narrativeArc,
        cefrLevel: story.cefrLevel,
        status: story.status,
        completedChapterIds: completed,
        domainsSeen: [...domainsSeen],
        a1ChapterIds,
        encounteredChapterIds: [...encountered],
        comprehensionAttemptedIds: attempted,
        comprehensionPassedIds: passed,
        comprehensionScores,
        domainsAvailable: [...domainsAvailable],
        domainsPassed: [...domainsPassed],
        passedDomainsByChapter,
      };
    });
}

function safeRatio(numerator: number, denominator: number): number {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) return 0;
  return numerator / denominator;
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function groupEvidence(passedDomains: Set<string>): A1DomainGroupEvidence[] {
  return A1_DOMAIN_GROUPS.map((group) => ({
    id: group.id,
    label: group.label,
    met: group.domains.some((domain) => passedDomains.has(domain)),
  }));
}

export function evaluateCrossStoryA1Readiness(
  signals: A1ReadinessSignal[],
  options?: { vocabularySupport?: number | null },
): CrossStoryA1Readiness {
  const availableSignals = signals.filter((signal) => signal.status === 'available');
  const pool = availableSignals.length > 0 ? availableSignals : signals;

  const totalA1Chapters = pool.reduce((sum, signal) => sum + signal.a1ChapterIds.length, 0);
  const completedChapters = pool.reduce((sum, signal) => sum + signal.completedChapterIds.length, 0);
  const encounteredChapters = pool.reduce(
    (sum, signal) => sum + new Set(signal.encounteredChapterIds).size,
    0,
  );
  const passedChapters = pool.reduce((sum, signal) => sum + signal.comprehensionPassedIds.length, 0);
  const attemptedComprehension = pool.reduce(
    (sum, signal) => sum + signal.comprehensionAttemptedIds.length,
    0,
  );
  const storiesWithPassed = pool.filter((signal) => signal.comprehensionPassedIds.length > 0).length;

  const domainsAvailable = new Set<string>();
  const domainsPassed = new Set<string>();
  const passedCountByDomain = new Map<string, number>();
  const comprehensionScores: number[] = [];

  for (const signal of pool) {
    for (const domain of signal.domainsAvailable) domainsAvailable.add(domain);
    for (const domain of signal.domainsPassed) domainsPassed.add(domain);
    for (const chapterId of signal.comprehensionPassedIds) {
      const score = signal.comprehensionScores[chapterId];
      if (typeof score === 'number') comprehensionScores.push(score);
      const chapterDomains = signal.passedDomainsByChapter?.[chapterId] ?? [];
      for (const domain of chapterDomains) {
        passedCountByDomain.set(domain, (passedCountByDomain.get(domain) ?? 0) + 1);
      }
    }
  }

  const repeatedDomains = [...passedCountByDomain.entries()].filter(([, count]) => count >= 2).length;
  const meanComprehension =
    comprehensionScores.length > 0
      ? mean(comprehensionScores)
      : mean(
          pool.flatMap((signal) =>
            signal.comprehensionAttemptedIds.map((id) => signal.comprehensionScores[id] ?? 0),
          ),
        );

  const domainCoverage = safeRatio(domainsPassed.size, domainsAvailable.size);
  const contentCompletion = safeRatio(completedChapters, totalA1Chapters);
  const repeatedDomainRate = safeRatio(repeatedDomains, domainsPassed.size);
  const vocabularySupport =
    typeof options?.vocabularySupport === 'number' && Number.isFinite(options.vocabularySupport)
      ? Math.max(0, Math.min(1, options.vocabularySupport))
      : null;

  const T = A1_CROSS_STORY_THRESHOLDS;
  const reasons: string[] = [];
  let status: ReadinessStatus = 'NOT_READY';

  const approaching =
    passedChapters >= T.minPassedForApproaching &&
    meanComprehension >= T.minComprehensionForApproaching &&
    (domainCoverage >= T.minDomainCoverageForApproaching || passedChapters >= 8);

  const ready =
    passedChapters >= T.minPassedForReady &&
    domainCoverage >= T.minDomainCoverageForReady &&
    meanComprehension >= T.minComprehensionForReady &&
    storiesWithPassed >= T.minStoriesForReady &&
    contentCompletion >= T.minContentCompletionForReady;

  const confident =
    passedChapters >= T.minPassedForConfident &&
    domainCoverage >= T.minDomainCoverageForConfident &&
    meanComprehension >= T.minComprehensionForConfident &&
    storiesWithPassed >= T.minStoriesForConfident &&
    repeatedDomainRate >= T.minRepeatedDomainRateForConfident &&
    contentCompletion >= T.minContentCompletionForConfident;

  if (confident) {
    status = 'CONFIDENT';
    reasons.push('You have broad A1 evidence across several stories.');
  } else if (ready) {
    status = 'READY';
    reasons.push('Everyday A1 situations, comprehension, and variety look steady.');
  } else if (approaching) {
    status = 'APPROACHING';
    if (storiesWithPassed < 2) {
      reasons.push('Try another A1 story — one story is not enough.');
    } else if (domainCoverage < T.minDomainCoverageForReady) {
      reasons.push('Add more everyday variety: time, shopping, or directions.');
    } else if (meanComprehension < T.minComprehensionForReady) {
      reasons.push('Comprehension still needs more successful checks.');
    } else {
      reasons.push('You are getting comfortable. A little more A1 reading will help.');
    }
  } else {
    status = 'NOT_READY';
    reasons.push('Keep reading A1 stories. Opening a chapter is not enough on its own.');
  }

  if (vocabularySupport !== null && vocabularySupport >= 0.4 && (status === 'READY' || status === 'CONFIDENT')) {
    reasons.push('Vocabulary exposure supports this reading.');
  } else if (vocabularySupport !== null && vocabularySupport < 0.2 && status !== 'NOT_READY') {
    reasons.push('Keep meeting new words in the stories.');
  }

  const canChooseNext = status === 'READY' || status === 'CONFIDENT';
  const message =
    status === 'CONFIDENT' || status === 'READY'
      ? "You're ready to start the next step."
      : status === 'APPROACHING'
        ? 'You are getting comfortable with A1. A little more variety will help.'
        : 'Keep reading A1 stories. The next step can wait.';

  return {
    implemented: true,
    status,
    nextLevel: 'A1+',
    canChooseNext,
    message,
    reasons,
    contentCompletion,
    groups: groupEvidence(domainsPassed),
    metrics: {
      totalA1Chapters,
      completedChapters,
      encounteredChapters,
      passedChapters,
      attemptedComprehension,
      domainCoverage,
      domainsAvailable: domainsAvailable.size,
      domainsPassed: domainsPassed.size,
      storiesInPool: pool.length,
      storiesWithPassed,
      meanComprehension,
      repeatedDomainRate,
      contentCompletion,
      vocabularySupport,
    },
    signals: pool,
  };
}

export function vocabularySupportFromState(
  state: UserVocabularyState | null | undefined,
): number | null {
  if (!state) return null;
  const lemmas = Object.values(state.lemmas);
  if (lemmas.length === 0) return null;
  const supportive = lemmas.filter(
    (lemma) =>
      lemma.status === 'familiar' || lemma.status === 'mastered' || lemma.familiarityScore >= 0.5,
  ).length;
  return safeRatio(supportive, lemmas.length);
}

export function a1ChaptersForStory(story: CatalogStory, chapters: Iterable<Chapter>): Chapter[] {
  const all = [...chapters].filter((chapter) => chapter.storyId === story.id);
  if (story.cefrLevels && story.cefrLevels.length > 1) {
    return all.filter((chapter) => {
      const target = chapter.cefrTarget;
      if (target === 'A1') return true;
      if (target === 'A1+' || target === 'A2') return false;
      return chapter.number >= 1 && chapter.number <= 20;
    });
  }
  return all;
}

export function domainsByChapterFromChapters(
  chapters: Iterable<Chapter>,
): Record<string, ChapterDomainMeta> {
  const result: Record<string, ChapterDomainMeta> = {};
  for (const chapter of chapters) {
    result[chapter.id] = {
      primaryDomain: chapter.primaryDomain,
      secondaryDomains: chapter.secondaryDomains,
    };
  }
  return result;
}
