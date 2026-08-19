import { describe, expect, it } from 'vitest';

import type { ProductionExercise, Sentence } from '@/src/content/schemas';
import { resolveProductionFocusLemmas } from '@/src/vocabulary/productionFocusLemmas';

describe('resolveProductionFocusLemmas', () => {
  const lexiconById = new Map([
    ['luca', { lemmaId: 'luca', italian: 'Luca', english: 'Luca', partOfSpeech: 'noun' }],
    ['vendere', { lemmaId: 'vendere', italian: 'vendere', english: 'to sell', partOfSpeech: 'verb' }],
    ['macchina', { lemmaId: 'macchina', italian: 'macchina', english: 'car', partOfSpeech: 'noun' }],
    ['la', { lemmaId: 'la', italian: 'la', english: 'the', partOfSpeech: 'article' }],
  ] as const);

  const source: Sentence = {
    id: 's1',
    text: 'Luca ha venduto la macchina.',
    tokens: [
      { surface: 'Luca', lemmaId: 'luca', start: 0, end: 4 },
      { surface: 'ha', lemmaId: 'avere', start: 5, end: 7 },
      { surface: 'venduto', lemmaId: 'vendere', start: 8, end: 15 },
      { surface: 'la', lemmaId: 'la', start: 16, end: 18 },
      { surface: 'macchina', lemmaId: 'macchina', start: 19, end: 27 },
    ],
  };

  it('uses focus lemmas present in the sentence', () => {
    const exercise: Pick<ProductionExercise, 'focus'> = { focus: ['vendere', 'present'] };
    expect(resolveProductionFocusLemmas(exercise, source, lexiconById as Map<string, never>)).toEqual([
      'vendere',
    ]);
  });

  it('falls back to open-class lemmas when focus has no lemma ids', () => {
    const exercise: Pick<ProductionExercise, 'focus'> = { focus: ['present', 'arrival'] };
    const ids = resolveProductionFocusLemmas(exercise, source, lexiconById as Map<string, never>);
    expect(ids).toContain('vendere');
    expect(ids).not.toContain('luca');
    expect(ids).not.toContain('la');
  });
});
