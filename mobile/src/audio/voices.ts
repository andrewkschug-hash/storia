import type { CharacterVoiceAssignment, TTSProviderId, VoiceRoster } from '@/src/audio/types';
import { isPlaceholderVoiceId } from '@/src/audio/voiceDisplay';
import type { Character } from '@/src/content/schemas';

export const NARRATOR_ID = 'narrator';

export function selectProvider(id: string): TTSProviderId {
  if (id === 'elevenlabs' || id === 'azure' || id === 'google') return id;
  throw new Error(`Unsupported TTS provider "${id}"`);
}

export function resolveSpeakerId(speakerId: string | null | undefined): string {
  if (!speakerId || speakerId === 'narrator') return NARRATOR_ID;
  return speakerId;
}

export function resolveCharacterVoice(
  roster: VoiceRoster,
  characters: Character[],
  speakerId: string | null | undefined,
): CharacterVoiceAssignment | null {
  const id = resolveSpeakerId(speakerId);
  const assigned = roster.characters[id];
  if (assigned?.voiceId && !isPlaceholderVoiceId(assigned.voiceId)) return assigned;

  const character = characters.find((c) => c.id === id);
  if (
    character?.voice.provider &&
    character.voice.voiceId &&
    !isPlaceholderVoiceId(character.voice.voiceId)
  ) {
    return {
      provider: character.voice.provider,
      voiceId: character.voice.voiceId,
      language: character.voice.language,
      speakingStyle: character.voice.speakingStyle ?? '',
    };
  }
  return null;
}
