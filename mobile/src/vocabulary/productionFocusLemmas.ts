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
  'davide',
  'chiara',
  'marta',
  'paolo',
  'lidia',
  'elisa',
]);

export const COPULA_AUXILIARY_LEMMAS = new Set(['essere', 'stare', 'avere']);

/**
 * Resolve which lemma ids a production self-assessment should affect.
 * Follows content-bearing focus hierarchy:
 * Meaningful chunk / phrase > content verb > noun > adjective > adverb > copula/auxiliary.
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
    // If fromFocus contains non-auxiliary content lemmas, prioritize them
    const contentFromFocus = fromFocus.filter((id) => !COPULA_AUXILIARY_LEMMAS.has(id));
    if (contentFromFocus.length > 0) return [...new Set(contentFromFocus)];
    if (fromFocus.length > 0) {
      // Check if there are content candidates in the sentence before settling on auxiliary
      const sentenceContentCandidates = [...sentenceLemmaIds].filter(
        (lemmaId) => isMeaningfulContentLemma(lemmaId, lexiconById),
      );
      if (sentenceContentCandidates.length === 0) {
        return [...new Set(fromFocus)];
      }
    }
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

function isMeaningfulContentLemma(lemmaId: string, lexiconById: Map<string, LexiconEntry>): boolean {
  if (!isMeaningfulLemma(lemmaId, lexiconById)) return false;
  if (COPULA_AUXILIARY_LEMMAS.has(lemmaId)) return false;
  return true;
}

/**
 * Content-bearing focus hierarchy:
 * Phrase (5) > Content verb (4) > Noun (3) > Adjective (2) > Adverb (2) > Auxiliary/copula (0)
 */
function openClassRank(lemmaId: string, lexiconById: Map<string, LexiconEntry>): number {
  if (COPULA_AUXILIARY_LEMMAS.has(lemmaId)) return 0;
  const entry = lexiconById.get(lemmaId);
  const pos = entry?.partOfSpeech ?? '';
  if (pos === 'phrase') return 5;
  if (pos === 'verb') return 4;
  if (pos === 'noun') return 3;
  if (pos === 'adjective') return 2;
  if (pos === 'adverb') return 2;
  if (entry?.frequency === 'high') return 1;
  return 0;
}

