import type {
  CharacterVoiceAssignment,
  LogicalVoice,
  TTSProviderId,
  VoiceRoster,
} from '@/src/audio/types';

export const NARRATOR_ID = 'narrator';

export const LOGICAL_VOICE_IDS = [
  'narrator',
  'luca',
  'sofia',
  'marco',
  'giulia',
  'nonna-rosa',
  'padrone',
  'marta',
] as const;

export type LogicalVoiceId = (typeof LOGICAL_VOICE_IDS)[number];

export function selectProvider(id: string): TTSProviderId {
  if (id === 'elevenlabs' || id === 'azure' || id === 'google') return id;
  throw new Error(`Unsupported TTS provider "${id}"`);
}

export function resolveSpeakerId(speakerId: string | null | undefined): string {
  if (!speakerId || speakerId === 'narrator') return NARRATOR_ID;
  return speakerId;
}

function isPlaceholder(id: string | null | undefined): boolean {
  if (!id) return true;
  return id.startsWith('lab-');
}

type LegacyCharacterRow = {
  logicalVoiceId?: string;
  provider?: TTSProviderId | string;
  voiceId?: string;
  voiceName?: string;
  language?: string;
  speakingStyle?: string;
  gender?: LogicalVoice['gender'];
  providers?: LogicalVoice['providers'];
};

type RawRoster = {
  activeProvider?: string;
  generationVersion?: number;
  logicalVoices?: Record<string, Partial<LogicalVoice> & LegacyCharacterRow>;
  characters?: Record<string, LegacyCharacterRow>;
};

export type RawVoiceRoster = RawRoster;

function emptyLogicalVoice(): LogicalVoice {
  return {
    speakingStyle: '',
    language: 'it-IT',
    providers: {},
  };
}

function bindingFromLegacy(row: LegacyCharacterRow | undefined): LogicalVoice {
  const voice = emptyLogicalVoice();
  if (!row) return voice;
  voice.speakingStyle = row.speakingStyle ?? '';
  voice.gender = row.gender;
  voice.language = 'it-IT';
  if (row.providers) {
    voice.providers = { ...row.providers };
  }
    if (row.provider && row.voiceId && !isPlaceholder(row.voiceId)) {
    const provider = selectProvider(String(row.provider));
    voice.providers[provider] = {
      voiceId: row.voiceId,
      voiceName: row.voiceName,
    };
  }
  return voice;
}

/** Accepts the new roster or the old character→vendor-id shape. */
export function normalizeRoster(raw: RawRoster | VoiceRoster | null | undefined): VoiceRoster {
  const source = raw ?? {};
  const logicalVoices: Record<string, LogicalVoice> = {};

  for (const id of LOGICAL_VOICE_IDS) {
    logicalVoices[id] = emptyLogicalVoice();
  }

  for (const [id, row] of Object.entries(source.logicalVoices ?? {})) {
    logicalVoices[id] = bindingFromLegacy(row);
  }

  for (const [id, row] of Object.entries(source.characters ?? {})) {
    const existing = logicalVoices[id] ?? emptyLogicalVoice();
    const fromLegacy = bindingFromLegacy(row);
    logicalVoices[id] = {
      speakingStyle: existing.speakingStyle || fromLegacy.speakingStyle,
      language: 'it-IT',
      gender: existing.gender ?? fromLegacy.gender,
      providers: { ...fromLegacy.providers, ...existing.providers },
    };
  }

  const characters: VoiceRoster['characters'] = {};
  for (const id of Object.keys(logicalVoices)) {
    const mapped = source.characters?.[id]?.logicalVoiceId;
    characters[id] = { logicalVoiceId: mapped || id };
  }
  for (const id of LOGICAL_VOICE_IDS) {
    if (!characters[id]) characters[id] = { logicalVoiceId: id };
  }

  let activeProvider: TTSProviderId = 'elevenlabs';
  try {
    activeProvider = selectProvider(source.activeProvider ?? 'elevenlabs');
  } catch {
    activeProvider = 'elevenlabs';
  }

  return {
    activeProvider,
    generationVersion: source.generationVersion ?? 1,
    logicalVoices,
    characters,
  };
}

export function logicalVoiceIdForSpeaker(roster: VoiceRoster, speakerId: string | null | undefined): string {
  const speaker = resolveSpeakerId(speakerId);
  return roster.characters[speaker]?.logicalVoiceId ?? speaker;
}

export function providerBinding(
  roster: VoiceRoster,
  logicalVoiceId: string,
  provider: TTSProviderId = roster.activeProvider,
) {
  const voice = roster.logicalVoices[logicalVoiceId];
  const binding = voice?.providers[provider];
  if (binding?.voiceId && !isPlaceholder(binding.voiceId)) return binding;
  return null;
}

export function assignmentForLogicalVoice(
  roster: VoiceRoster,
  logicalVoiceId: string,
  provider: TTSProviderId = roster.activeProvider,
): CharacterVoiceAssignment | null {
  const logical = roster.logicalVoices[logicalVoiceId];
  const binding = providerBinding(roster, logicalVoiceId, provider);
  if (!logical || !binding) return null;
  return {
    provider,
    voiceId: binding.voiceId,
    voiceName: binding.voiceName,
    language: logical.language,
    speakingStyle: logical.speakingStyle,
    gender: logical.gender,
    logicalVoiceId,
  };
}

export function assignProviderVoice(
  roster: VoiceRoster,
  logicalVoiceId: string,
  provider: TTSProviderId,
  input: { voiceId: string; voiceName?: string; gender?: LogicalVoice['gender']; speakingStyle?: string },
): VoiceRoster {
  const next = normalizeRoster(roster);
  const previous = next.logicalVoices[logicalVoiceId] ?? emptyLogicalVoice();
  next.logicalVoices[logicalVoiceId] = {
    speakingStyle: input.speakingStyle ?? previous.speakingStyle,
    language: 'it-IT',
    gender: input.gender ?? previous.gender,
    providers: {
      ...previous.providers,
      [provider]: { voiceId: input.voiceId, voiceName: input.voiceName },
    },
  };
  next.characters[logicalVoiceId] = { logicalVoiceId };
  next.activeProvider = provider;
  return next;
}

export function allLogicalVoicesLocked(roster: VoiceRoster, provider: TTSProviderId = roster.activeProvider): boolean {
  return LOGICAL_VOICE_IDS.every((id) => Boolean(providerBinding(roster, id, provider)));
}
