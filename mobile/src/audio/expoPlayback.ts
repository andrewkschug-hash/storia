import { createAudioPlayer as createExpoPlayer, setAudioModeAsync } from 'expo-audio';

import { rememberAudioUrl, resolvePlayableUrl } from '@/src/audio/localCache';
import type { AudioPlayer } from '@/src/audio/playback';

let audioModeReady = false;

async function ensureAudioMode() {
  if (audioModeReady) return;
  try {
    await setAudioModeAsync({ playsInSilentMode: true });
    audioModeReady = true;
  } catch {
    /* reader still works without silent-mode playback */
  }
}

export function createExpoPlaybackPlayer(): AudioPlayer {
  let player: ReturnType<typeof createExpoPlayer> | null = null;
  let ended: (() => void | Promise<void>) | null = null;

  return {
    async play(url: string, rate = 1) {
      await ensureAudioMode();
      if (player) {
        player.remove();
        player = null;
      }
      const playable = await resolvePlayableUrl(url);
      rememberAudioUrl(url);
      player = createExpoPlayer(playable);
      try {
        player.playbackRate = rate > 0 ? rate : 1;
      } catch {
        /* some platforms ignore rate */
      }
      player.addListener('playbackStatusUpdate', (status) => {
        if (status.didJustFinish) {
          void ended?.();
        }
      });
      player.play();
    },
    pause() {
      player?.pause();
    },
    resume() {
      player?.play();
    },
    stop() {
      if (player) {
        player.remove();
        player = null;
      }
    },
    isPlaying() {
      return !!player?.playing;
    },
    onEnded(cb) {
      ended = cb;
    },
  };
}
