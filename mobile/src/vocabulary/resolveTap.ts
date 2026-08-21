import type { LexiconEntry, Sentence } from '@/src/content/schemas';
import {
  findPhraseCoveringToken,
  lookupLemmaId,
  type LexiconIndex,
} from '@/src/vocabulary/dictionaryIndex';
import { formGlossFor } from '@/src/vocabulary/formGlosses';
import type {
  DictionaryLookup,
  PhraseLookup,
  SentenceLookup,
  TapContext,
  UserVocabularyState,
  WordLookup,
} from '@/src/vocabulary/types';

/**
 * Resolve a token tap into a word or phrase lookup.
 * Phrase metadata wins when the tapped token sits inside a known phrase.
 */
export function resolveTap(
  index: LexiconIndex,
  ctx: TapContext,
  vocab: UserVocabularyState,
): DictionaryLookup {
  const { sentence, tokenIndex, chapterId, chapterNumber } = ctx;
  const token = sentence.tokens[tokenIndex];
  if (!token) {
    return fallbackWord(ctx, '?', 'unknown', vocab);
  }

  const phrase = findPhraseCoveringToken(sentence, tokenIndex);
  if (phrase) {
    const encounter = vocab.phrases[phrase.phraseId];
    const result: PhraseLookup = {
      kind: 'phrase',
      phraseId: phrase.phraseId,
      surface: phrase.surface,
      naturalEnglish: phrase.naturalEn,
      literalEnglish: phrase.literalEn,
      sentenceText: sentence.text,
      sentenceId: sentence.id,
      chapterId,
      chapterNumber,
      tokenStart: phrase.tokenStart,
      tokenEnd: phrase.tokenEnd,
      lemmaIds: phrase.lemmaIds,
      encounterCount: encounter?.encounterCount ?? 0,
    };
    return result;
  }

  const entry = lookupLemmaId(index, token.lemmaId);
  return wordFromToken(ctx, token.surface, token.lemmaId, entry, vocab);
}

export function resolveSentenceLookup(
  sentence: Sentence,
  chapterId: string,
  chapterNumber: number,
): SentenceLookup {
  return {
    kind: 'sentence',
    surface: sentence.text,
    english: sentence.english ?? 'Translation unavailable',
    sentenceText: sentence.text,
    sentenceId: sentence.id,
    chapterId,
    chapterNumber,
    encounterCount: 0,
  };
}

export function resolveLemmaForm(
  index: LexiconIndex,
  surface: string,
  lemmaId: string,
  sentenceText: string,
  sentenceId: string,
  chapterId: string,
  chapterNumber: number,
  vocab: UserVocabularyState,
): WordLookup {
  const entry = lookupLemmaId(index, lemmaId);
  return {
    kind: 'word',
    surface,
    lemmaId,
    lemmaItalian: entry?.italian ?? lemmaId,
    english: displayEnglishForForm(surface, lemmaId, entry),
    partOfSpeech: entry?.partOfSpeech,
    sentenceText,
    sentenceId,
    chapterId,
    chapterNumber,
    tokenIndex: -1,
    encounterCount: vocab.lemmas[lemmaId]?.encounterCount ?? 0,
  };
}

/** Prefer form-level gloss when available; keep lemma english as fallback. */
export function displayEnglishForForm(
  surface: string,
  lemmaId: string,
  entry: LexiconEntry | undefined,
): string {
  const formGloss = formGlossFor(lemmaId, surface);
  if (formGloss) return formGloss;
  return entry?.english ?? 'Meaning unavailable';
}

function wordFromToken(
  ctx: TapContext,
  surface: string,
  lemmaId: string,
  entry: LexiconEntry | undefined,
  vocab: UserVocabularyState,
): WordLookup {
  return {
    kind: 'word',
    surface,
    lemmaId,
    lemmaItalian: entry?.italian ?? lemmaId,
    english: displayEnglishForForm(surface, lemmaId, entry),
    partOfSpeech: entry?.partOfSpeech,
    sentenceText: ctx.sentence.text,
    sentenceId: ctx.sentence.id,
    chapterId: ctx.chapterId,
    chapterNumber: ctx.chapterNumber,
    tokenIndex: ctx.tokenIndex,
    encounterCount: vocab.lemmas[lemmaId]?.encounterCount ?? 0,
  };
}

function fallbackWord(
  ctx: TapContext,
  surface: string,
  lemmaId: string,
  vocab: UserVocabularyState,
): WordLookup {
  return wordFromToken(ctx, surface, lemmaId, undefined, vocab);
}
