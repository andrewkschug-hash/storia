import { describe, expect, it } from 'vitest';

import {
  PAID_USAGE_CONFIRMATION,
  assertGoogleGeneratePermitted,
  classifyExistingAssets,
  closeGoogleApiPermit,
  countBillableCharacters,
  evaluateGoogleTtsGuard,
  googleApiPermitActive,
  loadPricingFile,
  openGoogleApiPermit,
  pricingFresh,
  resolveVoiceFamily,
  type PlannedGeneration,
  type PricingFile,
} from '../../../../services/tts-gateway/src/googleTtsGuard';
import { GoogleTTSProvider } from '../../../../services/tts-gateway/src/providers';

const NOW = new Date('2026-08-14T12:00:00Z');
const GOOGLE_VOICE = 'it-IT-Chirp3-HD-Enceladus';

function pricing(): PricingFile {
  const file = loadPricingFile();
  expect(file).not.toBeNull();
  return file!;
}

function clip(text: string, extra: Partial<PlannedGeneration> = {}): PlannedGeneration {
  const counted = countBillableCharacters(text);
  if (!counted.ok) throw new Error(counted.error);
  return {
    storyId: 'luca-a-roma',
    chapterId: 'luca-a-roma-01',
    chapterNumber: 1,
    sentenceId: extra.sentenceId ?? 's01',
    logicalVoice: extra.logicalVoice ?? 'narrator',
    googleVoiceId: extra.googleVoiceId ?? GOOGLE_VOICE,
    language: 'it-IT',
    text,
    generationSpeed: 'normal',
    generationVersion: 1,
    outputFilename: extra.outputFilename ?? 'tts_test',
    estimatedBillableCharacters: extra.estimatedBillableCharacters ?? counted.chars,
    action: extra.action ?? 'generate',
  };
}

function evalGuard(
  planned: PlannedGeneration[],
  extra: Partial<Parameters<typeof evaluateGoogleTtsGuard>[0]> = {},
) {
  return evaluateGoogleTtsGuard({
    planned,
    pricing: pricing(),
    hardLimitChars: 900_000,
    trackedUsage: 0,
    providerConfigured: true,
    now: NOW,
    ...extra,
  });
}

describe('Google TTS billable characters', () => {
  it('counts Unicode code points of the exact text sent to Google, including spaces and punctuation', () => {
    expect(countBillableCharacters('Ciao, Luca.')).toEqual({ ok: true, chars: 11 });
    expect(countBillableCharacters('')).toEqual({ ok: true, chars: 0 });
    expect(countBillableCharacters(null)).toMatchObject({ ok: false });
  });
});

describe('Google TTS hard guard', () => {
  it('allows safe generation under the hard limit', () => {
    const result = evalGuard([clip('a'.repeat(200_000))], { trackedUsage: 100_000, hardLimitChars: 900_000 });
    expect(result.allowed).toBe(true);
    expect(result.projectedUsage).toBe(300_000);
  });

  it('allows a batch that lands exactly on the hard limit', () => {
    const result = evalGuard([clip('a'.repeat(200_000))], { trackedUsage: 700_000, hardLimitChars: 900_000 });
    expect(result.allowed).toBe(true);
    expect(result.projectedUsage).toBe(900_000);
  });

  it('blocks a batch that would exceed the hard limit', () => {
    const result = evalGuard([clip('a'.repeat(200_000))], { trackedUsage: 700_001, hardLimitChars: 900_000 });
    expect(result.allowed).toBe(false);
    expect(result.code).toBe('over_hard_limit');
    expect(result.error).toContain('GENERATION BLOCKED');
    expect(result.error).toContain('No Google TTS requests were made.');
    expect(result.projectedUsage).toBe(900_001);
  });

  it('does not count existing valid Google assets as new generation', () => {
    const text = 'Luca arriva a Roma.';
    const classified = classifyExistingAssets(
      [
        {
          provider: 'google',
          voiceId: GOOGLE_VOICE,
          language: 'it-IT',
          speed: 'normal',
          text,
          generationVersion: 1,
        },
      ],
      {
        voiceId: GOOGLE_VOICE,
        language: 'it-IT',
        speed: 'normal',
        text,
        generationVersion: 1,
      },
    );
    expect(classified.action).toBe('reuse-google');
    const result = evalGuard([clip(text, { action: 'reuse-google' })], { trackedUsage: 50_000 });
    expect(result.allowed).toBe(true);
    expect(result.plannedCharacters).toBe(0);
    expect(result.projectedUsage).toBe(50_000);
  });

  it('counts ElevenLabs assets as Google migration work', () => {
    const text = 'Luca arriva a Roma.';
    const classified = classifyExistingAssets(
      [
        {
          provider: 'elevenlabs',
          voiceId: 'onwK4e9ZLuTAKqWW03F9',
          language: 'it-IT',
          speed: 'normal',
          text,
          generationVersion: 1,
        },
      ],
      {
        voiceId: GOOGLE_VOICE,
        language: 'it-IT',
        speed: 'normal',
        text,
        generationVersion: 1,
      },
    );
    expect(classified.action).toBe('generate');
    expect(classified.elevenLabsHit).toBe(true);
    const result = evalGuard([clip(text, { action: 'generate' })]);
    expect(result.plannedCharacters).toBe(countBillableCharacters(text).ok ? 19 : -1);
    expect(result.allowed).toBe(true);
  });

  it('blocks when the requested voice cannot be mapped to Google', () => {
    const result = evalGuard([clip('Ciao.', { googleVoiceId: '' })]);
    expect(result.allowed).toBe(false);
    expect(result.code).toBe('missing_google_voice');
  });

  it('blocks when pricing configuration is missing', () => {
    const result = evaluateGoogleTtsGuard({
      planned: [clip('Ciao.')],
      pricing: null,
      hardLimitChars: 900_000,
      trackedUsage: 0,
      providerConfigured: true,
      now: NOW,
    });
    expect(result.allowed).toBe(false);
    expect(result.code).toBe('missing_pricing');
  });

  it('blocks when pricing is stale', () => {
    const stale = { ...pricing(), staleAfter: '2020-01-01' };
    expect(pricingFresh(stale, NOW)).toBe(false);
    const result = evaluateGoogleTtsGuard({
      planned: [clip('Ciao.')],
      pricing: stale,
      hardLimitChars: 900_000,
      trackedUsage: 0,
      providerConfigured: true,
      now: NOW,
    });
    expect(result.allowed).toBe(false);
    expect(result.code).toBe('stale_pricing');
  });

  it('blocks when the character count cannot be calculated', () => {
    const result = evalGuard([clip('Ciao.', { estimatedBillableCharacters: 99 })]);
    expect(result.allowed).toBe(false);
    expect(result.code).toBe('missing_character_count');
  });

  it('blocks when the hard limit is missing', () => {
    const result = evalGuard([clip('Ciao.')], { hardLimitChars: null });
    expect(result.allowed).toBe(false);
    expect(result.code).toBe('missing_hard_limit');
  });

  it('blocks an unknown Google voice family', () => {
    expect(resolveVoiceFamily('it-IT-NotARealFamily-A', pricing()).ok).toBe(false);
    const result = evalGuard([clip('Ciao.', { googleVoiceId: 'it-IT-NotARealFamily-A' })]);
    expect(result.allowed).toBe(false);
    expect(result.code).toBe('unknown_voice_family');
  });

  it('blocks paid override without the exact confirmation phrase', () => {
    const result = evalGuard([clip('a'.repeat(200_000))], {
      trackedUsage: 800_000,
      hardLimitChars: 900_000,
      allowPaidUsage: true,
      paidUsageConfirmation: 'yes',
    });
    expect(result.allowed).toBe(false);
    expect(result.code).toBe('paid_override_unconfirmed');
    expect(result.error).toContain(PAID_USAGE_CONFIRMATION);
  });

  it('permits paid override only with the exact confirmation, and still reports cost', () => {
    const result = evalGuard([clip('a'.repeat(200_000))], {
      trackedUsage: 950_000,
      hardLimitChars: 900_000,
      allowPaidUsage: true,
      paidUsageConfirmation: PAID_USAGE_CONFIRMATION,
    });
    expect(result.allowed).toBe(true);
    expect(result.projectedUsage).toBe(1_150_000);
    expect(result.estimatedBillableOverFree).toBe(150_000);
    expect(result.estimatedChargeUsd).toBeCloseTo(4.5);
    expect(result.summary).toContain('PAID OVERRIDE');
  });
});

describe('Google TTS dry-run / API permit', () => {
  it('does not call Google without a preflight permit', async () => {
    closeGoogleApiPermit();
    expect(googleApiPermitActive()).toBe(false);
    expect(() => assertGoogleGeneratePermitted('Ciao.')).toThrow(/No Google TTS preflight permit/);
    const provider = new GoogleTTSProvider({ GOOGLE_TTS_API_KEY: 'test-not-used' });
    await expect(
      provider.generateSpeech({
        text: 'Ciao.',
        voiceId: GOOGLE_VOICE,
        language: 'it-IT',
        speed: 'normal',
      }),
    ).rejects.toThrow(/No Google TTS preflight permit/);
  });

  it('opens a permit only after a passing evaluation', () => {
    closeGoogleApiPermit();
    const result = evalGuard([clip('Ciao.')], { dryRun: true });
    expect(result.allowed).toBe(true);
    expect(result.dryRun).toBe(true);
    expect(googleApiPermitActive()).toBe(false);
    openGoogleApiPermit(result);
    expect(googleApiPermitActive()).toBe(true);
    expect(assertGoogleGeneratePermitted('Ciao.')).toBe(5);
    closeGoogleApiPermit();
  });
});
