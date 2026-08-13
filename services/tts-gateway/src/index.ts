import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

import { publicRoster, readRoster, writeAssignment } from './assignments';
import { apiKeyHint, loadGatewayEnv, providerConfigured, upsertEnvValues } from './env';
import { createTTSProvider } from './providers';
import { AssetRegistry } from './registry';
import { audioCacheKey, textHash } from './cacheKey';
import type { AudioAsset, TTSProviderId, TTSSpeed } from './types';

loadGatewayEnv();

const PORT = Number(process.env.TTS_GATEWAY_PORT ?? 8787);
const HOST = process.env.TTS_GATEWAY_HOST ?? '127.0.0.1';
const DATA_DIR = process.env.TTS_DATA_DIR ?? join(process.cwd(), 'data');
const PUBLIC_BASE = process.env.TTS_PUBLIC_BASE ?? `http://${HOST}:${PORT}`;
const ACTIVE = (process.env.TTS_PROVIDER ?? 'elevenlabs') as TTSProviderId;
const PROVIDERS: TTSProviderId[] = ['elevenlabs', 'azure', 'google'];
const PROVIDER_LABEL: Record<TTSProviderId, string> = {
  elevenlabs: 'ElevenLabs',
  azure: 'Azure',
  google: 'Google',
};

const registry = new AssetRegistry(DATA_DIR, PUBLIC_BASE);

function cors(res: ServerResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function json(res: ServerResponse, status: number, body: unknown) {
  cors(res);
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

async function readBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};
  return JSON.parse(raw);
}

function provider(id?: string) {
  return createTTSProvider((id as TTSProviderId) || ACTIVE, process.env);
}

const server = createServer(async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url ?? '/', PUBLIC_BASE);

  try {
    if (req.method === 'GET' && url.pathname === '/health') {
      json(res, 200, gatewayStatus());
      return;
    }

    if (req.method === 'GET' && url.pathname === '/v1/tts/status') {
      json(res, 200, gatewayStatus());
      return;
    }

    if (req.method === 'POST' && url.pathname === '/v1/tts/setup') {
      const body = (await readBody(req)) as {
        elevenlabsApiKey?: string;
        azureSpeechKey?: string;
        azureSpeechRegion?: string;
        googleTtsApiKey?: string;
      };
      const updates: Record<string, string> = {};
      if (body.elevenlabsApiKey?.trim()) updates.ELEVENLABS_API_KEY = body.elevenlabsApiKey.trim();
      if (body.azureSpeechKey?.trim()) updates.AZURE_SPEECH_KEY = body.azureSpeechKey.trim();
      if (body.azureSpeechRegion?.trim()) updates.AZURE_SPEECH_REGION = body.azureSpeechRegion.trim();
      if (body.googleTtsApiKey?.trim()) updates.GOOGLE_TTS_API_KEY = body.googleTtsApiKey.trim();
      if (Object.keys(updates).length === 0) {
        json(res, 400, { error: 'Paste an API key first.' });
        return;
      }
      upsertEnvValues(updates);
      json(res, 200, gatewayStatus());
      return;
    }

    if (req.method === 'GET' && url.pathname === '/v1/tts/test') {
      const id = ((url.searchParams.get('provider') as TTSProviderId | null) ?? ACTIVE) as TTSProviderId;
      if (!PROVIDERS.includes(id)) {
        json(res, 400, { ok: false, error: 'Unknown provider' });
        return;
      }
      if (!providerConfigured(id)) {
        json(res, 200, {
          ok: false,
          provider: id,
          label: PROVIDER_LABEL[id],
          error: `${PROVIDER_LABEL[id]} is not configured yet.`,
        });
        return;
      }
      try {
        const voices = await provider(id).listVoices('it-IT');
        json(res, 200, {
          ok: true,
          provider: id,
          label: PROVIDER_LABEL[id],
          voiceCount: voices.length,
          sampleVoiceName: voices[0]?.displayName ?? voices[0]?.name ?? null,
        });
      } catch (error) {
        json(res, 200, {
          ok: false,
          provider: id,
          label: PROVIDER_LABEL[id],
          error: error instanceof Error ? error.message : String(error),
        });
      }
      return;
    }

    if (req.method === 'GET' && url.pathname === '/v1/tts/voices') {
      const requested = url.searchParams.get('provider') as TTSProviderId | null;
      const ids = requested ? [requested] : PROVIDERS.filter((id) => providerConfigured(id));
      const voicesByProvider: Record<string, unknown[]> = {};
      for (const id of ids) {
        if (!providerConfigured(id)) {
          voicesByProvider[id] = [];
          continue;
        }
        voicesByProvider[id] = await provider(id).listVoices('it-IT');
      }
      const voices = requested ? (voicesByProvider[requested] ?? []) : Object.values(voicesByProvider).flat();
      json(res, 200, { provider: requested ?? 'all', voices, voicesByProvider });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/v1/tts/assignments') {
      const roster = readRoster();
      json(res, 200, { roster, summary: publicRoster(roster) });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/v1/tts/assignments') {
      const body = (await readBody(req)) as {
        characterId?: string;
        provider?: TTSProviderId;
        voiceId?: string;
        voiceName?: string;
        gender?: 'male' | 'female' | 'neutral';
        speakingStyle?: string;
      };
      if (!body.characterId || !body.provider || !body.voiceId) {
        json(res, 400, { error: 'characterId, provider, and voice are required' });
        return;
      }
      const roster = writeAssignment({
        characterId: body.characterId,
        provider: body.provider,
        voiceId: body.voiceId,
        voiceName: body.voiceName,
        gender: body.gender,
        speakingStyle: body.speakingStyle,
      });
      json(res, 200, { roster, summary: publicRoster(roster) });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/v1/tts/assets') {
      json(res, 200, { assets: loadAssets() });
      return;
    }

    if (req.method === 'GET' && url.pathname.startsWith('/v1/tts/audio/')) {
      const cacheKey = decodeURIComponent(url.pathname.slice('/v1/tts/audio/'.length));
      const file = registry.audioPath(cacheKey);
      if (!existsSync(file)) {
        json(res, 404, { error: 'Audio not found' });
        return;
      }
      const bytes = readFileSync(file);
      cors(res);
      res.writeHead(200, { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'public, max-age=86400' });
      res.end(bytes);
      return;
    }

    if (req.method === 'POST' && url.pathname === '/v1/tts/generate') {
      const body = (await readBody(req)) as {
        text?: string;
        voiceId?: string;
        speakerId?: string;
        contentId?: string;
        provider?: TTSProviderId;
        speed?: TTSSpeed;
        regenerate?: boolean;
      };
      if (!body.text || !body.voiceId) {
        json(res, 400, { error: 'text and voiceId are required' });
        return;
      }
      const asset = await generateOne(body);
      json(res, 200, asset);
      return;
    }

    if (req.method === 'POST' && url.pathname === '/v1/tts/batch') {
      const body = (await readBody(req)) as {
        chapterId?: string;
        sentences?: {
          text: string;
          voiceId: string;
          speakerId: string;
          contentId: string;
          speed?: TTSSpeed;
          provider?: TTSProviderId;
          regenerate?: boolean;
        }[];
      };
      const assets: AudioAsset[] = [];
      const errors: { index: number; speakerId?: string; contentId?: string; error: string }[] = [];
      for (let index = 0; index < (body.sentences ?? []).length; index++) {
        const sentence = body.sentences![index];
        try {
          assets.push(await generateOne(sentence));
        } catch (error) {
          errors.push({
            index,
            speakerId: sentence.speakerId,
            contentId: sentence.contentId,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
      json(res, 200, { chapterId: body.chapterId, assets, errors });
      return;
    }

    const approve = url.pathname.match(/^\/v1\/tts\/assets\/([^/]+)\/(approve|reject)$/);
    if (req.method === 'POST' && approve) {
      const id = decodeURIComponent(approve[1]);
      const action = approve[2];
      const assets = registry.load();
      const asset = assets.find((a) => a.id === id || a.cacheKey === id);
      if (!asset) {
        json(res, 404, { error: 'Asset not found' });
        return;
      }
      asset.status = action === 'approve' ? 'approved' : 'failed';
      asset.approvedAt = action === 'approve' ? new Date().toISOString() : null;
      registry.save(assets);
      json(res, 200, asset);
      return;
    }

    json(res, 404, { error: 'Not found' });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const status = message.includes('is not configured') ? 503 : 500;
    json(res, status, { error: message });
  }
});

function gatewayStatus() {
  return {
    ok: true,
    connected: true,
    provider: ACTIVE,
    providers: {
      elevenlabs: {
        id: 'elevenlabs' as const,
        label: PROVIDER_LABEL.elevenlabs,
        configured: providerConfigured('elevenlabs'),
        keyHint: apiKeyHint(process.env.ELEVENLABS_API_KEY),
      },
      azure: {
        id: 'azure' as const,
        label: PROVIDER_LABEL.azure,
        configured: providerConfigured('azure'),
      },
      google: {
        id: 'google' as const,
        label: PROVIDER_LABEL.google,
        configured: providerConfigured('google'),
        auth: process.env.GOOGLE_TTS_API_KEY
          ? 'api-key'
          : providerConfigured('google')
            ? 'adc'
            : null,
      },
    },
  };
}

const AUTO_APPROVE = process.env.TTS_AUTO_APPROVE !== 'false';

function loadAssets(): AudioAsset[] {
  const assets = registry.load();
  if (!AUTO_APPROVE) return assets;
  let changed = false;
  for (const asset of assets) {
    if (asset.status === 'review_required') {
      asset.status = 'approved';
      asset.approvedAt = new Date().toISOString();
      changed = true;
    }
  }
  if (changed) registry.save(assets);
  return assets;
}

function approveAsset(asset: AudioAsset): AudioAsset {
  if (!AUTO_APPROVE || asset.status === 'failed') return asset;
  asset.status = 'approved';
  asset.approvedAt = new Date().toISOString();
  return asset;
}
function shouldReuseGeneratedAsset(
  existing: AudioAsset | undefined,
  regenerate: boolean | undefined,
): boolean {
  if (!existing || regenerate) return false;
  return existing.status === 'approved' || existing.status === 'review_required';
}

async function generateOne(input: {
  text: string;
  voiceId: string;
  speakerId?: string;
  contentId?: string;
  provider?: TTSProviderId;
  speed?: TTSSpeed;
  regenerate?: boolean;
}): Promise<AudioAsset> {
  const speed = input.speed ?? 'normal';
  const providerId = (input.provider as TTSProviderId) || ACTIVE;
  const generationVersion = Number(process.env.TTS_GENERATION_VERSION ?? 1);
  const cacheKey = audioCacheKey({
    provider: providerId,
    voiceId: input.voiceId,
    language: 'it-IT',
    speed,
    text: input.text,
    generationVersion,
  });
  const assets = loadAssets();
  const existing = assets.find((a) => a.cacheKey === cacheKey);
  if (shouldReuseGeneratedAsset(existing, input.regenerate) && existsSync(registry.audioPath(cacheKey))) {
    registry.save(assets);
    return approveAsset(existing!);
  }

  const tts = provider(input.provider);
  const result = await tts.generateSpeech({
    text: input.text,
    voiceId: input.voiceId,
    language: 'it-IT',
    speed,
  });
  registry.writeAudio(result.cacheKey, Buffer.from(result.audio));
  if (existing) {
    existing.status = 'approved';
    existing.approvedAt = new Date().toISOString();
    existing.createdAt = new Date().toISOString();
    existing.audioUrl = registry.publicUrl(result.cacheKey);
    registry.save(assets);
    return approveAsset(existing);
  }
  const asset: AudioAsset = approveAsset({
    id: result.cacheKey,
    contentId: input.contentId ?? `adhoc:${textHash(input.text)}`,
    speakerId: input.speakerId ?? 'narrator',
    provider: result.provider,
    voiceId: input.voiceId,
    language: 'it-IT',
    speed,
    text: input.text,
    textHash: textHash(input.text),
    audioUrl: registry.publicUrl(result.cacheKey),
    duration: null,
    generationVersion: Number(process.env.TTS_GENERATION_VERSION ?? 1),
    status: 'approved',
    createdAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
    cacheKey: result.cacheKey,
  });
  assets.push(asset);
  registry.save(assets);
  return asset;
}

server.listen(PORT, HOST, () => {
  console.log(`Storia TTS gateway on ${PUBLIC_BASE}`);
  console.log('Open Voice Lab in the app, then tap Load Italian Voices.');
  console.log('API keys stay in this folder (.env) and are never sent to the reader app.');
});
