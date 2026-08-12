import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { TTSProviderId } from './types';

export type StoredAssignment = {
  provider: TTSProviderId;
  voiceId: string;
  voiceName?: string;
  language: 'it-IT';
  speakingStyle: string;
  gender?: 'male' | 'female' | 'neutral';
};

export type StoredRoster = {
  activeProvider: TTSProviderId;
  generationVersion: number;
  characters: Record<string, StoredAssignment>;
};

function defaultVoicesPath(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  return join(here, '../../../mobile/content/audio/voices.json');
}

export function voicesJsonPath(): string {
  return process.env.TTS_VOICES_JSON ?? defaultVoicesPath();
}

export function readRoster(): StoredRoster {
  const file = voicesJsonPath();
  if (!existsSync(file)) {
    return { activeProvider: 'elevenlabs', generationVersion: 1, characters: {} };
  }
  return JSON.parse(readFileSync(file, 'utf8')) as StoredRoster;
}

export function writeAssignment(input: {
  characterId: string;
  provider: TTSProviderId;
  voiceId: string;
  voiceName?: string;
  gender?: StoredAssignment['gender'];
  speakingStyle?: string;
}): StoredRoster {
  const roster = readRoster();
  const previous = roster.characters[input.characterId];
  roster.characters[input.characterId] = {
    provider: input.provider,
    voiceId: input.voiceId,
    voiceName: input.voiceName ?? previous?.voiceName,
    language: 'it-IT',
    speakingStyle: input.speakingStyle ?? previous?.speakingStyle ?? '',
    gender: input.gender ?? previous?.gender,
  };
  roster.activeProvider = input.provider;
  writeFileSync(voicesJsonPath(), `${JSON.stringify(roster, null, 2)}\n`, 'utf8');
  return roster;
}

/** Public view: names only. Internal voice IDs stay on the server file. */
export function publicRoster(roster: StoredRoster) {
  const characters: Record<string, { provider: TTSProviderId; voiceName: string; assigned: boolean }> = {};
  for (const [id, row] of Object.entries(roster.characters)) {
    const assigned = Boolean(row.voiceId) && !row.voiceId.startsWith('lab-');
    characters[id] = {
      provider: row.provider,
      voiceName: assigned ? row.voiceName || 'Saved voice' : '',
      assigned,
    };
  }
  return {
    activeProvider: roster.activeProvider,
    generationVersion: roster.generationVersion,
    characters,
  };
}
