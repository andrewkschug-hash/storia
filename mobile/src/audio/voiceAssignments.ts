import AsyncStorage from '@react-native-async-storage/async-storage';

import type { VoiceRoster } from '@/src/audio/types';

const KEY = 'storia.voiceRoster';

let runtime: VoiceRoster | null = null;

export function currentRoster(fallback: VoiceRoster): VoiceRoster {
  return runtime ?? fallback;
}

export function applyVoiceRoster(next: VoiceRoster): VoiceRoster {
  runtime = next;
  return next;
}

export async function persistVoiceRoster(next: VoiceRoster): Promise<void> {
  runtime = next;
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
}

export async function hydrateVoiceRoster(fallback: VoiceRoster): Promise<VoiceRoster> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as VoiceRoster;
      if (parsed?.characters) {
        runtime = parsed;
        return parsed;
      }
    }
  } catch {
    /* bundled roster */
  }
  runtime = fallback;
  return fallback;
}
