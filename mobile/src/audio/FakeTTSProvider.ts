import { audioCacheKey } from '@/src/audio/cacheKey';
import type {
  GenerateSpeechRequest,
  GenerateSpeechResult,
  TTSProvider,
  TTSProviderId,
  VoiceInfo,
} from '@/src/audio/types';

/** Test double. Never used by the Reader. */
export class FakeTTSProvider implements TTSProvider {
  readonly id: TTSProviderId;
  failNext = false;
  readonly generated: GenerateSpeechRequest[] = [];

  constructor(id: TTSProviderId = 'elevenlabs') {
    this.id = id;
  }

  async listVoices(): Promise<VoiceInfo[]> {
    return [
      { id: `${this.id}-it-male`, name: `${this.id} Italian male`, language: 'it-IT', gender: 'male' },
      { id: `${this.id}-it-female`, name: `${this.id} Italian female`, language: 'it-IT', gender: 'female' },
    ];
  }

  async generateSpeech(req: GenerateSpeechRequest): Promise<GenerateSpeechResult> {
    if (this.failNext) {
      this.failNext = false;
      throw new Error(`${this.id} failed`);
    }
    this.generated.push(req);
    return {
      audio: new ArrayBuffer(16),
      format: 'mp3',
      provider: this.id,
      cacheKey: audioCacheKey({
        provider: this.id,
        voiceId: req.voiceId,
        language: req.language,
        speed: req.speed,
        text: req.text,
        generationVersion: 1,
      }),
    };
  }
}

export function selectTTSProvider(
  id: string,
  providers: Record<TTSProviderId, TTSProvider>,
): TTSProvider {
  if (id !== 'elevenlabs' && id !== 'azure' && id !== 'google') {
    throw new Error(`Unsupported TTS provider "${id}"`);
  }
  return providers[id];
}
