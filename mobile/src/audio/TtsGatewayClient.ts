import type { AudioAsset, TTSProviderId, TTSSpeed, VoiceInfo, VoiceRoster } from '@/src/audio/types';

export type GatewayProviderStatus = {
  id: TTSProviderId;
  label: string;
  configured: boolean;
};

export type GatewayStatus = {
  ok: boolean;
  connected: boolean;
  provider: TTSProviderId;
  providers: Record<TTSProviderId, GatewayProviderStatus>;
};

export type GatewayTestResult = {
  ok: boolean;
  provider: TTSProviderId;
  label: string;
  voiceCount?: number;
  sampleVoiceName?: string | null;
  error?: string;
};

export type AssignmentResponse = {
  roster: VoiceRoster;
  summary: {
    characters: Record<string, { provider: TTSProviderId; voiceName: string; assigned: boolean }>;
  };
};

export type BatchSentenceError = {
  index: number;
  speakerId?: string;
  contentId?: string;
  error: string;
};

export type GatewayGenerateBody = {
  text: string;
  voiceId: string;
  speakerId: string;
  contentId: string;
  provider?: TTSProviderId;
  speed?: TTSSpeed;
  language?: 'it-IT';
  regenerate?: boolean;
};

export class TtsGatewayClient {
  constructor(private readonly baseUrl: string) {}

  async generate(body: GatewayGenerateBody): Promise<AudioAsset> {
    return this.postJson('/v1/tts/generate', body) as Promise<AudioAsset>;
  }

  async status(): Promise<GatewayStatus> {
    return this.get('/v1/tts/status') as Promise<GatewayStatus>;
  }

  async testProvider(provider: TTSProviderId): Promise<GatewayTestResult> {
    return this.get(`/v1/tts/test?provider=${provider}`) as Promise<GatewayTestResult>;
  }

  async saveSetup(input: {
    elevenlabsApiKey?: string;
    azureSpeechKey?: string;
    azureSpeechRegion?: string;
    googleTtsApiKey?: string;
  }): Promise<GatewayStatus> {
    return this.postJson('/v1/tts/setup', input) as Promise<GatewayStatus>;
  }

  async listVoices(provider?: TTSProviderId): Promise<VoiceInfo[]> {
    const q = provider ? `?provider=${provider}` : '';
    const res = await this.get(`/v1/tts/voices${q}`);
    return (res as { voices: VoiceInfo[] }).voices;
  }

  async listVoicesGrouped(): Promise<Record<string, VoiceInfo[]>> {
    const res = (await this.get('/v1/tts/voices')) as {
      voicesByProvider?: Record<string, VoiceInfo[]>;
    };
    return res.voicesByProvider ?? {};
  }

  async getAssignments(): Promise<AssignmentResponse> {
    return this.get('/v1/tts/assignments') as Promise<AssignmentResponse>;
  }

  async saveAssignment(input: {
    characterId: string;
    provider: TTSProviderId;
    voiceId: string;
    voiceName?: string;
    gender?: VoiceInfo['gender'];
    speakingStyle?: string;
  }): Promise<AssignmentResponse> {
    return this.postJson('/v1/tts/assignments', input) as Promise<AssignmentResponse>;
  }

  async listAssets(): Promise<AudioAsset[]> {
    const res = await this.get('/v1/tts/assets');
    return (res as { assets: AudioAsset[] }).assets;
  }

  async approve(id: string): Promise<AudioAsset> {
    return this.postJson(`/v1/tts/assets/${encodeURIComponent(id)}/approve`, {}) as Promise<AudioAsset>;
  }

  async reject(id: string): Promise<AudioAsset> {
    return this.postJson(`/v1/tts/assets/${encodeURIComponent(id)}/reject`, {}) as Promise<AudioAsset>;
  }

  async batchChapter(
    chapterId: string,
    sentences: GatewayGenerateBody[],
  ): Promise<{ assets: AudioAsset[]; errors: BatchSentenceError[] }> {
    return this.postJson('/v1/tts/batch', { chapterId, sentences }) as Promise<{
      assets: AudioAsset[];
      errors: BatchSentenceError[];
    }>;
  }

  audioUrl(cacheKey: string): string {
    return `${this.baseUrl.replace(/\/$/, '')}/v1/tts/audio/${encodeURIComponent(cacheKey)}`;
  }

  private async get(path: string): Promise<unknown> {
    const res = await fetchWithTimeout(`${this.baseUrl.replace(/\/$/, '')}${path}`);
    if (!res.ok) throw new Error(await readError(res));
    return res.json();
  }

  private async postJson(path: string, body: unknown): Promise<unknown> {
    const res = await fetchWithTimeout(`${this.baseUrl.replace(/\/$/, '')}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await readError(res));
    return res.json();
  }
}

async function readError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string };
    return data.error ?? res.statusText;
  } catch {
    return res.statusText;
  }
}

export function gatewayBaseUrl(): string | null {
  const fromEnv = process.env.EXPO_PUBLIC_TTS_GATEWAY_URL;
  if (fromEnv && fromEnv.length > 0) return fromEnv;
  if (typeof __DEV__ !== 'undefined' && __DEV__) return 'http://127.0.0.1:8787';
  return null;
}

const GATEWAY_FETCH_TIMEOUT_MS = 4_000;

async function fetchWithTimeout(input: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GATEWAY_FETCH_TIMEOUT_MS);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}
