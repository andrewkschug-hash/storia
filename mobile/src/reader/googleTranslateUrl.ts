export const MAX_TRANSLATION_INPUT_LENGTH = 500;

/**
 * Builds a robust, safely encoded Google Translate URL for translation.
 * Handles accents, apostrophes, punctuation, and multi-line inputs cleanly.
 */
export function buildGoogleTranslateUrl(
  text: string,
  sl: string = 'en',
  tl: string = 'it',
): string {
  const trimmed = text.trim().slice(0, MAX_TRANSLATION_INPUT_LENGTH);
  const encoded = encodeURIComponent(trimmed);
  return `https://translate.google.com/?sl=${sl}&tl=${tl}&text=${encoded}&op=translate`;
}

