import type { LexiconEntry, ProductionExercise, Sentence } from '@/src/content/schemas';

const CLOSED_CLASS = new Set(['article', 'preposition', 'conjunction', 'pronoun']);

const NAME_LEMMAS = new Set([
  'luca',
  'sofia',
  'marco',
  'giulia',
  'nonna-rosa',
  'padrone',
  'narrator',
  'narratore',
  'roma',
]);

const OPEN_CLASS_PRIORITY = new Set(['verb', 'noun', 'adjective', 'adverb', 'phrase']);

/**
 * Resolve which lemma ids a production self-assessment should affect.
 * Prefer exercise.focus entries that match source-sentence lemma ids.
 * Fall back to meaningful open-class lemmas in the sentence.
 */
export function resolveProductionFocusLemmas(
  exercise: Pick<ProductionExercise, 'focus'>,
  source: Sentence,
  lexiconById: Map<string, LexiconEntry>,
  maxFallback = 4,
): string[] {
  const sentenceLemmaIds = new Set(source.tokens.map((token) => token.lemmaId));

  if (exercise.focus?.length) {
    const fromFocus = exercise.focus.filter((id) => sentenceLemmaIds.has(id));
    if (fromFocus.length > 0) return [...new Set(fromFocus)];
  }

  const candidates = [...sentenceLemmaIds].filter((lemmaId) => isMeaningfulLemma(lemmaId, lexiconById));
  candidates.sort(
    (a, b) => openClassRank(b, lexiconById) - openClassRank(a, lexiconById),
  );
  return candidates.slice(0, maxFallback);
}

/** Speak lines and other contexts without authored focus tags. */
export function resolveSentenceFocusLemmas(
  source: Sentence,
  lexiconById: Map<string, LexiconEntry>,
  maxFallback = 4,
): string[] {
  const candidates = [...new Set(source.tokens.map((token) => token.lemmaId))].filter((lemmaId) =>
    isMeaningfulLemma(lemmaId, lexiconById),
  );
  candidates.sort(
    (a, b) => openClassRank(b, lexiconById) - openClassRank(a, lexiconById),
  );
  return candidates.slice(0, maxFallback);
}

function isMeaningfulLemma(lemmaId: string, lexiconById: Map<string, LexiconEntry>): boolean {
  if (NAME_LEMMAS.has(lemmaId)) return false;
  const entry = lexiconById.get(lemmaId);
  const pos = entry?.partOfSpeech ?? '';
  if (CLOSED_CLASS.has(pos)) return false;
  return true;
}

function openClassRank(lemmaId: string, lexiconById: Map<string, LexiconEntry>): number {
  const entry = lexiconById.get(lemmaId);
  const pos = entry?.partOfSpeech ?? '';
  if (OPEN_CLASS_PRIORITY.has(pos)) return 2;
  if (entry?.frequency === 'high') return 1;
  return 0;
}
