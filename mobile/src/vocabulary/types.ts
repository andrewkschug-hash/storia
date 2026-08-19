import type { LexiconEntry, Phrase, Sentence } from '@/src/content/schemas';
import type { SelfAssessment } from '@/src/vocabulary/selfAssessment';

export type LookupKind = 'word' | 'phrase' | 'sentence';
export type VocabularyStatus = 'new' | 'learning' | 'familiar' | 'mastered';

export type WordLookup = {
  kind: 'word';
  surface: string;
  lemmaId: string;
  lemmaItalian: string;
  english: string;
  partOfSpeech?: string;
  sentenceText: string;
  sentenceId: string;
  chapterId: string;
  chapterNumber: number;
  tokenIndex: number;
  encounterCount: number;
};

export type PhraseLookup = {
  kind: 'phrase';
  phraseId: string;
  surface: string;
  naturalEnglish: string;
  literalEnglish: string;
  explanation?: string;
  sentenceText: string;
  sentenceId: string;
  chapterId: string;
  chapterNumber: number;
  tokenStart: number;
  tokenEnd: number;
  lemmaIds: string[];
  encounterCount: number;
};

export type SentenceLookup = {
  kind: 'sentence';
  surface: string;
  english: string;
  sentenceText: string;
  sentenceId: string;
  chapterId: string;
  chapterNumber: number;
  encounterCount: number;
};

export type DictionaryLookup = WordLookup | PhraseLookup | SentenceLookup;

export type EncounterSignal = {
  tapped: boolean;
  at: string;
  chapterId: string;
};

export type LemmaEncounter = {
  lemmaId: string;
  encounterCount: number;
  tapCount: number;
  saveCount: number;
  chaptersEncountered: string[];
  firstChapterId: string | null;
  lastChapterId: string | null;
  firstEncounteredAt: string | null;
  lastEncounteredAt: string | null;
  lastSentenceId: string | null;
  saved: boolean;
  savedForms: string[];
  savedAt: string | null;
  lastReviewedAt: string | null;
  reviewCount: number;
  correctReviewCount: number;
  incorrectReviewCount: number;
  almostReviewCount: number;
  lastSelfAssessment: SelfAssessment | null;
  lastSelfAssessmentAt: string | null;
  intervalIndex: number;
  dueAt: string | null;
  familiarityScore: number;
  status: VocabularyStatus;
  recentEncounters: EncounterSignal[];
};

export type PhraseEncounter = {
  phraseId: string;
  surface: string;
  encounterCount: number;
  tapCount: number;
  saveCount: number;
  chaptersEncountered: string[];
  firstChapterId: string | null;
  lastChapterId: string | null;
  firstEncounteredAt: string | null;
  lastEncounteredAt: string | null;
  lastSentenceId: string | null;
  saved: boolean;
  savedAt: string | null;
  lastReviewedAt: string | null;
  reviewCount: number;
  correctReviewCount: number;
  incorrectReviewCount: number;
  almostReviewCount: number;
  lastSelfAssessment: SelfAssessment | null;
  lastSelfAssessmentAt: string | null;
  intervalIndex: number;
  dueAt: string | null;
  familiarityScore: number;
  status: VocabularyStatus;
  recentEncounters: EncounterSignal[];
};

export type UserVocabularyState = {
  lemmas: Record<string, LemmaEncounter>;
  phrases: Record<string, PhraseEncounter>;
};

export function createEmptyVocabularyState(): UserVocabularyState {
  return { lemmas: {}, phrases: {} };
}

export type TapContext = {
  sentence: Sentence;
  chapterId: string;
  chapterNumber: number;
  tokenIndex: number;
};

export type ResolvedPhrase = Phrase & {
  phraseId: string;
  lemmaIds: string[];
};

export type LexiconIndex = {
  byLemmaId: Map<string, LexiconEntry>;
  formToLemmaId: Map<string, string>;
};

export type FamiliaritySignals = {
  encounterCount: number;
  chaptersEncountered: number;
  tapCount: number;
  saveCount: number;
  saved: boolean;
  correctReviewCount: number;
  incorrectReviewCount: number;
  almostReviewCount?: number;
  lastEncounteredAt: string | null;
  lastReviewedAt: string | null;
};
