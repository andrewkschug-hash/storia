import { afterEach, describe, expect, it } from 'vitest';

import {
  COMPREHENSION_PASS_SCORE,
  a1ChaptersForStory,
  collectA1ReadinessSignals,
  evaluateCrossStoryA1Readiness,
  evaluateLearnerCrossStoryA1,
  evaluateLevelReadiness,
} from '@/src/cefr';
import {
  LUCA_STORY_ID,
  PRE_ROME_ARC_ID,
  __resetContentCache,
  getAvailableStories,
  getContentBundle,
  getStoriesInArc,
} from '@/src/content';
import type { CatalogStory } from '@/src/content/schemas';
import { __resetProgressService, __setProgressRepository } from '@/src/progress';
import { MemoryReadingProgressRepository } from '@/src/progress/MemoryReadingProgressRepository';
import { createInitialProgress, type ReadingProgressRecord } from '@/src/progress/types';

afterEach(() => {
  __resetContentCache();
  __resetProgressService();
  __setProgressRepository(null);
});

function catalogStory(id: string, extra: Partial<CatalogStory> = {}): CatalogStory {
  return {
    id,
    title: id,
    titleIt: id,
    description: 'test A1 story',
    cefrLevel: 'A1',
    narrativeArc: extra.narrativeArc ?? 'test-arc',
    narrativeOrder: extra.narrativeOrder ?? 1,
    status: extra.status ?? 'available',
    chapterCount: extra.chapterCount ?? 4,
    contentPath: extra.contentPath ?? `stories/${id}`,
    ...extra,
  };
}

function passedRecord(score: number) {
  const correct = Math.round(score * 3);
  return {
    attempted: 3,
    correct,
    incorrect: 3 - correct,
    score,
    completedAt: '2026-08-13T12:00:00.000Z',
    answers: [],
  };
}

function progressWith(
  storyId: string,
  chapterIds: string[],
  score = 1,
  extra?: Partial<ReadingProgressRecord>,
): ReadingProgressRecord {
  return {
    ...createInitialProgress(storyId, chapterIds[0] ?? `${storyId}-01`),
    completedChapterIds: [...chapterIds],
    lastOpenedAt: extra?.lastOpenedAt ?? '2026-08-13T12:00:00.000Z',
    comprehensionByChapter: Object.fromEntries(chapterIds.map((id) => [id, passedRecord(score)])),
    ...extra,
  };
}

const EVERYDAY = {
  c1: { primaryDomain: 'introductions', secondaryDomains: ['social'] },
  c2: { primaryDomain: 'age', secondaryDomains: ['numbers'] },
  c3: { primaryDomain: 'family', secondaryDomains: ['introductions'] },
  c4: { primaryDomain: 'numbers', secondaryDomains: ['family'] },
  c5: { primaryDomain: 'descriptions', secondaryDomains: ['family'] },
  c6: { primaryDomain: 'social', secondaryDomains: ['introductions'] },
};

const TIME = {
  t1: { primaryDomain: 'clock', secondaryDomains: ['numbers'] },
  t2: { primaryDomain: 'daily_routine', secondaryDomains: ['clock'] },
  t3: { primaryDomain: 'days', secondaryDomains: ['schedules'] },
  t4: { primaryDomain: 'dates', secondaryDomains: ['days'] },
  t5: { primaryDomain: 'schedules', secondaryDomains: ['clock'] },
  t6: { primaryDomain: 'daily_routine', secondaryDomains: ['family'] },
  t7: { primaryDomain: 'daily_routine', secondaryDomains: ['clock'] },
};

const SHOP = {
  s1: { primaryDomain: 'food', secondaryDomains: ['quantities'] },
  s2: { primaryDomain: 'ordering', secondaryDomains: ['food'] },
  s3: { primaryDomain: 'prices', secondaryDomains: ['numbers'] },
  s4: { primaryDomain: 'quantities', secondaryDomains: ['food'] },
  s5: { primaryDomain: 'shopping', secondaryDomains: ['prices'] },
  s6: { primaryDomain: 'shopping', secondaryDomains: ['likes'] },
};

const TOWN = {
  p1: { primaryDomain: 'places', secondaryDomains: ['descriptions'] },
  p2: { primaryDomain: 'directions', secondaryDomains: ['places'] },
  p3: { primaryDomain: 'weather', secondaryDomains: ['descriptions'] },
  p4: { primaryDomain: 'seasons', secondaryDomains: ['weather'] },
  p5: { primaryDomain: 'transportation', secondaryDomains: ['schedules'] },
  p6: { primaryDomain: 'directions', secondaryDomains: ['social'] },
  p7: { primaryDomain: 'transportation', secondaryDomains: ['places'] },
};

const PARTY = {
  f1: { primaryDomain: 'birthdays', secondaryDomains: ['dates'] },
  f2: { primaryDomain: 'invitations', secondaryDomains: ['days'] },
  f3: { primaryDomain: 'likes', secondaryDomains: ['food'] },
  f4: { primaryDomain: 'birthdays', secondaryDomains: ['family'] },
  f5: { primaryDomain: 'social', secondaryDomains: ['birthdays'] },
  f6: { primaryDomain: 'social', secondaryDomains: ['transportation'] },
};

function evaluatePool(input: {
  stories: CatalogStory[];
  progressByStoryId: Record<string, ReadingProgressRecord | undefined>;
  domainsByStoryAndChapter: Record<string, Record<string, { primaryDomain?: string; secondaryDomains?: string[] }>>;
  a1ChapterIdsByStory: Record<string, string[]>;
  vocabularySupport?: number | null;
}) {
  return evaluateCrossStoryA1Readiness(collectA1ReadinessSignals(input), {
    vocabularySupport: input.vocabularySupport,
  });
}

describe('Phase 12M cross-story A1 readiness', () => {
  it('does not regress Luca band evaluateLevelReadiness', () => {
    const isolated = evaluateLevelReadiness({
      currentLevel: 'A1',
      completedChapterNumbers: [1],
      levelChapterStart: 1,
      levelChapterEnd: 20,
      vocabularyStrength: 0.9,
      phraseStrength: 0.9,
      comprehensionStrength: 1,
      recentTapRate: 0.05,
      recentComprehensionScores: [1],
      averageSentenceDifficulty: 12,
    });
    expect(isolated.status).toBe('NOT_READY');

    const ready = evaluateLevelReadiness({
      currentLevel: 'A1',
      completedChapterNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      levelChapterStart: 1,
      levelChapterEnd: 20,
      vocabularyStrength: 0.5,
      phraseStrength: 0.4,
      comprehensionStrength: 0.82,
      recentTapRate: 0.12,
      recentComprehensionScores: [0.75, 0.8, 1, 0.75, 1],
      averageSentenceDifficulty: 18,
    });
    expect(ready.status).toBe('READY');
  });

  it('returns NOT_READY with empty progress and no NaN', () => {
    const result = evaluatePool({
      stories: [catalogStory('story-a'), catalogStory('story-b', { narrativeOrder: 2 })],
      progressByStoryId: {},
      domainsByStoryAndChapter: {
        'story-a': EVERYDAY,
        'story-b': TIME,
      },
      a1ChapterIdsByStory: {
        'story-a': Object.keys(EVERYDAY),
        'story-b': Object.keys(TIME),
      },
    });
    expect(result.implemented).toBe(true);
    expect(result.status).toBe('NOT_READY');
    expect(result.canChooseNext).toBe(false);
    expect(result.contentCompletion).toBe(0);
    expect(Number.isFinite(result.metrics.domainCoverage)).toBe(true);
    expect(Number.isFinite(result.metrics.meanComprehension)).toBe(true);
    expect(result.metrics.passedChapters).toBe(0);
    expect(result.groups.every((group) => !group.met)).toBe(true);
  });

  it('handles an empty catalog without division by zero', () => {
    const result = evaluateCrossStoryA1Readiness([]);
    expect(result.status).toBe('NOT_READY');
    expect(result.metrics.totalA1Chapters).toBe(0);
    expect(result.metrics.domainCoverage).toBe(0);
    expect(result.metrics.contentCompletion).toBe(0);
    expect(Number.isNaN(result.metrics.meanComprehension)).toBe(false);
  });

  it('does not mark one completed pre-Rome-style story as READY', () => {
    const chapterIds = Object.keys(EVERYDAY);
    const result = evaluatePool({
      stories: [
        catalogStory('everyday', { chapterCount: 6 }),
        catalogStory('time', { narrativeOrder: 2, chapterCount: 7 }),
        catalogStory('shop', { narrativeOrder: 3, chapterCount: 6 }),
        catalogStory('town', { narrativeOrder: 4, chapterCount: 7 }),
        catalogStory('party', { narrativeOrder: 5, chapterCount: 6 }),
      ],
      progressByStoryId: {
        everyday: progressWith('everyday', chapterIds),
      },
      domainsByStoryAndChapter: {
        everyday: EVERYDAY,
        time: TIME,
        shop: SHOP,
        town: TOWN,
        party: PARTY,
      },
      a1ChapterIdsByStory: {
        everyday: chapterIds,
        time: Object.keys(TIME),
        shop: Object.keys(SHOP),
        town: Object.keys(TOWN),
        party: Object.keys(PARTY),
      },
    });
    expect(result.status).not.toBe('READY');
    expect(result.status).not.toBe('CONFIDENT');
    expect(result.canChooseNext).toBe(false);
    expect(result.metrics.storiesWithPassed).toBe(1);
    expect(result.contentCompletion).toBeLessThan(1);
  });

  it('gains strength across several different A1 stories', () => {
    const pool = {
      stories: [
        catalogStory('everyday', { chapterCount: 6 }),
        catalogStory('time', { narrativeOrder: 2, chapterCount: 7 }),
        catalogStory('shop', { narrativeOrder: 3, chapterCount: 6 }),
        catalogStory('town', { narrativeOrder: 4, chapterCount: 7 }),
        catalogStory('party', { narrativeOrder: 5, chapterCount: 6 }),
      ],
      domainsByStoryAndChapter: {
        everyday: EVERYDAY,
        time: TIME,
        shop: SHOP,
        town: TOWN,
        party: PARTY,
      },
      a1ChapterIdsByStory: {
        everyday: Object.keys(EVERYDAY),
        time: Object.keys(TIME),
        shop: Object.keys(SHOP),
        town: Object.keys(TOWN),
        party: Object.keys(PARTY),
      },
    };
    const one = evaluatePool({
      ...pool,
      progressByStoryId: { everyday: progressWith('everyday', Object.keys(EVERYDAY)) },
    });
    const several = evaluatePool({
      ...pool,
      progressByStoryId: {
        everyday: progressWith('everyday', Object.keys(EVERYDAY)),
        time: progressWith('time', Object.keys(TIME)),
        shop: progressWith('shop', Object.keys(SHOP)),
      },
    });
    expect(several.metrics.passedChapters).toBeGreaterThan(one.metrics.passedChapters);
    expect(several.metrics.domainCoverage).toBeGreaterThan(one.metrics.domainCoverage);
    expect(several.metrics.storiesWithPassed).toBe(3);
    expect(several.status === 'READY' || several.status === 'CONFIDENT').toBe(true);
    expect(several.canChooseNext).toBe(true);
    expect(several.groups.find((group) => group.id === 'everyday')?.met).toBe(true);
    expect(several.groups.find((group) => group.id === 'time')?.met).toBe(true);
    expect(several.groups.find((group) => group.id === 'shopping')?.met).toBe(true);
  });

  it('does not treat broad domain exposure with poor comprehension as READY', () => {
    const chapterIds = [...Object.keys(EVERYDAY), ...Object.keys(TIME), ...Object.keys(SHOP)];
    const result = evaluatePool({
      stories: [
        catalogStory('everyday'),
        catalogStory('time', { narrativeOrder: 2 }),
        catalogStory('shop', { narrativeOrder: 3 }),
      ],
      progressByStoryId: {
        everyday: progressWith('everyday', Object.keys(EVERYDAY), 0.3),
        time: progressWith('time', Object.keys(TIME), 0.3),
        shop: progressWith('shop', Object.keys(SHOP), 0.3),
      },
      domainsByStoryAndChapter: {
        everyday: EVERYDAY,
        time: TIME,
        shop: SHOP,
      },
      a1ChapterIdsByStory: {
        everyday: Object.keys(EVERYDAY),
        time: Object.keys(TIME),
        shop: Object.keys(SHOP),
      },
    });
    expect(0.3).toBeLessThan(COMPREHENSION_PASS_SCORE);
    expect(result.metrics.passedChapters).toBe(0);
    expect(result.metrics.completedChapters).toBe(chapterIds.length);
    expect(result.status).not.toBe('READY');
    expect(result.status).not.toBe('CONFIDENT');
    expect(result.groups.every((group) => !group.met)).toBe(true);
  });

  it('does not treat strong comprehension with narrow domains as READY', () => {
    const result = evaluatePool({
      stories: [
        catalogStory('narrow'),
        catalogStory('also-narrow', { narrativeOrder: 2 }),
        catalogStory('shop', { narrativeOrder: 3, chapterCount: 6 }),
        catalogStory('town', { narrativeOrder: 4, chapterCount: 7 }),
      ],
      progressByStoryId: {
        narrow: progressWith('narrow', ['n1', 'n2', 'n3', 'n4']),
        'also-narrow': progressWith('also-narrow', ['a1', 'a2', 'a3', 'a4']),
      },
      domainsByStoryAndChapter: {
        narrow: {
          n1: { primaryDomain: 'introductions' },
          n2: { primaryDomain: 'introductions' },
          n3: { primaryDomain: 'introductions' },
          n4: { primaryDomain: 'introductions' },
        },
        'also-narrow': {
          a1: { primaryDomain: 'age' },
          a2: { primaryDomain: 'age' },
          a3: { primaryDomain: 'age' },
          a4: { primaryDomain: 'age' },
        },
        shop: SHOP,
        town: TOWN,
      },
      a1ChapterIdsByStory: {
        narrow: ['n1', 'n2', 'n3', 'n4'],
        'also-narrow': ['a1', 'a2', 'a3', 'a4'],
        shop: Object.keys(SHOP),
        town: Object.keys(TOWN),
      },
    });
    expect(result.metrics.meanComprehension).toBe(1);
    expect(result.metrics.domainCoverage).toBeLessThan(0.6);
    expect(result.status).not.toBe('READY');
    expect(result.status).not.toBe('CONFIDENT');
  });

  it('counts repeated successful comprehension in the same domain', () => {
    const once = evaluatePool({
      stories: [catalogStory('once')],
      progressByStoryId: { once: progressWith('once', ['c1']) },
      domainsByStoryAndChapter: { once: { c1: { primaryDomain: 'clock' } } },
      a1ChapterIdsByStory: { once: ['c1', 'c2'] },
    });
    const repeated = evaluatePool({
      stories: [catalogStory('repeated')],
      progressByStoryId: { repeated: progressWith('repeated', ['c1', 'c2']) },
      domainsByStoryAndChapter: {
        repeated: {
          c1: { primaryDomain: 'clock' },
          c2: { primaryDomain: 'clock', secondaryDomains: ['schedules'] },
        },
      },
      a1ChapterIdsByStory: { repeated: ['c1', 'c2'] },
    });
    expect(once.metrics.repeatedDomainRate).toBe(0);
    expect(repeated.metrics.repeatedDomainRate).toBeGreaterThan(0);
    expect(repeated.metrics.passedChapters).toBe(2);
  });

  it('lets a future A1 catalog story join the same pool', () => {
    const current = evaluatePool({
      stories: [catalogStory('everyday')],
      progressByStoryId: {},
      domainsByStoryAndChapter: { everyday: EVERYDAY },
      a1ChapterIdsByStory: { everyday: Object.keys(EVERYDAY) },
    });
    const mysteryIds = ['m1', 'm2', 'm3', 'm4'];
    const expanded = evaluatePool({
      stories: [
        catalogStory('everyday'),
        catalogStory('mystery-night', { narrativeArc: 'other-a1', narrativeOrder: 50, chapterCount: 4 }),
      ],
      progressByStoryId: {
        'mystery-night': progressWith('mystery-night', mysteryIds),
      },
      domainsByStoryAndChapter: {
        everyday: EVERYDAY,
        'mystery-night': {
          m1: { primaryDomain: 'introductions' },
          m2: { primaryDomain: 'mystery' },
          m3: { primaryDomain: 'social' },
          m4: { primaryDomain: 'likes' },
        },
      },
      a1ChapterIdsByStory: {
        everyday: Object.keys(EVERYDAY),
        'mystery-night': mysteryIds,
      },
    });
    expect(expanded.metrics.totalA1Chapters).toBe(current.metrics.totalA1Chapters + 4);
    expect(expanded.metrics.domainsAvailable).toBeGreaterThan(current.metrics.domainsAvailable);
    expect(expanded.metrics.passedChapters).toBe(4);
    expect(expanded.signals.some((signal) => signal.storyId === 'mystery-night')).toBe(true);
  });

  it('keeps content completion separate from CEFR readiness', () => {
    const narrowA = Object.fromEntries(
      Array.from({ length: 10 }, (_, i) => [`a${i + 1}`, { primaryDomain: 'introductions' }]),
    );
    const narrowB = Object.fromEntries(
      Array.from({ length: 10 }, (_, i) => [`b${i + 1}`, { primaryDomain: 'age' }]),
    );
    const result = evaluatePool({
      stories: [
        catalogStory('narrow-a', { chapterCount: 10 }),
        catalogStory('narrow-b', { narrativeOrder: 2, chapterCount: 10 }),
        catalogStory('shop', { narrativeOrder: 3, chapterCount: 6 }),
        catalogStory('town', { narrativeOrder: 4, chapterCount: 7 }),
      ],
      progressByStoryId: {
        'narrow-a': progressWith('narrow-a', Object.keys(narrowA)),
        'narrow-b': progressWith('narrow-b', Object.keys(narrowB)),
      },
      domainsByStoryAndChapter: {
        'narrow-a': narrowA,
        'narrow-b': narrowB,
        shop: SHOP,
        town: TOWN,
      },
      a1ChapterIdsByStory: {
        'narrow-a': Object.keys(narrowA),
        'narrow-b': Object.keys(narrowB),
        shop: Object.keys(SHOP),
        town: Object.keys(TOWN),
      },
    });
    expect(result.contentCompletion).toBeCloseTo(20 / 33, 5);
    expect(result.contentCompletion).toBeGreaterThan(0.55);
    expect(result.metrics.meanComprehension).toBe(1);
    expect(result.metrics.domainCoverage).toBeLessThan(0.6);
    expect(result.status).toBe('APPROACHING');
    expect(result.canChooseNext).toBe(false);
  });

  it('uses real pre-Rome + Luca A1 pools from the catalog', async () => {
    const repo = new MemoryReadingProgressRepository();
    __setProgressRepository(repo);
    const preRome = getStoriesInArc(PRE_ROME_ARC_ID);

    for (const story of preRome) {
      const bundle = getContentBundle(story.id);
      const ids = [...bundle.chapters.keys()];
      await repo.save(progressWith(story.id, ids, 1));
    }

    const preOnly = await evaluateLearnerCrossStoryA1();
    expect(preOnly.metrics.passedChapters).toBe(32);
    expect(preOnly.metrics.storiesWithPassed).toBe(5);
    expect(preOnly.metrics.domainCoverage).toBeGreaterThanOrEqual(0.85);
    expect(preOnly.status === 'READY' || preOnly.status === 'CONFIDENT').toBe(true);
    expect(preOnly.groups.every((group) => group.met)).toBe(true);

    const luca = getContentBundle(LUCA_STORY_ID);
    const lucaA1 = a1ChaptersForStory(
      getAvailableStories().find((story) => story.id === LUCA_STORY_ID)!,
      luca.chapters.values(),
    );
    expect(lucaA1).toHaveLength(20);
    await repo.save(progressWith(LUCA_STORY_ID, lucaA1.map((chapter) => chapter.id), 1));

    const combined = await evaluateLearnerCrossStoryA1();
    expect(combined.metrics.passedChapters).toBe(52);
    expect(combined.metrics.contentCompletion).toBe(1);
    expect(combined.metrics.passedChapters).toBeGreaterThan(preOnly.metrics.passedChapters);
    expect(combined.status === 'READY' || combined.status === 'CONFIDENT').toBe(true);

    __setProgressRepository(new MemoryReadingProgressRepository());
    const lucaOnlyRepo = new MemoryReadingProgressRepository();
    __setProgressRepository(lucaOnlyRepo);
    await lucaOnlyRepo.save(progressWith(LUCA_STORY_ID, lucaA1.map((chapter) => chapter.id), 1));
    const lucaOnly = await evaluateLearnerCrossStoryA1();
    expect(lucaOnly.metrics.passedChapters).toBe(20);
    expect(lucaOnly.metrics.domainCoverage).toBeLessThan(preOnly.metrics.domainCoverage);
    expect(lucaOnly.status).not.toBe('READY');
    expect(lucaOnly.status).not.toBe('CONFIDENT');
  });

  it('does not count merely opening a chapter as comprehension evidence', () => {
    const opened: ReadingProgressRecord = {
      ...createInitialProgress('everyday', 'c1'),
      currentChapterId: 'c1',
      lastSentenceId: 's01',
      lastOpenedAt: '2026-08-13T12:00:00.000Z',
      completedChapterIds: [],
      comprehensionByChapter: {},
    };
    const result = evaluatePool({
      stories: [catalogStory('everyday')],
      progressByStoryId: { everyday: opened },
      domainsByStoryAndChapter: { everyday: EVERYDAY },
      a1ChapterIdsByStory: { everyday: Object.keys(EVERYDAY) },
    });
    expect(result.metrics.encounteredChapters).toBeGreaterThan(0);
    expect(result.metrics.passedChapters).toBe(0);
    expect(result.metrics.attemptedComprehension).toBe(0);
    expect(result.status).toBe('NOT_READY');
  });
});
