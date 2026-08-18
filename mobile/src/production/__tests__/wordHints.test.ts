import { describe, expect, it } from 'vitest';

import { buildWordHintSegments } from '@/src/production/wordHints';
import type { LexiconEntry, Sentence } from '@/src/content/schemas';

const lexiconById = new Map<string, LexiconEntry>([
  [
    'lavoro',
    {
      lemmaId: 'lavoro',
      italian: 'lavoro',
      english: 'job',
      partOfSpeech: 'noun',
      difficulty: 1,
      frequency: 'high',
    },
  ],
  [
    'cercare',
    {
      lemmaId: 'cercare',
      italian: 'cercare',
      english: 'to look for',
      partOfSpeech: 'verb',
      difficulty: 1,
      frequency: 'high',
    },
  ],
]);

const sentence: Sentence = {
  id: 's09',
  text: 'Scusa, cerco un lavoro.',
  english: "Excuse me, I'm looking for a job.",
  speakerId: 'luca',
  kind: 'dialogue',
  tokens: [
    { surface: 'Scusa', lemmaId: 'scusa', index: 0 },
    { surface: 'cerco', lemmaId: 'cercare', index: 1 },
    { surface: 'un', lemmaId: 'un', index: 2 },
    { surface: 'lavoro', lemmaId: 'lavoro', index: 3 },
  ],
  phrases: [],
  reinforces: [],
  phraseReinforces: [],
  introduces: [],
  difficulty: 1,
  variants: [],
  selectedVariantId: 'base',
};

describe('buildWordHintSegments', () => {
  it('marks English words that map to Italian tokens as tappable', () => {
    const segments = buildWordHintSegments(
      "Excuse me, I'm looking for a job.",
      sentence,
      lexiconById,
    );
    const job = segments.find((segment) => segment.text.trim() === 'job');
    expect(job?.tappable).toBe(true);
    expect(job?.hint).toBe('lavoro');
  });
});
