/**
 * Deterministic text scorer for Luca production exercises.
 * No React, Expo, audio, microphone, or STT.
 *
 * Future STT should call: scoreProductionAnswer(exercise, transcript)
 */

import type {
  ProductionExercise,
  ProductionMatch,
  ProductionPerson,
  ProductionSemantic,
} from '@/src/content/schemas';
import { normalizeProductionText } from '@/src/production/normalize';

export type ProductionScoreStatus = 'correct' | 'almost' | 'incorrect' | 'unrecognized';

export type ProductionScoreReason =
  | 'exact_match'
  | 'acceptable_answer'
  | 'subject_drop'
  | 'gender_variant'
  | 'word_order_variant'
  | 'apostrophe_normalization'
  | 'semantic_match'
  | 'minor_morphology'
  | 'minor_recognition_like_difference'
  | 'minor_spelling'
  | 'wrong_person'
  | 'wrong_number'
  | 'wrong_gender'
  | 'wrong_tense'
  | 'wrong_polarity'
  | 'missing_required_content'
  | 'extra_required_content'
  | 'wrong_meaning'
  | 'empty_input'
  | 'unsupported_input';

export type ProductionScoreResult = {
  result: ProductionScoreStatus;
  reason: ProductionScoreReason;
  mode: ProductionMatch;
  /** Alias of result — kept so existing tests/callers can read either field. */
  status: ProductionScoreStatus;
  /** Best authorized Italian surface to show as the correction. */
  matchedIt?: string;
};

type FlexTag = 'subject_drop' | 'gender_variant' | 'word_order_variant' | 'apostrophe_normalization';

const SUBJECTS = new Set(['io', 'tu', 'lui', 'lei', 'noi', 'voi', 'loro']);

const PERSON_PRONOUN: Partial<Record<ProductionPerson, string>> = {
  '1sg': 'io',
  '2sg': 'tu',
  '3sg': 'lui',
  '1pl': 'noi',
  '2pl': 'voi',
  '3pl': 'loro',
};

const VERB_PERSON: Record<string, ProductionPerson> = {
  sono: '1sg',
  ho: '1sg',
  sto: '1sg',
  voglio: '1sg',
  vorrei: '1sg',
  cerco: '1sg',
  lavoro: '1sg',
  arrivo: '1sg',
  cammino: '1sg',
  guardo: '1sg',
  prendo: '1sg',
  posso: '1sg',
  devo: '1sg',
  vengo: '1sg',
  resto: '1sg',
  penso: '1sg',
  chiedo: '1sg',
  preparo: '1sg',
  torno: '1sg',
  vado: '1sg',
  sveglio: '1sg',
  organizzo: '1sg',
  accetto: '1sg',
  vendo: '1sg',
  parto: '1sg',
  alzo: '1sg',
  compro: '1sg',
  parlo: '1sg',
  trovo: '1sg',
  faccio: '1sg',
  so: '1sg',
  aiuto: '1sg',
  sei: '2sg',
  hai: '2sg',
  stai: '2sg',
  vuoi: '2sg',
  vieni: '2sg',
  cerchi: '2sg',
  lavori: '2sg',
  devi: '2sg',
  aspetti: '2sg',
  fai: '2sg',
  vai: '2sg',
  siamo: '1pl',
  abbiamo: '1pl',
  andiamo: '1pl',
  lavoriamo: '1pl',
  possiamo: '1pl',
  prendiamo: '1pl',
  viaggiamo: '1pl',
  facciamo: '1pl',
  dobbiamo: '1pl',
  proviamo: '1pl',
  parliamo: '1pl',
  aspettiamo: '1pl',
  sappiamo: '1pl',
  vediamo: '1pl',
  avete: '2pl',
  siete: '2pl',
  è: '3sg',
  ha: '3sg',
  va: '3sg',
  parte: '3sg',
  serve: '3sg',
  chiude: '3sg',
  viene: '3sg',
  torna: '3sg',
  deve: '3sg',
  vuole: '3sg',
  compra: '3sg',
  costa: '3sg',
  dipende: '3sg',
  piace: '3sg',
  vengono: '3pl',
  chiudono: '3pl',
  servono: '3pl',
};

const IMPERATIVE_OR_FORMULA =
  /^(aiutami|aspetta|scusa|scusi|entrate|tornate|buongiorno|grazie|va bene|ecco|ciao|perché no|ok)\b/;

const GENDER_PAIRS: Array<[string, string]> = [
  ['andato', 'andata'],
  ['arrivato', 'arrivata'],
  ['tornato', 'tornata'],
  ['nuovo', 'nuova'],
  ['pronto', 'pronta'],
  ['pronti', 'pronte'],
  ['sicuro', 'sicura'],
  ['sicuri', 'sicure'],
];

const TIME_TWO = /^(ogni mattina|la sera|domani mattina) (.+)$/;
const TIME_ONE_START = /^(ieri|oggi|domani|adesso|ora|sabato) (.+)$/;
const TIME_ONE_END = /^(.+) (ieri|oggi|domani|adesso|ora|sabato)$/;
const TIME_TWO_END = /^(.+) (ogni mattina|la sera|domani mattina)$/;

const PP_AUX = /\b(sono|sei|è|siamo|siete|ho|hai|ha|abbiamo|avete|hanno)\b/;
const PP_PARTICIPLE = /\b\w+(ato|ata|ati|ate|uto|uta|uti|ute|ito|ita|iti|ite)\b/;
const IMPERFECT =
  /\b(\w+(avo|avi|ava|avamo|avate|avano|evo|evi|eva|evamo|evate|evano|ivo|ivi|iva|ivamo|ivate|ivano)|c'era|c'erano|ero|eri|era|eravamo|eravate|erano)\b/;
const ITALIAN_LETTER = /[a-zàèéìòù]/i;
const DIACRITIC_MARKS = /[\u0300-\u036f]/g;

export function scoreProductionAnswer(
  exercise: ProductionExercise,
  learnerText: string,
): ProductionScoreResult {
  const mode = exercise.match;
  const normalized = normalizeProductionText(learnerText);
  if (!normalized) {
    return scored('unrecognized', 'empty_input', mode);
  }
  if (!ITALIAN_LETTER.test(normalized)) {
    return scored('unrecognized', 'unsupported_input', mode);
  }

  if (mode === 'exact') return scoreExact(exercise, learnerText, normalized);
  if (mode === 'flexible') return scoreFlexible(exercise, learnerText, normalized);
  return scoreSemantic(exercise, normalized);
}

function scored(
  result: ProductionScoreStatus,
  reason: ProductionScoreReason,
  mode: ProductionMatch,
  matchedIt?: string,
): ProductionScoreResult {
  return { result, reason, mode, status: result, matchedIt };
}

function scoreExact(
  exercise: ProductionExercise,
  learnerText: string,
  normalized: string,
): ProductionScoreResult {
  const expected = normalizeProductionText(exercise.expectedIt);
  if (normalized === expected) {
    return scored(
      'correct',
      apostropheReason(learnerText, exercise.expectedIt) ?? 'exact_match',
      'exact',
      exercise.expectedIt,
    );
  }
  for (const alt of exercise.acceptableAnswers ?? []) {
    if (normalized === normalizeProductionText(alt)) {
      return scored(
        'correct',
        apostropheReason(learnerText, alt) ?? 'acceptable_answer',
        'exact',
        alt,
      );
    }
  }
  const almost = almostAgainstAuthorized(exercise, normalized);
  if (almost) return scored('almost', almost.reason, 'exact', almost.matchedIt);
  return scored('incorrect', diagnoseIncorrect(exercise, normalized), 'exact', exercise.expectedIt);
}

function scoreFlexible(
  exercise: ProductionExercise,
  learnerText: string,
  normalized: string,
): ProductionScoreResult {
  const hit = classifyFlexibleHit(exercise, normalized);
  if (hit) {
    const apostrophe = apostropheReason(learnerText, exercise.expectedIt);
    if (hit === 'exact_match' && apostrophe) {
      return scored('correct', apostrophe, 'flexible', exercise.expectedIt);
    }
    return scored('correct', hit, 'flexible', exercise.expectedIt);
  }
  const almost = almostAgainstAuthorized(exercise, normalized);
  if (almost) return scored('almost', almost.reason, 'flexible', almost.matchedIt);
  return scored('incorrect', diagnoseIncorrect(exercise, normalized), 'flexible', exercise.expectedIt);
}

function scoreSemantic(exercise: ProductionExercise, normalized: string): ProductionScoreResult {
  const hit = classifyFlexibleHit(exercise, normalized);
  if (hit) {
    if (hit === 'exact_match' || hit === 'acceptable_answer') {
      return scored('correct', hit, 'semantic', exercise.expectedIt);
    }
    return scored('correct', hit === 'subject_drop' ? hit : 'semantic_match', 'semantic', exercise.expectedIt);
  }

  const almost = almostAgainstAuthorized(exercise, normalized);
  if (almost) return scored('almost', almost.reason, 'semantic', almost.matchedIt);

  const semantic = exercise.semantic;
  if (!semantic) {
    return scored('unrecognized', 'unsupported_input', 'semantic', exercise.expectedIt);
  }

  const missingConcept = missingRequiredConcept(normalized, semantic);
  if (missingConcept) {
    return scored('incorrect', 'missing_required_content', 'semantic', exercise.expectedIt);
  }

  if (semantic.requiredTense && !tenseMatches(normalized, semantic.requiredTense)) {
    return scored('incorrect', 'wrong_tense', 'semantic', exercise.expectedIt);
  }

  if (semantic.requiredPerson && !personConstraintMatches(normalized, semantic.requiredPerson)) {
    return scored('incorrect', 'wrong_person', 'semantic', exercise.expectedIt);
  }

  if (semantic.requiredPolarity === 'negative' && !/\bnon\b/.test(normalized)) {
    return scored('incorrect', 'wrong_polarity', 'semantic', exercise.expectedIt);
  }
  if (semantic.requiredPolarity === 'affirmative' && polarityFlippedAffirmative(normalized, semantic)) {
    return scored('incorrect', 'wrong_polarity', 'semantic', exercise.expectedIt);
  }

  const relationFail = failedRelation(normalized, semantic);
  if (relationFail === 'wrong_polarity' || relationFail === 'missing_required_content') {
    return scored('incorrect', relationFail, 'semantic', exercise.expectedIt);
  }
  if (relationFail) {
    return scored('incorrect', 'wrong_meaning', 'semantic', exercise.expectedIt);
  }

  return scored('correct', 'semantic_match', 'semantic', exercise.expectedIt);
}

function apostropheReason(learnerText: string, authored: string): ProductionScoreReason | null {
  const learnerFull = normalizeProductionText(learnerText);
  const authoredFull = normalizeProductionText(authored);
  if (learnerFull !== authoredFull) return null;
  const learnerRaw = normalizeProductionText(learnerText, { restoreApostropheE: false });
  const authoredRaw = normalizeProductionText(authored, { restoreApostropheE: false });
  if (learnerRaw !== authoredRaw) return 'apostrophe_normalization';
  if (/[\u2018\u2019\u201B\u0060\u00B4]/.test(learnerText)) return 'apostrophe_normalization';
  return null;
}

function classifyFlexibleHit(
  exercise: ProductionExercise,
  normalized: string,
): ProductionScoreReason | null {
  const genderAllowed = promptLeavesGenderOpen(exercise.promptEn);
  const expected = normalizeProductionText(exercise.expectedIt);
  const expectedMap = expandFlexibleTagged(expected, genderAllowed);
  const expectedTags = expectedMap.get(normalized);
  if (expectedTags) return reasonFromTags(expectedTags, 'expected');

  for (const alt of exercise.acceptableAnswers ?? []) {
    const altNorm = normalizeProductionText(alt);
    const altMap = expandFlexibleTagged(altNorm, genderAllowed);
    const altTags = altMap.get(normalized);
    if (altTags) return reasonFromTags(altTags, 'acceptable');
  }
  return null;
}

function reasonFromTags(tags: Set<FlexTag>, source: 'expected' | 'acceptable'): ProductionScoreReason {
  if (tags.size === 0) return source === 'expected' ? 'exact_match' : 'acceptable_answer';
  if (tags.has('gender_variant') && tags.size === 1) return 'gender_variant';
  if (tags.has('word_order_variant') && tags.size === 1) return 'word_order_variant';
  if (tags.has('subject_drop') && tags.size === 1) return 'subject_drop';
  if (tags.has('apostrophe_normalization') && tags.size === 1) return 'apostrophe_normalization';
  if (tags.has('gender_variant')) return 'gender_variant';
  if (tags.has('word_order_variant')) return 'word_order_variant';
  if (tags.has('subject_drop')) return 'subject_drop';
  return 'apostrophe_normalization';
}

function authorizedNormalized(exercise: ProductionExercise): string[] {
  return [exercise.expectedIt, ...(exercise.acceptableAnswers ?? [])]
    .map((answer) => normalizeProductionText(answer))
    .filter(Boolean);
}

function expandFlexibleTagged(normalized: string, genderAllowed: boolean): Map<string, Set<FlexTag>> {
  const seen = new Map<string, Set<FlexTag>>();
  const queue: Array<{ text: string; tags: Set<FlexTag> }> = [{ text: normalized, tags: new Set() }];
  seen.set(normalized, new Set());

  const offer = (value: string, tags: Set<FlexTag>, extra: FlexTag) => {
    const next = normalizeProductionText(value);
    if (!next) return;
    const nextTags = new Set(tags);
    nextTags.add(extra);
    const prev = seen.get(next);
    if (!prev) {
      seen.set(next, nextTags);
      queue.push({ text: next, tags: nextTags });
      return;
    }
    if (nextTags.size < prev.size) seen.set(next, nextTags);
  };

  while (queue.length) {
    const current = queue.shift()!;
    const dropped = dropSubject(current.text);
    if (dropped !== current.text) offer(dropped, current.tags, 'subject_drop');
    const person = inferPerson(current.text);
    if (
      person &&
      PERSON_PRONOUN[person] &&
      !IMPERATIVE_OR_FORMULA.test(current.text) &&
      !current.text.startsWith('mi piace')
    ) {
      const withSubject = `${PERSON_PRONOUN[person]} ${dropSubject(current.text)}`;
      if (normalizeProductionText(withSubject) !== current.text) {
        offer(withSubject, current.tags, 'subject_drop');
      }
    }
    for (const moved of moveTimeAdverb(current.text)) offer(moved, current.tags, 'word_order_variant');
    for (const dove of doveEVariants(current.text)) offer(dove, current.tags, 'apostrophe_normalization');
    if (genderAllowed) {
      for (const gendered of genderVariants(current.text)) offer(gendered, current.tags, 'gender_variant');
    }
  }

  return seen;
}

function almostAgainstAuthorized(
  exercise: ProductionExercise,
  learner: string,
): { reason: ProductionScoreReason; matchedIt: string } | null {
  const genderAllowed = promptLeavesGenderOpen(exercise.promptEn);
  const authorized = new Set<string>();
  const surfaceByNormalized = new Map<string, string>();
  for (const surface of [exercise.expectedIt, ...(exercise.acceptableAnswers ?? [])]) {
    const base = normalizeProductionText(surface);
    if (!base) continue;
    for (const variant of expandFlexibleTagged(base, genderAllowed).keys()) {
      authorized.add(variant);
      if (!surfaceByNormalized.has(variant)) surfaceByNormalized.set(variant, surface);
    }
  }

  const matchedSurface = (normalizedAuth: string) =>
    surfaceByNormalized.get(normalizedAuth) ?? exercise.expectedIt;

  if (!genderAllowed) {
    for (const base of authorizedNormalized(exercise)) {
      for (const gendered of genderVariants(base)) {
        if (gendered === learner) {
          return { reason: 'minor_morphology', matchedIt: matchedSurface(base) };
        }
      }
    }
  }

  if (accentOnlyDifference(learner, authorized)) {
    const auth = [...authorized].find((candidate) => accentOnlyAgainst(learner, candidate));
    return {
      reason: 'minor_recognition_like_difference',
      matchedIt: auth ? matchedSurface(auth) : exercise.expectedIt,
    };
  }

  const spelling = spellingAlmost(learner, authorized);
  if (spelling) {
    const structural = diagnoseIncorrect(exercise, learner);
    if (
      structural === 'wrong_person' ||
      structural === 'wrong_number' ||
      structural === 'wrong_tense' ||
      structural === 'wrong_polarity' ||
      structural === 'wrong_gender'
    ) {
      return null;
    }
    return { reason: 'minor_spelling', matchedIt: matchedSurface(spelling) };
  }

  return null;
}

function accentOnlyAgainst(learner: string, auth: string): boolean {
  return accentOnlyDifference(learner, [auth]);
}

/** Small typo tolerance: same token count, most tokens exact, limited edits on the rest. */
function spellingAlmost(learner: string, authorized: Iterable<string>): string | null {
  const learnerTokens = learner.split(' ').filter(Boolean);
  if (learnerTokens.length === 0) return null;

  let best: { auth: string; distance: number } | null = null;
  for (const auth of authorized) {
    const authTokens = auth.split(' ').filter(Boolean);
    if (authTokens.length !== learnerTokens.length) continue;

    let changed = 0;
    let distance = 0;
    let ok = true;
    for (let i = 0; i < learnerTokens.length; i += 1) {
      const a = learnerTokens[i];
      const b = authTokens[i];
      if (a === b) continue;
      if (looksLikeConjugationOrMorphologySwap(a, b)) {
        ok = false;
        break;
      }
      changed += 1;
      const edits = tokenEditDistance(a, b);
      const allowed = maxTokenEdits(b.length);
      if (edits > allowed) {
        ok = false;
        break;
      }
      distance += edits;
    }
    if (!ok || changed === 0) continue;
    // Keep meaning close: at most half the tokens may differ, and never more than 2.
    if (changed > Math.min(2, Math.max(1, Math.floor(authTokens.length / 2)))) continue;
    if (!best || distance < best.distance) best = { auth, distance };
  }
  return best?.auth ?? null;
}

function maxTokenEdits(tokenLength: number): number {
  if (tokenLength <= 3) return 1;
  if (tokenLength <= 7) return 1;
  return 2;
}

/** Same stem + different ending → conjugation/morphology, not a typo. */
function looksLikeConjugationOrMorphologySwap(a: string, b: string): boolean {
  const fold = (value: string) => value.normalize('NFD').replace(DIACRITIC_MARKS, '');
  const left = fold(a);
  const right = fold(b);
  if (left === right || left.length < 2 || right.length < 2) return false;
  if (left.slice(0, -1) === right.slice(0, -1) && left.slice(-1) !== right.slice(-1)) {
    return true;
  }
  const minLen = Math.min(left.length, right.length);
  if (minLen >= 4) {
    let shared = 0;
    while (shared < minLen && left[shared] === right[shared]) shared += 1;
    if (shared >= 4 && shared < minLen && left.length !== right.length) return true;
  }
  return false;
}

function tokenEditDistance(a: string, b: string): number {
  if (a === b) return 0;
  const fold = (value: string) => value.normalize('NFD').replace(DIACRITIC_MARKS, '');
  const left = fold(a);
  const right = fold(b);
  if (left === right) return 0;
  return levenshtein(left, right);
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const rows = a.length + 1;
  const cols = b.length + 1;
  const prev = new Array<number>(cols);
  const curr = new Array<number>(cols);
  for (let j = 0; j < cols; j += 1) prev[j] = j;
  for (let i = 1; i < rows; i += 1) {
    curr[0] = i;
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j < cols; j += 1) prev[j] = curr[j];
  }
  return prev[b.length];
}

function accentOnlyDifference(learner: string, authorized: Iterable<string>): boolean {
  const fold = (token: string) => token.normalize('NFD').replace(DIACRITIC_MARKS, '');
  const learnerTokens = learner.split(' ');
  for (const auth of authorized) {
    const authTokens = auth.split(' ');
    if (learnerTokens.length !== authTokens.length) continue;
    let differs = false;
    let ok = true;
    for (let i = 0; i < learnerTokens.length; i += 1) {
      const a = learnerTokens[i];
      const b = authTokens[i];
      if (a === b) continue;
      if ((a === 'e' && b === 'è') || (a === 'è' && b === 'e')) {
        ok = false;
        break;
      }
      if (fold(a) !== fold(b)) {
        ok = false;
        break;
      }
      differs = true;
    }
    if (ok && differs) return true;
  }
  return false;
}

function diagnoseIncorrect(exercise: ProductionExercise, learner: string): ProductionScoreReason {
  const expected = normalizeProductionText(exercise.expectedIt);
  const learnerPerson = inferPerson(learner);
  const expectedPerson = inferPerson(expected);

  if (learnerPerson && expectedPerson && learnerPerson !== expectedPerson) {
    if (personFamily(learnerPerson) === personFamily(expectedPerson)) return 'wrong_number';
    return 'wrong_person';
  }

  const expectedNeg = /\bnon\b/.test(expected);
  const learnerNeg = /\bnon\b/.test(learner);
  if (expectedNeg !== learnerNeg) return 'wrong_polarity';

  if (looksPassatoProssimo(expected) && !looksPassatoProssimo(learner)) return 'wrong_tense';
  if (IMPERFECT.test(expected) && !IMPERFECT.test(learner) && !looksPassatoProssimo(expected)) {
    return 'wrong_tense';
  }
  if (!looksPassatoProssimo(expected) && !IMPERFECT.test(expected) && looksPassatoProssimo(learner)) {
    return 'wrong_tense';
  }

  if (!promptLeavesGenderOpen(exercise.promptEn)) {
    for (const gendered of genderVariants(expected)) {
      if (gendered === learner) return 'wrong_gender';
    }
  }

  const expectedTokens = expected.split(' ');
  const learnerTokens = learner.split(' ');
  if (expectedTokens.every((token) => learnerTokens.includes(token)) && learnerTokens.length > expectedTokens.length) {
    return 'extra_required_content';
  }
  const content = expectedTokens.filter(
    (token) => !SUBJECTS.has(token) && !['il', 'lo', 'la', 'i', 'gli', 'le', 'un', 'una', 'a', 'al', 'in'].includes(token),
  );
  if (content.some((token) => !learnerTokens.includes(token)) && learnerTokens.length < expectedTokens.length) {
    return 'missing_required_content';
  }

  return 'wrong_meaning';
}

function personFamily(person: ProductionPerson): '1' | '2' | '3' | 'imp' {
  if (person === 'impersonal') return 'imp';
  return person.slice(0, 1) as '1' | '2' | '3';
}

function looksPassatoProssimo(normalized: string): boolean {
  return PP_AUX.test(normalized) && PP_PARTICIPLE.test(normalized);
}

function dropSubject(normalized: string): string {
  const parts = normalized.split(' ');
  if (parts.length > 1 && SUBJECTS.has(parts[0])) return parts.slice(1).join(' ');
  return normalized;
}

function inferPerson(normalized: string): ProductionPerson | null {
  const parts = normalized.split(' ');
  if (parts[0] && SUBJECTS.has(parts[0])) {
    const mapped = Object.entries(PERSON_PRONOUN).find(([, pronoun]) => pronoun === parts[0]);
    return (mapped?.[0] as ProductionPerson | undefined) ?? null;
  }
  if (parts[0] === 'mi' && parts[1] === 'sveglio') return '1sg';
  if (parts[0] === 'si' && parts[1] === 'sveglia') return '3sg';
  if (parts[0] === 'mi' && parts[1] === 'alzo') return '1sg';
  if (parts[0] === 'si' && parts[1] === 'alza') return '3sg';
  if (IMPERATIVE_OR_FORMULA.test(normalized)) return null;
  for (let i = 0; i < parts.length; i++) {
    const word = parts[i];
    if (VERB_PERSON[word]) {
      return VERB_PERSON[word];
    }
  }
  return null;
}

function promptLeavesGenderOpen(promptEn: string): boolean {
  if (/\b(he|she|him|her|his|hers)\b/i.test(promptEn)) return false;
  if (/\b(i'm|i am)\s+(luca|giulia|marco)\b/i.test(promptEn)) return false;
  return true;
}

function genderVariants(normalized: string): string[] {
  const out: string[] = [];
  for (const [a, b] of GENDER_PAIRS) {
    const reA = new RegExp(`\\b${a}\\b`);
    const reB = new RegExp(`\\b${b}\\b`);
    if (reA.test(normalized)) out.push(normalized.replace(new RegExp(`\\b${a}\\b`, 'g'), b));
    if (reB.test(normalized)) out.push(normalized.replace(new RegExp(`\\b${b}\\b`, 'g'), a));
  }
  return out;
}

function moveTimeAdverb(normalized: string): string[] {
  const out: string[] = [];
  let match = TIME_TWO.exec(normalized);
  if (match) out.push(`${match[2]} ${match[1]}`);
  match = TIME_ONE_START.exec(normalized);
  if (match) out.push(`${match[2]} ${match[1]}`);
  match = TIME_ONE_END.exec(normalized);
  if (match) out.push(`${match[2]} ${match[1]}`);
  match = TIME_TWO_END.exec(normalized);
  if (match) out.push(`${match[2]} ${match[1]}`);
  return out;
}

function doveEVariants(normalized: string): string[] {
  const out: string[] = [];
  if (/\bdov'è\b/.test(normalized)) out.push(normalized.replace(/\bdov'è\b/g, 'dove è'));
  if (/\bdove è\b/.test(normalized)) out.push(normalized.replace(/\bdove è\b/g, "dov'è"));
  return out;
}

function missingRequiredConcept(normalized: string, semantic: ProductionSemantic): string | null {
  for (const concept of semantic.requiredConcepts) {
    const aliases = semantic.conceptAliases?.[concept] ?? [concept];
    const hit = aliases.some((alias) => includesPhrase(normalized, normalizeProductionText(alias)));
    if (!hit) return concept;
  }
  return null;
}

function includesPhrase(haystack: string, needle: string): boolean {
  if (!needle) return false;
  if (needle.includes(' ')) return haystack.includes(needle);
  return new RegExp(`\\b${escapeRegExp(needle)}\\b`).test(haystack);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function tenseMatches(normalized: string, tense: NonNullable<ProductionSemantic['requiredTense']>): boolean {
  if (tense === 'passato_prossimo') return looksPassatoProssimo(normalized);
  if (tense === 'imperfetto') return IMPERFECT.test(normalized);
  if (tense === 'conditional') return /\b\w+rei\b|\bvorrei\b/.test(normalized);
  if (tense === 'present') {
    if (/\bieri\b/.test(normalized) && looksPassatoProssimo(normalized)) return false;
    return true;
  }
  return true;
}

function personConstraintMatches(normalized: string, allowed: ProductionPerson[]): boolean {
  if (allowed.includes('impersonal') && /\b(ci serve|c'è|c'era|serve)\b/.test(normalized)) return true;
  const inferred = inferPerson(normalized);
  if (inferred && allowed.includes(inferred)) return true;
  if (allowed.includes('1pl') && /\b(dobbiamo|abbiamo|andiamo|ci serve)\b/.test(normalized)) return true;
  if (allowed.includes('3sg') && /\b(è|ha|viene|chiude|serve|c'è|deve|torna|vuole|compra)\b/.test(normalized))
    return true;
  if (allowed.includes('3pl') && /\b(vengono|chiudono|sono|hanno)\b/.test(normalized)) return true;
  return false;
}

function polarityFlippedAffirmative(normalized: string, semantic: ProductionSemantic): boolean {
  if (semantic.requiredRelations?.includes('if_then')) return false;
  return /\bnon\b/.test(normalized);
}

function failedRelation(
  normalized: string,
  semantic: ProductionSemantic,
): ProductionScoreReason | string | null {
  const relations = semantic.requiredRelations ?? [];
  if (relations.includes('if_then') && !/\bse\b/.test(normalized)) {
    return 'missing_required_content';
  }

  const { condition, result } = splitConditionResult(normalized);
  if (relations.includes('condition_negative')) {
    if (!condition || !/\bnon\b/.test(condition)) return 'wrong_polarity';
  }
  if (relations.includes('result_affirmative')) {
    if (!result || /\bnon\b/.test(result)) return 'wrong_polarity';
  }
  if (relations.includes('need_plan')) {
    const hasPlan = /\bpiano\b/.test(normalized);
    const hasNeed = /\b(serve|servono|dobbiamo|bisogno)\b/.test(normalized);
    if (!hasPlan || !hasNeed) return 'missing_required_content';
  }
  return null;
}

function splitConditionResult(normalized: string): { condition: string; result: string } {
  if (normalized.includes(',')) {
    const [condition, ...rest] = normalized.split(',');
    return { condition: condition.trim(), result: rest.join(',').trim() };
  }
  const seMatch = /^se (.+?) ((?:il |la |l'|i |le )?\S+ \S+)$/.exec(normalized);
  if (seMatch) return { condition: `se ${seMatch[1]}`.trim(), result: seMatch[2].trim() };
  const parts = normalized.split(' se ');
  if (parts.length === 2 && !normalized.startsWith('se ')) {
    return { condition: `se ${parts[1]}`.trim(), result: parts[0].trim() };
  }
  return { condition: normalized, result: '' };
}

export function countProductionSentences(text: string): number {
  return text
    .split(/[.!?]+/)
    .map((part) => part.trim())
    .filter(Boolean).length;
}

export function countProductionWords(text: string): number {
  return normalizeProductionText(text).split(' ').filter(Boolean).length;
}
