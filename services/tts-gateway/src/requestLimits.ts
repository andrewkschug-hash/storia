/** Maximum JSON body size accepted by the gateway (batch payloads). */
export const MAX_REQUEST_BODY_BYTES = 512 * 1024;

/** Maximum characters per TTS text field in a single sentence. */
export const MAX_TTS_TEXT_CHARS = 2_000;

/** Maximum sentences per batch request. */
export const MAX_BATCH_SENTENCES = 500;

export function requestBodyTooLargeMessage(maxBytes: number): string {
  return `Request body exceeds ${maxBytes} bytes.`;
}

export function ttsTextTooLongMessage(maxChars: number): string {
  return `TTS text exceeds ${maxChars} characters.`;
}

export function batchTooLargeMessage(maxSentences: number): string {
  return `Batch exceeds ${maxSentences} sentences.`;
}
