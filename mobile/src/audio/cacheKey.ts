import type { TTSLanguage, TTSProviderId, TTSSpeed } from '@/src/audio/types';

/** Deterministic content hash — not a cryptographic secret. */
export function contentHash(value: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    const c = value.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0;
    h2 = Math.imul(h2 ^ (c + i), 0x01000193) >>> 0;
  }
  return (h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0')).slice(0, 16);
}

export type AudioCacheKeyInput = {
  provider: TTSProviderId;
  voiceId: string;
  language: TTSLanguage;
  speed: TTSSpeed;
  text: string;
  generationVersion: number;
};

export function audioCacheKey(input: AudioCacheKeyInput): string {
  const payload = [
    input.provider,
    input.voiceId,
    input.language,
    input.speed,
    input.text.normalize('NFC').trim(),
    String(input.generationVersion),
  ].join('|');
  return `tts_${contentHash(payload)}`;
}

export function textHash(text: string): string {
  return contentHash(text.normalize('NFC').trim());
}
