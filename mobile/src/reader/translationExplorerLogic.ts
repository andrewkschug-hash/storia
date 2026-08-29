import type { Sentence } from '@/src/content/schemas';
import type { DictionaryLookup } from '@/src/vocabulary/types';
import type {
  ExploreTranslationPayload,
  ExploreTranslationSource,
} from './translationExplorerTypes';

export interface HeaderPayloadResolutionOptions {
  highlightedSentence?: Sentence | null;
  activeSentence?: Sentence | null;
}

/**
 * Resolves the prefilled Translation Explorer payload when opened from the Reader header.
 *
 * Strict Priority:
 * 1. Highlighted sentence
 * 2. Active sentence
 * 3. Empty custom state
 */
export function resolveHeaderExplorerPayload(
  options: HeaderPayloadResolutionOptions,
): ExploreTranslationPayload {
  const target = options.highlightedSentence ?? options.activeSentence;
  if (target && target.text.trim().length > 0) {
    return {
      text: target.text,
      source: 'reader_header',
      contextSentence: target.text,
      referenceEnglish: target.english ?? undefined,
      selectedText: undefined,
    };
  }

  return {
    text: '',
    source: 'reader_header',
    contextSentence: undefined,
    referenceEnglish: undefined,
    selectedText: undefined,
  };
}

/**
 * Resolves the Translation Explorer payload when opened from a Dictionary Lookup (word, phrase, or sentence).
 *
 * For words and phrases, preserves sentence-first immersion by loading the full sentence into the editor
 * and identifying the selected token/phrase for the exploration context.
 */
export function resolveDictionaryExplorerPayload(
  lookup: DictionaryLookup,
  sentence?: Sentence | null,
): ExploreTranslationPayload {
  const contextSentence = sentence?.text ?? lookup.sentenceText ?? (lookup.kind === 'sentence' ? lookup.surface : undefined);
  const referenceEnglish =
    sentence?.english ??
    (lookup.kind === 'phrase'
      ? lookup.naturalEnglish
      : lookup.kind === 'sentence'
        ? lookup.english
        : undefined);

  if (lookup.kind === 'word') {
    return {
      text: contextSentence && contextSentence.trim().length > 0 ? contextSentence : lookup.surface,
      source: 'word',
      contextSentence: contextSentence && contextSentence.trim().length > 0 ? contextSentence : undefined,
      referenceEnglish,
      selectedText: lookup.surface,
    };
  }

  if (lookup.kind === 'phrase') {
    return {
      text: contextSentence && contextSentence.trim().length > 0 ? contextSentence : lookup.surface,
      source: 'phrase',
      contextSentence: contextSentence && contextSentence.trim().length > 0 ? contextSentence : undefined,
      referenceEnglish,
      selectedText: lookup.surface,
    };
  }

  // Sentence lookup
  return {
    text: lookup.surface,
    source: 'sentence',
    contextSentence: lookup.surface,
    referenceEnglish: lookup.english,
    selectedText: undefined,
  };
}
