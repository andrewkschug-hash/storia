import { afterEach, describe, expect, it } from 'vitest';

import { exposureState } from '@/src/adaptive/scoring';
import { selectAdaptiveChapter } from '@/src/adaptive/select';
import type { AdaptiveItem } from '@/src/adaptive/types';
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
} from '@/src/progress';
import { getContinueReadingTarget } from '@/src/progress/continueReading';
import { MemoryReadingProgressRepository } from '@/src/progress/MemoryReadingProgressRepository';
import { resolveSentenceLookup, resolveTap } from '@/src/vocabulary/resolveTap';
import { buildLexiconIndexFromBundle } from '@/src/vocabulary/dictionaryIndex';
import { MemoryUserVocabularyRepository } from '@/src/vocabulary/UserVocabularyRepository';
import { VocabularyService } from '@/src/vocabulary/VocabularyService';

afterEach(() => {
  __resetContentCache();
  __resetProgressService();
  __setProgressRepository(null);
});

function allSentences(chapterId: string, storyId?: string) {
  const chapter = getChapter(chapterId, storyId)!;
  return chapter.paragraphs.flatMap((paragraph) => paragraph.sentences);
}

function tokenStats(chapterId: string, storyId?: string) {
  const sentences = allSentences(chapterId, storyId);
  const tokens = sentences.flatMap((sentence) => sentence.tokens);
  const lemmas = tokens.map((token) => token.lemmaId);
  return {
    sentences: sentences.length,
    tokens: tokens.length,
    uniqueLemmas: new Set(lemmas).size,
    avgSentenceLength: tokens.length / sentences.length,
  };
}

function lemmaItem(id: string, state: AdaptiveItem['state'], priority = 0.6): AdaptiveItem {
  return {
    kind: 'lemma',
    id,
    italian: id,
    state,
    priority,
    factors: {
      struggle: state === 'reinforce' ? 0.6 : 0.1,
      importance: 0.5,
      recency: 0.5,
      storyRelevance: 0.5,
      phraseRelevance: 0,
      upcoming: 0.4,
      overexposure: 0,
    },
    encounterCount: state === 'normal' ? 1 : 12,
    tapCount: state === 'reinforce' || state === 'recovering' ? 6 : 1,
    tapRate: state === 'reinforce' ? 0.5 : 0.1,
    recentTaps: state === 'recovering' ? 1 : 0,
    recentWindow: 5,
    recentTapRate: state === 'recovering' ? 0.2 : 0.1,
    saved: false,
    reasons: [`${id} ${state}`],
  };
}

describe('Phase 12O true beginner onboarding', () => {
  it('sends a brand-new learner to Luca a Roma chapter 1', async () => {
    __setProgressRepository(new MemoryReadingProgressRepository());
    const target = await getContinueReadingTarget();
    expect(target?.storyId).toBe(LUCA_STORY_ID);
    expect(target?.chapterId).toBe('luca-a-roma-01');
    expect(target?.isStart).toBe(true);
  });

  it('keeps S1.1–S1.3 longer than Luca Ch1 without changing either prose', () => {
    const s11 = tokenStats('luca-prima-di-roma-01-01', 'luca-prima-di-roma-01');
    const s12 = tokenStats('luca-prima-di-roma-01-02', 'luca-prima-di-roma-01');
    const s13 = tokenStats('luca-prima-di-roma-01-03', 'luca-prima-di-roma-01');
    const luca1 = tokenStats('luca-a-roma-01', LUCA_STORY_ID);

    expect(s11).toEqual({ sentences: 38, tokens: 129, uniqueLemmas: 50, avgSentenceLength: 129 / 38 });
    expect(s12).toEqual({ sentences: 36, tokens: 128, uniqueLemmas: 57, avgSentenceLength: 128 / 36 });
    expect(s13).toEqual({ sentences: 35, tokens: 128, uniqueLemmas: 50, avgSentenceLength: 128 / 35 });
    expect(luca1).toEqual({ sentences: 13, tokens: 41, uniqueLemmas: 25, avgSentenceLength: 41 / 13 });
    expect(getChapter('luca-a-roma-01', LUCA_STORY_ID)?.paragraphs[0]?.sentences[0]?.text).toBe(
      'Luca arriva a Roma.',
    );
    expect(getChapter('luca-prima-di-roma-01-01', 'luca-prima-di-roma-01')?.paragraphs[0]?.sentences[0]?.text).toBe(
      'Luca è a Pietralba.',
    );
  });

  it('gives zero-knowledge S1.1 sentence English on first tap', () => {
    const chapter = getChapter('luca-prima-di-roma-01-01', 'luca-prima-di-roma-01')!;
    const first = chapter.paragraphs[0]!.sentences[0]!;
    const lookup = resolveSentenceLookup(first, chapter.id, chapter.number);
    expect(first.english).toBe('Luca is in Pietralba.');
    expect(lookup.english).toBe('Luca is in Pietralba.');
    expect(lookup.english).not.toBe('Translation unavailable');

    for (const sentence of allSentences('luca-prima-di-roma-01-01', 'luca-prima-di-roma-01')) {
      expect(sentence.english?.trim()).toBeTruthy();
      expect(sentence.english).not.toBe('Translation unavailable');
      expect(sentence.variants.every((variant) => variant.id === 'standard')).toBe(true);
    }
  });

  it('lets a zero-vocab learner tap a word immediately without completing the chapter', async () => {
    const bundle = getContentBundle('luca-prima-di-roma-01');
    const chapter = bundle.chapters.get('luca-prima-di-roma-01-01')!;
    const sentence = chapter.paragraphs[0]!.sentences[0]!;
    const vocab = new VocabularyService(new MemoryUserVocabularyRepository(), bundle);
    const before = await vocab.getState();
    expect(Object.keys(before.lemmas)).toHaveLength(0);

    const lookup = resolveTap(
      buildLexiconIndexFromBundle(bundle),
      { sentence, tokenIndex: 1, chapterId: chapter.id, chapterNumber: chapter.number },
      before,
    );
    expect(lookup.kind).toBe('word');
    if (lookup.kind === 'word') {
      expect(lookup.english.toLowerCase()).toMatch(/be|is/);
    }

    await vocab.openTap({
      sentence,
      tokenIndex: 1,
      chapterId: chapter.id,
      chapterNumber: chapter.number,
    });
    const after = await vocab.getState();
    expect(after.lemmas.essere?.tapCount).toBe(1);
    expect(after.lemmas.essere?.status).not.toBe('mastered');

    __setProgressRepository(new MemoryReadingProgressRepository());
    const progress = await getProgressService('luca-prima-di-roma-01').getOrCreate();
    expect(progress.completedChapterIds).toEqual([]);
  });

  it('uses standard authored text on first exposure even with empty adaptive profile', () => {
    const bundle = getContentBundle('luca-prima-di-roma-01');
    const authored = bundle.chapters.get('luca-prima-di-roma-01-01')!;
    const adapted = selectAdaptiveChapter(authored, bundle, [], []);
    const sentences = adapted.chapter.paragraphs.flatMap((paragraph) => paragraph.sentences);
    expect(sentences.every((sentence) => sentence.selectedVariantId === 'standard')).toBe(true);
    expect(sentences[0]?.text).toBe('Luca è a Pietralba.');
    expect(adapted.logs).toHaveLength(0);
  });

  it('does not swap pre-Rome into easier or extended variants when vocabulary is mastered or recovering', () => {
    const bundle = getContentBundle('luca-prima-di-roma-01');
    const authored = bundle.chapters.get('luca-prima-di-roma-01-01')!;
    const mastered = selectAdaptiveChapter(authored, bundle, [lemmaItem('essere', 'mastered', 0.9)], []);
    const recovering = selectAdaptiveChapter(authored, bundle, [lemmaItem('essere', 'recovering', 0.8)], []);
    const reinforce = selectAdaptiveChapter(authored, bundle, [lemmaItem('essere', 'reinforce', 0.9)], []);

    for (const result of [mastered, recovering, reinforce]) {
      const sentences = result.chapter.paragraphs.flatMap((paragraph) => paragraph.sentences);
      expect(sentences.every((sentence) => sentence.selectedVariantId === 'standard')).toBe(true);
      expect(sentences.some((sentence) => sentence.tokens.some((token) => token.lemmaId === 'essere'))).toBe(
        true,
      );
      expect(sentences[0]?.text).toBe(authored.paragraphs[0]!.sentences[0]!.text);
    }
    expect(exposureState(12, 0.5, 0.2, 0.2)).toBe('recovering');
    expect(exposureState(12, 0.1, 0.05, 0.1)).toBe('mastered');
  });

  it('completes S1.1 after comprehension failure, success, skip, incorrect, or correct production', async () => {
    __setProgressRepository(new MemoryReadingProgressRepository());
    const storyId = 'luca-prima-di-roma-01';
    const chapter = getContentBundle(storyId).chapters.get('luca-prima-di-roma-01-01')!;
    const exercises = getProductionExercisesForChapter(chapter.id, storyId);
    expect(exercises.length).toBeGreaterThan(0);
    expect(skipProduction().action).toBe('complete_chapter');

    const failService = getProgressService(storyId);
    await failService.openChapter(chapter.id);
    const failed = await failService.finishComprehensionAndComplete(
      chapter.id,
      chapter.questions.map((question) => ({ questionId: question.id, correct: false, attempts: 2 })),
    );
    expect(failed.comprehensionByChapter[chapter.id]?.score).toBe(0);
    expect(failed.completedChapterIds).toContain(chapter.id);
    expect(await failService.getChapterStatus('luca-prima-di-roma-01-02')).not.toBe('locked');
    await failService.openChapter(chapter.id);
    expect(await failService.getChapterStatus(chapter.id)).toBe('completed');

    __setProgressRepository(new MemoryReadingProgressRepository());
    const okService = getProgressService(storyId);
    await okService.openChapter(chapter.id);
    await okService.recordProduction(chapter.id, {
      skipped: false,
      attempts: [
        { exerciseId: exercises[0]!.id, assessment: 'not_yet' },
        { exerciseId: exercises[1]!.id, assessment: 'got_it' },
      ],
    });
    const passed = await okService.finishComprehensionAndComplete(
      chapter.id,
      chapter.questions.map((question) => ({ questionId: question.id, correct: true, attempts: 1 })),
    );
    expect(passed.comprehensionByChapter[chapter.id]?.score).toBe(1);
    expect(passed.productionByChapter?.[chapter.id]?.attempts[0]?.assessment).toBe('not_yet');
    expect(passed.completedChapterIds).toContain(chapter.id);
    expect(passed.currentChapterId).toBe('luca-prima-di-roma-01-02');
  });

  it('persists story progress independently of Luca and keeps sentence English across pre-Rome', async () => {
    __setProgressRepository(new MemoryReadingProgressRepository());
    const pre = getProgressService('luca-prima-di-roma-01');
    const luca = getProgressService(LUCA_STORY_ID);
    const chapter = getContentBundle('luca-prima-di-roma-01').chapters.get('luca-prima-di-roma-01-01')!;
    await pre.openChapter(chapter.id);
    await pre.recordProduction(chapter.id, { skipped: true, attempts: [] });
    await pre.finishComprehensionAndComplete(
      chapter.id,
      chapter.questions.map((question) => ({ questionId: question.id, correct: true, attempts: 1 })),
    );

    const preProgress = await pre.getOrCreate();
    const lucaProgress = await luca.getOrCreate();
    expect(preProgress.completedChapterIds).toEqual(['luca-prima-di-roma-01-01']);
    expect(lucaProgress.completedChapterIds).toEqual([]);
    expect(lucaProgress.currentChapterId).toBe('luca-a-roma-01');

    for (const storyId of [
      'luca-prima-di-roma-01',
      'luca-prima-di-roma-02',
      'luca-prima-di-roma-03',
      'luca-prima-di-roma-04',
      'luca-prima-di-roma-05',
    ]) {
      const bundle = getContentBundle(storyId);
      for (const chapter of bundle.chapters.values()) {
        for (const sentence of chapter.paragraphs.flatMap((paragraph) => paragraph.sentences)) {
          expect(sentence.english?.trim()).toBeTruthy();
        }
      }
    }
  });
});
