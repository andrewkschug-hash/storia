import type { ContentBundle, LexiconEntry, Phrase, Sentence } from '@/src/content/schemas';
import type { LexiconIndex, ResolvedPhrase } from '@/src/vocabulary/types';

export type { LexiconIndex, ResolvedPhrase };

export function buildLexiconIndex(lexicon: LexiconEntry[]): LexiconIndex {
  const byLemmaId = new Map<string, LexiconEntry>();
  const formToLemmaId = new Map<string, string>();

  for (const entry of lexicon) {
    byLemmaId.set(entry.lemmaId, entry);
    formToLemmaId.set(normalizeForm(entry.italian), entry.lemmaId);
    formToLemmaId.set(normalizeForm(entry.lemmaId), entry.lemmaId);
    for (const inflection of entry.inflections ?? []) {
      formToLemmaId.set(normalizeForm(inflection), entry.lemmaId);
    }
  }

  return { byLemmaId, formToLemmaId };
}

export function buildLexiconIndexFromBundle(bundle: ContentBundle): LexiconIndex {
  return buildLexiconIndex(bundle.lexicon);
}

export function phraseIdFromSurface(surface: string): string {
  return surface
    .normalize('NFC')
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '_')
    .replace(/^_+|_+$/g, '');
}

export function resolvePhrase(
  phrase: Phrase,
  sentence: Sentence,
): ResolvedPhrase {
  const lemmaIds = sentence.tokens
    .slice(phrase.tokenStart, phrase.tokenEnd + 1)
    .map((t) => t.lemmaId);
  return {
    ...phrase,
    phraseId: phraseIdFromSurface(phrase.surface),
    lemmaIds,
  };
}

export function findPhraseCoveringToken(
  sentence: Sentence,
  tokenIndex: number,
): ResolvedPhrase | null {
  const phrases = sentence.phrases ?? [];
  // Prefer the tightest (shortest) covering phrase
  let best: ResolvedPhrase | null = null;
  for (const phrase of phrases) {
    if (tokenIndex >= phrase.tokenStart && tokenIndex <= phrase.tokenEnd) {
      const resolved = resolvePhrase(phrase, sentence);
      const span = phrase.tokenEnd - phrase.tokenStart;
      if (!best || span < best.tokenEnd - best.tokenStart) {
        best = resolved;
      }
    }
  }
  return best;
}

export function normalizeForm(value: string): string {
  return value.normalize('NFC').toLowerCase().replace(/[’']/g, "'");
}

export function lookupLemmaId(
  index: LexiconIndex,
  lemmaIdOrForm: string,
): LexiconEntry | undefined {
  return (
    index.byLemmaId.get(lemmaIdOrForm) ??
    index.byLemmaId.get(index.formToLemmaId.get(normalizeForm(lemmaIdOrForm)) ?? '')
  );
}
