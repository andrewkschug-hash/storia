import type { LexiconEntry, Sentence, Token } from '@/src/content/schemas';

export type WordHintSegment = {
  text: string;
  hint: string | null;
  tappable: boolean;
};

const SKIP_POS = new Set(['article', 'preposition', 'conjunction', 'pronoun']);

function normalizeWord(value: string): string {
  return value.toLowerCase().replace(/[^a-z']/g, '');
}

function buildLemmaHintMap(
  sentence: Sentence,
  lexiconById: Map<string, LexiconEntry>,
): Map<string, string> {
  const hints = new Map<string, string>();
  for (const token of sentence.tokens ?? []) {
    const entry = lexiconById.get(token.lemmaId);
    if (!entry || SKIP_POS.has(entry.partOfSpeech)) continue;
    const englishWords = entry.english
      .toLowerCase()
      .split(/[^a-z']+/)
      .filter(Boolean);
    for (const word of englishWords) {
      if (!hints.has(word)) hints.set(word, token.surface);
    }
    hints.set(normalizeWord(entry.english), token.surface);
  }
  for (const phrase of sentence.phrases ?? []) {
    const phraseWords = phrase.naturalEn
      .toLowerCase()
      .split(/[^a-z']+/)
      .filter(Boolean);
    for (const word of phraseWords) {
      if (!hints.has(word)) hints.set(word, phrase.surface);
    }
  }
  return hints;
}

function hintForWord(word: string, hintMap: Map<string, string>): string | null {
  const normalized = normalizeWord(word);
  if (!normalized) return null;
  if (hintMap.has(normalized)) return hintMap.get(normalized) ?? null;
  for (const [key, italian] of hintMap) {
    if (key.includes(normalized) || normalized.includes(key)) return italian;
  }
  return null;
}

/** Split an English prompt into tappable word segments with Italian hints from the source sentence. */
export function buildWordHintSegments(
  promptEn: string,
  sourceSentence: Sentence | null | undefined,
  lexiconById: Map<string, LexiconEntry>,
): WordHintSegment[] {
  if (!sourceSentence?.tokens?.length) {
    return [{ text: promptEn, hint: null, tappable: false }];
  }
  const hintMap = buildLemmaHintMap(sourceSentence, lexiconById);
  const parts = promptEn.split(/(\s+|[.,!?;:"])/);
  return parts.map((part) => {
    const word = normalizeWord(part);
    if (!word) return { text: part, hint: null, tappable: false };
    const hint = hintForWord(part, hintMap);
    return { text: part, hint, tappable: hint !== null };
  });
}
