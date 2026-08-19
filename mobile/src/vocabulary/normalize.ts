import { computeFamiliarity } from '@/src/vocabulary/familiarity';
import type {
  FamiliaritySignals,
  LemmaEncounter,
  PhraseEncounter,
  UserVocabularyState,
} from '@/src/vocabulary/types';
import { createEmptyVocabularyState } from '@/src/vocabulary/types';

export function createLemmaEncounter(lemmaId: string): LemmaEncounter {
  return {
    lemmaId,
    encounterCount: 0,
    tapCount: 0,
    saveCount: 0,
    chaptersEncountered: [],
    firstChapterId: null,
    lastChapterId: null,
    firstEncounteredAt: null,
    lastEncounteredAt: null,
    lastSentenceId: null,
    saved: false,
    savedForms: [],
    savedAt: null,
    lastReviewedAt: null,
    reviewCount: 0,
    correctReviewCount: 0,
    incorrectReviewCount: 0,
    almostReviewCount: 0,
    lastSelfAssessment: null,
    lastSelfAssessmentAt: null,
    intervalIndex: -1,
    dueAt: null,
    familiarityScore: 0,
    status: 'new',
    recentEncounters: [],
  };
}

export function createPhraseEncounter(phraseId: string, surface: string): PhraseEncounter {
  return {
    phraseId,
    surface,
    encounterCount: 0,
    tapCount: 0,
    saveCount: 0,
    chaptersEncountered: [],
    firstChapterId: null,
    lastChapterId: null,
    firstEncounteredAt: null,
    lastEncounteredAt: null,
    lastSentenceId: null,
    saved: false,
    savedAt: null,
    lastReviewedAt: null,
    reviewCount: 0,
    correctReviewCount: 0,
    incorrectReviewCount: 0,
    almostReviewCount: 0,
    lastSelfAssessment: null,
    lastSelfAssessmentAt: null,
    intervalIndex: -1,
    dueAt: null,
    familiarityScore: 0,
    status: 'new',
    recentEncounters: [],
  };
}

export function refreshFamiliarity<T extends LemmaEncounter | PhraseEncounter>(
  row: T,
  now?: Date,
): T {
  const signals: FamiliaritySignals = {
    encounterCount: row.encounterCount,
    chaptersEncountered: row.chaptersEncountered.length,
    tapCount: row.tapCount,
    saveCount: row.saveCount,
    saved: row.saved,
    correctReviewCount: row.correctReviewCount,
    incorrectReviewCount: row.incorrectReviewCount,
    almostReviewCount: row.almostReviewCount,
    lastEncounteredAt: row.lastEncounteredAt,
    lastReviewedAt: row.lastReviewedAt,
  };
  const { score, status } = computeFamiliarity(signals, now);
  row.familiarityScore = score;
  row.status = status;
  return row;
}

export function normalizeVocabularyState(raw: Partial<UserVocabularyState> | null | undefined): UserVocabularyState {
  const empty = createEmptyVocabularyState();
  if (!raw) return empty;
  const lemmas: UserVocabularyState['lemmas'] = {};
  for (const [id, row] of Object.entries(raw.lemmas ?? {})) {
    lemmas[id] = refreshFamiliarity(normalizeLemma(id, row as Partial<LemmaEncounter>));
  }
  const phrases: UserVocabularyState['phrases'] = {};
  for (const [id, row] of Object.entries(raw.phrases ?? {})) {
    phrases[id] = refreshFamiliarity(
      normalizePhrase(id, row as Partial<PhraseEncounter>),
    );
  }
  return { lemmas, phrases };
}

function normalizeLemma(id: string, row: Partial<LemmaEncounter>): LemmaEncounter {
  const base = createLemmaEncounter(id);
  return {
    ...base,
    ...row,
    lemmaId: row.lemmaId ?? id,
    chaptersEncountered: [...(row.chaptersEncountered ?? [])],
    savedForms: [...(row.savedForms ?? [])],
    tapCount: row.tapCount ?? 0,
    saveCount: row.saveCount ?? (row.saved ? 1 : 0),
    firstEncounteredAt: row.firstEncounteredAt ?? row.lastEncounteredAt ?? null,
    intervalIndex: row.intervalIndex ?? -1,
    reviewCount: row.reviewCount ?? 0,
    correctReviewCount: row.correctReviewCount ?? 0,
    incorrectReviewCount: row.incorrectReviewCount ?? 0,
    almostReviewCount: row.almostReviewCount ?? 0,
    lastSelfAssessment: row.lastSelfAssessment ?? null,
    lastSelfAssessmentAt: row.lastSelfAssessmentAt ?? null,
    recentEncounters: [...(row.recentEncounters ?? [])],
  };
}

function normalizePhrase(id: string, row: Partial<PhraseEncounter>): PhraseEncounter {
  const base = createPhraseEncounter(id, row.surface ?? id);
  return {
    ...base,
    ...row,
    phraseId: row.phraseId ?? id,
    surface: row.surface ?? id,
    chaptersEncountered: [...(row.chaptersEncountered ?? [])],
    tapCount: row.tapCount ?? 0,
    saveCount: row.saveCount ?? (row.saved ? 1 : 0),
    firstEncounteredAt: row.firstEncounteredAt ?? row.lastEncounteredAt ?? null,
    intervalIndex: row.intervalIndex ?? -1,
    reviewCount: row.reviewCount ?? 0,
    correctReviewCount: row.correctReviewCount ?? 0,
    incorrectReviewCount: row.incorrectReviewCount ?? 0,
    almostReviewCount: row.almostReviewCount ?? 0,
    lastSelfAssessment: row.lastSelfAssessment ?? null,
    lastSelfAssessmentAt: row.lastSelfAssessmentAt ?? null,
    recentEncounters: [...(row.recentEncounters ?? [])],
  };
}

export function cloneVocabularyState(state: UserVocabularyState): UserVocabularyState {
  return {
    lemmas: Object.fromEntries(
      Object.entries(state.lemmas).map(([k, v]) => [
        k,
        {
          ...v,
          savedForms: [...v.savedForms],
          chaptersEncountered: [...v.chaptersEncountered],
          recentEncounters: [...v.recentEncounters],
        },
      ]),
    ),
    phrases: Object.fromEntries(
      Object.entries(state.phrases).map(([k, v]) => [
        k,
        {
          ...v,
          chaptersEncountered: [...v.chaptersEncountered],
          recentEncounters: [...v.recentEncounters],
        },
      ]),
    ),
  };
}
