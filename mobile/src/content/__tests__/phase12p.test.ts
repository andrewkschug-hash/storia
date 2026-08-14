import { afterEach, describe, expect, it } from 'vitest';

import { evaluateLearnerCrossStoryA1 } from '@/src/cefr';
import { A1_CROSS_STORY_THRESHOLDS } from '@/src/cefr/crossStoryReadiness';
import {
  LUCA_STORY_ID,
  __resetContentCache,
  getChapter,
  getContentBundle,
} from '@/src/content';
import { getProductionExercisesForChapter } from '@/src/content/productionExercises';
import { skipProduction } from '@/src/production/flow';
import {
  __resetProgressService,
  __setProgressRepository,
  getProgressService,
  peekProgress,
} from '@/src/progress';
import { getContinueReadingTarget } from '@/src/progress/continueReading';
import { MemoryReadingProgressRepository } from '@/src/progress/MemoryReadingProgressRepository';
import { loadStoryProgressView } from '@/src/progress/useReadingProgress';
import { buildLexiconIndexFromBundle } from '@/src/vocabulary/dictionaryIndex';
import { resolveSentenceLookup, resolveTap } from '@/src/vocabulary/resolveTap';
import { createLemmaEncounter, refreshFamiliarity } from '@/src/vocabulary/normalize';
import { MemoryUserVocabularyRepository } from '@/src/vocabulary/UserVocabularyRepository';
import { VocabularyService } from '@/src/vocabulary/VocabularyService';

afterEach(() => {
  __resetContentCache();
  __resetProgressService();
  __setProgressRepository(null);
});

const PRE_ROME = [
  'luca-prima-di-roma-01',
  'luca-prima-di-roma-02',
  'luca-prima-di-roma-03',
  'luca-prima-di-roma-04',
  'luca-prima-di-roma-05',
] as const;

async function completeChapter(
  storyId: string,
  chapterId: string,
  opts: { score: number; production: 'skip' | 'got_it' | 'not_yet' | 'none' },
) {
  const service = getProgressService(storyId);
  const chapter = getContentBundle(storyId).chapters.get(chapterId)!;
  await service.openChapter(chapterId);
  if (opts.production !== 'none') {
    const exercises = getProductionExercisesForChapter(chapterId, storyId);
    if (opts.production === 'skip') {
      expect(skipProduction().action).toBe('complete_chapter');
      await service.recordProduction(chapterId, {
        skipped: true,
        attempts: exercises.map((exercise) => ({
          exerciseId: exercise.id,
          assessment: 'skipped',
        })),
      });
    } else {
      await service.recordProduction(chapterId, {
        skipped: false,
        attempts: exercises.map((exercise) => ({
          exerciseId: exercise.id,
          assessment: opts.production,
        })),
      });
    }
  }
  const answers = chapter.questions.map((question) => ({
    questionId: question.id,
    correct: opts.score >= 2 / 3,
    attempts: opts.score >= 2 / 3 ? 1 : 2,
  }));
  return service.finishComprehensionAndComplete(chapterId, answers);
}

async function completeStory(
  storyId: string,
  opts: { score: number; production: 'skip' | 'got_it' | 'not_yet' | 'none' },
) {
  const bundle = getContentBundle(storyId);
  for (const summary of bundle.story.chapters) {
    await completeChapter(storyId, summary.id, opts);
  }
}

describe('Phase 12P empty-progress first journey', () => {
  it('starts a new learner on S1.1 after onboarding-equivalent empty progress', async () => {
    __setProgressRepository(new MemoryReadingProgressRepository());
    const target = await getContinueReadingTarget();
    expect(target?.storyId).toBe('luca-prima-di-roma-01');
    expect(target?.chapterId).toBe('luca-prima-di-roma-01-01');
    expect(target?.isStart).toBe(true);
    expect(target?.progress).toBeNull();
    expect(await peekProgress(LUCA_STORY_ID)).toBeNull();
    expect(await peekProgress('luca-prima-di-roma-01')).toBeNull();
  });

  it('does not materialize Luca progress when browsing Stories or Vocabulary', async () => {
    __setProgressRepository(new MemoryReadingProgressRepository());
    await getProgressService('luca-prima-di-roma-01').openChapter('luca-prima-di-roma-01-01');

    const lucaView = await loadStoryProgressView(LUCA_STORY_ID);
    expect(lucaView.progress).toBeNull();
    expect(lucaView.chapters[0]?.status).toBe('available');
    expect(lucaView.chapters.slice(1).every((chapter) => chapter.status === 'locked')).toBe(true);
    expect(await peekProgress(LUCA_STORY_ID)).toBeNull();

    const target = await getContinueReadingTarget();
    expect(target?.storyId).toBe('luca-prima-di-roma-01');
    expect(target?.chapterId).toBe('luca-prima-di-roma-01-01');
  });

  it('keeps Continue Reading on pre-Rome even if Luca getOrCreate runs without an open', async () => {
    __setProgressRepository(new MemoryReadingProgressRepository());
    await getProgressService('luca-prima-di-roma-01').openChapter('luca-prima-di-roma-01-01');
    const created = await getProgressService(LUCA_STORY_ID).getOrCreate();
    expect(created.lastOpenedAt).toBeNull();
    expect(created.currentChapterId).toBe('luca-a-roma-01');
    const target = await getContinueReadingTarget();
    expect(target?.storyId).toBe('luca-prima-di-roma-01');
  });
});

describe('Phase 12P S1.1 reader help', () => {
  it('supports word, phrase, and sentence English on first exposure', () => {
    const bundle = getContentBundle('luca-prima-di-roma-01');
    const chapter = bundle.chapters.get('luca-prima-di-roma-01-01')!;
    const index = buildLexiconIndexFromBundle(bundle);
    const empty = { lemmas: {}, phrases: {} };

    const first = chapter.paragraphs[0]!.sentences[0]!;
    const word = resolveTap(index, {
      sentence: first,
      tokenIndex: 1,
      chapterId: chapter.id,
      chapterNumber: chapter.number,
    }, empty);
    expect(word.kind).toBe('word');
    if (word.kind === 'word') expect(word.english).toBe('to be');

    const intro = chapter.paragraphs.flatMap((paragraph) => paragraph.sentences).find((sentence) =>
      sentence.text === 'Mi chiamo Luca.',
    )!;
    const phrase = resolveTap(index, {
      sentence: intro,
      tokenIndex: 0,
      chapterId: chapter.id,
      chapterNumber: chapter.number,
    }, empty);
    expect(phrase.kind).toBe('phrase');
    if (phrase.kind === 'phrase') {
      expect(phrase.naturalEnglish.toLowerCase()).toContain('name');
    }

    const sentence = resolveSentenceLookup(first, chapter.id, chapter.number);
    expect(sentence.english).toBe('Luca is in Pietralba.');
  });

  it('keeps sentence English on every pre-Rome sentence', () => {
    for (const storyId of PRE_ROME) {
      for (const chapter of getContentBundle(storyId).chapters.values()) {
        for (const sentence of chapter.paragraphs.flatMap((paragraph) => paragraph.sentences)) {
          expect(sentence.english?.trim(), `${chapter.id}:${sentence.id}`).toBeTruthy();
        }
      }
    }
  });
});

describe('Phase 12P Profile A — absolute beginner', () => {
  it('completes S1 gradually with taps, failed comprehension, and skipped production', async () => {
    __setProgressRepository(new MemoryReadingProgressRepository());
    const bundle = getContentBundle('luca-prima-di-roma-01');
    const vocab = new VocabularyService(new MemoryUserVocabularyRepository(), bundle);
    const ch1 = bundle.chapters.get('luca-prima-di-roma-01-01')!;
    const first = ch1.paragraphs[0]!.sentences[0]!;

    await vocab.openTap({
      sentence: first,
      tokenIndex: 1,
      chapterId: ch1.id,
      chapterNumber: ch1.number,
    });
    await vocab.openTap({
      sentence: first,
      tokenIndex: 3,
      chapterId: ch1.id,
      chapterNumber: ch1.number,
    });
    const tapped = await vocab.getState();
    expect(tapped.lemmas.essere?.tapCount).toBeGreaterThan(0);
    expect(tapped.lemmas.pietralba?.tapCount).toBeGreaterThan(0);

    const failed = await completeChapter('luca-prima-di-roma-01', 'luca-prima-di-roma-01-01', {
      score: 0,
      production: 'skip',
    });
    expect(failed.comprehensionByChapter['luca-prima-di-roma-01-01']?.score).toBe(0);
    expect(failed.completedChapterIds).toContain('luca-prima-di-roma-01-01');
    expect(failed.productionByChapter?.['luca-prima-di-roma-01-01']?.skipped).toBe(true);
    expect(await getProgressService('luca-prima-di-roma-01').getChapterStatus('luca-prima-di-roma-01-02')).not.toBe(
      'locked',
    );

    await completeChapter('luca-prima-di-roma-01', 'luca-prima-di-roma-01-02', {
      score: 1,
      production: 'skip',
    });
    await completeChapter('luca-prima-di-roma-01', 'luca-prima-di-roma-01-03', {
      score: 0,
      production: 'not_yet',
    });
    await completeChapter('luca-prima-di-roma-01', 'luca-prima-di-roma-01-04', {
      score: 1,
      production: 'skip',
    });
    await completeChapter('luca-prima-di-roma-01', 'luca-prima-di-roma-01-05', {
      score: 0,
      production: 'skip',
    });
    await completeChapter('luca-prima-di-roma-01', 'luca-prima-di-roma-01-06', {
      score: 1,
      production: 'skip',
    });

    const afterS1 = await evaluateLearnerCrossStoryA1();
    expect(afterS1.metrics.storiesWithPassed).toBeLessThan(A1_CROSS_STORY_THRESHOLDS.minStoriesForReady);
    expect(afterS1.status === 'READY' || afterS1.status === 'CONFIDENT').toBe(false);

    const target = await getContinueReadingTarget();
    expect(target?.storyId).toBe('luca-prima-di-roma-02');
    expect(getChapter('luca-a-roma-01', LUCA_STORY_ID)?.paragraphs[0]?.sentences[0]?.text).toBe(
      'Luca arriva a Roma.',
    );
  });
});

describe('Phase 12P Profile B — fast beginner', () => {
  it('passes S1+S2 production and still uses one cross-story readiness model', async () => {
    __setProgressRepository(new MemoryReadingProgressRepository());
    await completeStory('luca-prima-di-roma-01', { score: 1, production: 'got_it' });
    const oneStory = await evaluateLearnerCrossStoryA1();
    expect(oneStory.status === 'READY' || oneStory.status === 'CONFIDENT').toBe(false);

    await completeStory('luca-prima-di-roma-02', { score: 1, production: 'got_it' });
    const twoStories = await evaluateLearnerCrossStoryA1();
    expect(twoStories.metrics.storiesWithPassed).toBe(2);
    expect(twoStories.metrics.passedChapters).toBe(13);
    expect(twoStories.metrics.vocabularySupport).toBeNull();
    expect(twoStories.signals.every((signal) => signal.storyId !== undefined)).toBe(true);

    const target = await getContinueReadingTarget();
    expect(target?.storyId).toBe('luca-prima-di-roma-03');

    await completeStory('luca-prima-di-roma-03', { score: 1, production: 'got_it' });
    await completeStory('luca-prima-di-roma-04', { score: 1, production: 'got_it' });
    await completeStory('luca-prima-di-roma-05', { score: 1, production: 'got_it' });
    const fiveStories = await evaluateLearnerCrossStoryA1();
    expect(fiveStories.status === 'READY' || fiveStories.status === 'CONFIDENT').toBe(true);
    expect(fiveStories.canChooseNext).toBe(true);

    const towardLuca = await getContinueReadingTarget();
    expect(towardLuca?.storyId).toBe(LUCA_STORY_ID);
    expect(towardLuca?.chapterId).toBe('luca-a-roma-01');
  });

  it('does not let Luca A1 comprehension alone reach READY', async () => {
    __setProgressRepository(new MemoryReadingProgressRepository());
    const luca = getContentBundle(LUCA_STORY_ID);
    for (const summary of luca.story.chapters.filter((chapter) => chapter.number <= 20)) {
      await completeChapter(LUCA_STORY_ID, summary.id, { score: 1, production: 'got_it' });
    }
    const lucaOnly = await evaluateLearnerCrossStoryA1();
    expect(lucaOnly.metrics.passedChapters).toBe(20);
    expect(lucaOnly.status).not.toBe('READY');
    expect(lucaOnly.status).not.toBe('CONFIDENT');
  });
});

describe('Phase 12P Profile C — casual learner', () => {
  it('leaves chapters unfinished, switches stories, and restores after a service restart', async () => {
    const repo = new MemoryReadingProgressRepository();
    __setProgressRepository(repo);

    const s1 = getProgressService('luca-prima-di-roma-01');
    await s1.openChapter('luca-prima-di-roma-01-01');
    await s1.savePosition('luca-prima-di-roma-01-01', 's07');

    const s3 = getProgressService('luca-prima-di-roma-03');
    await s3.openChapter('luca-prima-di-roma-03-01');
    await s3.savePosition('luca-prima-di-roma-03-01', 's04');

    let target = await getContinueReadingTarget();
    expect(target?.storyId).toBe('luca-prima-di-roma-03');
    expect(target?.chapterId).toBe('luca-prima-di-roma-03-01');
    expect(target?.progress?.lastSentenceId).toBe('s04');
    expect(target?.progress?.completedChapterIds).toEqual([]);

    await s1.openChapter('luca-prima-di-roma-01-01');
    target = await getContinueReadingTarget();
    expect(target?.storyId).toBe('luca-prima-di-roma-01');
    expect(target?.progress?.lastSentenceId).toBe('s07');

    await completeChapter('luca-prima-di-roma-01', 'luca-prima-di-roma-01-01', {
      score: 0,
      production: 'skip',
    });

    __resetProgressService();
    const restoredS1 = await peekProgress('luca-prima-di-roma-01');
    const restoredS3 = await peekProgress('luca-prima-di-roma-03');
    expect(restoredS1?.completedChapterIds).toEqual(['luca-prima-di-roma-01-01']);
    expect(restoredS3?.completedChapterIds).toEqual([]);
    expect(restoredS3?.lastSentenceId).toBe('s04');
    expect(await peekProgress(LUCA_STORY_ID)).toBeNull();

    target = await getContinueReadingTarget();
    expect(target?.storyId).toBe('luca-prima-di-roma-01');
    expect(target?.chapterId).toBe('luca-prima-di-roma-01-02');
  });

  it('keys progress by storyId+chapterId so S1 ch1 cannot complete Luca ch1', async () => {
    __setProgressRepository(new MemoryReadingProgressRepository());
    await completeChapter('luca-prima-di-roma-01', 'luca-prima-di-roma-01-01', {
      score: 1,
      production: 'none',
    });
    const pre = await peekProgress('luca-prima-di-roma-01');
    const luca = await peekProgress(LUCA_STORY_ID);
    expect(pre?.completedChapterIds).toEqual(['luca-prima-di-roma-01-01']);
    expect(luca).toBeNull();
    expect(getChapter('luca-prima-di-roma-01-01')?.id).not.toBe(getChapter('luca-a-roma-01')?.id);
  });
});

describe('Phase 12P vocabulary is supporting evidence only', () => {
  it('does not use vocabulary mastery as a READY gate', async () => {
    __setProgressRepository(new MemoryReadingProgressRepository());
    await completeStory('luca-prima-di-roma-01', { score: 1, production: 'got_it' });
    const withoutVocab = await evaluateLearnerCrossStoryA1();
    const withVocab = await evaluateLearnerCrossStoryA1({
      vocabulary: {
        lemmas: {
          essere: refreshFamiliarity({
            ...createLemmaEncounter('essere'),
            status: 'mastered',
            encounterCount: 40,
            tapCount: 0,
            correctReviewCount: 3,
            familiarityScore: 1,
            firstChapterId: 'luca-prima-di-roma-01-01',
            lastChapterId: 'luca-prima-di-roma-01-06',
            firstEncounteredAt: '2026-08-13T12:00:00.000Z',
            lastEncounteredAt: '2026-08-13T12:00:00.000Z',
            chaptersEncountered: ['luca-prima-di-roma-01-01'],
          }),
        },
        phrases: {},
      },
    });
    expect(withoutVocab.status).toBe(withVocab.status);
    expect(withoutVocab.status === 'READY' || withoutVocab.status === 'CONFIDENT').toBe(false);
  });
});
