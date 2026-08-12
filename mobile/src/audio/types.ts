export type TTSProviderId = 'elevenlabs' | 'azure' | 'google';
export type TTSSpeed = 'normal' | 'slow';
export type TTSLanguage = 'it-IT';

export type AudioGenerationStatus =
  | 'not_generated'
  | 'generating'
  | 'generated'
  | 'review_required'
  | 'approved'
  | 'failed';

export type VoiceInfo = {
  id: string;
  name: string;
  language: string;
  gender?: 'male' | 'female' | 'neutral';
  style?: string;
  displayName?: string;
  provider?: TTSProviderId;
};

export type GenerateSpeechRequest = {
  text: string;
  voiceId: string;
  language: TTSLanguage;
  speed: TTSSpeed;
};

export type GenerateSpeechResult = {
  audio: ArrayBuffer;
  format: 'mp3' | 'wav' | 'ogg';
  provider: TTSProviderId;
  cacheKey: string;
};

export interface TTSProvider {
  readonly id: TTSProviderId;
  listVoices(language?: string): Promise<VoiceInfo[]>;
  generateSpeech(req: GenerateSpeechRequest): Promise<GenerateSpeechResult>;
}

export type CharacterVoiceAssignment = {
  provider: TTSProviderId;
  voiceId: string;
  language: TTSLanguage;
  speakingStyle: string;
  /** Human-readable name only. Never show voiceId in the UI. */
  voiceName?: string;
  gender?: 'male' | 'female' | 'neutral';
};

export type AudioAsset = {
  id: string;
  contentId: string;
  speakerId: string;
  provider: TTSProviderId;
  voiceId: string;
  language: TTSLanguage;
  speed: TTSSpeed;
  text: string;
  textHash: string;
  audioUrl: string;
  duration: number | null;
  generationVersion: number;
  status: AudioGenerationStatus;
  createdAt: string;
  approvedAt: string | null;
  cacheKey: string;
};

export type VoiceRoster = {
  activeProvider: TTSProviderId;
  generationVersion: number;
  characters: Record<string, CharacterVoiceAssignment>;
};
