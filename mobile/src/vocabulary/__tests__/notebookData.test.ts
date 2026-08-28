import { describe, expect, it } from 'vitest';

import { getContentBundle, LUCA_STORY_ID } from '@/src/content';
import { grammarNoteForBatch } from '@/src/content/lessonBatches';
import { browseVocabulary } from '@/src/vocabulary/catalog';
import {
  getMomentForChapter,
  getNarrativeAnnotation,
  NARRATIVE_VOCABULARY,
  NOTEBOOK_GRAMMAR_INSIGHTS,
  NOTEBOOK_MOMENTS,
  NOTEBOOK_PHRASES,
} from '@/src/vocabulary/notebookData';
import {
  getVerbPattern,
  NOTEBOOK_VERB_PATTERNS,
} from '@/src/vocabulary/notebookVerbs';
import { VocabularyService } from '@/src/vocabulary/VocabularyService';
import type { UserVocabularyRepository } from '@/src/vocabulary/UserVocabularyRepository';
import type { UserVocabularyState } from '@/src/vocabulary/types';

describe('notebookData referential integrity', () => {
  const bundle = getContentBundle(LUCA_STORY_ID);
  const totalChapters = bundle.story.chapters.length;

  it('covers all chapters with contiguous narrative moments', () => {
    expect(NOTEBOOK_MOMENTS.length).toBeGreaterThanOrEqual(5);
    expect(NOTEBOOK_MOMENTS[0].chapterStart).toBe(1);
    expect(NOTEBOOK_MOMENTS[NOTEBOOK_MOMENTS.length - 1].chapterEnd).toBe(totalChapters);

    for (let i = 0; i < NOTEBOOK_MOMENTS.length; i++) {
      const moment = NOTEBOOK_MOMENTS[i];
      expect(moment.chapterStart).toBeLessThanOrEqual(moment.chapterEnd);
      expect(moment.titleIt.length).toBeGreaterThan(0);
      expect(moment.description.length).toBeGreaterThan(20);
      expect(moment.coreThemes.length).toBeGreaterThanOrEqual(3);
      expect(moment.signatureQuote.chapterNumber).toBeGreaterThanOrEqual(moment.chapterStart);
      expect(moment.signatureQuote.chapterNumber).toBeLessThanOrEqual(moment.chapterEnd);

      if (i > 0) {
        const prev = NOTEBOOK_MOMENTS[i - 1];
        expect(moment.chapterStart).toBe(prev.chapterEnd + 1);
      }
    }
  });

  it('maps any valid chapter number to its correct moment', () => {
    expect(getMomentForChapter(1)?.id).toBe('arrivo');
    expect(getMomentForChapter(20)?.id).toBe('arrivo');
    expect(getMomentForChapter(21)?.id).toBe('appartenenza');
    expect(getMomentForChapter(25)?.id).toBe('responsabilita');
    expect(getMomentForChapter(45)?.id).toBe('due-vite');
    expect(getMomentForChapter(55)?.id).toBe('la-scelta');
    expect(getMomentForChapter(56)?.id).toBe('funziona-davvero');
    expect(getMomentForChapter(999)).toBeNull();
  });

  it('guarantees every narrative vocabulary lemma exists in the lexicon', () => {
    const seenLemmas = new Set<string>();

    for (const item of NARRATIVE_VOCABULARY) {
      expect(seenLemmas.has(item.lemmaId)).toBe(false);
      seenLemmas.add(item.lemmaId);

      const entry = bundle.lexiconById.get(item.lemmaId);
      expect(entry, `Lemma "${item.lemmaId}" must exist in italian-core lexicon`).toBeTruthy();
      expect(item.whyItMatters.length).toBeGreaterThan(20);
      expect(item.storyAnchor.chapterNumber).toBeGreaterThanOrEqual(1);
      expect(item.storyAnchor.chapterNumber).toBeLessThanOrEqual(totalChapters);
      expect(item.storyAnchor.quoteIt.length).toBeGreaterThan(0);
      expect(item.storyAnchor.quoteEn.length).toBeGreaterThan(0);
    }
  });

  it('resolves narrative annotations through getNarrativeAnnotation helper', () => {
    expect(getNarrativeAnnotation('contratto')).toBeTruthy();
    expect(getNarrativeAnnotation('contratto')?.storyAnchor.chapterNumber).toBe(46);
    expect(getNarrativeAnnotation('fiducia')).toBeTruthy();
    expect(getNarrativeAnnotation('pressino')).toBeTruthy();
    expect(getNarrativeAnnotation('non-existent-word-xyz')).toBeNull();
  });

  it('verifies all memorable phrases link to valid chapters', () => {
    const seenIds = new Set<string>();

    for (const phrase of NOTEBOOK_PHRASES) {
      expect(seenIds.has(phrase.id)).toBe(false);
      seenIds.add(phrase.id);

      expect(phrase.chapterNumber).toBeGreaterThanOrEqual(1);
      expect(phrase.chapterNumber).toBeLessThanOrEqual(totalChapters);
      expect(phrase.textIt.length).toBeGreaterThan(0);
      expect(phrase.textEn.length).toBeGreaterThan(0);
      expect(phrase.speaker.length).toBeGreaterThan(0);
      expect(phrase.whyMemorable.length).toBeGreaterThan(15);
    }
  });

  it('verifies all grammar insights link to valid chapter ranges', () => {
    const seenIds = new Set<string>();

    for (const insight of NOTEBOOK_GRAMMAR_INSIGHTS) {
      expect(seenIds.has(insight.id)).toBe(false);
      seenIds.add(insight.id);

      expect(insight.chapterRange.start).toBeGreaterThanOrEqual(1);
      expect(insight.chapterRange.end).toBeLessThanOrEqual(totalChapters);
      expect(insight.chapterRange.start).toBeLessThanOrEqual(insight.chapterRange.end);
      expect(insight.sampleChapterNumber).toBeGreaterThanOrEqual(insight.chapterRange.start);
      expect(insight.sampleChapterNumber).toBeLessThanOrEqual(insight.chapterRange.end);
      expect(insight.titleIt.length).toBeGreaterThan(0);
      expect(insight.formula.length).toBeGreaterThan(0);
      expect(insight.exampleIt.length).toBeGreaterThan(0);
      expect(insight.exampleEn.length).toBeGreaterThan(0);
    }
  });

  it('guarantees all verb patterns reference valid lexicon entries and chapters', () => {
    const seenVerbs = new Set<string>();

    for (const verb of NOTEBOOK_VERB_PATTERNS) {
      expect(seenVerbs.has(verb.lemmaId)).toBe(false);
      seenVerbs.add(verb.lemmaId);

      const entry = bundle.lexiconById.get(verb.lemmaId);
      expect(entry, `Verb "${verb.lemmaId}" must exist in italian-core lexicon`).toBeTruthy();
      expect(verb.infinitive.length).toBeGreaterThan(0);
      expect(verb.english.length).toBeGreaterThan(0);
      expect(verb.whyItChanges.length).toBeGreaterThan(15);

      for (const person of ['io', 'tu', 'luiLei', 'noi', 'voi', 'loro'] as const) {
        expect(verb.presente[person].length).toBeGreaterThan(0);
        expect(verb.passatoProssimo[person].length).toBeGreaterThan(0);
        expect(verb.imperfetto[person].length).toBeGreaterThan(0);
      }

      expect(verb.transformations.length).toBeGreaterThanOrEqual(3);
      for (const t of verb.transformations) {
        expect(t.form.length).toBeGreaterThan(0);
        expect(t.tenseName.length).toBeGreaterThan(0);
        expect(t.concept.length).toBeGreaterThan(0);
        expect(t.quoteIt.length).toBeGreaterThan(0);
        expect(t.quoteEn.length).toBeGreaterThan(0);
        expect(t.chapterNumber).toBeGreaterThanOrEqual(1);
        expect(t.chapterNumber).toBeLessThanOrEqual(totalChapters);
      }
    }

    expect(getVerbPattern('parlare')).toBeTruthy();
    expect(getVerbPattern('essere')?.presente.io).toBe('sono');
    expect(getVerbPattern('non-existent-verb')).toBeNull();
  });

  it('provides all 14 grammar lesson batches for Luca a Roma (Ch 1-70)', () => {
    for (let batch = 1; batch <= 14; batch++) {
      const start = (batch - 1) * 5 + 1;
      const end = batch * 5;
      const note = grammarNoteForBatch(start, end, LUCA_STORY_ID);
      expect(note, `Batch ${start}-${end} must have a grammar note`).toBeTruthy();
      expect(note?.title.length).toBeGreaterThan(0);
      expect(note?.steps.length).toBeGreaterThan(0);
    }
  });

  it('enriches browseVocabulary with partOfSpeech and introducedChapter from lexicon', () => {
    const mockState: UserVocabularyState = {
      lemmas: {
        caffe: {
          lemmaId: 'caffe',
          encounterCount: 3,
          tapCount: 1,
          saveCount: 0,
          chaptersEncountered: ['luca-a-roma-01'],
          firstChapterId: 'luca-a-roma-01',
          lastChapterId: 'luca-a-roma-01',
          firstEncounteredAt: new Date().toISOString(),
          lastEncounteredAt: new Date().toISOString(),
          lastSentenceId: null,
          saved: false,
          savedForms: ['caffè'],
          savedAt: null,
          lastReviewedAt: null,
          reviewCount: 0,
          correctReviewCount: 0,
          incorrectReviewCount: 0,
          almostReviewCount: 0,
          lastSelfAssessment: null,
          lastSelfAssessmentAt: null,
          intervalIndex: 0,
          dueAt: null,
          familiarityScore: 0.5,
          status: 'learning',
          recentEncounters: [],
        },
      },
      phrases: {},
      version: 1,
    };

    const browsed = browseVocabulary(bundle, mockState);
    expect(browsed.learning.length).toBe(1);
    const item = browsed.learning[0];
    expect(item.id).toBe('caffe');
    expect(item.partOfSpeech).toBe('noun');
    expect(item.introducedChapter).toBe(8);
  });

  it('toggles saved status correctly via VocabularyService', async () => {
    let savedState: UserVocabularyState = {
      lemmas: {},
      phrases: {},
      version: 1,
    };

    const mockRepo: UserVocabularyRepository = {
      get: async () => savedState,
      save: async (st) => {
        savedState = st;
      },
    };

    const service = new VocabularyService(mockRepo, bundle);

    const isSaved1 = await service.toggleSaved('lemma', 'caffe');
    expect(isSaved1).toBe(true);
    expect(savedState.lemmas.caffe.saved).toBe(true);

    const isSaved2 = await service.toggleSaved('lemma', 'caffe');
    expect(isSaved2).toBe(false);
    expect(savedState.lemmas.caffe.saved).toBe(false);
  });
});
