import catalogJson from '../../content/audio/catalog.json';
import voicesJson from '../../content/audio/voices.json';
import { getContentBundle } from '@/src/content';
import { AudioService, createCatalog } from '@/src/audio/AudioService';
import type { AudioAsset, VoiceRoster } from '@/src/audio/types';
import { applyVoiceRoster, currentRoster } from '@/src/audio/voiceAssignments';
import { selectProvider } from '@/src/audio/voices';

const bundledRoster: VoiceRoster = {
  activeProvider: selectProvider(voicesJson.activeProvider),
  generationVersion: voicesJson.generationVersion,
  characters: voicesJson.characters as VoiceRoster['characters'],
};

applyVoiceRoster(bundledRoster);

let catalog = createCatalog(
  (catalogJson.assets ?? []) as AudioAsset[],
  bundledRoster,
  getContentBundle().characters,
);

let audio: AudioService | null = null;

export function getAudioService(): AudioService {
  if (!audio) audio = new AudioService(catalog);
  return audio;
}

export function getAudioCatalog() {
  return catalog;
}

export function getVoiceRoster(): VoiceRoster {
  return currentRoster(bundledRoster);
}

/** @internal tests */
export function __resetDefaultAudio() {
  audio = null;
}

export { AudioService, createCatalog, refreshCatalogFromGateway } from '@/src/audio/AudioService';
export { AudioCatalog, shouldReuseGeneratedAsset } from '@/src/audio/catalog';
export { audioCacheKey, contentHash, textHash } from '@/src/audio/cacheKey';
export { resolveCharacterVoice, resolveSpeakerId, selectProvider, NARRATOR_ID } from '@/src/audio/voices';
export { TtsGatewayClient, gatewayBaseUrl } from '@/src/audio/TtsGatewayClient';
export type { BatchSentenceError } from '@/src/audio/TtsGatewayClient';
export { friendlyGatewayError, unassignedSpeakersMessage } from '@/src/audio/gatewayErrors';
export {
  applyVoiceRoster,
  persistVoiceRoster,
  hydrateVoiceRoster,
  currentRoster,
} from '@/src/audio/voiceAssignments';
export {
  ASSIGNABLE_CHARACTERS,
  DEFAULT_SAMPLE,
  PROVIDER_LABEL,
  assignmentCaption,
  coreVoicesLocked,
  displayVoiceName,
  gatewayDownMessage,
  isAssigned,
  isPlaceholderVoiceId,
  voiceSubtitle,
} from '@/src/audio/voiceDisplay';
export { SilentAudioPlayer } from '@/src/audio/playback';
export { FakeTTSProvider, selectTTSProvider } from '@/src/audio/FakeTTSProvider';
export { hasCachedAudioUrl, rememberAudioUrl } from '@/src/audio/localCache';
export type { TTSProvider, GenerateSpeechRequest, AudioAsset, TTSSpeed } from '@/src/audio/types';
