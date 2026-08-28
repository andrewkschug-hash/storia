import type { Sentence } from '@/src/content/schemas';

/**
 * Returns the standard spoken text for the chapter header (number and Italian title).
 * Example: "Capitolo 1. Arrivo."
 */
export function chapterHeaderText(chapter: { number: number; titleIt: string }): string {
  const cleanTitle = chapter.titleIt.trim().replace(/\.+$/, '');
  return `Capitolo ${chapter.number}. ${cleanTitle}.`;
}

/**
 * Generates a synthetic narration Sentence representing the chapter header for audio playback.
 */
export function makeHeaderSentence(chapter: {
  id?: string;
  number: number;
  titleIt: string;
}): Sentence {
  const id = chapter.id ? `header:${chapter.id}` : `header:${chapter.number}`;
  const text = chapterHeaderText(chapter);
  return {
    id,
    speakerId: 'narrator',
    text,
    kind: 'narration',
    tokens: [],
    phrases: [],
    reinforces: [],
    phraseReinforces: [],
    introduces: [],
    difficulty: 1,
    variants: [],
    selectedVariantId: 'standard',
    english: `Chapter ${chapter.number}. ${chapter.titleIt}.`,
  };
}

/**
 * Checks if a sentence ID represents a chapter header.
 */
export function isHeaderSentenceId(id: string | null | undefined): boolean {
  if (!id) return false;
  return id === 'header' || id.startsWith('header:');
}
