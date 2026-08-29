import { describe, expect, it } from 'vitest';
import type { Sentence } from '@/src/content/schemas';
import type { WordLookup, PhraseLookup, SentenceLookup } from '@/src/vocabulary/types';
import {
  resolveHeaderExplorerPayload,
  resolveDictionaryExplorerPayload,
  resolveInitialEditorText,
} from '@/src/reader/translationExplorerLogic';

describe('Translation Explorer Payload Resolution', () => {
  const sampleSentence: Sentence = {
    id: 's1',
    text: 'Ci siamo visti ieri.',
    english: 'We saw each other yesterday.',
    tokens: [
      { surface: 'Ci', lemmaId: 'ci', start: 0, end: 2 },
      { surface: 'siamo', lemmaId: 'essere', start: 3, end: 8 },
      { surface: 'visti', lemmaId: 'vedere', start: 9, end: 14 },
      { surface: 'ieri', lemmaId: 'ieri', start: 15, end: 19 },
      { surface: '.', lemmaId: '.', start: 19, end: 20 },
    ],
  };

  describe('Word-level exploration & Context preservation', () => {
    it('preserves full sentence context and reference when exploring a word', () => {
      const wordLookup: WordLookup = {
        kind: 'word',
        surface: 'visti',
        lemmaId: 'vedere',
        lemmaItalian: 'vedere',
        english: 'seen (pl.)',
        sentenceText: 'Ci siamo visti ieri.',
        sentenceId: 's1',
        chapterId: 'ch1',
        chapterNumber: 1,
        tokenIndex: 2,
        encounterCount: 1,
      };

      const payload = resolveDictionaryExplorerPayload(wordLookup, sampleSentence);

      expect(payload.text).toBe('Ci siamo visti ieri.');
      expect(payload.selectedText).toBe('visti');
      expect(payload.contextSentence).toBe('Ci siamo visti ieri.');
      expect(payload.referenceEnglish).toBe('We saw each other yesterday.');
      expect(payload.source).toBe('word');
    });

    it('falls back to word surface if no sentence context exists', () => {
      const wordLookup: WordLookup = {
        kind: 'word',
        surface: 'ciao',
        lemmaId: 'ciao',
        lemmaItalian: 'ciao',
        english: 'hello',
        sentenceText: '',
        sentenceId: '',
        chapterId: 'ch1',
        chapterNumber: 1,
        tokenIndex: 0,
        encounterCount: 1,
      };

      const payload = resolveDictionaryExplorerPayload(wordLookup, null);

      expect(payload.text).toBe('ciao');
      expect(payload.selectedText).toBe('ciao');
      expect(payload.contextSentence).toBeUndefined();
      expect(payload.referenceEnglish).toBeUndefined();
      expect(payload.source).toBe('word');
    });
  });

  describe('Phrase-level exploration', () => {
    it('preserves full sentence context and phrase reference when exploring a phrase', () => {
      const phraseLookup: PhraseLookup = {
        kind: 'phrase',
        phraseId: 'ci-siamo-visti',
        surface: 'ci siamo visti',
        naturalEnglish: 'we saw each other',
        literalEnglish: 'us we are seen',
        sentenceText: 'Ci siamo visti ieri.',
        sentenceId: 's1',
        chapterId: 'ch1',
        chapterNumber: 1,
        tokenStart: 0,
        tokenEnd: 2,
        lemmaIds: ['ci', 'essere', 'vedere'],
        encounterCount: 1,
      };

      const payload = resolveDictionaryExplorerPayload(phraseLookup, sampleSentence);

      expect(payload.text).toBe('Ci siamo visti ieri.');
      expect(payload.selectedText).toBe('ci siamo visti');
      expect(payload.contextSentence).toBe('Ci siamo visti ieri.');
      expect(payload.referenceEnglish).toBe('We saw each other yesterday.');
      expect(payload.source).toBe('phrase');
    });
  });

  describe('Sentence-level exploration', () => {
    it('loads the sentence and its reference English', () => {
      const sentenceLookup: SentenceLookup = {
        kind: 'sentence',
        surface: 'Ci siamo visti ieri.',
        english: 'We saw each other yesterday.',
        sentenceText: 'Ci siamo visti ieri.',
        sentenceId: 's1',
        chapterId: 'ch1',
        chapterNumber: 1,
        encounterCount: 0,
      };

      const payload = resolveDictionaryExplorerPayload(sentenceLookup, sampleSentence);

      expect(payload.text).toBe('Ci siamo visti ieri.');
      expect(payload.selectedText).toBeUndefined();
      expect(payload.contextSentence).toBe('Ci siamo visti ieri.');
      expect(payload.referenceEnglish).toBe('We saw each other yesterday.');
      expect(payload.source).toBe('sentence');
    });
  });

  describe('Header resolution priority', () => {
    const activeSentence: Sentence = {
      id: 's2',
      text: 'Luca cammina verso casa.',
      english: 'Luca walks towards home.',
      tokens: [],
    };

    it('prioritizes highlighted sentence when present', () => {
      const payload = resolveHeaderExplorerPayload({
        highlightedSentence: sampleSentence,
        activeSentence,
      });

      expect(payload.text).toBe('Ci siamo visti ieri.');
      expect(payload.contextSentence).toBe('Ci siamo visti ieri.');
      expect(payload.referenceEnglish).toBe('We saw each other yesterday.');
      expect(payload.source).toBe('reader_header');
    });

    it('uses active sentence when highlighted sentence is absent', () => {
      const payload = resolveHeaderExplorerPayload({
        highlightedSentence: null,
        activeSentence,
      });

      expect(payload.text).toBe('Luca cammina verso casa.');
      expect(payload.contextSentence).toBe('Luca cammina verso casa.');
      expect(payload.referenceEnglish).toBe('Luca walks towards home.');
      expect(payload.source).toBe('reader_header');
    });

    it('falls back to empty custom state when neither is available', () => {
      const payload = resolveHeaderExplorerPayload({
        highlightedSentence: null,
        activeSentence: null,
      });

      expect(payload.text).toBe('');
      expect(payload.contextSentence).toBeUndefined();
      expect(payload.referenceEnglish).toBeUndefined();
      expect(payload.selectedText).toBeUndefined();
      expect(payload.source).toBe('reader_header');
    });
  });

  describe('resolveInitialEditorText', () => {
    it('returns reference English when direction is en_to_it', () => {
      const payload = resolveHeaderExplorerPayload({
        highlightedSentence: sampleSentence,
      });
      const text = resolveInitialEditorText(payload, 'en_to_it');
      expect(text).toBe('We saw each other yesterday.');
    });

    it('returns Italian text when direction is it_to_en', () => {
      const payload = resolveHeaderExplorerPayload({
        highlightedSentence: sampleSentence,
      });
      const text = resolveInitialEditorText(payload, 'it_to_en');
      expect(text).toBe('Ci siamo visti ieri.');
    });

    it('returns empty string if payload is null or fields are absent', () => {
      expect(resolveInitialEditorText(null, 'en_to_it')).toBe('');
      expect(
        resolveInitialEditorText(
          { text: '', source: 'reader_header' },
          'en_to_it',
        ),
      ).toBe('');
    });
  });
});

