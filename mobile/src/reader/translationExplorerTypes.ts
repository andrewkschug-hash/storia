export type ExploreTranslationSource =
  | 'reader_header'
  | 'word'
  | 'phrase'
  | 'sentence';

export interface ExploreTranslationPayload {
  /**
   * The text to load into the Italian editor.
   * Full sentence by default for word/phrase exploration to maintain sentence-first immersion.
   */
  text: string;
  source: ExploreTranslationSource;

  /** Full sentence containing the selected text, when available. */
  contextSentence?: string;

  /** Storia's curated English translation of the context sentence or phrase. */
  referenceEnglish?: string;

  /** The specific selected word or phrase surface, if exploration originated there. */
  selectedText?: string;
}
