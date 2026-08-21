/**
 * Alternative-answer quality policy for production / speak overlays.
 * Used by audits and tests — does not change scoring by itself.
 */

export type AltVerdict =
  | 'VALID'
  | 'PERSON_MISMATCH'
  | 'TENSE_MISMATCH'
  | 'MEANING_DRIFT'
  | 'SCOPE_MISMATCH'
  | 'TYPO'
  | 'GENDER_ERROR'
  | 'OTHER';

export type AltAuditRow = {
  source: string;
  exerciseId: string;
  expectedIt: string;
  promptEn?: string;
  alternative: string;
  verdict: AltVerdict;
  reason: string;
};

const TYPO_PATTERNS: Array<{ re: RegExp; reason: string }> = [
  { re: /\be\s+alla\b/i, reason: 'missing accent: e for è' },
  { re: /\bc'e\b/i, reason: "missing accent: c'e for c'è" },
  { re: /\bdov'e\b/i, reason: "missing accent: dov'e for dov'è" },
  { re: /\bpuo\b/i, reason: 'missing accent: puo for può' },
  { re: /\blunedi\b/i, reason: 'missing accent: lunedi for lunedì' },
];

const PERSON_1SG = /\b(mi |ho |sono |vado |voglio |devo |posso |prendo |cerco |arrivo |alzo |piace)\b/i;
const PERSON_3SG_STORY = /\b(luca |sofia |marco |davide |elisa |marta )\b/i;
const PERSON_3SG_VERB = /\b(si alza|prende |ha |è |va |vuole |deve |può |arriva )\b/i;
const PERSON_1PL = /\b(andiamo|siamo|dobbiamo|vogliamo|possiamo)\b/i;
const PERSON_2PL = /\b(andate|siete|dovete|volete|potete)\b/i;

export function classifyAlternative(input: {
  expectedIt: string;
  alternative: string;
  promptEn?: string;
}): { verdict: AltVerdict; reason: string } {
  const expected = input.expectedIt.trim();
  const alt = input.alternative.trim();
  const prompt = (input.promptEn ?? '').trim();

  if (!alt) return { verdict: 'OTHER', reason: 'empty alternative' };
  if (alt.toLocaleLowerCase('it') === expected.toLocaleLowerCase('it')) {
    return { verdict: 'VALID', reason: 'identical to expected' };
  }

  for (const row of TYPO_PATTERNS) {
    if (row.re.test(alt) && !row.re.test(expected)) {
      return { verdict: 'TYPO', reason: row.reason };
    }
  }

  // Gender: male name + feminine past participle.
  if (/\bluca\b/i.test(expected + ' ' + prompt) && /\barrivata\b/i.test(alt) && /\barrivato\b/i.test(expected)) {
    return { verdict: 'GENDER_ERROR', reason: 'feminine participle with male subject Luca' };
  }

  // 1sg expected / I-prompt vs 3sg story narration alt.
  const promptIs1sg = /\bi\b|i'm|i’m|my\b/i.test(prompt);
  const expectedIs1sg = PERSON_1SG.test(expected) || /^(mi |ho |sono )/i.test(expected);
  if ((promptIs1sg || expectedIs1sg) && PERSON_3SG_STORY.test(alt) && PERSON_3SG_VERB.test(alt)) {
    return { verdict: 'PERSON_MISMATCH', reason: '1sg target with 3sg story alternative' };
  }

  // Imperative vs question mood.
  if (/!$/.test(expected.replace(/\.$/, '!')) || /^(aiutami|entra|ascolta|guarda)\b/i.test(expected)) {
    if (/\?$/.test(alt) || /^(mi aiuti|mi ascolti)\b/i.test(alt)) {
      return { verdict: 'TENSE_MISMATCH', reason: 'imperative vs interrogative' };
    }
  }

  // Andate (2pl) vs Andiamo (1pl).
  if (/\bandate\b/i.test(expected) && /\bandiamo\b/i.test(alt)) {
    return { verdict: 'PERSON_MISMATCH', reason: '2pl imperative vs 1pl' };
  }
  if (PERSON_2PL.test(expected) && PERSON_1PL.test(alt) && !PERSON_1PL.test(expected)) {
    return { verdict: 'PERSON_MISMATCH', reason: 'person/number swap' };
  }
  if (/\bè a casa\b/i.test(expected) && /\bsiamo a casa\b/i.test(alt)) {
    return { verdict: 'PERSON_MISMATCH', reason: '3sg vs 1pl' };
  }

  // Meaning drift pairs.
  if (/\btorna\b/i.test(expected) && /\bva\b/i.test(alt) && !/\btorna\b/i.test(alt)) {
    return { verdict: 'MEANING_DRIFT', reason: 'return vs go' };
  }
  if (/\bdeve\b/i.test(expected) && /\bvuole\b/i.test(alt)) {
    return { verdict: 'MEANING_DRIFT', reason: 'must vs want' };
  }
  if (/\bparte\b/i.test(expected) && /\bnon va\b/i.test(alt)) {
    return { verdict: 'MEANING_DRIFT', reason: 'leave vs go' };
  }
  if (/^come stai\b/i.test(expected) && /^come va\b/i.test(alt)) {
    return { verdict: 'MEANING_DRIFT', reason: 'different greeting formula' };
  }
  if (/^vorrei\b/i.test(expected) && (/^chiedo\b/i.test(alt) || /^pane e acqua/i.test(alt))) {
    return { verdict: 'MEANING_DRIFT', reason: 'conditional diluted to ask/fragment' };
  }

  // Scope: bare fragment much shorter than expected for a full clause.
  const expWords = expected.split(/\s+/).filter(Boolean).length;
  const altWords = alt.split(/\s+/).filter(Boolean).length;
  if (expWords >= 3 && altWords <= 2 && !/^io\s+/i.test(alt)) {
    return { verdict: 'SCOPE_MISMATCH', reason: 'fragment much shorter than expected clause' };
  }
  if (/\bvoglio comprare\b/i.test(expected) && /^voglio un\b/i.test(alt)) {
    return { verdict: 'SCOPE_MISMATCH', reason: 'drops taught verb comprare' };
  }
  if (/\bun mio amico\b/i.test(expected) && /\bun amico\b/i.test(alt) && !/\bmio\b/i.test(alt)) {
    return { verdict: 'SCOPE_MISMATCH', reason: 'drops required possessive' };
  }

  // Awkward vocative + conjugated form.
  if (/^elisa vieni\b/i.test(alt)) {
    return { verdict: 'OTHER', reason: 'awkward vocative + conjugated verb' };
  }

  return { verdict: 'VALID', reason: 'passes policy checks' };
}
