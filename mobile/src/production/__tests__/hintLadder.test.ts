import { describe, expect, it } from 'vitest';
import type { LexiconEntry, ProductionExercise, Sentence } from '@/src/content/schemas';
import {
  buildTargetedWordHints,
  deriveFocusKeywords,
  generateSentenceCloze,
} from '@/src/production/hintLadder';

const mockLexicon = new Map<string, LexiconEntry>([
  ['arrivare', { lemmaId: 'arrivare', italian: 'arrivare', english: 'to arrive', partOfSpeech: 'verb', difficulty: 1, frequency: 'high' }],
  ['roma', { lemmaId: 'roma', italian: 'Roma', english: 'Rome', partOfSpeech: 'noun', difficulty: 1, frequency: 'high' }],
  ['comprare', { lemmaId: 'comprare', italian: 'comprare', english: 'to buy', partOfSpeech: 'verb', difficulty: 1, frequency: 'high' }],
  ['biglietto', { lemmaId: 'biglietto', italian: 'biglietto', english: 'ticket', partOfSpeech: 'noun', difficulty: 1, frequency: 'high' }],
  ['andare', { lemmaId: 'andare', italian: 'andare', english: 'to go', partOfSpeech: 'verb', difficulty: 1, frequency: 'high' }],
  ['caffè', { lemmaId: 'caffè', italian: 'caffè', english: 'cafe', partOfSpeech: 'noun', difficulty: 1, frequency: 'high' }],
  ['prepararsi', { lemmaId: 'prepararsi', italian: 'prepararsi', english: 'to get ready', partOfSpeech: 'verb', difficulty: 1, frequency: 'high' }],
  ['lavoro', { lemmaId: 'lavoro', italian: 'lavoro', english: 'job', partOfSpeech: 'noun', difficulty: 1, frequency: 'high' }],
  ['risolvere', { lemmaId: 'risolvere', italian: 'risolvere', english: 'to solve', partOfSpeech: 'verb', difficulty: 2, frequency: 'high' }],
  ['problema', { lemmaId: 'problema', italian: 'problema', english: 'problem', partOfSpeech: 'noun', difficulty: 1, frequency: 'high' }],
  ['lavorare', { lemmaId: 'lavorare', italian: 'lavorare', english: 'to work', partOfSpeech: 'verb', difficulty: 1, frequency: 'high' }],
  ['bisogno', { lemmaId: 'bisogno', italian: 'bisogno', english: 'need', partOfSpeech: 'noun', difficulty: 1, frequency: 'high' }],
  ['aiuto', { lemmaId: 'aiuto', italian: 'aiuto', english: 'help', partOfSpeech: 'noun', difficulty: 1, frequency: 'high' }],
]);

function createSentence(text: string, english: string, tokens: Array<{ surface: string; lemmaId: string }>, phrases: Array<{ surface: string; naturalEn: string }> = []): Sentence {
  return {
    id: 's01',
    text,
    english,
    speakerId: 'narrator',
    kind: 'narration',
    tokens: tokens.map((t, idx) => ({ ...t, index: idx })),
    phrases,
    reinforces: [],
    phraseReinforces: [],
    introduces: [],
    difficulty: 1,
    variants: [],
    selectedVariantId: 'base',
  };
}

describe('Hint Ladder Engine', () => {
  describe('Test Matrix across grammar & CEFR levels', () => {
    it('handles Simple A1: "Luca arriva a Roma."', () => {
      const exercise: ProductionExercise = {
        exerciseId: 'ex-01',
        storyId: 'luca',
        chapterId: 'ch01',
        sourceSentenceId: 's01',
        promptEn: 'Luca arrives in Rome.',
        expectedIt: 'Luca arriva a Roma.',
        level: 'A1',
        match: 'flexible',
        focus: ['arrivare', 'roma'],
      };
      const sentence = createSentence(
        'Luca arriva a Roma.',
        'Luca arrives in Rome.',
        [
          { surface: 'Luca', lemmaId: 'luca' },
          { surface: 'arriva', lemmaId: 'arrivare' },
          { surface: 'a', lemmaId: 'a' },
          { surface: 'Roma', lemmaId: 'roma' },
        ],
      );

      // Level 1: Keywords
      const keywords = deriveFocusKeywords(exercise, sentence, mockLexicon);
      expect(keywords).toContain('arriva');
      expect(keywords).toContain('a Roma');
      // Invariant: Level 1 !== full target sentence
      expect(keywords.join(' ')).not.toBe(exercise.expectedIt);

      // Level 2: Cloze Frame
      const cloze = generateSentenceCloze(exercise.expectedIt, keywords, exercise.focus, sentence);
      expect(cloze).toBe('Luca ______ a Roma.');
      expect(cloze).toContain('______');
      expect(cloze).not.toBe(exercise.expectedIt);
    });

    it('handles SVO: "Marco compra il biglietto."', () => {
      const exercise: ProductionExercise = {
        exerciseId: 'ex-02',
        storyId: 'luca',
        chapterId: 'ch01',
        sourceSentenceId: 's02',
        promptEn: 'Marco buys the ticket.',
        expectedIt: 'Marco compra il biglietto.',
        level: 'A1',
        match: 'flexible',
        focus: ['comprare', 'biglietto'],
      };
      const sentence = createSentence(
        'Marco compra il biglietto.',
        'Marco buys the ticket.',
        [
          { surface: 'Marco', lemmaId: 'marco' },
          { surface: 'compra', lemmaId: 'comprare' },
          { surface: 'il', lemmaId: 'il' },
          { surface: 'biglietto', lemmaId: 'biglietto' },
        ],
      );

      const keywords = deriveFocusKeywords(exercise, sentence, mockLexicon);
      expect(keywords).toContain('compra');
      expect(keywords).toContain('il biglietto');

      const cloze = generateSentenceCloze(exercise.expectedIt, keywords, exercise.focus, sentence);
      expect(cloze).toBe('Marco ______ il biglietto.');
    });

    it('handles Prepositional phrases: "Luca va al caffè con Sofia."', () => {
      const exercise: ProductionExercise = {
        exerciseId: 'ex-03',
        storyId: 'luca',
        chapterId: 'ch01',
        sourceSentenceId: 's03',
        promptEn: 'Luca goes to the cafe with Sofia.',
        expectedIt: 'Luca va al caffè con Sofia.',
        level: 'A1',
        match: 'flexible',
        focus: ['andare', 'caffè'],
      };
      const sentence = createSentence(
        'Luca va al caffè con Sofia.',
        'Luca goes to the cafe with Sofia.',
        [
          { surface: 'Luca', lemmaId: 'luca' },
          { surface: 'va', lemmaId: 'andare' },
          { surface: 'al', lemmaId: 'a' },
          { surface: 'caffè', lemmaId: 'caffè' },
          { surface: 'con', lemmaId: 'con' },
          { surface: 'Sofia', lemmaId: 'sofia' },
        ],
      );

      const keywords = deriveFocusKeywords(exercise, sentence, mockLexicon);
      expect(keywords).toContain('va');
      expect(keywords).toContain('al caffè');

      const cloze = generateSentenceCloze(exercise.expectedIt, keywords, exercise.focus, sentence);
      expect(cloze).toBe('Luca ______ al caffè con Sofia.');
    });

    it('handles Idiomatic Phrase chunks: "Marco ha bisogno di aiuto."', () => {
      const exercise: ProductionExercise = {
        exerciseId: 'ex-04',
        storyId: 'luca',
        chapterId: 'ch01',
        sourceSentenceId: 's04',
        promptEn: 'Marco needs help.',
        expectedIt: 'Marco ha bisogno di aiuto.',
        level: 'A1',
        match: 'flexible',
        focus: ['bisogno', 'aiuto'],
      };
      const sentence = createSentence(
        'Marco ha bisogno di aiuto.',
        'Marco needs help.',
        [
          { surface: 'Marco', lemmaId: 'marco' },
          { surface: 'ha', lemmaId: 'avere' },
          { surface: 'bisogno', lemmaId: 'bisogno' },
          { surface: 'di', lemmaId: 'di' },
          { surface: 'aiuto', lemmaId: 'aiuto' },
        ],
        [{ surface: 'ha bisogno', naturalEn: 'needs' }],
      );

      const keywords = deriveFocusKeywords(exercise, sentence, mockLexicon);
      expect(keywords).toContain('ha bisogno');
      expect(keywords.some((k) => k.includes('aiuto'))).toBe(true);

      const cloze = generateSentenceCloze(exercise.expectedIt, keywords, exercise.focus, sentence);
      expect(cloze).toContain('______');
      expect(cloze).not.toBe(exercise.expectedIt);
    });

    it('handles Past Tense: "Marco ha risolto il problema."', () => {
      const exercise: ProductionExercise = {
        exerciseId: 'ex-05',
        storyId: 'luca',
        chapterId: 'ch01',
        sourceSentenceId: 's05',
        promptEn: 'Marco solved the problem.',
        expectedIt: 'Marco ha risolto il problema.',
        level: 'A2',
        match: 'flexible',
        focus: ['risolvere', 'problema'],
      };
      const sentence = createSentence(
        'Marco ha risolto il problema.',
        'Marco solved the problem.',
        [
          { surface: 'Marco', lemmaId: 'marco' },
          { surface: 'ha', lemmaId: 'avere' },
          { surface: 'risolto', lemmaId: 'risolvere' },
          { surface: 'il', lemmaId: 'il' },
          { surface: 'problema', lemmaId: 'problema' },
        ],
      );

      const keywords = deriveFocusKeywords(exercise, sentence, mockLexicon);
      expect(keywords).toContain('risolto');
      expect(keywords).toContain('il problema');

      const cloze = generateSentenceCloze(exercise.expectedIt, keywords, exercise.focus, sentence);
      expect(cloze).toContain('______');
      expect(cloze).not.toBe(exercise.expectedIt);
    });

    it('handles Imperfetto: "Luca lavorava ogni mattina."', () => {
      const exercise: ProductionExercise = {
        exerciseId: 'ex-06',
        storyId: 'luca',
        chapterId: 'ch01',
        sourceSentenceId: 's06',
        promptEn: 'Luca worked every morning.',
        expectedIt: 'Luca lavorava ogni mattina.',
        level: 'A2',
        match: 'flexible',
        focus: ['lavorare'],
      };
      const sentence = createSentence(
        'Luca lavorava ogni mattina.',
        'Luca worked every morning.',
        [
          { surface: 'Luca', lemmaId: 'luca' },
          { surface: 'lavorava', lemmaId: 'lavorare' },
          { surface: 'ogni', lemmaId: 'ogni' },
          { surface: 'mattina', lemmaId: 'mattina' },
        ],
      );

      const keywords = deriveFocusKeywords(exercise, sentence, mockLexicon);
      expect(keywords).toContain('lavorava');

      const cloze = generateSentenceCloze(exercise.expectedIt, keywords, exercise.focus, sentence);
      expect(cloze).toBe('Luca ______ ogni mattina.');
    });

    it('handles Longer B1 sentences without leaking full answer', () => {
      const exercise: ProductionExercise = {
        exerciseId: 'ex-07',
        storyId: 'luca',
        chapterId: 'ch01',
        sourceSentenceId: 's07',
        promptEn: 'When you learn to listen with humility, everything begins to work with unexpected ease.',
        expectedIt: 'Quando impari ad ascoltare con umiltà, tutto comincia a funzionare con una facilità inaspettata.',
        level: 'A2',
        match: 'flexible',
        focus: ['imparare', 'ascoltare', 'umiltà'],
      };
      const sentence = createSentence(
        'Quando impari ad ascoltare con umiltà, tutto comincia a funzionare con una facilità inaspettata.',
        'When you learn to listen with humility, everything begins to work with unexpected ease.',
        [
          { surface: 'Quando', lemmaId: 'quando' },
          { surface: 'impari', lemmaId: 'imparare' },
          { surface: 'ad', lemmaId: 'a' },
          { surface: 'ascoltare', lemmaId: 'ascoltare' },
          { surface: 'con', lemmaId: 'con' },
          { surface: 'umiltà', lemmaId: 'umiltà' },
        ],
        [{ surface: 'con umiltà', naturalEn: 'with humility' }],
      );

      const keywords = deriveFocusKeywords(exercise, sentence, mockLexicon);
      expect(keywords).toContain('impari');
      expect(keywords).toContain('con umiltà');
      expect(keywords.length).toBeLessThanOrEqual(4);

      // Invariants
      expect(keywords.join(' ')).not.toBe(exercise.expectedIt);

      const cloze = generateSentenceCloze(exercise.expectedIt, keywords, exercise.focus, sentence);
      expect(cloze).toContain('______');
      expect(cloze).not.toBe(exercise.expectedIt);
    });

    it('handles person-transformed exercises: "We go to the station." uses "andiamo", not "va"', () => {
      const exercise: ProductionExercise = {
        exerciseId: 'luca-a-roma-ch16-prod-01',
        storyId: 'luca-a-roma',
        chapterId: 'luca-a-roma-16',
        sourceSentenceId: 's02',
        promptEn: 'We go to the station.',
        expectedIt: 'Andiamo alla stazione.',
        level: 'A1',
        match: 'flexible',
        focus: ['andare'],
      };
      const sentence = createSentence(
        'Il gruppo va alla stazione.',
        'The group goes to the station.',
        [
          { surface: 'Il', lemmaId: 'il' },
          { surface: 'gruppo', lemmaId: 'gruppo' },
          { surface: 'va', lemmaId: 'andare' },
          { surface: 'alla', lemmaId: 'a' },
          { surface: 'stazione', lemmaId: 'stazione' },
        ],
        [{ surface: 'alla stazione', naturalEn: 'to the station' }],
      );

      const keywords = deriveFocusKeywords(exercise, sentence, mockLexicon);
      expect(keywords).toContain('alla stazione');
      expect(keywords).toContain('Andiamo');
      expect(keywords).not.toContain('va');
    });
  });

  describe('Selective Tap-to-Reveal English Vocabulary (Level 0 Micro-hints)', () => {
    it('only marks English words matching focus anchors as tappable with dotted underline', () => {
      const sentence = createSentence(
        'Luca arriva a Roma.',
        'Luca arrives in Rome.',
        [
          { surface: 'Luca', lemmaId: 'luca' },
          { surface: 'arriva', lemmaId: 'arrivare' },
          { surface: 'a', lemmaId: 'a' },
          { surface: 'Roma', lemmaId: 'roma' },
        ],
      );

      const segments = buildTargetedWordHints(
        'Luca arrives in Rome.',
        ['arriva', 'a Roma'],
        sentence,
        mockLexicon,
      );

      const arrivesSegment = segments.find((s) => s.text.trim() === 'arrives');
      expect(arrivesSegment?.tappable).toBe(true);
      expect(arrivesSegment?.hint).toBe('arriva');

      const lucaSegment = segments.find((s) => s.text.trim() === 'Luca');
      expect(lucaSegment?.tappable).toBe(false);
    });
  });
});
