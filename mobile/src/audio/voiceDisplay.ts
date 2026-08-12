import type { CharacterVoiceAssignment, TTSProviderId, VoiceInfo, VoiceRoster } from '@/src/audio/types';

export const PROVIDER_LABEL: Record<TTSProviderId, string> = {
  elevenlabs: 'ElevenLabs',
  azure: 'Azure',
  google: 'Google',
};

export const ASSIGNABLE_CHARACTERS: { id: string; label: string }[] = [
  { id: 'luca', label: 'Luca' },
  { id: 'sofia', label: 'Sofia' },
  { id: 'marco', label: 'Marco' },
  { id: 'giulia', label: 'Giulia' },
  { id: 'nonna-rosa', label: 'Nonna Rosa' },
  { id: 'narrator', label: 'Narrator' },
];

export const DEFAULT_SAMPLE = 'Ciao, mi chiamo Luca. Vivo a Roma.';

export function looksLikeInternalId(value: string): boolean {
  const v = value.trim();
  if (!v) return true;
  if (/^it[-_]IT[-_]/i.test(v)) return true;
  if (/^[A-Za-z0-9]{16,}$/.test(v) && !/\s/.test(v)) return true;
  return false;
}

export function isPlaceholderVoiceId(id: string | null | undefined): boolean {
  if (!id) return true;
  return id.startsWith('lab-');
}

export function isAssigned(row: CharacterVoiceAssignment | undefined): boolean {
  return Boolean(row?.voiceId) && !isPlaceholderVoiceId(row?.voiceId);
}

export function displayVoiceName(voice: Pick<VoiceInfo, 'id' | 'name' | 'displayName' | 'gender'>): string {
  if (voice.displayName && !looksLikeInternalId(voice.displayName)) return voice.displayName;
  if (voice.name && voice.name !== voice.id && !looksLikeInternalId(voice.name)) return voice.name;
  const who = voice.gender === 'female' ? 'Female' : voice.gender === 'male' ? 'Male' : 'Voice';
  return `Italian ${who} Voice`;
}

export function voiceSubtitle(voice: Pick<VoiceInfo, 'language' | 'gender'>): string {
  const lang = voice.language?.toLowerCase().startsWith('it') ? 'Italian' : voice.language || 'Italian';
  const gender =
    voice.gender === 'female' ? 'Female' : voice.gender === 'male' ? 'Male' : voice.gender === 'neutral' ? 'Neutral' : null;
  return gender ? `${lang} • ${gender}` : lang;
}

export function assignmentCaption(roster: VoiceRoster, characterId: string): string {
  const row = roster.characters[characterId];
  if (!isAssigned(row)) return 'Not assigned yet';
  const name = row.voiceName && !looksLikeInternalId(row.voiceName) ? row.voiceName : 'Saved voice';
  return `${name} · ${PROVIDER_LABEL[row.provider]}`;
}

export function gatewayDownMessage(): string {
  return [
    'The TTS gateway is not running. That is a small local service that talks to ElevenLabs so your API key never goes into the app.',
    '',
    'In a new terminal:',
    '',
    '  cd services/tts-gateway',
    '  copy .env.example .env',
    '  npm start',
    '',
    'Wait until it says: Storia TTS gateway on http://127.0.0.1:8787',
    'Then come back here and tap Check connection.',
    '',
    'Windows PowerShell uses copy .env.example .env',
    'macOS/Linux uses cp .env.example .env',
  ].join('\n');
}

export function coreVoicesLocked(roster: VoiceRoster): boolean {
  return (['luca', 'sofia', 'narrator'] as const).every((id) => isAssigned(roster.characters[id]));
}
