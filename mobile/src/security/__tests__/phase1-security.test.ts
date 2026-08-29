import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-native', () => ({
  Platform: { OS: 'web' },
}));

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: async () => null,
    setItem: async () => {},
    removeItem: async () => {},
  },
}));

vi.mock('@/src/lib/supabase', () => ({
  isSupabaseConfigured: () => false,
  getSupabase: () => {
    throw new Error('Supabase is not configured in tests.');
  },
}));

vi.mock('@/src/sync/learnerSession', () => ({
  hydrateLearnerIfNeeded: vi.fn(async () => {}),
  clearLocalLearnerState: vi.fn(async () => {}),
}));

vi.mock('@/src/onboarding/storage', () => ({
  resetOnboarding: vi.fn(async () => {}),
}));

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { Readable } from 'node:stream';

import { AUTH_CONFIG_MESSAGE, requireSupabaseForAuth } from '@/src/security/productionAuth';
import { isDevBuild, isProductionBuild } from '@/src/security/buildMode';
import { canAccessDeveloperTools, isDeveloperEmail } from '@/src/account/storage';
import { gatewayBaseUrl } from '@/src/audio/TtsGatewayClient';

import { authoringDisabledMessage, isAuthoringEnabled } from '../../../../services/tts-gateway/src/authoring';
import { gatewayStatus } from '../../../../services/tts-gateway/src/gatewayStatus';
import { readJsonBody } from '../../../../services/tts-gateway/src/httpBody';
import {
  MAX_BATCH_SENTENCES,
  MAX_REQUEST_BODY_BYTES,
  MAX_TTS_TEXT_CHARS,
  batchTooLargeMessage,
  requestBodyTooLargeMessage,
  ttsTextTooLongMessage,
} from '../../../../services/tts-gateway/src/requestLimits';
import { evaluateGoogleTtsGuard, loadPricingFile } from '../../../../services/tts-gateway/src/googleTtsGuard';

function setDevMode(dev: boolean): void {
  (globalThis as { __DEV__?: boolean }).__DEV__ = dev;
}

function collectSourceFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '__tests__' || entry.name === '__mocks__' || entry.name === 'node_modules') continue;
      collectSourceFiles(full, acc);
    } else if (/\.(ts|tsx)$/.test(entry.name) && !entry.name.endsWith('.test.ts')) {
      acc.push(full);
    }
  }
  return acc;
}

describe('Phase 1 security — production auth', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    setDevMode(false);
    vi.unstubAllEnvs();
  });

  it('allows local auth fallback only in development without Supabase', async () => {
    setDevMode(true);
    vi.doMock('@/src/lib/supabaseEnv', () => ({ isSupabaseConfigured: () => false }));
    const mod = await import('@/src/security/productionAuth');
    expect(mod.allowsLocalAuthFallback()).toBe(true);

    setDevMode(false);
    vi.resetModules();
    vi.doMock('@/src/lib/supabaseEnv', () => ({ isSupabaseConfigured: () => false }));
    const prod = await import('@/src/security/productionAuth');
    expect(prod.allowsLocalAuthFallback()).toBe(false);
  });

  it('requireSupabaseForAuth throws in production when Supabase is missing', async () => {
    setDevMode(false);
    vi.doMock('@/src/lib/supabaseEnv', () => ({ isSupabaseConfigured: () => false }));
    const mod = await import('@/src/security/productionAuth');
    expect(() => mod.requireSupabaseForAuth()).toThrow(AUTH_CONFIG_MESSAGE);
  });

  it('requireSupabaseForAuth passes when Supabase is configured', () => {
    vi.stubEnv('EXPO_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY', 'anon-key');
    expect(() => requireSupabaseForAuth()).not.toThrow();
  });
});

describe('Phase 1 security — developer routes and authorization', () => {
  afterEach(() => {
    setDevMode(false);
  });

  it('blocks developer tooling in production builds', () => {
    setDevMode(false);
    expect(isDevBuild()).toBe(false);
    expect(isProductionBuild()).toBe(true);
    expect(canAccessDeveloperTools(null)).toBe(false);
  });

  it('registers developer routes only under __DEV__ in root layout', () => {
    const layout = readFileSync(join(process.cwd(), 'app/_layout.tsx'), 'utf8');
    expect(layout).toContain('typeof __DEV__ !== \'undefined\' && __DEV__');
    expect(layout).toContain('voice-lab');
    expect(layout).toContain('audio-studio');
    expect(layout).toContain('cefr-audit');
    expect(layout).toContain('adaptive-debug');
  });

  it('hard-blocks developer screens in production via Redirect', () => {
    for (const screen of ['voice-lab.tsx', 'audio-studio.tsx', 'cefr-audit.tsx', 'adaptive-debug.tsx']) {
      const source = readFileSync(join(process.cwd(), 'app', screen), 'utf8');
      expect(source).toMatch(/isDevBuild\(\)/);
      expect(source).toContain('<Redirect href="/" />');
    }
  });
});

describe('Phase 1 security — production bundle hygiene', () => {
  const mobileRoot = join(process.cwd());

  it('properly gates developer authorization without leaking credentials', () => {
    expect(isDeveloperEmail('andrewkschug@gmail.com')).toBe(true);
    expect(isDeveloperEmail('unknown@example.com')).toBe(false);
    expect(isDeveloperEmail(null)).toBe(false);
  });

  it('does not reference EXPO_PUBLIC_TTS_GATEWAY_URL in client runtime code', () => {
    const clientFiles = [
      ...collectSourceFiles(join(mobileRoot, 'src')),
      ...collectSourceFiles(join(mobileRoot, 'app')),
    ].filter((f) => !f.includes('phase1-security.test.ts'));
    for (const file of clientFiles) {
      const text = readFileSync(file, 'utf8');
      expect(text, `${file} must not read EXPO_PUBLIC_TTS_GATEWAY_URL`).not.toContain(
        'EXPO_PUBLIC_TTS_GATEWAY_URL',
      );
    }
  });

  it('does not embed provider secret env access in client sources', () => {
    const files = collectSourceFiles(join(mobileRoot, 'src')).filter(
      (f) => !f.includes('phase1-security.test.ts'),
    );
    const forbidden = [
      'process.env.ELEVENLABS_API_KEY',
      'process.env.AZURE_SPEECH_KEY',
      'process.env.GOOGLE_APPLICATION_CREDENTIALS',
      'process.env.GOOGLE_TTS_API_KEY',
    ];
    for (const file of files) {
      const text = readFileSync(file, 'utf8');
      for (const needle of forbidden) {
        expect(text, `${file} must not access ${needle}`).not.toContain(needle);
      }
      expect(text, `${file} must not embed sk_ API keys`).not.toMatch(/sk_[a-zA-Z0-9]{12,}/);
    }
  });
});

describe('Phase 1 security — TTS gateway URL', () => {
  afterEach(() => {
    setDevMode(false);
  });

  it('returns localhost gateway only in development', () => {
    setDevMode(true);
    expect(gatewayBaseUrl()).toBe('http://127.0.0.1:8787');

    setDevMode(false);
    expect(gatewayBaseUrl()).toBeNull();
  });
});

describe('Phase 1 security — TTS authoring endpoints', () => {
  it('enables authoring only on localhost bind by default', () => {
    expect(isAuthoringEnabled({ TTS_GATEWAY_HOST: '127.0.0.1' })).toBe(true);
    expect(isAuthoringEnabled({ TTS_GATEWAY_HOST: 'localhost' })).toBe(true);
    expect(isAuthoringEnabled({ TTS_GATEWAY_HOST: '::1' })).toBe(true);
    expect(isAuthoringEnabled({ TTS_GATEWAY_HOST: '0.0.0.0' })).toBe(false);
    expect(isAuthoringEnabled({ TTS_GATEWAY_HOST: '127.0.0.1', TTS_GATEWAY_AUTHORING: 'false' })).toBe(
      false,
    );
  });

  it('uses a stable authoring-disabled message for production-like configs', () => {
    expect(authoringDisabledMessage()).toBe('TTS authoring is disabled in this gateway configuration.');
  });
});

describe('Phase 1 security — TTS request limits', () => {
  it('defines bounded body, text, and batch sizes', () => {
    expect(MAX_REQUEST_BODY_BYTES).toBeGreaterThan(0);
    expect(MAX_TTS_TEXT_CHARS).toBeGreaterThan(0);
    expect(MAX_BATCH_SENTENCES).toBeGreaterThan(0);
    expect(requestBodyTooLargeMessage(100)).toContain('100');
    expect(ttsTextTooLongMessage(50)).toContain('50');
    expect(batchTooLargeMessage(10)).toContain('10');
  });

  it('rejects oversized JSON bodies', async () => {
    const payload = 'x'.repeat(600 * 1024);
    const req = Readable.from([payload]) as unknown as import('node:http').IncomingMessage;
    await expect(readJsonBody(req, 512 * 1024)).rejects.toThrow(/Request body exceeds/);
  });
});

describe('Phase 1 security — TTS status response', () => {
  it('never returns API key hints or fragments', () => {
    const fakeElevenLabsKey = 'el_fixture_not_a_real_provider_secret_value';
    const fakeAzureKey = 'azure_fixture_not_a_real_provider_secret';
    const fakeGoogleKey = 'google_fixture_not_a_real_provider_secret';
    const status = gatewayStatus({
      ELEVENLABS_API_KEY: fakeElevenLabsKey,
      AZURE_SPEECH_KEY: fakeAzureKey,
      GOOGLE_TTS_API_KEY: fakeGoogleKey,
    });
    const serialized = JSON.stringify(status);
    expect(serialized).not.toContain(fakeElevenLabsKey);
    expect(serialized).not.toContain(fakeAzureKey);
    expect(serialized).not.toContain(fakeGoogleKey);
    expect(serialized).not.toContain('keyHint');
    expect(status.providers.elevenlabs.configured).toBe(true);
    expect(status.providers.elevenlabs).not.toHaveProperty('keyHint');
  });
});

describe('Phase 1 security — Google TTS cost guard', () => {
  it('still blocks paid Google generation without confirmation', () => {
    const pricing = loadPricingFile();
    expect(pricing).not.toBeNull();
    const result = evaluateGoogleTtsGuard({
      planned: [
        {
          storyId: 'luca-a-roma',
          chapterId: 'luca-a-roma-01',
          sentenceId: 's01',
          logicalVoice: 'narrator',
          googleVoiceId: 'it-IT-Chirp3-HD-Enceladus',
          language: 'it-IT',
          text: 'Ciao mondo.',
          generationSpeed: 'normal',
          generationVersion: 1,
          outputFilename: 'tts_test',
          estimatedBillableCharacters: 10,
          action: 'generate',
        },
      ],
      pricing: pricing!,
      hardLimitChars: 1,
      trackedUsage: { monthKey: '2026-08', billableCharacters: 0 },
      providerConfigured: true,
      now: new Date('2026-08-14T12:00:00Z'),
      allowPaidUsage: false,
    });
    expect(result.allowed).toBe(false);
  });
});
