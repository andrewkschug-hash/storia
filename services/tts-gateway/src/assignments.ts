import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { TTSProviderId } from './types';

export const LOGICAL_VOICE_IDS = [
  'narrator',
  'luca',
  'sofia',
  'marco',
  'giulia',
  'nonna-rosa',
  'padrone',
] as const;

export type ProviderBinding = { voiceId: string; voiceName?: string };

export type LogicalVoice = {
  speakingStyle: string;
  language: 'it-IT';
  gender?: 'male' | 'female' | 'neutral';
  providers: Partial<Record<TTSProviderId, ProviderBinding | null>>;
};

export type StoredRoster = {
  activeProvider: TTSProviderId;
  generationVersion: number;
  logicalVoices: Record<string, LogicalVoice>;
  characters: Record<string, { logicalVoiceId: string }>;
};

function isPlaceholder(id: string | null | undefined) {
  return !id || id.startsWith('lab-');
}

function emptyVoice(): LogicalVoice {
  return { speakingStyle: '', language: 'it-IT', providers: {} };
}

export function normalizeRoster(raw: Record<string, unknown> | StoredRoster | null | undefined): StoredRoster {
  const source = (raw ?? {}) as {
    activeProvider?: string;
    generationVersion?: number;
    logicalVoices?: Record<string, LogicalVoice & { provider?: TTSProviderId; voiceId?: string; voiceName?: string }>;
    characters?: Record<
      string,
      {
        logicalVoiceId?: string;
        provider?: TTSProviderId;
        voiceId?: string;
        voiceName?: string;
        speakingStyle?: string;
        gender?: LogicalVoice['gender'];
        providers?: LogicalVoice['providers'];
      }
    >;
  };
  const logicalVoices: Record<string, LogicalVoice> = {};
  for (const id of LOGICAL_VOICE_IDS) logicalVoices[id] = emptyVoice();

  const absorb = (id: string, row: (typeof source.characters)[string] | undefined) => {
    if (!row) return;
    const current = logicalVoices[id] ?? emptyVoice();
    const providers = { ...current.providers, ...(row.providers ?? {}) };
    if (row.provider && row.voiceId && !isPlaceholder(row.voiceId)) {
      providers[row.provider] = { voiceId: row.voiceId, voiceName: row.voiceName };
    }
    logicalVoices[id] = {
      speakingStyle: current.speakingStyle || row.speakingStyle || '',
      language: 'it-IT',
      gender: current.gender ?? row.gender,
      providers,
    };
  };

  for (const [id, row] of Object.entries(source.logicalVoices ?? {})) absorb(id, row);
  for (const [id, row] of Object.entries(source.characters ?? {})) absorb(id, row);

  const characters: StoredRoster['characters'] = {};
  for (const id of Object.keys(logicalVoices)) {
    characters[id] = { logicalVoiceId: source.characters?.[id]?.logicalVoiceId || id };
  }

  const active =
    source.activeProvider === 'google' || source.activeProvider === 'azure' || source.activeProvider === 'elevenlabs'
      ? source.activeProvider
      : 'elevenlabs';

  return {
    activeProvider: active,
    generationVersion: source.generationVersion ?? 1,
    logicalVoices,
    characters,
  };
}

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
    return normalizeRoster({ activeProvider: 'elevenlabs', generationVersion: 1 });
  }
  return normalizeRoster(JSON.parse(readFileSync(file, 'utf8')) as StoredRoster);
}

export function writeAssignment(input: {
  characterId: string;
  provider: TTSProviderId;
  voiceId: string;
  voiceName?: string;
  gender?: LogicalVoice['gender'];
  speakingStyle?: string;
}): StoredRoster {
  const roster = readRoster();
  const previous = roster.logicalVoices[input.characterId] ?? emptyVoice();
  roster.logicalVoices[input.characterId] = {
    speakingStyle: input.speakingStyle ?? previous.speakingStyle,
    language: 'it-IT',
    gender: input.gender ?? previous.gender,
    providers: {
      ...previous.providers,
      [input.provider]: { voiceId: input.voiceId, voiceName: input.voiceName },
    },
  };
  roster.characters[input.characterId] = { logicalVoiceId: input.characterId };
  roster.activeProvider = input.provider;
  writeFileSync(voicesJsonPath(), `${JSON.stringify(roster, null, 2)}\n`, 'utf8');
  return roster;
}

export function publicRoster(roster: StoredRoster) {
  const normalized = normalizeRoster(roster);
  const characters: Record<
    string,
    { provider: TTSProviderId; voiceName: string; assigned: boolean; logicalVoiceId: string }
  > = {};
  for (const [id, row] of Object.entries(normalized.characters)) {
    const logicalId = row.logicalVoiceId;
    const binding = normalized.logicalVoices[logicalId]?.providers[normalized.activeProvider];
    const assigned = Boolean(binding?.voiceId) && !isPlaceholder(binding?.voiceId);
    characters[id] = {
      provider: normalized.activeProvider,
      voiceName: assigned ? binding?.voiceName || 'Saved voice' : '',
      assigned,
      logicalVoiceId: logicalId,
    };
  }
  return {
    activeProvider: normalized.activeProvider,
    generationVersion: normalized.generationVersion,
    characters,
  };
}
