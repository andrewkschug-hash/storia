import type {
  GenerateSpeechRequest,
  GenerateSpeechResult,
  TTSProvider,
  TTSProviderId,
  VoiceInfo,
} from './types';
import { audioCacheKey } from './cacheKey';
import { toPublicVoices, voicesForItalianTTS } from './voiceCatalog';

export type {
  GenerateSpeechRequest,
  GenerateSpeechResult,
  TTSProvider,
  TTSProviderId,
  VoiceInfo,
} from './types';

export { audioCacheKey } from './cacheKey';

export function createTTSProvider(id: TTSProviderId, env: NodeJS.Dict<string | undefined>): TTSProvider {
  if (id === 'elevenlabs') return new ElevenLabsTTSProvider(env);
  if (id === 'azure') return new AzureTTSProvider(env);
  if (id === 'google') return new GoogleTTSProvider(env);
  throw new Error(`Unknown TTS provider ${id}`);
}

function requireEnv(env: NodeJS.Dict<string | undefined>, key: string): string {
  const value = env[key];
  if (!value) {
    throw new Error(`${key} is not configured. TTS credentials stay on the gateway.`);
  }
  return value;
}

export class ElevenLabsTTSProvider implements TTSProvider {
  readonly id = 'elevenlabs' as const;

  constructor(private readonly env: NodeJS.Dict<string | undefined>) {}

  async listVoices(): Promise<VoiceInfo[]> {
    const key = requireEnv(this.env, 'ELEVENLABS_API_KEY');
    const res = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: { 'xi-api-key': key },
    });
    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`ElevenLabs voices failed: ${res.status}${detail ? ` — ${detail}` : ''}`);
    }
    const data = (await res.json()) as {
      voices?: {
        voice_id: string;
        name: string;
        category?: string;
        labels?: { gender?: string; language?: string; accent?: string };
        verified_languages?: { language?: string }[];
      }[];
    };
    const chosen = voicesForItalianTTS(data.voices ?? []);
    return toPublicVoices(
      this.id,
      chosen.map((v) => ({
        id: v.voice_id,
        name: v.name,
        language: 'it-IT',
        gender: v.labels?.gender === 'female' || v.labels?.gender === 'male' ? v.labels.gender : undefined,
      })),
    );
  }

  async generateSpeech(req: GenerateSpeechRequest): Promise<GenerateSpeechResult> {
    const key = requireEnv(this.env, 'ELEVENLABS_API_KEY');
    const speed = req.speed === 'slow' ? 0.75 : 1;
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(req.voiceId)}`, {
      method: 'POST',
      headers: {
        'xi-api-key': key,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text: req.text,
        model_id: this.env.ELEVENLABS_MODEL_ID ?? 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.45,
          similarity_boost: 0.75,
          speed,
        },
      }),
    });
    if (!res.ok) throw new Error(`ElevenLabs generate failed: ${res.status} ${await res.text()}`);
    const audio = await res.arrayBuffer();
    return {
      audio,
      format: 'mp3',
      provider: this.id,
      cacheKey: audioCacheKey({
        provider: this.id,
        voiceId: req.voiceId,
        language: req.language,
        speed: req.speed,
        text: req.text,
        generationVersion: Number(this.env.TTS_GENERATION_VERSION ?? 1),
      }),
    };
  }
}

export class AzureTTSProvider implements TTSProvider {
  readonly id = 'azure' as const;

  constructor(private readonly env: NodeJS.Dict<string | undefined>) {}

  async listVoices(language = 'it-IT'): Promise<VoiceInfo[]> {
    const key = requireEnv(this.env, 'AZURE_SPEECH_KEY');
    const region = requireEnv(this.env, 'AZURE_SPEECH_REGION');
    const res = await fetch(
      `https://${region}.tts.speech.microsoft.com/cognitiveservices/voices/list`,
      { headers: { 'Ocp-Apim-Subscription-Key': key } },
    );
    if (!res.ok) throw new Error(`Azure voices failed: ${res.status}`);
    const data = (await res.json()) as {
      ShortName: string;
      DisplayName: string;
      Locale: string;
      Gender: string;
    }[];
    return toPublicVoices(
      this.id,
      data
        .filter((v) => v.Locale.toLowerCase().startsWith(language.slice(0, 2).toLowerCase()))
        .map((v) => ({
          id: v.ShortName,
          name: v.DisplayName,
          language: v.Locale,
          gender: v.Gender.toLowerCase() === 'female' ? 'female' : 'male',
        })),
    );
  }

  async generateSpeech(req: GenerateSpeechRequest): Promise<GenerateSpeechResult> {
    const key = requireEnv(this.env, 'AZURE_SPEECH_KEY');
    const region = requireEnv(this.env, 'AZURE_SPEECH_REGION');
    const rate = req.speed === 'slow' ? '75%' : '100%';
    const ssml = `<speak version="1.0" xml:lang="${req.language}"><voice name="${escapeXml(req.voiceId)}"><prosody rate="${rate}">${escapeXml(req.text)}</prosody></voice></speak>`;
    const res = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': key,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
        'User-Agent': 'storia-tts-gateway',
      },
      body: ssml,
    });
    if (!res.ok) throw new Error(`Azure generate failed: ${res.status} ${await res.text()}`);
    return {
      audio: await res.arrayBuffer(),
      format: 'mp3',
      provider: this.id,
      cacheKey: audioCacheKey({
        provider: this.id,
        voiceId: req.voiceId,
        language: req.language,
        speed: req.speed,
        text: req.text,
        generationVersion: Number(this.env.TTS_GENERATION_VERSION ?? 1),
      }),
    };
  }
}

export class GoogleTTSProvider implements TTSProvider {
  readonly id = 'google' as const;

  constructor(private readonly env: NodeJS.Dict<string | undefined>) {}

  async listVoices(language = 'it-IT'): Promise<VoiceInfo[]> {
    const key = requireEnv(this.env, 'GOOGLE_TTS_API_KEY');
    const res = await fetch(
      `https://texttospeech.googleapis.com/v1/voices?languageCode=${encodeURIComponent(language)}&key=${encodeURIComponent(key)}`,
    );
    if (!res.ok) throw new Error(`Google voices failed: ${res.status}`);
    const data = (await res.json()) as {
      voices?: { name: string; ssmlGender?: string; languageCodes?: string[] }[];
    };
    return toPublicVoices(
      this.id,
      (data.voices ?? []).map((v) => ({
        id: v.name,
        name: v.name,
        language: v.languageCodes?.[0] ?? language,
        gender: v.ssmlGender === 'FEMALE' ? 'female' : v.ssmlGender === 'MALE' ? 'male' : 'neutral',
      })),
    );
  }

  async generateSpeech(req: GenerateSpeechRequest): Promise<GenerateSpeechResult> {
    const key = requireEnv(this.env, 'GOOGLE_TTS_API_KEY');
    const res = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${encodeURIComponent(key)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text: req.text },
          voice: { languageCode: req.language, name: req.voiceId },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: req.speed === 'slow' ? 0.75 : 1,
          },
        }),
      },
    );
    if (!res.ok) throw new Error(`Google generate failed: ${res.status} ${await res.text()}`);
    const data = (await res.json()) as { audioContent?: string };
    if (!data.audioContent) throw new Error('Google TTS returned no audio');
    const audio = Buffer.from(data.audioContent, 'base64').buffer;
    return {
      audio,
      format: 'mp3',
      provider: this.id,
      cacheKey: audioCacheKey({
        provider: this.id,
        voiceId: req.voiceId,
        language: req.language,
        speed: req.speed,
        text: req.text,
        generationVersion: Number(this.env.TTS_GENERATION_VERSION ?? 1),
      }),
    };
  }
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
