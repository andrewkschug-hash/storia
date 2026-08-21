import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { loadContentBundle } from '@/src/content/loadContentBundle';
import { classifyAlternative } from '@/src/production/alternativePolicy';
import {
  filterA1WordModeAlternatives,
  isA1WordModeChunk,
  productionCardView,
  productionDisplayFromStory,
} from '@/src/production/flow';
import { countProductionWords } from '@/src/production/score';
import { conflictsWithAccepted, phraseFamilyKey, reviewClusterKeys } from '@/src/review/reviewClusters';
import { ReviewService } from '@/src/review/ReviewService';
import { createLemmaEncounter, createPhraseEncounter } from '@/src/vocabulary/normalize';
import { createEmptyVocabularyState } from '@/src/vocabulary/types';
import { formGlossFor, listFormGlossEntries } from '@/src/vocabulary/formGlosses';
import { displayEnglishForForm } from '@/src/vocabulary/resolveTap';

const here = fileURLToPath(new URL('.', import.meta.url));
const root = join(here, '../../../content');
const storyPath = join(root, 'stories', 'luca-a-roma');
const chaptersDir = join(storyPath, 'chapters');

function loadLucaBundle() {
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

describe('A1 word-mode display hygiene', () => {
  it('filters long alternatives from A1 word mode', () => {
    expect(isA1WordModeChunk('arrivo')).toBe(true);
    expect(isA1WordModeChunk('Ho fame.')).toBe(true);
    expect(isA1WordModeChunk('Arrivo a Roma.')).toBe(false);
    expect(filterA1WordModeAlternatives('arrivo', ['Arrivo a Roma.', 'Io arrivo', 'arriva'])).toEqual([
      'Io arrivo',
      'arriva',
    ]);
  });

  it('does not reveal full-sentence alternatives for long A1 overlays', () => {
    const bundle = loadLucaBundle();
    const sentence = [...bundle.chapters.values()]
      .flatMap((chapter) => chapter.paragraphs.flatMap((paragraph) => paragraph.sentences))
      .find((row) => row.id === 's01' && row.text.includes('arriva'));
    expect(sentence).toBeTruthy();

    const exercise = {
      exerciseId: 'luca-a-roma-ch01-prod-01',
      storyId: 'luca-a-roma',
      chapterId: 'luca-a-roma-01',
      sourceSentenceId: 's01',
      promptEn: 'I arrive in Rome.',
      expectedIt: 'Arrivo a Roma.',
      acceptableAnswers: ['Io arrivo a Roma.'],
      match: 'flexible' as const,
      level: 'A1' as const,
      focus: ['present', 'arrival'],
    };

    const display = productionDisplayFromStory(exercise, sentence!, {
      storySentence: sentence!,
      lexiconById: bundle.lexiconById,
    });
    expect(countProductionWords(display.expectedIt)).toBeLessThanOrEqual(2);
    expect(display.acceptableAnswers.every((line) => isA1WordModeChunk(line))).toBe(true);
    expect(display.acceptableAnswers.some((line) => /a roma/i.test(line))).toBe(false);

    const view = productionCardView(exercise, 0, 4, true, sentence!, {
      storySentence: sentence!,
      lexiconById: bundle.lexiconById,
    });
    expect(view.wordFocused).toBe(true);
    expect(view.acceptableAnswers.every((line) => countProductionWords(line) <= 2)).toBe(true);
  });

  it('prefers conjugated story surface over infinitive when short', () => {
    const bundle = loadLucaBundle();
    const sentence = [...bundle.chapters.values()]
      .flatMap((chapter) => chapter.paragraphs.flatMap((paragraph) => paragraph.sentences))
      .find((row) => row.id === 's01' && row.text.includes('arriva'));
    const exercise = {
      exerciseId: 'luca-a-roma-ch01-prod-01',
      storyId: 'luca-a-roma',
      chapterId: 'luca-a-roma-01',
      sourceSentenceId: 's01',
      promptEn: 'I arrive in Rome.',
      expectedIt: 'Arrivo a Roma.',
      acceptableAnswers: ['Io arrivo a Roma.'],
      match: 'flexible' as const,
      level: 'A1' as const,
      focus: ['arrivare'],
    };
    const display = productionDisplayFromStory(exercise, sentence!, {
      storySentence: sentence!,
      lexiconById: bundle.lexiconById,
    });
    expect(countProductionWords(display.expectedIt)).toBe(1);
    expect(display.expectedIt.toLowerCase()).not.toBe('arrivare');
  });
});

describe('review semantic dedupe', () => {
  it('clusters ha_fame with ha_ancora_fame and avere-hunger', () => {
    expect(phraseFamilyKey('ha_ancora_fame')).toBe('ha_fame');
    const a = { kind: 'phrase' as const, id: 'ha_fame', english: 'is hungry' };
    const b = { kind: 'phrase' as const, id: 'ha_ancora_fame', english: 'is still hungry' };
    const c = { kind: 'lemma' as const, id: 'avere', english: 'to have' };
    const d = { kind: 'lemma' as const, id: 'fame', english: 'hunger' };
    expect(conflictsWithAccepted(b, [a])).toBe(true);
    expect(conflictsWithAccepted(c, [a])).toBe(true);
    expect(conflictsWithAccepted(d, [a])).toBe(true);
    expect(reviewClusterKeys(a).some((k) => k.startsWith('cluster:'))).toBe(true);
  });

  it('dedupes scusa lemma/phrase and can-work near duplicates', () => {
    expect(
      conflictsWithAccepted(
        { kind: 'lemma', id: 'scusa', english: 'sorry / excuse me' },
        [{ kind: 'phrase', id: 'scusa', english: 'excuse me' }],
      ),
    ).toBe(true);
    expect(
      conflictsWithAccepted(
        { kind: 'phrase', id: 'puo_lavorare', english: 'can work' },
        [{ kind: 'phrase', id: 'posso_lavorare', english: 'I can work' }],
      ),
    ).toBe(true);
  });

  it('batch session does not include avere-hunger near-duplicates together', () => {
    const bundle = loadLucaBundle();
    const state = createEmptyVocabularyState();
    state.lemmas.avere = {
      ...createLemmaEncounter('avere'),
      encounterCount: 5,
      tapCount: 3,
      incorrectReviewCount: 2,
    };
    state.lemmas.fame = {
      ...createLemmaEncounter('fame'),
      encounterCount: 4,
      tapCount: 2,
      incorrectReviewCount: 1,
    };
    state.phrases.ha_fame = {
      ...createPhraseEncounter('ha_fame', 'ha fame'),
      encounterCount: 4,
      tapCount: 2,
      incorrectReviewCount: 1,
    };
    state.phrases.ha_ancora_fame = {
      ...createPhraseEncounter('ha_ancora_fame', 'ha ancora fame'),
      encounterCount: 3,
      tapCount: 2,
      incorrectReviewCount: 1,
    };

    const session = new ReviewService(bundle).createBatchSession(state, bundle, 1, 5, { limit: 5 });
    const ids = session.items.map((item) => `${item.kind}:${item.id}`);
    const hungerish = ids.filter(
      (id) =>
        id === 'lemma:avere' ||
        id === 'lemma:fame' ||
        id === 'phrase:ha_fame' ||
        id === 'phrase:ha_ancora_fame',
    );
    expect(hungerish.length).toBeLessThanOrEqual(1);
  });
});

describe('alternative answer policy', () => {
  it('flags known invalid patterns', () => {
    expect(
      classifyAlternative({
        expectedIt: 'Mi alzo.',
        alternative: 'Luca si alza.',
        promptEn: 'I get up.',
      }).verdict,
    ).toBe('PERSON_MISMATCH');
    expect(
      classifyAlternative({
        expectedIt: 'Aiutami.',
        alternative: 'Mi aiuti?',
        promptEn: 'Help me.',
      }).verdict,
    ).toBe('TENSE_MISMATCH');
    expect(
      classifyAlternative({
        expectedIt: 'Marco torna al caffè.',
        alternative: 'Marco va al caffè.',
      }).verdict,
    ).toBe('MEANING_DRIFT');
    expect(
      classifyAlternative({
        expectedIt: 'Davide è alla porta.',
        alternative: 'Davide e alla porta.',
      }).verdict,
    ).toBe('TYPO');
    expect(
      classifyAlternative({
        expectedIt: 'Luca è arrivato presto.',
        alternative: 'Luca è arrivata presto.',
        promptEn: 'Luca arrived early.',
      }).verdict,
    ).toBe('GENDER_ERROR');
    expect(
      classifyAlternative({
        expectedIt: 'Ho fame.',
        alternative: 'Io ho fame.',
        promptEn: "I'm hungry.",
      }).verdict,
    ).toBe('VALID');
  });
});

describe('form-level dictionary glosses', () => {
  it('maps high-frequency forms including ambiguous readings', () => {
    expect(formGlossFor('essere', 'siete')).toMatch(/you all are \(voi\)/i);
    expect(formGlossFor('essere', 'sono')).toMatch(/I am \/ they are/i);
    expect(formGlossFor('avere', 'abbiamo')).toBe('we have');
    expect(formGlossFor('potere', 'può')).toBe('he/she can');
    expect(formGlossFor('potere', 'posso')).toBe('I can');
    expect(formGlossFor('dovere', 'deve')).toMatch(/must/i);
    expect(listFormGlossEntries().length).toBeGreaterThan(80);
  });

  it('uses form gloss in displayEnglishForForm', () => {
    const entry = {
      lemmaId: 'essere',
      italian: 'essere',
      english: 'to be',
      partOfSpeech: 'verb' as const,
    };
    expect(displayEnglishForForm('siete', 'essere', entry)).toMatch(/you all are/i);
    expect(displayEnglishForForm('xyz', 'essere', entry)).toBe('to be');
  });
});
