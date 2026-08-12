import type { TTSProviderId, VoiceInfo } from './types';

export type PublicVoice = VoiceInfo & {
  displayName: string;
  provider: TTSProviderId;
};

export function looksLikeInternalId(value: string): boolean {
  const v = value.trim();
  if (!v) return true;
  if (/^it[-_]IT[-_]/i.test(v)) return true;
  if (/^[A-Za-z0-9]{16,}$/.test(v) && !/\s/.test(v)) return true;
  if (/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(v)) return true;
  return false;
}

export function genderLabel(gender?: VoiceInfo['gender']): string {
  if (gender === 'female') return 'Female';
  if (gender === 'male') return 'Male';
  if (gender === 'neutral') return 'Neutral';
  return '';
}

export function friendlyVoiceName(
  voice: Pick<VoiceInfo, 'id' | 'name' | 'gender'>,
  fallbackIndex: number,
): string {
  const name = voice.name?.trim() || '';
  if (name && name !== voice.id && !looksLikeInternalId(name)) return name;
  const who = genderLabel(voice.gender);
  return who ? `Italian ${who} Voice ${fallbackIndex}` : `Italian Voice ${fallbackIndex}`;
}

export function voiceSupportsItalian(raw: unknown): boolean {
  const blob = JSON.stringify(raw).toLowerCase();
  return (
    blob.includes('italian') ||
    blob.includes('italiano') ||
    blob.includes('"it"') ||
    blob.includes('it-it') ||
    blob.includes('it_it')
  );
}

/** ElevenLabs voices eligible for Italian preview/generation (multilingual v2). */
export function voicesForItalianTTS(
  voices: { voice_id: string; category?: string }[],
): typeof voices {
  const all = voices ?? [];
  if (all.length === 0) return [];

  const italianTagged = all.filter((v) => voiceSupportsItalian(v));
  const premade = all.filter((v) => v.category === 'premade' || v.category === 'default');
  const byId = new Map<string, (typeof all)[number]>();
  for (const voice of italianTagged) byId.set(voice.voice_id, voice);
  for (const voice of premade) byId.set(voice.voice_id, voice);

  const merged = [...byId.values()];
  return merged.length > 0 ? merged : all;
}

export function toPublicVoices(provider: TTSProviderId, voices: VoiceInfo[]): PublicVoice[] {
  const counts: Record<string, number> = { male: 0, female: 0, neutral: 0, unknown: 0 };
  return voices.map((voice) => {
    const key = voice.gender ?? 'unknown';
    counts[key] = (counts[key] ?? 0) + 1;
    return {
      ...voice,
      provider,
      displayName: friendlyVoiceName(voice, counts[key]),
    };
  });
}
