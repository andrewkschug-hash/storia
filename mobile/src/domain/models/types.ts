/**
 * Domain models for Storia — story-driven Italian reading engine.
 * Content and progress layers depend on these; UI never hard-codes narrative text.
 */

export type DifficultyLevel = 1 | 2 | 3 | 4;

export type VocabularyState =
  | 'new'
  | 'introduced'
  | 'learning'
  | 'familiar'
  | 'mastered';

export type TTSProviderId = 'elevenlabs' | 'azure' | 'google';
export type TTSSpeed = 'normal' | 'slow';

export type AudioGenerationStatus =
  | 'not_generated'
  | 'generating'
  | 'generated'
  | 'review_required'
  | 'approved'
  | 'failed';

export type SentenceKind = 'narration' | 'dialogue';

export interface CharacterVoice {
  provider: TTSProviderId;
  voiceId: string;
  language: 'it-IT';
  speakingStyle: string;
}

export interface Character {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'neutral';
  ageDescription: string;
  voice: CharacterVoice;
}

export interface Location {
  id: string;
  name: string;
  city?: string;
  description?: string;
}

export interface StoryEvent {
  id: string;
  storyId: string;
  chapterId: string;
  characterIds: string[];
  summary: string;
  rememberedFacts: string[];
}

export interface PhraseAnnotation {
  surface: string;
  literalEn: string;
  naturalEn: string;
  /** Inclusive start/end token indices within the sentence */
  tokenStart: number;
  tokenEnd: number;
}

export interface SentenceToken {
  surface: string;
  lemmaId?: string;
  /** Character offsets in sentence.text */
  start: number;
  end: number;
}

export interface Sentence {
  id: string;
  text: string;
  speakerId: string | null;
  kind: SentenceKind;
  tokens?: SentenceToken[];
  phrases?: PhraseAnnotation[];
}

export interface Paragraph {
  id: string;
  order: number;
  sentences: Sentence[];
}

export interface ComprehensionChoice {
  id: string;
  text: string;
  correct: boolean;
}

export interface ComprehensionQuestion {
  id: string;
  promptEn: string;
  choices: ComprehensionChoice[];
}

export interface Chapter {
  id: string;
  storyId: string;
  number: number;
  title: string;
  titleIt: string;
  difficultyLevel: DifficultyLevel;
  paragraphs: Paragraph[];
  questions: ComprehensionQuestion[];
}

export interface Story {
  id: string;
  title: string;
  titleIt: string;
  slug: string;
  level: DifficultyLevel;
  synopsis: string;
  characterIds: string[];
  chapters: ChapterSummary[];
}

export interface ChapterSummary {
  id: string;
  number: number;
  title: string;
  titleIt: string;
  difficultyLevel: DifficultyLevel;
  wordCount: number;
}

export interface VocabularyEntry {
  id: string;
  italian: string;
  english: string;
  lemma: string;
  pos: string;
  difficulty: DifficultyLevel;
  frequency: number;
  introducedChapterId?: string;
  inflections?: string[];
}

export interface UserVocabularyProgress {
  lemmaId: string;
  state: VocabularyState;
  encounterCount: number;
  tapCount: number;
  lastEncounteredAt?: string;
  familiarityScore: number;
  introducedChapterId?: string;
}

export interface ReadingProgress {
  storyId: string;
  chapterId: string;
  chapterNumber: number;
  totalChapters: number;
  percentComplete: number;
  chapterPercentComplete?: number;
  chaptersCompleted: number;
  storiesCompleted: number;
  wordsEncountered: number;
  wordsFamiliar: number;
  readingStreakDays: number;
  lastSentenceId?: string;
}

export interface SentenceAudio {
  sentenceId: string;
  provider: TTSProviderId;
  voiceId: string;
  language: 'it-IT';
  speed: TTSSpeed;
  status: AudioGenerationStatus;
  cacheKey: string;
  uri?: string;
  version: number;
}

export interface GrammarPattern {
  id: string;
  nameIt: string;
  nameEn: string;
  explanationShort: string;
  exampleForms: string[];
  encounterThreshold: number;
  relatedLemmaIds: string[];
}

export interface UserSettings {
  colorSchemePreference: 'system' | 'light' | 'dark';
  fontScale: number;
}
