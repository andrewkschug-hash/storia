import {
  assignmentForLogicalVoice,
  logicalVoiceIdForSpeaker,
  normalizeRoster,
} from '@/src/audio/logicalVoices';
import { isPlaceholderVoiceId } from '@/src/audio/voiceDisplay';
import type { CharacterVoiceAssignment, VoiceRoster } from '@/src/audio/types';
import type { Character } from '@/src/content/schemas';

export { NARRATOR_ID, resolveSpeakerId, selectProvider } from '@/src/audio/logicalVoices';

export function resolveCharacterVoice(
  roster: VoiceRoster,
  characters: Character[],
  speakerId: string | null | undefined,
): CharacterVoiceAssignment | null {
  const normalized = normalizeRoster(roster);
  const logicalId = logicalVoiceIdForSpeaker(normalized, speakerId);
  const assigned = assignmentForLogicalVoice(normalized, logicalId, normalized.activeProvider);
  if (assigned) return assigned;

  const character = characters.find((c) => c.id === logicalId);
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
      logicalVoiceId: logicalId,
    };
  }
  return null;
}
