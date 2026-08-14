export type ReadingEventType =
  | 'words_read'
  | 'word_tapped'
  | 'word_lookup'
  | 'phrase_lookup'
  | 'dictionary_opened'
  | 'word_saved'
  | 'phrase_saved'
  | 'review_initiated'
  | 'audio_played'
  | 'sentence_replayed'
  | 'comprehension_attempt';

export type ReadingEvent = {
  id: string;
  at: string;
  type: ReadingEventType;
  storyId?: string;
  chapterId?: string;
  sentenceId?: string;
  lemmaId?: string;
  phraseId?: string;
  tokensRead?: number;
  cefrLevel?: string;
  meta?: Record<string, string | number | boolean | null>;
};

export type RecordReadingEventInput = Omit<ReadingEvent, 'id' | 'at'> & {
  at?: string;
};
