export type WordGrammar = {
  partOfSpeech?: string;
  gender?: 'masculine' | 'feminine' | string;
  number?: 'singular' | 'plural' | string;
  grammarTag?: string;
};

const ARTICLES_MASC_SG = new Set(['il', 'lo', 'l', "l'", 'un', 'uno']);
const ARTICLES_FEM_SG = new Set(['la', 'una', "un'"]);
const ARTICLES_MASC_PL = new Set(['i', 'gli', 'dei', 'degli']);
const ARTICLES_FEM_PL = new Set(['le', 'delle']);

/**
 * Derives grammatical details (part of speech, masculine/feminine, singular/plural)
 * for an Italian word from its lexicon entry, lemma, and surface form.
 */
export function resolveWordGrammar(
  surface: string,
  lemmaId: string,
  entry?: {
    partOfSpeech?: string;
    gender?: string;
    inflections?: string[];
  },
): WordGrammar {
  const normSurface = surface.toLowerCase().trim().replace(/[’']/g, '');
  const normLemma = lemmaId.toLowerCase().trim();
  const rawPos = entry?.partOfSpeech?.toLowerCase() || '';

  let pos = rawPos;
  let gender = entry?.gender?.toLowerCase();
  let number: 'singular' | 'plural' | undefined;

  // 1. Articles / Determiners
  if (ARTICLES_MASC_SG.has(normSurface)) {
    return { partOfSpeech: 'Article', gender: 'masculine', number: 'singular', grammarTag: 'Article · Masc. sing.' };
  }
  if (ARTICLES_FEM_SG.has(normSurface)) {
    return { partOfSpeech: 'Article', gender: 'feminine', number: 'singular', grammarTag: 'Article · Fem. sing.' };
  }
  if (ARTICLES_MASC_PL.has(normSurface)) {
    return { partOfSpeech: 'Article', gender: 'masculine', number: 'plural', grammarTag: 'Article · Masc. plur.' };
  }
  if (ARTICLES_FEM_PL.has(normSurface)) {
    return { partOfSpeech: 'Article', gender: 'feminine', number: 'plural', grammarTag: 'Article · Fem. plur.' };
  }

  // 2. Pronouns
  if (pos === 'pronoun') {
    if (['lui', 'egli', 'esso', 'lo', 'gli'].includes(normSurface)) {
      gender = 'masculine';
      number = 'singular';
    } else if (['lei', 'ella', 'essa', 'la', 'le'].includes(normSurface)) {
      gender = 'feminine';
      number = 'singular';
    } else if (['loro', 'essi', 'li'].includes(normSurface)) {
      gender = 'masculine';
      number = 'plural';
    } else if (['esse', 'le'].includes(normSurface)) {
      gender = 'feminine';
      number = 'plural';
    }
  }

  // 3. Verbs
  if (pos === 'verb') {
    return {
      partOfSpeech: 'Verb',
      grammarTag: 'Verb',
    };
  }

  // 4. Prepositions / Adverbs / Conjunctions
  if (pos === 'preposition' || pos === 'adverb' || pos === 'conjunction') {
    const formattedPos = pos.charAt(0).toUpperCase() + pos.slice(1);
    return {
      partOfSpeech: formattedPos,
      grammarTag: formattedPos,
    };
  }

  // 5. Nouns and Adjectives: deduce gender and number from endings & lexicon entry
  if (pos === 'noun' || pos === 'adjective' || !pos) {
    if (!gender) {
      if (normSurface.endsWith('o')) {
        gender = 'masculine';
        number = 'singular';
      } else if (normSurface.endsWith('a')) {
        gender = 'feminine';
        number = 'singular';
      } else if (normSurface.endsWith('i')) {
        gender = 'masculine';
        number = 'plural';
      } else if (normSurface.endsWith('e')) {
        // e can be masc or fem sg (or fem pl from -a)
        if (normLemma.endsWith('a') && normSurface.endsWith('e')) {
          gender = 'feminine';
          number = 'plural';
        } else {
          number = 'singular';
        }
      }
    } else {
      // Gender is known from entry
      if (gender === 'masculine') {
        if (normSurface.endsWith('i')) {
          number = 'plural';
        } else {
          number = 'singular';
        }
      } else if (gender === 'feminine') {
        if (normLemma.endsWith('e') && normSurface.endsWith('e')) {
          number = 'singular';
        } else if (normSurface.endsWith('e') || normSurface.endsWith('i')) {
          number = 'plural';
        } else {
          number = 'singular';
        }
      }
    }
  }

  const posDisplay = pos ? pos.charAt(0).toUpperCase() + pos.slice(1) : undefined;
  const parts: string[] = [];
  if (posDisplay) parts.push(posDisplay);

  const traits: string[] = [];
  if (gender) {
    traits.push(gender === 'masculine' ? 'masculine' : gender === 'feminine' ? 'feminine' : gender);
  }
  if (number) {
    traits.push(number);
  }

  let grammarTag: string | undefined;
  if (traits.length > 0) {
    const traitStr = traits.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(', ');
    grammarTag = posDisplay ? `${posDisplay} · ${traitStr}` : traitStr;
  } else if (posDisplay) {
    grammarTag = posDisplay;
  }

  return {
    partOfSpeech: posDisplay,
    gender,
    number,
    grammarTag,
  };
}
