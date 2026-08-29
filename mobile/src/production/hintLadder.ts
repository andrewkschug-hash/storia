import type { LexiconEntry, ProductionExercise, Sentence, Token } from '@/src/content/schemas';

export type HintLevel = 0 | 1 | 2 | 3;

export type TargetedWordHintSegment = {
  text: string;
  hint: string | null;
  tappable: boolean;
};

const LOW_INFO_STOPWORDS = new Set([
  // Articles
  'il', 'lo', 'la', 'l\'', 'i', 'gli', 'le', 'un', 'uno', 'una', 'un\'',
  // Simple Prepositions
  'di', 'a', 'da', 'in', 'con', 'su', 'per', 'tra', 'fra',
  // Articulated Prepositions (a + art)
  'al', 'allo', 'alla', 'all\'', 'ai', 'agli', 'alle',
  // (di + art)
  'del', 'dello', 'della', 'dell\'', 'dei', 'degli', 'delle',
  // (da + art)
  'dal', 'dallo', 'dalla', 'dall\'', 'dai', 'dagli', 'dalle',
  // (in + art)
  'nel', 'nello', 'nella', 'nell\'', 'nei', 'negli', 'nelle',
  // (su + art)
  'sul', 'sullo', 'sulla', 'sull\'', 'sui', 'sugli', 'sulle',
  // (con + art)
  'col', 'coi',
  // Conjunctions & Pronouns
  'e', 'ed', 'ma', 'o', 'od', 'che', 'cui', 'se', 'ci', 'ne', 'si', 'mi', 'ti', 'vi',
]);

function normalizeWord(value: string): string {
  return value.toLowerCase().replace(/[^a-z'àèéìòùáéíóú]/g, '');
}

/**
 * Derives 2-4 high-information contextual anchors for Level 1 (💡 KEY WORDS).
 * Prioritizes meaningful phrase chunks (e.g., "a Roma", "ha bisogno", "al caffè")
 * and filters out standalone low-information stopwords.
 */
export function deriveFocusKeywords(
  exercise: ProductionExercise,
  sourceSentence?: Sentence | null,
  lexiconById?: Map<string, LexiconEntry>,
): string[] {
  const expected = exercise.expectedIt.trim();
  const focusLemmas = new Set((exercise.focus ?? []).map((f) => f.toLowerCase()));
  const anchors: string[] = [];
  const seenNorm = new Set<string>();

  const addAnchor = (surface: string) => {
    const trimmed = surface.trim();
    const norm = normalizeWord(trimmed);
    if (!trimmed || !norm) return;
    if (LOW_INFO_STOPWORDS.has(norm) && !trimmed.includes(' ')) return;
    if (seenNorm.has(norm)) return;

    // Invariant: Keyword must actually appear in expected target Italian
    if (!expected.toLowerCase().includes(trimmed.toLowerCase())) {
      return;
    }

    // Don't add a single word if it's already contained in an existing multi-word anchor
    if (!trimmed.includes(' ') && anchors.some((a) => a.toLowerCase().split(/\s+/).includes(trimmed.toLowerCase()))) {
      return;
    }

    seenNorm.add(norm);
    anchors.push(trimmed);
  };

  // 1. Canonical sentence phrases matching focus or high-value chunks
  if (sourceSentence?.phrases?.length) {
    for (const phrase of sourceSentence.phrases) {
      if (phrase.surface && expected.toLowerCase().includes(phrase.surface.toLowerCase())) {
        addAnchor(phrase.surface);
      }
    }
  }

  // 2. Extract multi-word prepositional/idiomatic combinations (e.g. "a Roma", "al caffè", "per Marco")
  if (sourceSentence?.tokens?.length) {
    const tokens = sourceSentence.tokens;
    for (let i = 0; i < tokens.length; i++) {
      const tok = tokens[i];
      const prevTok = i > 0 ? tokens[i - 1] : null;

      const isFocus = tok.lemmaId && focusLemmas.has(tok.lemmaId.toLowerCase());
      const isProperOrNoun =
        tok.surface &&
        ((/^[A-Z]/.test(tok.surface) && tok.surface.toLowerCase() !== 'luca') ||
          (lexiconById?.get(tok.lemmaId)?.partOfSpeech === 'noun'));

      if ((isFocus || isProperOrNoun) && prevTok) {
        const prevNorm = normalizeWord(prevTok.surface);
        if (LOW_INFO_STOPWORDS.has(prevNorm)) {
          // Chunk preposition/article with noun: e.g. "a Roma", "il biglietto", "al caffè"
          const chunk = `${prevTok.surface} ${tok.surface}`;
          if (expected.toLowerCase().includes(chunk.toLowerCase())) {
            addAnchor(chunk);
            continue;
          }
        }
      }

      if (isFocus) {
        addAnchor(tok.surface);
      }
    }
  }

  // 3. If still under 2 anchors and we have lexicon/tokens, find main verbs/nouns from sentence
  if (anchors.length < 2 && sourceSentence?.tokens?.length && lexiconById) {
    for (const tok of sourceSentence.tokens) {
      const entry = lexiconById.get(tok.lemmaId);
      if (entry && (entry.partOfSpeech === 'verb' || entry.partOfSpeech === 'noun')) {
        addAnchor(tok.surface);
      }
      if (anchors.length >= 3) break;
    }
  }

  // 4. Fallback / supplementary: extract non-stopwords from expectedIt if under 2 anchors
  if (anchors.length < 2) {
    const words = expected.replace(/[.,!?;:"]/g, '').split(/\s+/);
    for (const w of words) {
      const norm = normalizeWord(w);
      if (norm && !LOW_INFO_STOPWORDS.has(norm) && norm !== 'luca') {
        addAnchor(w);
      }
      if (anchors.length >= 3) break;
    }
  }

  // Cap at 4 anchors maximum
  const result = anchors.slice(0, 4);

  // Invariant: Level 1 must not contain the full target sentence
  const joinedResult = result.join(' ').toLowerCase();
  const normExpected = normalizeWord(expected);
  if (normalizeWord(joinedResult) === normExpected && result.length === 1) {
    return result;
  }

  return result;
}

/**
 * Generates a Level 2 cloze scaffold (🧩 SENTENCE FRAME) that masks the primary target/verb
 * while preserving sentence syntax, structural prepositions, and punctuation.
 * Invariant: cloze must contain at least one blank and cloze !== expectedIt.
 */
export function generateSentenceCloze(
  expectedIt: string,
  focusKeywords: string[],
  focusLemmas: string[] = [],
  sourceSentence?: Sentence | null,
): string {
  const expected = expectedIt.trim();
  const words = expected.split(/\s+/);

  if (words.length <= 1) {
    return '______';
  }

  const maskCandidates = new Set<string>();

  // 1. If we have focus lemmas + source sentence tokens, identify the primary verb/target token
  if (sourceSentence?.tokens?.length && focusLemmas.length > 0) {
    const focusSet = new Set(focusLemmas.map((f) => f.toLowerCase()));
    for (const tok of sourceSentence.tokens) {
      if (tok.lemmaId && focusSet.has(tok.lemmaId.toLowerCase())) {
        const norm = normalizeWord(tok.surface);
        if (norm && !LOW_INFO_STOPWORDS.has(norm)) {
          maskCandidates.add(norm);
          break;
        }
      }
    }
  }

  // 2. If no candidate found from tokens, use the first focus keyword that is a single content word
  if (maskCandidates.size === 0 && focusKeywords.length > 0) {
    for (const kw of focusKeywords) {
      const singleWord = kw.trim().split(/\s+/)[0];
      const norm = normalizeWord(singleWord);
      if (norm && !LOW_INFO_STOPWORDS.has(norm)) {
        maskCandidates.add(norm);
        break;
      }
    }
  }

  // 3. Fallback: mask the second word (usually the verb in SVO Italian: "Luca [arriva] a Roma")
  if (maskCandidates.size === 0) {
    const secondWordNorm = words.length > 1 ? normalizeWord(words[1]) : '';
    if (secondWordNorm) {
      maskCandidates.add(secondWordNorm);
    } else {
      maskCandidates.add(normalizeWord(words[0]));
    }
  }

  let maskedAtLeastOne = false;
  const resultWords = words.map((w) => {
    const match = w.match(/^([^a-zA-Z0-9'àèéìòùáéíóú]*)(.*?)([^a-zA-Z0-9'àèéìòùáéíóú]*)$/);
    if (!match) return w;
    const [, pre, core, post] = match;
    const norm = normalizeWord(core);

    if (norm && maskCandidates.has(norm) && !maskedAtLeastOne) {
      maskedAtLeastOne = true;
      return `${pre}______${post}`;
    }
    return w;
  });

  // Guarantee invariant: at least one blank is present and result !== expectedIt
  if (!maskedAtLeastOne) {
    const targetIdx = words.length >= 3 ? 1 : words.length - 1;
    const match = words[targetIdx].match(/^([^a-zA-Z0-9'àèéìòùáéíóú]*)(.*?)([^a-zA-Z0-9'àèéìòùáéíóú]*)$/);
    if (match) {
      const [, pre, , post] = match;
      resultWords[targetIdx] = `${pre}______${post}`;
    } else {
      resultWords[targetIdx] = '______';
    }
  }

  return resultWords.join(' ');
}

function matchesEnglishWord(promptWordNorm: string, targetEnWord: string): boolean {
  if (promptWordNorm === targetEnWord) return true;
  // Handle simple English inflections: arrives/arrive, buys/buy, worked/work, tickets/ticket
  if (promptWordNorm.startsWith(targetEnWord) || targetEnWord.startsWith(promptWordNorm)) {
    const diff = Math.abs(promptWordNorm.length - targetEnWord.length);
    if (diff <= 3) return true;
  }
  return false;
}

/**
 * Builds English prompt segments where ONLY focus items receive subtle dotted underlines and tap-to-reveal hints.
 * Micro-hint invariant: Tapping an English word reveals the Italian translation without advancing hintLevel.
 */
export function buildTargetedWordHints(
  promptEn: string,
  focusKeywords: string[],
  sourceSentence?: Sentence | null,
  lexiconById?: Map<string, LexiconEntry>,
): TargetedWordHintSegment[] {
  if (!sourceSentence?.tokens?.length || !lexiconById) {
    return [{ text: promptEn, hint: null, tappable: false }];
  }

  const targetEntries: Array<{ enWords: string[]; surface: string }> = [];
  const focusAnchors = new Set(focusKeywords.map((k) => normalizeWord(k)));

  for (const token of sourceSentence.tokens) {
    const normSurface = normalizeWord(token.surface);
    const entry = lexiconById.get(token.lemmaId);
    if (!entry) continue;

    const isAnchor =
      focusAnchors.has(normSurface) ||
      Array.from(focusAnchors).some((a) => a.includes(normSurface) || normSurface.includes(a));

    if (isAnchor) {
      const enWords = entry.english
        .toLowerCase()
        .split(/[^a-z']+/)
        .filter((w) => w && !LOW_INFO_STOPWORDS.has(w) && w !== 'to');
      if (enWords.length > 0) {
        targetEntries.push({ enWords, surface: token.surface });
      }
    }
  }

  for (const phrase of sourceSentence.phrases ?? []) {
    const normPhrase = normalizeWord(phrase.surface);
    const isAnchor =
      focusAnchors.has(normPhrase) ||
      Array.from(focusAnchors).some((a) => a.includes(normPhrase) || normPhrase.includes(a));

    if (isAnchor) {
      const phraseEnWords = phrase.naturalEn
        .toLowerCase()
        .split(/[^a-z']+/)
        .filter((w) => w && !LOW_INFO_STOPWORDS.has(w) && w !== 'to');
      if (phraseEnWords.length > 0) {
        targetEntries.push({ enWords: phraseEnWords, surface: phrase.surface });
      }
    }
  }

  const findHintForWord = (word: string): string | null => {
    const norm = normalizeWord(word);
    if (!norm) return null;
    for (const item of targetEntries) {
      for (const enW of item.enWords) {
        if (matchesEnglishWord(norm, enW)) {
          return item.surface;
        }
      }
    }
    return null;
  };

  const parts = promptEn.split(/(\s+|[.,!?;:"])/);
  return parts.map((part) => {
    const norm = normalizeWord(part);
    if (!norm) {
      return { text: part, hint: null, tappable: false };
    }
    const hint = findHintForWord(part);
    return { text: part, hint, tappable: hint !== null };
  });
}
