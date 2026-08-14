import {
  allLogicalVoicesLocked,
  LOGICAL_VOICE_IDS,
  normalizeRoster,
  providerBinding,
} from '@/src/audio/logicalVoices';
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
  { id: 'padrone', label: 'Padrone' },
  { id: 'narrator', label: 'Narrator' },
];

export const DEFAULT_SAMPLE = 'Ciao, mi chiamo Luca. Vivo a Roma.';
export const LOCK_SAMPLE_CHAPTERS = [1, 5, 10, 20] as const;

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

export function displayVoiceName(
  voice: Pick<VoiceInfo, 'id' | 'name' | 'displayName' | 'gender' | 'provider'>,
): string {
  if (voice.provider === 'google') {
    return voice.displayName || voice.name || voice.id;
  }
  if (voice.displayName && !looksLikeInternalId(voice.displayName)) return voice.displayName;
  if (voice.name && voice.name !== voice.id && !looksLikeInternalId(voice.name)) return voice.name;
  const who = voice.gender === 'female' ? 'Female' : voice.gender === 'male' ? 'Male' : 'Voice';
  return `Italian ${who} Voice`;
}

export function voiceSubtitle(
  voice: Pick<VoiceInfo, 'language' | 'gender' | 'style' | 'id' | 'provider'>,
): string {
  const lang = voice.language?.toLowerCase().startsWith('it') ? 'it-IT' : voice.language || 'it-IT';
  const gender =
    voice.gender === 'female'
      ? 'Female'
      : voice.gender === 'male'
        ? 'Male'
        : voice.gender === 'neutral'
          ? 'Neutral'
          : null;
  const parts = [lang];
  if (gender) parts.push(gender);
  if (voice.style) parts.push(voice.style);
  if (voice.provider === 'google' && voice.id) parts.push(voice.id);
  return parts.join(' · ');
}

export function assignmentCaption(roster: VoiceRoster, characterId: string): string {
  const normalized = normalizeRoster(roster);
  const logicalId = normalized.characters[characterId]?.logicalVoiceId ?? characterId;
  const binding = providerBinding(normalized, logicalId, normalized.activeProvider);
  if (!binding) {
    return `Logical voice ${logicalId} · not mapped on ${PROVIDER_LABEL[normalized.activeProvider]}`;
  }
  const name = binding.voiceName || 'Saved voice';
  return `${logicalId} → ${name} · ${PROVIDER_LABEL[normalized.activeProvider]}`;
}

export function gatewayDownMessage(): string {
  return [
    'The TTS gateway is not running. That is a small local service that talks to Google Cloud TTS so your credentials never go into the app.',
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
  const normalized = normalizeRoster(roster);
  return (['luca', 'sofia', 'narrator'] as const).every((id) =>
    Boolean(providerBinding(normalized, id, normalized.activeProvider)),
  );
}

export function sevenVoicesLocked(roster: VoiceRoster): boolean {
  return allLogicalVoicesLocked(normalizeRoster(roster));
}

export { LOGICAL_VOICE_IDS };
