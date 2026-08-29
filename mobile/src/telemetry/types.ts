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
  | 'audio_starts'
  | 'audio_completion'
  | 'speed_change'
  | 'sentence_replay_count'
  | 'comprehension_attempt'
  | 'speak_scene_started'
  | 'speak_scene_line'
  | 'speak_scene_completed'
  | 'speak_scene_skipped'
  | 'self_assessment'
  | 'translation_explorer_opened'
  | 'translation_explorer_launched';

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
