import AsyncStorage from '@react-native-async-storage/async-storage';

import { normalizeRoster } from '@/src/audio/logicalVoices';
import type { VoiceRoster } from '@/src/audio/types';

const KEY = 'storia.voiceRoster';

let runtime: VoiceRoster | null = null;

export function currentRoster(fallback: VoiceRoster): VoiceRoster {
  return runtime ?? fallback;
}

export function applyVoiceRoster(next: VoiceRoster): VoiceRoster {
  runtime = normalizeRoster(next);
  return runtime;
}

export async function persistVoiceRoster(next: VoiceRoster): Promise<void> {
  runtime = normalizeRoster(next);
  await AsyncStorage.setItem(KEY, JSON.stringify(runtime));
}

export async function hydrateVoiceRoster(fallback: VoiceRoster): Promise<VoiceRoster> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as VoiceRoster;
      if (parsed?.characters) {
        runtime = normalizeRoster(parsed);
        return runtime;
      }
    }
  } catch {
    /* bundled roster */
  }
  runtime = fallback;
  return fallback;
}
