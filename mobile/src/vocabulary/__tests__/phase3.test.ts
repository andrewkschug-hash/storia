import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, beforeEach } from 'vitest';

import { loadContentBundle } from '@/src/content/loadContentBundle';
import type { ContentBundle, Sentence } from '@/src/content/schemas';
import {
  buildLexiconIndexFromBundle,
  findPhraseCoveringToken,
  phraseIdFromSurface,
} from '@/src/vocabulary/dictionaryIndex';
import { resolveSentenceLookup, resolveTap } from '@/src/vocabulary/resolveTap';
import { VocabularyService } from '@/src/vocabulary/VocabularyService';
import { MemoryUserVocabularyRepository } from '@/src/vocabulary/UserVocabularyRepository';
import { createEmptyVocabularyState } from '@/src/vocabulary/types';

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
    adaptiveJson: JSON.parse(readFileSync(join(storyPath, 'adaptive-variants.json'), 'utf8')),
    translationsJson: JSON.parse(readFileSync(join(storyPath, 'sentence-english.json'), 'utf8')),
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
  throw new Error(`Sentence not found containing: ${textIncludes}`);
}

function tokenIndexFor(sentence: Sentence, surface: string): number {
  const idx = sentence.tokens.findIndex(
    (t) => t.surface.toLowerCase() === surface.toLowerCase(),
  );
  if (idx < 0) throw new Error(`Token ${surface} not in ${sentence.text}`);
  return idx;
}

describe('Phase 3 dictionary resolve', () => {
  const bundle = loadBundle();
  const index = buildLexiconIndexFromBundle(bundle);
  const empty = createEmptyVocabularyState();

  it('maps an inflected form to the correct lemma while showing the surface', () => {
    const { sentence, chapterId, chapterNumber } = findSentence(bundle, 'cammina');
    const tokenIndex = tokenIndexFor(sentence, 'cammina');
    const lookup = resolveTap(
      index,
      { sentence, chapterId, chapterNumber, tokenIndex },
      empty,
    );
    expect(lookup.kind).toBe('word');
    if (lookup.kind !== 'word') return;
    expect(lookup.surface.toLowerCase()).toBe('cammina');
    expect(lookup.lemmaId).toBe('camminare');
    expect(lookup.lemmaItalian).toBe('camminare');
    expect(lookup.english.toLowerCase()).toContain('walk');
  });

  it('opens the correct lemma for a known word', () => {
    const { sentence, chapterId, chapterNumber } = findSentence(bundle, 'Luca è a Roma');
    const tokenIndex = tokenIndexFor(sentence, 'Roma');
    const lookup = resolveTap(
      index,
      { sentence, chapterId, chapterNumber, tokenIndex },
      empty,
    );
    expect(lookup.kind).toBe('word');
    if (lookup.kind !== 'word') return;
    expect(lookup.lemmaId).toBe('roma');
  });

  it('unknown lemma produces a graceful fallback', () => {
    const { sentence, chapterId, chapterNumber } = findSentence(bundle, 'Luca è a Roma');
    const fake = {
      ...sentence,
      tokens: sentence.tokens.map((t, i) =>
        i === 0 ? { ...t, lemmaId: 'zzz_unknown_lemma', surface: 'Zzz' } : t,
      ),
    };
    const lookup = resolveTap(
      index,
      { sentence: fake, chapterId, chapterNumber, tokenIndex: 0 },
      empty,
    );
    expect(lookup.kind).toBe('word');
    if (lookup.kind !== 'word') return;
    expect(lookup.english).toBe('Meaning unavailable');
    expect(lookup.lemmaId).toBe('zzz_unknown_lemma');
  });

  it('recognizes phrase metadata for ha fame', () => {
    const { sentence } = findSentence(bundle, 'ha fame');
    const idx = tokenIndexFor(sentence, 'ha');
    const phrase = findPhraseCoveringToken(sentence, idx);
    expect(phrase).not.toBeNull();
    expect(phrase!.surface.toLowerCase()).toContain('fame');
    expect(phraseIdFromSurface(phrase!.surface)).toBe('ha_fame');
  });

  it('ha fame resolves to the phrase natural meaning', () => {
    const { sentence, chapterId, chapterNumber } = findSentence(bundle, 'Luca ha fame');
    const tokenIndex = tokenIndexFor(sentence, 'fame');
    const lookup = resolveTap(
      index,
      { sentence, chapterId, chapterNumber, tokenIndex },
      empty,
    );
    expect(lookup.kind).toBe('phrase');
    if (lookup.kind !== 'phrase') return;
    expect(lookup.naturalEnglish.toLowerCase()).toContain('hungry');
    expect(lookup.literalEnglish.toLowerCase()).toContain('hunger');
  });

  it('phrase meaning overrides isolated-word interpretation', () => {
    const { sentence, chapterId, chapterNumber } = findSentence(bundle, 'Luca ha fame');
    const tokenIndex = tokenIndexFor(sentence, 'ha');
    const lookup = resolveTap(
      index,
      { sentence, chapterId, chapterNumber, tokenIndex },
      empty,
    );
    expect(lookup.kind).toBe('phrase');
    if (lookup.kind !== 'phrase') return;
    expect(lookup.naturalEnglish.toLowerCase()).not.toBe('to have');
    expect(lookup.naturalEnglish.toLowerCase()).toContain('hungry');
  });

  it('come stai resolves as a phrase', () => {
    const { sentence, chapterId, chapterNumber } = findSentence(bundle, 'Come stai');
    const tokenIndex = tokenIndexFor(sentence, 'Come');
    const lookup = resolveTap(
      index,
      { sentence, chapterId, chapterNumber, tokenIndex },
      empty,
    );
    expect(lookup.kind).toBe('phrase');
    if (lookup.kind !== 'phrase') return;
    expect(lookup.naturalEnglish.toLowerCase()).toContain('how are you');
  });

  it('va bene resolves as a phrase', () => {
    const { sentence, chapterId, chapterNumber } = findSentence(bundle, 'va bene');
    const tokenIndex = tokenIndexFor(sentence, 'va');
    const lookup = resolveTap(
      index,
      { sentence, chapterId, chapterNumber, tokenIndex },
      empty,
    );
    expect(lookup.kind).toBe('phrase');
    if (lookup.kind !== 'phrase') return;
    expect(lookup.naturalEnglish.toLowerCase()).toMatch(/okay|all right|goes well|going well/);
  });

  it('non lo so resolves as a phrase', () => {
    const { sentence, chapterId, chapterNumber } = findSentence(bundle, 'Non lo so');
    const tokenIndex = tokenIndexFor(sentence, 'so');
    const lookup = resolveTap(
      index,
      { sentence, chapterId, chapterNumber, tokenIndex },
      empty,
    );
    expect(lookup.kind).toBe('phrase');
    if (lookup.kind !== 'phrase') return;
    expect(lookup.naturalEnglish.toLowerCase()).toContain("don't know");
  });

  it("dov'è resolves as a phrase", () => {
    const { sentence, chapterId, chapterNumber } = findSentence(bundle, "Dov'è");
    const tokenIndex = 0;
    const lookup = resolveTap(
      index,
      { sentence, chapterId, chapterNumber, tokenIndex },
      empty,
    );
    expect(lookup.kind).toBe('phrase');
    if (lookup.kind !== 'phrase') return;
    expect(lookup.naturalEnglish.toLowerCase()).toContain('where is');
  });
});

describe('Phase 3 vocabulary persistence', () => {
  let bundle: ContentBundle;
  let service: VocabularyService;
  let repo: MemoryUserVocabularyRepository;

  beforeEach(() => {
    bundle = loadBundle();
    repo = new MemoryUserVocabularyRepository();
    service = new VocabularyService(repo, bundle);
  });

  it('persists vocabulary encounters and increments on repeat', async () => {
    const { sentence, chapterId, chapterNumber } = findSentence(bundle, 'cammina');
    const tokenIndex = tokenIndexFor(sentence, 'cammina');
    const ctx = { sentence, chapterId, chapterNumber, tokenIndex };

    await service.openTap(ctx);
    await service.openTap(ctx);
    const state = await service.getState();
    expect(state.lemmas.camminare.encounterCount).toBe(2);
    expect(state.lemmas.camminare.firstChapterId).toBe(chapterId);
    expect(state.lemmas.camminare.lastChapterId).toBe(chapterId);
  });

  it('save persists and survives repository reload', async () => {
    const { sentence, chapterId, chapterNumber } = findSentence(bundle, 'Luca ha fame');
    const tokenIndex = tokenIndexFor(sentence, 'fame');
    const lookup = await service.openTap({ sentence, chapterId, chapterNumber, tokenIndex });
    await service.saveLookup(lookup);

    const service2 = new VocabularyService(repo, bundle);
    const state = await service2.getState();
    expect(state.phrases.ha_fame?.saved).toBe(true);
    expect(await service2.isSaved(lookup)).toBe(true);
  });

  it('phrase encounters persist separately', async () => {
    const { sentence, chapterId, chapterNumber } = findSentence(bundle, 'Come stai');
    const tokenIndex = tokenIndexFor(sentence, 'stai');
    await service.openTap({ sentence, chapterId, chapterNumber, tokenIndex });
    const state = await service.getState();
    const id = phraseIdFromSurface('Come stai?');
    // surface in content may be "Come stai?" 
    const phraseKeys = Object.keys(state.phrases);
    expect(phraseKeys.length).toBeGreaterThan(0);
    expect(state.phrases[phraseKeys[0]].encounterCount).toBe(1);
    expect(id.length).toBeGreaterThan(0);
  });

  it('resolves a full-sentence English translation without counting a word tap', () => {
    const { sentence, chapterId, chapterNumber } = findSentence(
      bundle,
      'Luca arriva a Roma.',
    );
    const lookup = resolveSentenceLookup(sentence, chapterId, chapterNumber);
    expect(lookup.kind).toBe('sentence');
    expect(lookup.surface).toBe('Luca arriva a Roma.');
    expect(lookup.english).toBe('Luca arrives in Rome.');
  });

  it('uses the adaptive variant English that matches the displayed sentence', () => {
    const { sentence, chapterId, chapterNumber } = findSentence(bundle, 'Luca aspetta.');
    const variant = sentence.variants.find((v) => v.id === 'extended');
    expect(variant?.text).toBe('Luca aspetta qui.');
    expect(variant?.english).toBe('Luca waits here.');
    const displayed = {
      ...sentence,
      text: variant!.text,
      english: variant!.english,
      selectedVariantId: 'extended',
    };
    const lookup = resolveSentenceLookup(displayed, chapterId, chapterNumber);
    expect(lookup.english).toBe('Luca waits here.');
    expect(lookup.english).not.toBe('Luca waits.');
  });

  it('dictionary lookup does not require network (pure local resolve)', () => {
    const { sentence, chapterId, chapterNumber } = findSentence(bundle, 'Roma');
    const tokenIndex = tokenIndexFor(sentence, 'Roma');
    const lookup = resolveTap(
      buildLexiconIndexFromBundle(bundle),
      { sentence, chapterId, chapterNumber, tokenIndex },
      createEmptyVocabularyState(),
    );
    expect(lookup).toBeTruthy();
  });
});
