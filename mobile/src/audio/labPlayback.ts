import { CHAPTER_SENTENCE_GAP_MS, PLAYBACK_RATE } from '@/src/audio/AudioService';
import { createAudioPlayer, type AudioPlayer } from '@/src/audio/playback';
import type { TTSSpeed } from '@/src/audio/types';

export { CHAPTER_SENTENCE_GAP_MS, PLAYBACK_RATE };

let player: AudioPlayer | null = null;

function labPlayer(): AudioPlayer {
  if (!player) player = createAudioPlayer();
  return player;
}

export function labPlaybackRate(speed: TTSSpeed): number {
  return PLAYBACK_RATE[speed];
}

export async function playLabPreview(url: string, speed: TTSSpeed): Promise<void> {
  await labPlayer().play(url, labPlaybackRate(speed));
}

export function stopLabPreview(): void {
  labPlayer().stop();
}

export function waitSentenceGap(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, CHAPTER_SENTENCE_GAP_MS));
}
