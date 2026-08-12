import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, beforeEach } from 'vitest';

import { loadContentBundle } from '@/src/content/loadContentBundle';
import type { ContentBundle, Sentence } from '@/src/content/schemas';
import { ReviewService } from '@/src/review/ReviewService';
import { browseVocabulary } from '@/src/vocabulary/catalog';
import {
  computeFamiliarity,
  FAMILIARITY_CONFIG,
  isDue,
  nextDueAt,
  REVIEW_INTERVAL_DAYS,
} from '@/src/vocabulary/familiarity';
import {
  createLemmaEncounter,
  createPhraseEncounter,
  refreshFamiliarity,
} from '@/src/vocabulary/normalize';
import {
  findExamplesForLemma,
  findExamplesForPhrase,
} from '@/src/vocabulary/storyExamples';
import type { LemmaEncounter, PhraseEncounter, UserVocabularyState } from '@/src/vocabulary/types';
import { MemoryUserVocabularyRepository } from '@/src/vocabulary/UserVocabularyRepository';
import { VocabularyService } from '@/src/vocabulary/VocabularyService';

const here = fileURLToPath(new URL('.', import.meta.url));
const root = join(here, '../../../content');
const storyPath = join(root, 'stories', 'luca-a-roma');
const chaptersDir = join(storyPath, 'chapters');

function loadBundle(): ContentBundle {
  const chapterJsonByFile: Record<string, unknown> = {};
  for (const file of readdirSync(chaptersDir)) {
    if (!file.endsWith('.json')) continue;
    chapterJsonByFile[file] = JSON.parse(readFileSync(join(chaptersDir, file), 'utf8'));
  }
  return loadContentBundle({
    charactersJson: JSON.parse(readFileSync(join(root, 'characters.json'), 'utf8')),
    locationsJson: JSON.parse(readFileSync(join(root, 'locations.json'), 'utf8')),
    lexiconJson: JSON.parse(readFileSync(join(root, 'lexicon', 'italian-core.json'), 'utf8')),
    manifestJson: JSON.parse(readFileSync(join(storyPath, 'manifest.json'), 'utf8')),
    chapterJsonByFile,
    storyPath: 'stories/luca-a-roma',
  });
}

function findSentence(bundle: ContentBundle, textIncludes: string): {
  chapterId: string;
  chapterNumber: number;
  sentence: Sentence;
} {
  for (const chapter of bundle.chapters.values()) {
    for (const paragraph of chapter.paragraphs) {
      for (const sentence of paragraph.sentences) {
        if (sentence.text.includes(textIncludes)) {
          return { chapterId: chapter.id, chapterNumber: chapter.number, sentence };
        }
      }
    }
  }
  throw new Error(`No sentence containing "${textIncludes}"`);
}

function tokenIndexFor(sentence: Sentence, surface: string): number {
  const i = sentence.tokens.findIndex((t) => t.surface === surface || t.surface.toLowerCase() === surface.toLowerCase());
  if (i < 0) throw new Error(`No token ${surface} in ${sentence.text}`);
  return i;
}

function allChapterIds(bundle: ContentBundle): string[] {
  return [...bundle.chapters.values()].map((c) => c.id);
}

function seedLemma(id: string, patch: Partial<LemmaEncounter>): LemmaEncounter {
  return refreshFamiliarity({ ...createLemmaEncounter(id), ...patch, lemmaId: id });
}

function seedPhrase(id: string, surface: string, patch: Partial<PhraseEncounter>): PhraseEncounter {
  return refreshFamiliarity({ ...createPhraseEncounter(id, surface), ...patch, phraseId: id, surface });
}

describe('Phase 5 vocabulary model', () => {
  let bundle: ContentBundle;
  let service: VocabularyService;
  let repo: MemoryUserVocabularyRepository;

  beforeEach(() => {
    bundle = loadBundle();
    repo = new MemoryUserVocabularyRepository();
    service = new VocabularyService(repo, bundle);
  });

  it('increments encounter on tap', async () => {
    const { sentence, chapterId, chapterNumber } = findSentence(bundle, 'cammina');
    const ctx = { sentence, chapterId, chapterNumber, tokenIndex: tokenIndexFor(sentence, 'cammina') };
    await service.openTap(ctx);
    await service.openTap(ctx);
    const state = await service.getState();
    expect(state.lemmas.camminare.encounterCount).toBe(2);
  });

  it('tracks encounters across multiple chapters', async () => {
    const first = findSentence(bundle, 'cammina');
    await service.openTap({
      sentence: first.sentence,
      chapterId: first.chapterId,
      chapterNumber: first.chapterNumber,
      tokenIndex: tokenIndexFor(first.sentence, 'cammina'),
    });

    let other: ReturnType<typeof findSentence> | null = null;
    for (const chapter of bundle.chapters.values()) {
      if (chapter.id === first.chapterId) continue;
      for (const p of chapter.paragraphs) {
        for (const s of p.sentences) {
          if (s.tokens.some((t) => t.lemmaId === 'camminare')) {
            other = { chapterId: chapter.id, chapterNumber: chapter.number, sentence: s };
            break;
          }
        }
        if (other) break;
      }
      if (other) break;
    }
    expect(other).toBeTruthy();
    await service.openTap({
      sentence: other!.sentence,
      chapterId: other!.chapterId,
      chapterNumber: other!.chapterNumber,
      tokenIndex: other!.sentence.tokens.findIndex((t) => t.lemmaId === 'camminare'),
    });

    const row = (await service.getState()).lemmas.camminare;
    expect(row.chaptersEncountered).toContain(first.chapterId);
    expect(row.chaptersEncountered).toContain(other!.chapterId);
    expect(row.chaptersEncountered.length).toBeGreaterThanOrEqual(2);
  });

  it('keeps tap and encounter as distinct signals', async () => {
    const found = findSentence(bundle, 'cammina');
    const chapter = bundle.chapters.get(found.chapterId)!;
    await service.recordChapterExposure(chapter);
    const afterRead = (await service.getState()).lemmas.camminare;
    const encountersAfterRead = afterRead.encounterCount;
    expect(encountersAfterRead).toBeGreaterThan(0);
    expect(afterRead.tapCount).toBe(0);

    await service.openTap({
      sentence: found.sentence,
      chapterId: found.chapterId,
      chapterNumber: found.chapterNumber,
      tokenIndex: tokenIndexFor(found.sentence, 'cammina'),
    });
    const afterTap = (await service.getState()).lemmas.camminare;
    expect(afterTap.tapCount).toBe(1);
    expect(afterTap.encounterCount).toBe(encountersAfterRead + 1);
  });

  it('save marks a word as saved and increments saveCount', async () => {
    const { sentence, chapterId, chapterNumber } = findSentence(bundle, 'cammina');
    const lookup = await service.openTap({
      sentence,
      chapterId,
      chapterNumber,
      tokenIndex: tokenIndexFor(sentence, 'cammina'),
    });
    await service.saveLookup(lookup);
    const row = (await service.getState()).lemmas.camminare;
    expect(row.saved).toBe(true);
    expect(row.saveCount).toBe(1);
    expect(row.status).toBe('learning');
  });

  it('changes familiarity according to configured rules', () => {
    const one = computeFamiliarity({
      encounterCount: 1,
      chaptersEncountered: 1,
      tapCount: 0,
      saveCount: 0,
      saved: false,
      correctReviewCount: 0,
      incorrectReviewCount: 0,
      lastEncounteredAt: new Date().toISOString(),
      lastReviewedAt: null,
    });
    expect(one.status).toBe('new');

    const learning = computeFamiliarity({
      encounterCount: FAMILIARITY_CONFIG.learningMinEncounters,
      chaptersEncountered: FAMILIARITY_CONFIG.learningMinChapters,
      tapCount: 0,
      saveCount: 0,
      saved: false,
      correctReviewCount: 0,
      incorrectReviewCount: 0,
      lastEncounteredAt: new Date().toISOString(),
      lastReviewedAt: null,
    });
    expect(learning.status).toBe('learning');

    const familiar = computeFamiliarity({
      encounterCount: FAMILIARITY_CONFIG.familiarMinEncounters,
      chaptersEncountered: FAMILIARITY_CONFIG.familiarMinChapters,
      tapCount: 0,
      saveCount: 0,
      saved: false,
      correctReviewCount: 0,
      incorrectReviewCount: 0,
      lastEncounteredAt: new Date().toISOString(),
      lastReviewedAt: null,
    });
    expect(familiar.status).toBe('familiar');
    expect(familiar.score).toBeGreaterThanOrEqual(FAMILIARITY_CONFIG.familiarMinScore);
  });

  it('keeps phrase familiarity independent of constituent lemmas', async () => {
    await service.__replaceState({
      lemmas: {
        avere: seedLemma('avere', { encounterCount: 1, chaptersEncountered: ['c1'] }),
        fame: seedLemma('fame', { encounterCount: 1, chaptersEncountered: ['c1'] }),
      },
      phrases: {
        ha_fame: seedPhrase('ha_fame', 'ha fame', {
          encounterCount: 8,
          chaptersEncountered: ['c1', 'c2', 'c3'],
        }),
      },
    });
    const state = await service.getState();
    expect(state.phrases.ha_fame.status).toBe('familiar');
    expect(state.lemmas.avere.status).toBe('new');
    expect(state.lemmas.fame.status).toBe('new');
  });
});

describe('Phase 5 review queue and spacing', () => {
  let bundle: ContentBundle;
  let reviews: ReviewService;

  beforeEach(() => {
    bundle = loadBundle();
    reviews = new ReviewService(bundle);
  });

  it('prioritizes saved words in the review queue', () => {
    const state: UserVocabularyState = {
      lemmas: {
        ristorante: seedLemma('ristorante', {
          encounterCount: 6,
          chaptersEncountered: ['ch-1', 'ch-2'],
          tapCount: 0,
        }),
        affitto: seedLemma('affitto', {
          encounterCount: 1,
          chaptersEncountered: ['ch-1'],
          saved: true,
          saveCount: 1,
        }),
      },
      phrases: {},
    };
    const queue = reviews.buildQueue(state, {
      currentChapterId: 'none',
      completedChapterIds: allChapterIds(bundle),
    });
    expect(queue[0].id).toBe('affitto');
    expect(queue[0].reasons).toContain('saved');
  });

  it('prioritizes important unfamiliar words over already-familiar ones', () => {
    const state: UserVocabularyState = {
      lemmas: {
        aspettare: seedLemma('aspettare', {
          encounterCount: 5,
          chaptersEncountered: ['a', 'b'],
          tapCount: 3,
        }),
        casa: seedLemma('casa', {
          encounterCount: 12,
          chaptersEncountered: ['a', 'b', 'c', 'd'],
          tapCount: 0,
          correctReviewCount: 3,
          reviewCount: 3,
        }),
      },
      phrases: {},
    };
    const queue = reviews.buildQueue(state, {
      currentChapterId: 'none',
      completedChapterIds: allChapterIds(bundle),
    });
    expect(queue[0].id).toBe('aspettare');
  });

  it('correct review increases familiarity and extends the interval', async () => {
    const repo = new MemoryUserVocabularyRepository();
    const service = new VocabularyService(repo, bundle);
    await service.__replaceState({
      lemmas: {
        camminare: seedLemma('camminare', {
          encounterCount: 4,
          chaptersEncountered: ['c1', 'c2'],
          intervalIndex: -1,
        }),
      },
      phrases: {},
    });
    const before = (await service.getState()).lemmas.camminare.familiarityScore;
    const now = new Date('2026-08-11T12:00:00.000Z');
    await service.recordReview('lemma', 'camminare', true, now);
    const after = (await service.getState()).lemmas.camminare;
    expect(after.correctReviewCount).toBe(1);
    expect(after.reviewCount).toBe(1);
    expect(after.familiarityScore).toBeGreaterThanOrEqual(before);
    expect(after.intervalIndex).toBe(0);
    expect(REVIEW_INTERVAL_DAYS[after.intervalIndex]).toBe(1);
    const due = new Date(after.dueAt!);
    expect(due.getTime() - now.getTime()).toBe(1 * 24 * 60 * 60 * 1000);
  });

  it('incorrect review does not destroy progress', async () => {
    const repo = new MemoryUserVocabularyRepository();
    const service = new VocabularyService(repo, bundle);
    const started = seedLemma('camminare', {
      encounterCount: 6,
      chaptersEncountered: ['c1', 'c2'],
      correctReviewCount: 1,
      reviewCount: 1,
      intervalIndex: 1,
    });
    await service.__replaceState({ lemmas: { camminare: started }, phrases: {} });
    const before = (await service.getState()).lemmas.camminare;
    const beforeInterval = before.intervalIndex;
    const beforeStatus = before.status;
    const beforeEncounters = before.encounterCount;
    await service.recordReview('lemma', 'camminare', false, new Date('2026-08-11T12:00:00.000Z'));
    const after = (await service.getState()).lemmas.camminare;
    expect(after.incorrectReviewCount).toBe(1);
    expect(after.status).toBe(beforeStatus);
    expect(after.familiarityScore).toBeGreaterThan(0.15);
    expect(after.encounterCount).toBe(beforeEncounters);
    expect(after.intervalIndex).toBeLessThan(beforeInterval);
  });

  it('changes review interval on success and shortens on miss', () => {
    const from = new Date('2026-01-01T00:00:00.000Z');
    const first = nextDueAt(-1, from, true);
    expect(first.intervalIndex).toBe(0);
    expect(REVIEW_INTERVAL_DAYS[first.intervalIndex]).toBe(1);

    const second = nextDueAt(0, from, true);
    expect(REVIEW_INTERVAL_DAYS[second.intervalIndex]).toBe(3);

    const third = nextDueAt(1, from, true);
    expect(REVIEW_INTERVAL_DAYS[third.intervalIndex]).toBe(7);

    const shortened = nextDueAt(2, from, false);
    expect(REVIEW_INTERVAL_DAYS[shortened.intervalIndex]).toBe(3);
  });

  it('identifies due reviews correctly', () => {
    const now = new Date('2026-08-11T00:00:00.000Z');
    expect(isDue(null, now)).toBe(true);
    expect(isDue('2026-08-10T00:00:00.000Z', now)).toBe(true);
    expect(isDue('2026-08-12T00:00:00.000Z', now)).toBe(false);

    const state: UserVocabularyState = {
      lemmas: {
        dueWord: seedLemma('casa', {
          lemmaId: 'casa',
          encounterCount: 4,
          chaptersEncountered: ['c1'],
          tapCount: 2,
          dueAt: '2026-08-10T00:00:00.000Z',
          reviewCount: 1,
        }),
        later: seedLemma('mangiare', {
          encounterCount: 4,
          chaptersEncountered: ['c1'],
          tapCount: 2,
          dueAt: '2026-08-20T00:00:00.000Z',
          reviewCount: 1,
        }),
      },
      phrases: {},
    };
    const queue = reviews.buildQueue(state, {
      currentChapterId: 'none',
      completedChapterIds: allChapterIds(bundle),
      now,
    });
    const ids = queue.map((c) => c.id);
    expect(ids).toContain('casa');
    expect(ids).not.toContain('mangiare');
  });

  it('persists review results across service reload', async () => {
    const repo = new MemoryUserVocabularyRepository();
    const service = new VocabularyService(repo, bundle);
    await service.__replaceState({
      lemmas: {
        camminare: seedLemma('camminare', { encounterCount: 3, chaptersEncountered: ['c1'] }),
      },
      phrases: {},
    });
    await service.recordReview('lemma', 'camminare', true, new Date('2026-08-11T12:00:00.000Z'));
    const again = new VocabularyService(repo, bundle);
    const row = (await again.getState()).lemmas.camminare;
    expect(row.reviewCount).toBe(1);
    expect(row.correctReviewCount).toBe(1);
    expect(row.dueAt).toBeTruthy();
  });

  it('keeps review sessions small', () => {
    const lemmas: UserVocabularyState['lemmas'] = {};
    for (const entry of bundle.lexicon.slice(0, 20)) {
      if (entry.partOfSpeech === 'article') continue;
      lemmas[entry.lemmaId] = seedLemma(entry.lemmaId, {
        encounterCount: 4,
        chaptersEncountered: ['c1', 'c2'],
        saved: true,
        saveCount: 1,
      });
    }
    const session = reviews.createSession(
      { lemmas, phrases: {} },
      { currentChapterId: 'none', completedChapterIds: allChapterIds(bundle), limit: 5 },
    );
    expect(session.items.length).toBeLessThanOrEqual(5);
    expect(session.items.length).toBeGreaterThan(0);
    const maxed = reviews.createSession(
      { lemmas, phrases: {} },
      { currentChapterId: 'none', completedChapterIds: allChapterIds(bundle), limit: 40 },
    );
    expect(maxed.items.length).toBeLessThanOrEqual(10);
  });
});

describe('Phase 5 vocabulary screen data and examples', () => {
  let bundle: ContentBundle;

  beforeEach(() => {
    bundle = loadBundle();
  });

  it('vocabulary summary reflects real learner data', async () => {
    const service = new VocabularyService(new MemoryUserVocabularyRepository(), bundle);
    await service.__replaceState({
      lemmas: {
        camminare: seedLemma('camminare', {
          encounterCount: 3,
          chaptersEncountered: ['a', 'b'],
        }),
        casa: seedLemma('casa', {
          encounterCount: 8,
          chaptersEncountered: ['a', 'b', 'c'],
        }),
        mangiare: seedLemma('mangiare', {
          encounterCount: 14,
          chaptersEncountered: ['a', 'b', 'c', 'd'],
          correctReviewCount: 3,
          reviewCount: 3,
        }),
      },
      phrases: {},
    });
    const summary = service.summarize(await service.getState());
    expect(summary.encountered).toBe(3);
    expect(summary.learning).toBeGreaterThanOrEqual(1);
    expect(summary.familiar).toBeGreaterThanOrEqual(1);
    expect(summary.mastered).toBeGreaterThanOrEqual(1);

    const lists = browseVocabulary(bundle, await service.getState());
    expect(lists.learning.some((i) => i.id === 'camminare')).toBe(true);
  });

  it('word detail loads a real story example', () => {
    const examples = findExamplesForLemma(bundle, 'camminare', 3);
    expect(examples.length).toBeGreaterThan(0);
    expect(examples[0].text.toLowerCase()).toContain('cammin');
    expect(examples[0].chapterNumber).toBeGreaterThan(0);
  });

  it('phrase detail loads a real story example', () => {
    const examples = findExamplesForPhrase(bundle, 'ha_fame', 3);
    expect(examples.length).toBeGreaterThan(0);
    expect(examples[0].text.toLowerCase()).toContain('fame');
  });
});
